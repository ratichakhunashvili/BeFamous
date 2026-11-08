"use server";
// Admin campaign wizard (12–16, 35–37) and campaign status (27/28).
// SECURITY: every exported function starts with requireAdmin().
import { randomBytes } from "node:crypto";
import { and, eq, max, ne } from "drizzle-orm";
import { redirect, RedirectType } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/db";
import { getCampaign, missionsLocked, slugify } from "@/lib/admin-campaigns";
import { isCity } from "@/lib/cities";
import { requireAdmin } from "@/lib/session";

export type WizardState = { fieldErrors?: Record<string, string>; values?: Record<string, string>; error?: string } | undefined;

const uuid = z.string().uuid();
const text = (max: number) => z.string().trim().max(max);
const req = (max: number) => z.string().trim().min(1).max(max);
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .transform((d) => new Date(`${d}T00:00:00+04:00`)); // start of that day in Tbilisi

function collect(form: FormData, keys: string[]) {
  return Object.fromEntries(keys.map((k) => [k, String(form.get(k) ?? "")]));
}
function errorsOf(issues: z.core.$ZodIssue[]) {
  const out: Record<string, string> = {};
  for (const i of issues) out[String(i.path[0])] = "invalid";
  return out;
}
/** "draft" = save and go to the list; otherwise continue to the next step. */
const after = (form: FormData, next: string) => (form.get("intent") === "draft" ? "/admin/campaigns?status=draft" : next);
async function audit(actorId: string, action: string, target: string, data?: unknown) {
  await db.insert(schema.auditLog).values({ actorId, action, target, data: data ?? null });
}

