// Admin numbers (dashboard 04, analytics 20/43). Only real counts from our database; anything we
// can't measure is returned as null so pages show "—" instead of a made-up 0.
import "server-only";
import { and, count, countDistinct, eq, gte, sql } from "drizzle-orm";
import { db, schema } from "@/db";

const TZ = "Asia/Tbilisi";

/** Daily counts for the last `days` days (Tbilisi calendar days), oldest first. */
export async function dailySeries(kind: "joins" | "visits" | "approved", days: number, challengeId?: string) {
  const since = new Date(Date.now() - days * 86_400_000);
  const day = (col: unknown) => sql<string>`to_char((${col} at time zone ${TZ})::date, 'YYYY-MM-DD')`;
  let rows: { day: string; n: number }[] = [];
  if (kind === "joins") {
    const p = schema.participations;
    rows = await db
      .select({ day: day(p.joinedAt), n: count() })
      .from(p)
      .where(and(gte(p.joinedAt, since), challengeId ? eq(p.challengeId, challengeId) : undefined))
      .groupBy(sql`1`);
  } else if (kind === "visits") {
    const c = schema.checkins;
    rows = await db
      .select({ day: day(c.createdAt), n: count() })
      .from(c)
      .innerJoin(schema.qrCodes, eq(schema.qrCodes.id, c.qrCodeId))
      .innerJoin(schema.missions, eq(schema.missions.id, schema.qrCodes.missionId))
      .where(and(gte(c.createdAt, since), challengeId ? eq(schema.missions.challengeId, challengeId) : undefined))
      .groupBy(sql`1`);
  } else {
    const s = schema.submissions;
    rows = await db
      .select({ day: day(s.reviewedAt), n: count() })
      .from(s)
      .innerJoin(schema.missions, eq(schema.missions.id, s.missionId))
      .where(and(eq(s.status, "approved"), gte(s.reviewedAt, since), challengeId ? eq(schema.missions.challengeId, challengeId) : undefined))
      .groupBy(sql`1`);
  }
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ });
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - 1 - i) * 86_400_000);
    const key = fmt.format(d);
    return { date: d, value: Number(rows.find((r) => r.day === key)?.n ?? 0) };
  });
}

/** Group a daily series into `buckets` bars (sums), labelled by each bucket's first day. */
export function bucket(series: { date: Date; value: number }[], buckets: number) {
  const size = Math.ceil(series.length / buckets);
  const out: { date: Date; value: number }[] = [];
  for (let i = 0; i < series.length; i += size) out.push({ date: series[i].date, value: series.slice(i, i + size).reduce((a, b) => a + b.value, 0) });
  return out;
}

export async function dashboardStats() {
  const monthStart = new Date(new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit" }).format(new Date()) + "-01T00:00:00+04:00");
  const [[active], [participants], [visits], [vouchers]] = await Promise.all([
    db.select({ n: count() }).from(schema.challenges).where(eq(schema.challenges.status, "active")),
    db.select({ n: countDistinct(schema.participations.userId) }).from(schema.participations),
    db.select({ n: count() }).from(schema.checkins),
    db.select({ n: count() }).from(schema.vouchers).where(gte(schema.vouchers.createdAt, monthStart)),
  ]);
  return { active: active.n, participants: participants.n, visits: visits.n, vouchersThisMonth: vouchers.n };
}

/** Change of new joins: last 30 days vs the 30 before. null when there is no earlier baseline. */
export async function joinTrend() {
  const now = Date.now();
  const p = schema.participations;
  const [[recent], [before]] = await Promise.all([
    db.select({ n: count() }).from(p).where(gte(p.joinedAt, new Date(now - 30 * 86_400_000))),
    db
      .select({ n: count() })
      .from(p)
      .where(and(gte(p.joinedAt, new Date(now - 60 * 86_400_000)), sql`${p.joinedAt} < ${new Date(now - 30 * 86_400_000)}`)),
  ]);
  if (!before.n) return null;
  return Math.round(((recent.n - before.n) / before.n) * 100);
}

/**
 * Analytics cards (20 / 43 / 44) for the last `days` days, optionally one campaign.
 * views = sum of admin-entered post views (cumulative, not per period) — null when no post has numbers.
 * visits = null for a campaign without a QR visit (not 0).
 */
export async function periodStats(days: number, challengeId?: string) {
  const since = new Date(Date.now() - days * 86_400_000);
  const { participations: p, submissions: s, missions: m, checkins: ck, qrCodes: q, socialPosts: sp, challenges: ch } = schema;
  const [[joined], [approved], [visits], viewsRow, campaign] = await Promise.all([
    db.select({ n: countDistinct(p.userId) }).from(p).where(and(gte(p.joinedAt, since), challengeId ? eq(p.challengeId, challengeId) : undefined)),
    db
      .select({ n: count() })
      .from(s)
      .innerJoin(m, eq(m.id, s.missionId))
      .where(and(eq(s.status, "approved"), gte(s.reviewedAt, since), challengeId ? eq(m.challengeId, challengeId) : undefined)),
    db
      .select({ n: count() })
      .from(ck)
      .innerJoin(q, eq(q.id, ck.qrCodeId))
      .innerJoin(m, eq(m.id, q.missionId))
      .where(and(gte(ck.createdAt, since), challengeId ? eq(m.challengeId, challengeId) : undefined)),
    db
      .select({
        views: sql<number | null>`sum((${sp.metrics}->>'views')::bigint)`.mapWith((v) => (v == null ? null : Number(v))),
        withMetrics: sql<number>`count(*) filter (where ${sp.metrics}->>'views' is not null)`.mapWith(Number),
        posts: count(),
        lastSynced: sql<Date | null>`max(${sp.lastSyncedAt})`.mapWith((v) => (v ? new Date(v) : null)),
      })
      .from(sp)
      .innerJoin(m, eq(m.id, sp.missionId))
      .where(and(eq(sp.status, "verified"), challengeId ? eq(m.challengeId, challengeId) : undefined)),
    challengeId ? db.query.challenges.findFirst({ where: eq(ch.id, challengeId), columns: { kind: true } }) : Promise.resolve(undefined),
  ]);
  const v = viewsRow[0];
  return {
    joined: joined.n,
    approved: approved.n,
    visits: campaign && campaign.kind !== "visit" ? null : visits.n,
    views: v && v.withMetrics > 0 ? v.views : null,
    viewsCoverage: { withMetrics: v?.withMetrics ?? 0, posts: v?.posts ?? 0 },
    lastSynced: v?.lastSynced ?? null,
  };
}

/** The moment `days` days ago (for "last N days" filters). */
export function sinceDays(days: number) {
  return new Date(Date.now() - days * 86_400_000);
}
