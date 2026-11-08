"use server";
// Business panel: propose a campaign (goes to the admin as a draft to publish) and the AI campaign advisor.
// SECURITY: every exported function starts with requireBusiness() (role business or admin).
import { eq, max } from "drizzle-orm";
import { generateText, Output } from "ai";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/db";
import { slugify } from "@/lib/admin-campaigns";
import { isCity } from "@/lib/cities";
import { requireBusiness } from "@/lib/session";

export type BusinessFormState = { fieldErrors?: Record<string, string>; values?: Record<string, string> } | undefined;

const KEYS = ["titleKa", "titleEn", "descriptionKa", "descriptionEn", "brand", "interestId", "kind", "city", "hashtags", "startsAt", "endsAt", "rewardKa", "rewardEn", "rewardValue", "rewardStock"];

// ---- Create a campaign (draft, waits for the admin to publish) ----
export async function createBusinessCampaignAction(_prev: BusinessFormState, form: FormData): Promise<BusinessFormState> {
  const me = await requireBusiness();
  const values = Object.fromEntries(KEYS.map((k) => [k, String(form.get(k) ?? "")]));
  const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).transform((d) => new Date(`${d}T00:00:00+04:00`));
  const optInt = z.string().trim().transform((v) => (v === "" ? null : Number(v))).refine((v) => v === null || (Number.isInteger(v) && v >= 0 && v <= 100000));
  const parsed = z
    .object({
      titleKa: z.string().trim().min(1).max(80),
      titleEn: z.string().trim().min(1).max(80),
      descriptionKa: z.string().trim().min(1).max(400),
      descriptionEn: z.string().trim().max(400),
      brand: z.string().trim().min(1).max(80),
      interestId: z.string().uuid(),
      kind: z.enum(["visit", "video"]),
      city: z.string().refine((v) => v === "" || isCity(v)),
      hashtags: z
        .string()
        .trim()
        .transform((v) => [...new Set(["#BeFamous", ...v.split(/[\s,]+/).filter(Boolean).map((t) => (t.startsWith("#") ? t : `#${t}`))])])
        .refine((t) => t.length <= 6 && t.every((x) => /^#[\p{L}\p{N}_]{2,40}$/u.test(x)))
        .transform((t) => t.join(" ")),
      startsAt: day,
      endsAt: day,
      rewardKa: z.string().trim().min(1).max(120),
      rewardEn: z.string().trim().max(120),
      rewardValue: optInt,
      rewardStock: optInt,
    })
    .refine((v) => v.endsAt > v.startsAt, { path: ["endsAt"] })
    .safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] = "invalid";
    return { fieldErrors, values };
  }
  const d = parsed.data;
  const interest = await db.query.interests.findFirst({ where: eq(schema.interests.id, d.interestId) });
  const base = slugify(d.titleEn);
  let slug = base;
  for (let n = 2; await db.query.challenges.findFirst({ where: eq(schema.challenges.slug, slug), columns: { id: true } }); n++) slug = `${base}-${n}`;
  const [{ top }] = await db.select({ top: max(schema.challenges.sortOrder) }).from(schema.challenges);
  const rewardEn = d.rewardEn || d.rewardKa;

  const id = await db.transaction(async (tx) => {
    const [ch] = await tx
      .insert(schema.challenges)
      .values({
        slug,
        titleKa: d.titleKa,
        titleEn: d.titleEn,
        descriptionKa: d.descriptionKa,
        descriptionEn: d.descriptionEn || d.descriptionKa,
        brand: d.brand,
        interestId: interest?.id ?? null,
        categoryKa: interest?.nameKa.toLocaleUpperCase("ka") ?? null,
        categoryEn: interest?.nameEn.toUpperCase() ?? null,
        coverArt: { icon: interest?.slug ?? "camera", kicker: interest?.nameEn.toUpperCase() ?? "BEFAMOUS", label: d.titleEn.toUpperCase() },
        kind: d.kind,
        city: d.city || null,
        hashtags: d.hashtags,
        rewardKa: d.rewardKa,
        rewardEn,
        startsAt: d.startsAt,
        endsAt: new Date(d.endsAt.getTime() + 86_399_000),
        xpReward: 200,
        status: "draft",
        ownerId: me.id,
        sortOrder: (top ?? 0) + 1,
        rules: [
          { icon: "/figma/icon-spark-20.svg", titleKa: "ჰეშთეგები", titleEn: "Hashtags", captionKa: d.hashtags, captionEn: d.hashtags },
          { icon: "/figma/icon-gift-20.svg", titleKa: "ჯილდო", titleEn: "Reward", captionKa: d.rewardKa, captionEn: rewardEn },
        ],
      })
      .returning({ id: schema.challenges.id });
    // Standard missions: visit campaigns = QR check-in, then the post; video campaigns = the post.
    let qrId: string | null = null;
    if (d.kind === "visit") {
      const [qr] = await tx.insert(schema.missions).values({ challengeId: ch.id, type: "visit_qr", titleKa: "QR ვიზიტი", titleEn: "QR visit", xpReward: 100, position: 1, required: true, placeName: d.brand }).returning();
      qrId = qr.id;
      await tx.insert(schema.qrCodes).values({ missionId: qr.id, code: `${base.slice(0, 8).toUpperCase().replace(/-/g, "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, label: d.brand });
    }
    await tx.insert(schema.missions).values({ challengeId: ch.id, type: "upload", titleKa: "კრეატიული ვიდეო", titleEn: "Creative video", xpReward: 0, position: qrId ? 2 : 1, required: true, unlockAfterMissionId: qrId, config: { hashtags: d.hashtags } });
    await tx.insert(schema.rewards).values({ titleKa: d.rewardKa, titleEn: rewardEn, valueGel: d.rewardValue, stock: d.rewardStock, brand: d.brand, challengeId: ch.id, expiresAt: new Date(d.endsAt.getTime() + 30 * 86_400_000) });
    await tx.insert(schema.auditLog).values({ actorId: me.id, action: "business.campaign.create", target: ch.id });
    return ch.id;
  });
  redirect(`/business/panel/campaigns?created=${id}`);
}

// ---- AI campaign advisor ----
export type Idea = { titleKa: string; titleEn: string; topic: "cafes" | "fashion" | "tech" | "beauty"; kind: "visit" | "video"; hashtag: string; rewardKa: string; descriptionKa: string; whyKa: string };
export type AdvisorState = { ideas?: Idea[]; error?: "input" | "unavailable"; values?: Record<string, string> } | undefined;

const ideaSchema = z.object({
  ideas: z
    .array(
      z.object({
        titleKa: z.string().describe("Short campaign name in Georgian"),
        titleEn: z.string().describe("Same name in English"),
        topic: z.enum(["cafes", "fashion", "tech", "beauty"]),
        kind: z.enum(["visit", "video"]).describe("visit = customers come in and scan a QR code, then post; video = they only post"),
        hashtag: z.string().describe("One campaign hashtag without spaces, e.g. #SecretCoffee"),
        rewardKa: z.string().describe("Reward for approved posts, in Georgian, e.g. 30 ₾ ვაუჩერი"),
        descriptionKa: z.string().describe("What creators should post, 1-2 sentences in Georgian"),
        whyKa: z.string().describe("Why this fits this business, 1-2 sentences in Georgian"),
      }),
    )
    .length(3),
});

export async function adviseCampaignAction(_prev: AdvisorState, form: FormData): Promise<AdvisorState> {
  await requireBusiness();
  const values = { business: String(form.get("business") ?? "").trim().slice(0, 600), goal: String(form.get("goal") ?? "").trim().slice(0, 300), city: String(form.get("city") ?? ""), budget: String(form.get("budget") ?? "").trim().slice(0, 40) };
  if (values.business.length < 5) return { error: "input", values };
  try {
    const { output } = await generateText({
      model: process.env.AI_GATEWAY_MODEL ?? "anthropic/claude-sonnet-5.5",
      output: Output.object({ schema: ideaSchema }),
      system:
        "You are a marketing advisor for BeFamous, a Georgian platform where local creators post TikTok/Instagram videos for brand challenges and get vouchers. Suggest practical, realistic campaigns for small Georgian businesses. Rewards are vouchers or products. Write Georgian text naturally. Never promise views or sales numbers.",
      prompt: `Business: ${values.business}\nGoal: ${values.goal || "more visits and awareness"}\nCity: ${values.city || "Georgia"}\nBudget for rewards: ${values.budget || "small"}\nSuggest exactly 3 different campaign ideas.`,
    });
    return { ideas: output.ideas.map((i) => ({ ...i, hashtag: i.hashtag.startsWith("#") ? i.hashtag.replace(/\s+/g, "") : `#${i.hashtag.replace(/\s+/g, "")}` })), values };
  } catch (e) {
    console.error("AI advisor failed:", e instanceof Error ? e.message : e);
    return { error: "unavailable", values };
  }
}