// ---------- 12: basics (creates the draft on first save) ----------
export async function saveBasicsAction(_prev: WizardState, form: FormData): Promise<WizardState> {
  const admin = await requireAdmin();
  const keys = ["id", "titleKa", "titleEn", "descriptionKa", "descriptionEn", "brand", "interestId", "kind", "city", "hashtags", "startsAt", "endsAt"];
  const values = collect(form, keys);
  const parsed = z
    .object({
      titleKa: req(80),
      titleEn: req(80),
      descriptionKa: text(400),
      descriptionEn: text(400),
      brand: text(80),
      interestId: z.string().refine((v) => v === "" || /^[0-9a-f-]{36}$/i.test(v)),
      kind: z.enum(["visit", "video"]),
      city: z.string().refine((v) => v === "" || isCity(v)),
      // Each tag "#Word"; BeFamous campaigns always include #BeFamous.
      hashtags: z
        .string()
        .trim()
        .transform((v) => [...new Set(v.split(/[\s,]+/).filter(Boolean).map((t) => (t.startsWith("#") ? t : `#${t}`)))])
        .refine((tags) => tags.length > 0 && tags.length <= 6 && tags.every((t) => /^#[\p{L}\p{N}_]{2,40}$/u.test(t)))
        .transform((tags) => tags.join(" ")),
      startsAt: date,
      endsAt: date,
    })
    .refine((v) => v.endsAt > v.startsAt, { path: ["endsAt"] })
    .safeParse(values);
  if (!parsed.success) return { fieldErrors: errorsOf(parsed.error.issues), values };
  const d = parsed.data;
  const interest = d.interestId ? await db.query.interests.findFirst({ where: eq(schema.interests.id, d.interestId) }) : undefined;
  const endOfDay = new Date(d.endsAt.getTime() + 86_399_000); // the campaign runs through its last day
  const fields = {
    titleKa: d.titleKa,
    titleEn: d.titleEn,
    descriptionKa: d.descriptionKa || null,
    descriptionEn: d.descriptionEn || null,
    brand: d.brand || null,
    interestId: interest?.id ?? null,
    categoryKa: interest ? interest.nameKa.toLocaleUpperCase("ka") : null,
    categoryEn: interest ? interest.nameEn.toUpperCase() : null,
    coverArt: { icon: "camera", kicker: interest ? interest.nameEn.toUpperCase() : "BEFAMOUS", label: d.titleEn.toUpperCase() },
    kind: d.kind,
    city: d.city || null,
    hashtags: d.hashtags,
    startsAt: d.startsAt,
    endsAt: endOfDay,
  };

  let id = values.id;
  if (id) {
    const existing = await db.query.challenges.findFirst({ where: eq(schema.challenges.id, uuid.parse(id)) });
    if (!existing) return { error: "notFound", values };
    await db.update(schema.challenges).set(fields).where(eq(schema.challenges.id, id));
    await audit(admin.id, "campaign.update", id, { step: "basics" });
  } else {
    // Unique slug from the English title.
    const base = slugify(d.titleEn);
    let slug = base;
    for (let n = 2; await db.query.challenges.findFirst({ where: eq(schema.challenges.slug, slug), columns: { id: true } }); n++) slug = `${base}-${n}`;
    const [{ top }] = await db.select({ top: max(schema.challenges.sortOrder) }).from(schema.challenges);
    const [row] = await db
      .insert(schema.challenges)
      .values({ ...fields, slug, status: "draft", sortOrder: (top ?? 0) + 1 })
      .returning({ id: schema.challenges.id });
    id = row.id;
    await audit(admin.id, "campaign.create", id);
  }
  redirect(after(form, `/admin/campaigns/${id}/edit/missions`), RedirectType.push);
}

// ---------- 35: mission add / edit ----------
export async function saveMissionAction(_prev: WizardState, form: FormData): Promise<WizardState> {
  const admin = await requireAdmin();
  const values = collect(form, ["campaignId", "missionId", "titleKa", "titleEn", "type", "descriptionKa", "descriptionEn", "xpReward", "required", "placeName"]);
  const campaign = await getCampaign(uuid.parse(values.campaignId));
  if (!campaign) return { error: "notFound", values };
  if (missionsLocked(campaign)) return { error: "locked", values };
  const parsed = z
    .object({
      titleKa: req(80),
      titleEn: req(80),
      type: z.enum(["visit_qr", "upload", "invite"]),
      descriptionKa: text(200),
      descriptionEn: text(200),
      xpReward: z.coerce.number().int().min(0).max(10_000),
      placeName: text(120),
    })
    .safeParse(values);
  if (!parsed.success) return { fieldErrors: errorsOf(parsed.error.issues), values };
  const d = parsed.data;
  const required = values.required === "on" && d.type !== "invite"; // invites are always optional
  const firstQr = campaign.missions.find((m) => m.type === "visit_qr" && m.id !== values.missionId);
  const fields = {
    titleKa: d.titleKa,
    titleEn: d.titleEn,
    type: d.type,
    descriptionKa: d.descriptionKa || null,
    descriptionEn: d.descriptionEn || null,
    xpReward: d.xpReward,
    required,
    placeName: d.type === "visit_qr" ? d.placeName || campaign.challenge.brand : null,
    // In visit campaigns the post unlocks after the QR check-in (as in the app's screen 11).
    unlockAfterMissionId: d.type === "upload" && campaign.challenge.kind === "visit" ? (firstQr?.id ?? null) : null,
    config: d.type === "upload" ? { hashtags: campaign.challenge.hashtags } : {},
  };
  let missionId = values.missionId;
  if (missionId) {
    if (!campaign.missions.some((m) => m.id === missionId)) return { error: "notFound", values };
    await db.update(schema.missions).set(fields).where(eq(schema.missions.id, missionId));
  } else {
    const [row] = await db
      .insert(schema.missions)
      .values({ ...fields, challengeId: campaign.challenge.id, position: campaign.missions.length + 1 })
      .returning({ id: schema.missions.id });
    missionId = row.id;
  }
  // Every visit mission has its own printable QR code.
  if (d.type === "visit_qr" && !campaign.qr.some((q) => q.missionId === missionId)) {
    const code = `${slugify(campaign.challenge.titleEn).slice(0, 8).toUpperCase().replace(/-/g, "")}-${randomBytes(4).toString("hex").toUpperCase()}`;
    await db.insert(schema.qrCodes).values({ missionId, code, label: fields.placeName });
  }
  await audit(admin.id, values.missionId ? "mission.update" : "mission.create", missionId, { campaign: campaign.challenge.id });
  redirect(`/admin/campaigns/${campaign.challenge.id}/edit/missions?saved=${missionId}`, RedirectType.replace);
}

export async function deleteMissionAction(form: FormData) {
  const admin = await requireAdmin();
  const campaign = await getCampaign(uuid.parse(form.get("campaignId")));
  const missionId = uuid.parse(form.get("missionId"));
  if (campaign && !missionsLocked(campaign) && campaign.missions.some((m) => m.id === missionId)) {
    await db.delete(schema.missions).where(eq(schema.missions.id, missionId));
    // Keep positions 1..n.
    const rest = campaign.missions.filter((m) => m.id !== missionId);
    for (const [i, m] of rest.entries()) await db.update(schema.missions).set({ position: i + 1 }).where(eq(schema.missions.id, m.id));
    await audit(admin.id, "mission.delete", missionId, { campaign: campaign.challenge.id });
  }
  redirect(`/admin/campaigns/${campaign?.challenge.id ?? ""}/edit/missions`, RedirectType.replace);
}

// ---------- 14: reward and completion XP ----------
export async function saveCampaignRewardAction(_prev: WizardState, form: FormData): Promise<WizardState> {
  const admin = await requireAdmin();
  const values = collect(form, ["campaignId", "rewardKa", "rewardEn", "valueGel", "stock", "expiresAt", "xpReward"]);
  const campaign = await getCampaign(uuid.parse(values.campaignId));
  if (!campaign) return { error: "notFound", values };
  const optInt = z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v)))
    .refine((v) => v === null || (Number.isInteger(v) && v >= 0 && v <= 1_000_000));
  const parsed = z
    .object({
      rewardKa: text(120),
      rewardEn: text(120),
      valueGel: optInt,
      stock: optInt,
      expiresAt: z.string().refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v)),
      xpReward: z.coerce.number().int().min(0).max(100_000),
    })
    .refine((v) => (v.rewardKa === "") === (v.rewardEn === ""), { path: ["rewardEn"] })
    .safeParse(values);
  if (!parsed.success) return { fieldErrors: errorsOf(parsed.error.issues), values };
  const d = parsed.data;
  await db
    .update(schema.challenges)
    .set({ xpReward: d.xpReward, rewardKa: d.rewardKa || null, rewardEn: d.rewardEn || null })
    .where(eq(schema.challenges.id, campaign.challenge.id));
  if (d.rewardKa) {
    const fields = {
      titleKa: d.rewardKa,
      titleEn: d.rewardEn,
      valueGel: d.valueGel,
      stock: d.stock,
      brand: campaign.challenge.brand,
      expiresAt: d.expiresAt ? new Date(`${d.expiresAt}T23:59:59+04:00`) : campaign.challenge.endsAt,
    };
    if (campaign.reward) await db.update(schema.rewards).set(fields).where(eq(schema.rewards.id, campaign.reward.id));
    else await db.insert(schema.rewards).values({ ...fields, challengeId: campaign.challenge.id });
  }
  await audit(admin.id, "campaign.update", campaign.challenge.id, { step: "rewards" });
  redirect(after(form, `/admin/campaigns/${campaign.challenge.id}/edit/rules`), RedirectType.push);
}

