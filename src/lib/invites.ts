// Invite codes (54): one per user, e.g. "NINO-BF26". A friend opens /i/NINO-BF26, signs up,
// and the inviter gets a notification + their optional "invite a friend" mission.
import "server-only";
import { and, eq, inArray, isNull, ne, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { completeMission } from "@/lib/progress";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Georgian → Latin letters so codes are easy to type anywhere.
const latin: Record<string, string> = {
  ა: "A", ბ: "B", გ: "G", დ: "D", ე: "E", ვ: "V", ზ: "Z", თ: "T", ი: "I", კ: "K", ლ: "L", მ: "M", ნ: "N", ო: "O", პ: "P", ჟ: "ZH", რ: "R",
  ს: "S", ტ: "T", უ: "U", ფ: "P", ქ: "K", ღ: "GH", ყ: "Q", შ: "SH", ჩ: "CH", ც: "TS", ძ: "DZ", წ: "TS", ჭ: "CH", ხ: "KH", ჯ: "J", ჰ: "H",
};

function codePrefix(name: string) {
  const first = name.trim().split(/\s+/)[0] ?? "";
  const word = [...first].map((ch) => latin[ch] ?? ch.toUpperCase()).join("").replace(/[^A-Z]/g, "");
  return (word || "BF").slice(0, 8);
}

export const INVITE_COOKIE = "invite";
export const isInviteCode = (v: unknown): v is string => typeof v === "string" && /^[A-Z]{1,8}-BF\d{2,4}$/.test(v);

/** The user's invite code, created on first visit to 54. */
export async function getOrCreateInviteCode(userId: string, name: string) {
  const existing = await db.query.invites.findFirst({ where: eq(schema.invites.inviterId, userId) });
  if (existing) return existing.code;
  const prefix = codePrefix(name);
  for (let attempt = 0; attempt < 8; attempt++) {
    const digits = attempt < 5 ? 2 : 4; // widen if the short space is crowded
    const n = crypto.getRandomValues(new Uint32Array(1))[0] % 10 ** digits;
    const code = `${prefix}-BF${String(n).padStart(digits, "0")}`;
    const [row] = await db.insert(schema.invites).values({ inviterId: userId, code }).onConflictDoNothing().returning({ code: schema.invites.code });
    if (row) return row.code;
    const mine = await db.query.invites.findFirst({ where: eq(schema.invites.inviterId, userId) });
    if (mine) return mine.code; // created concurrently
  }
  throw new Error("Could not create an invite code");
}

/** Called inside sign-up: links the new user to the inviter and rewards the inviter. */
export async function acceptInvite(tx: Tx, newUserId: string, code: string) {
  const invite = await tx.query.invites.findFirst({ where: and(eq(schema.invites.code, code), ne(schema.invites.inviterId, newUserId)) });
  if (!invite) return;
  const inviter = await tx.query.users.findFirst({ where: and(eq(schema.users.id, invite.inviterId), isNull(schema.users.deletedAt)) });
  if (!inviter) return;
  const [linked] = await tx
    .update(schema.users)
    .set({ invitedById: inviter.id })
    .where(and(eq(schema.users.id, newUserId), isNull(schema.users.invitedById)))
    .returning({ id: schema.users.id });
  if (!linked) return;
  await tx.insert(schema.notifications).values({ userId: inviter.id, kind: "invite_accepted", data: { inviteeId: newUserId } });

  // Complete the inviter's open "invite a friend" missions in challenges they joined.
  const joined = await tx.select({ challengeId: schema.participations.challengeId }).from(schema.participations).where(eq(schema.participations.userId, inviter.id));
  if (!joined.length) return;
  const inviteMissions = await tx
    .select({ id: schema.missions.id })
    .from(schema.missions)
    .where(and(eq(schema.missions.type, "invite"), inArray(schema.missions.challengeId, joined.map((j) => j.challengeId))));
  for (const m of inviteMissions) await completeMission(tx, inviter.id, m.id);
}

/** How many friends signed up with this user's link. */
export async function countInvited(userId: string) {
  const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(schema.users).where(eq(schema.users.invitedById, userId));
  return row?.n ?? 0;
}