// ---------- 15: rules (shown to users on screen 65 before joining) ----------
export async function saveRulesAction(_prev: WizardState, form: FormData): Promise<WizardState> {
  const admin = await requireAdmin();
  const keys = ["campaignId", "entryKa", "entryEn", "methodKa", "methodEn", "workKa", "workEn"];
  const values = collect(form, keys);
  const campaign = await getCampaign(uuid.parse(values.campaignId));
  if (!campaign) return { error: "notFound", values };
  const parsed = z.object(Object.fromEntries(keys.slice(1).map((k) => [k, req(160)]))).safeParse(values);
  if (!parsed.success) return { fieldErrors: errorsOf(parsed.error.issues), values };
  const v = parsed.data as Record<string, string>;
  const c = campaign.challenge;
  const rules = [
    { icon: "/figma/icon-spark-20.svg", titleKa: "ჰეშთეგები", titleEn: "Hashtags", captionKa: c.hashtags ?? "#BeFamous", captionEn: c.hashtags ?? "#BeFamous" },
    { icon: "/figma/icon-team.svg", titleKa: "მონაწილეობის პირობა", titleEn: "Who can take part", captionKa: v.entryKa, captionEn: v.entryEn },
    { icon: "/figma/icon-camera-20.svg", titleKa: "ნამუშევრის პირობა", titleEn: "What to post", captionKa: v.workKa, captionEn: v.workEn },
    { icon: "/figma/icon-check.svg", titleKa: "შეფასება", titleEn: "How it's judged", captionKa: v.methodKa, captionEn: v.methodEn },
    ...(c.rewardKa ? [{ icon: "/figma/icon-gift-20.svg", titleKa: "ჯილდო", titleEn: "Reward", captionKa: c.rewardKa, captionEn: c.rewardEn ?? c.rewardKa }] : []),
  ];
  await db.update(schema.challenges).set({ rules, rulesKa: v.entryKa, rulesEn: v.entryEn }).where(eq(schema.challenges.id, c.id));
  await audit(admin.id, "campaign.update", c.id, { step: "rules" });
  redirect(after(form, `/admin/campaigns/${c.id}/edit/review`), RedirectType.push);
}

// ---------- 37: publish now / schedule ----------
const stepIcon = { visit_qr: "/figma/icon-qr.svg", upload: "/figma/icon-upload-20.svg", social_post: "/figma/icon-upload-20.svg", invite: "/figma/icon-team.svg" } as const;

export async function publishCampaignAction(form: FormData) {
  const admin = await requireAdmin();
  const campaign = await getCampaign(uuid.parse(form.get("campaignId")));
  if (!campaign) redirect("/admin/campaigns");
  const mode = form.get("mode") === "schedule" ? "schedule" : "now";
  const c = campaign.challenge;
  const ready = c.titleKa && c.titleEn && c.startsAt && c.endsAt && campaign.missions.some((m) => m.required) && (c.rules?.length ?? 0) > 0;
  if (!ready || c.status === "ended") redirect(`/admin/campaigns/${c.id}/edit/publish?error=incomplete`);
  const startsInFuture = c.startsAt! > new Date();
  if (mode === "schedule" && !startsInFuture) redirect(`/admin/campaigns/${c.id}/edit/publish?error=start`);
  const status = mode === "schedule" || startsInFuture ? "scheduled" : "active";
  // "How to take part" rows on the app's detail screen, built from the missions.
  const steps = [
    { icon: "/figma/icon-activity.svg", titleKa: "გაეცანი პირობებს", titleEn: "Read the rules", captionKa: "მონაწილეობა უფასოა", captionEn: "Taking part is free", link: "rules" as const },
    ...campaign.missions.map((m) => ({ icon: stepIcon[m.type], titleKa: m.titleKa, titleEn: m.titleEn, captionKa: m.descriptionKa ?? "", captionEn: m.descriptionEn ?? "" })),
  ];
  await db.update(schema.challenges).set({ status, steps }).where(and(eq(schema.challenges.id, c.id), ne(schema.challenges.status, "ended")));
  await audit(admin.id, `campaign.${status === "active" ? "publish" : "schedule"}`, c.id);
  redirect(`/admin/campaigns/${c.id}/published`, RedirectType.replace);
}

// ---------- 27 / 28: pause and resume ----------
export async function setCampaignPausedAction(form: FormData) {
  const admin = await requireAdmin();
  const id = uuid.parse(form.get("campaignId"));
  const pause = form.get("pause") === "1";
  await db
    .update(schema.challenges)
    .set({ status: pause ? "paused" : "active" })
    .where(and(eq(schema.challenges.id, id), eq(schema.challenges.status, pause ? "active" : "paused")));
  await audit(admin.id, pause ? "campaign.pause" : "campaign.resume", id);
  redirect(`/admin/campaigns/${id}`, RedirectType.replace);
}

/** Only an unpublished draft that nobody joined can be deleted (published campaigns keep their history). */
export async function deleteDraftAction(form: FormData) {
  const admin = await requireAdmin();
  const campaign = await getCampaign(uuid.parse(form.get("campaignId")));
  if (campaign && campaign.challenge.status === "draft" && campaign.joined === 0) {
    await db.delete(schema.rewards).where(eq(schema.rewards.challengeId, campaign.challenge.id));
    await db.delete(schema.challenges).where(eq(schema.challenges.id, campaign.challenge.id));
    await audit(admin.id, "campaign.delete", campaign.challenge.id, { title: campaign.challenge.titleKa });
  }
  redirect("/admin/campaigns?status=draft", RedirectType.replace);
}
