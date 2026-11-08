// DEMO DATA for presentations: 10 campaigns + ~60 generated users who joined, visited, posted,
// got reviewed and earned rewards over the last 30 days — so the admin dashboard and analytics fill up.
// Everything is marked so it can be removed in one go:
//   users:      email ends with @demo.befamous
//   campaigns:  slug starts with "demo-"
//   metrics:    social_posts.metrics_source = "demo" (shown as the source in analytics)
//   npm run demo:data          add (re-running first removes the previous demo data)
//   npm run demo:data -- clean remove it all
import { config } from "dotenv";
config({ path: ".env.local" });

const FIRST = ["ნინო", "გიორგი", "ანა", "ლუკა", "მარიამ", "დავით", "სალომე", "ნიკა", "თამარ", "ლევან", "ელენე", "საბა", "მაკა", "ირაკლი", "ქეთი", "ზურა", "ნათია", "ბექა", "სოფო", "ოთარ"];
const LAST = ["ბერიძე", "მაისურაძე", "კვარაცხელია", "გელაშვილი", "ლომიძე", "ჯაფარიძე", "ხარაბაძე", "ნოზაძე", "ცერცვაძე", "მჭედლიშვილი", "წიკლაური", "ბაქრაძე"];
const CITIES = ["tbilisi", "tbilisi", "tbilisi", "batumi", "kutaisi", "outside"];

type Camp = { slug: string; ka: string; en: string; interest: string; kind: "visit" | "video"; city: string | null; brand: string; tag: string; reward: [string, string, number]; xp: number; status: "active" | "ended" | "scheduled" };
const CAMPAIGNS: Camp[] = [
  { slug: "demo-latte-art", ka: "ლატე არტის კვირა", en: "Latte Art Week", interest: "cafes", kind: "visit", city: "tbilisi", brand: "Fabrika Café", tag: "#LatteArtWeek", reward: ["30 ₾ ყავის ვაუჩერი", "30 ₾ coffee voucher", 30], xp: 200, status: "active" },
  { slug: "demo-khachapuri", ka: "ხაჭაპურის გამოწვევა", en: "Khachapuri Challenge", interest: "cafes", kind: "visit", city: "batumi", brand: "Adjara Bakery", tag: "#KhachapuriChallenge", reward: ["25 ₾ ვაუჩერი", "25 ₾ voucher", 25], xp: 180, status: "active" },
  { slug: "demo-street-style", ka: "ქუჩის სტილი", en: "Street Style Tbilisi", interest: "fashion", kind: "video", city: "tbilisi", brand: "Vake Studio", tag: "#StreetStyleTbilisi", reward: ["50 ₾ ვაუჩერი", "50 ₾ voucher", 50], xp: 250, status: "active" },
  { slug: "demo-vintage", ka: "ვინტაჟური ლუქი", en: "Vintage Look", interest: "fashion", kind: "video", city: null, brand: "Retro Market", tag: "#VintageLook", reward: ["40 ₾ ვაუჩერი", "40 ₾ voucher", 40], xp: 220, status: "active" },
  { slug: "demo-unboxing", ka: "ანბოქსინგ დღე", en: "Unboxing Day", interest: "tech", kind: "video", city: null, brand: "Zoommer", tag: "#UnboxingDay", reward: ["60 ₾ ვაუჩერი", "60 ₾ voucher", 60], xp: 300, status: "active" },
  { slug: "demo-desk-setup", ka: "ჩემი სამუშაო მაგიდა", en: "My Desk Setup", interest: "tech", kind: "video", city: null, brand: "Alta", tag: "#MyDeskSetup", reward: ["Mystery Box", "Mystery Box", 0], xp: 260, status: "active" },
  { slug: "demo-glow-routine", ka: "დილის რუტინა", en: "Morning Glow Routine", interest: "beauty", kind: "video", city: null, brand: "Glow Lab", tag: "#MorningGlow", reward: ["35 ₾ ვაუჩერი", "35 ₾ voucher", 35], xp: 210, status: "active" },
  { slug: "demo-spa-visit", ka: "სპა ვიზიტი", en: "Spa Visit", interest: "beauty", kind: "visit", city: "tbilisi", brand: "Lumiere Spa", tag: "#SpaVisit", reward: ["45 ₾ ვაუჩერი", "45 ₾ voucher", 45], xp: 240, status: "active" },
  { slug: "demo-summer-menu", ka: "ზაფხულის მენიუ", en: "Summer Menu", interest: "cafes", kind: "visit", city: "kutaisi", brand: "Kutaisi Kitchen", tag: "#SummerMenu", reward: ["20 ₾ ვაუჩერი", "20 ₾ voucher", 20], xp: 150, status: "ended" },
  { slug: "demo-new-year", ka: "საახალწლო ლუქი", en: "New Year Look", interest: "fashion", kind: "video", city: null, brand: "Galleria", tag: "#NewYearLook", reward: ["70 ₾ ვაუჩერი", "70 ₾ voucher", 70], xp: 280, status: "scheduled" },
];

// Deterministic pseudo-random numbers so re-runs look similar.
let seed = 42;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];
const daysAgo = (d: number, h = 0) => new Date(Date.now() - d * 86_400_000 - h * 3_600_000);

async function main() {
  const clean = process.argv.includes("clean");
  const bcrypt = (await import("bcryptjs")).default;
  const { and, eq, inArray, like } = await import("drizzle-orm");
  const { db, schema } = await import("../src/db");
  const s = schema;

  // ---- remove previous demo data ----
  const oldUsers = await db.select({ id: s.users.id }).from(s.users).where(like(s.users.email, "%@demo.befamous"));
  const oldCamps = await db.select({ id: s.challenges.id }).from(s.challenges).where(like(s.challenges.slug, "demo-%"));
  if (oldCamps.length) await db.delete(s.rewards).where(inArray(s.rewards.challengeId, oldCamps.map((c) => c.id)));
  if (oldCamps.length) await db.delete(s.challenges).where(inArray(s.challenges.id, oldCamps.map((c) => c.id)));
  if (oldUsers.length) await db.delete(s.users).where(inArray(s.users.id, oldUsers.map((u) => u.id)));
  console.log(`removed ${oldCamps.length} demo campaigns, ${oldUsers.length} demo users`);
  if (clean) process.exit(0);

  const interests = await db.select().from(s.interests);
  const interestId = (slug: string) => interests.find((i) => i.slug === slug)?.id ?? null;

  // ---- users ----
  const hash = await bcrypt.hash(`demo-${Date.now()}`, 4); // nobody can sign in as a demo user
  const users = [];
  for (let i = 0; i < 60; i++) {
    const created = daysAgo(Math.floor(rnd() * 45) + 1);
    const [u] = await db
      .insert(s.users)
      .values({ name: `${pick(FIRST)} ${pick(LAST)}`, email: `user${i + 1}@demo.befamous`, passwordHash: hash, city: pick(CITIES), termsAcceptedAt: created, createdAt: created })
      .returning();
    users.push(u);
    const mine = interests.filter(() => rnd() < 0.5);
    if (mine.length) await db.insert(s.userInterests).values(mine.map((x) => ({ userId: u.id, interestId: x.id })));
  }

  let sort = 100;
  for (const c of CAMPAIGNS) {
    const start = c.status === "scheduled" ? daysAgo(-5) : c.status === "ended" ? daysAgo(40) : daysAgo(28);
    const end = c.status === "ended" ? daysAgo(3) : daysAgo(-25);
    const i = interests.find((x) => x.slug === c.interest);
    const hashtags = `#BeFamous ${c.tag}`;
    const [ch] = await db
      .insert(s.challenges)
      .values({
        slug: c.slug,
        titleKa: c.ka,
        titleEn: c.en,
        descriptionKa: `გამოაქვეყნე ვიდეო ${hashtags} ჰეშთეგებით და მიიღე ჯილდო.`,
        descriptionEn: `Post a video with ${hashtags} and earn a reward.`,
        brand: c.brand,
        interestId: interestId(c.interest),
        categoryKa: i?.nameKa.toLocaleUpperCase("ka") ?? null,
        categoryEn: i?.nameEn.toUpperCase() ?? null,
        coverArt: { icon: c.interest === "tech" ? "tech" : "camera", kicker: i?.nameEn.toUpperCase() ?? "BEFAMOUS", label: c.en.toUpperCase() },
        kind: c.kind,
        city: c.city,
        hashtags,
        rewardKa: c.reward[0],
        rewardEn: c.reward[1],
        status: c.status,
        startsAt: start,
        endsAt: end,
        xpReward: c.xp,
        sortOrder: sort++,
        rules: [
          { icon: "/figma/icon-spark-20.svg", titleKa: "ჰეშთეგები", titleEn: "Hashtags", captionKa: hashtags, captionEn: hashtags },
          { icon: "/figma/icon-gift-20.svg", titleKa: "ჯილდო", titleEn: "Reward", captionKa: c.reward[0], captionEn: c.reward[1] },
        ],
        steps: [{ icon: "/figma/icon-upload-20.svg", titleKa: "გამოაქვეყნე პოსტი", titleEn: "Publish a post", captionKa: hashtags, captionEn: hashtags }],
      })
      .returning();

    let qrMissionId: string | null = null;
    let qrId: string | null = null;
    if (c.kind === "visit") {
      const [m] = await db.insert(s.missions).values({ challengeId: ch.id, type: "visit_qr", titleKa: "QR ვიზიტი", titleEn: "QR visit", xpReward: 100, position: 1, required: true, placeName: c.brand }).returning();
      qrMissionId = m.id;
      const [q] = await db.insert(s.qrCodes).values({ missionId: m.id, code: `DEMO-${c.slug.slice(5, 11).toUpperCase()}-${Math.floor(rnd() * 1e6)}`, label: c.brand }).returning();
      qrId = q.id;
    }
    const [post] = await db
      .insert(s.missions)
      .values({ challengeId: ch.id, type: "upload", titleKa: "კრეატიული ვიდეო", titleEn: "Creative video", xpReward: 0, position: c.kind === "visit" ? 2 : 1, required: true, unlockAfterMissionId: qrMissionId, config: { hashtags } })
      .returning();
    const [reward] = await db
      .insert(s.rewards)
      .values({ titleKa: c.reward[0], titleEn: c.reward[1], valueGel: c.reward[2] || null, brand: c.brand, stock: 100, challengeId: ch.id, expiresAt: daysAgo(-40) })
      .returning();
    if (c.status === "scheduled") continue;

    // ---- participants ----
    const count = 12 + Math.floor(rnd() * 22);
    const people = [...users].sort(() => rnd() - 0.5).slice(0, count);
    for (const u of people) {
      const joined = daysAgo(Math.floor(rnd() * 27) + 1, Math.floor(rnd() * 12));
      await db.insert(s.participations).values({ userId: u.id, challengeId: ch.id, joinedAt: joined });
      const after = (h: number) => new Date(Math.min(Date.now() - 60_000, joined.getTime() + h * 3_600_000));
      let xp = 0;
      if (qrMissionId && qrId) {
        if (rnd() < 0.8) {
          await db.insert(s.checkins).values({ userId: u.id, qrCodeId: qrId, createdAt: after(5) });
          await db.insert(s.missionProgress).values({ userId: u.id, missionId: qrMissionId, status: "completed", completedAt: after(5) });
          await db.insert(s.xpEvents).values({ userId: u.id, amount: 100, reason: "mission", refId: qrMissionId, createdAt: after(5) });
          xp += 100;
        } else continue;
      }
      if (rnd() < 0.15) continue; // joined but never posted
      const r = rnd();
      const status = r < 0.55 ? "approved" : r < 0.72 ? "pending" : r < 0.88 ? "revision" : "rejected";
      const url = `https://www.tiktok.com/@${u.email.split("@")[0]}/video/7${Math.floor(rnd() * 1e17)}`;
      const created = after(24 + rnd() * 48);
      const reviewed = status === "pending" ? null : after(72 + rnd() * 48);
      const [sub] = await db
        .insert(s.submissions)
        .values({ userId: u.id, missionId: post.id, mediaUrl: url, mediaType: "post", platform: "tiktok", handle: `@${u.email.split("@")[0]}`, caption: `${pick(["ჩემი დღე", "ახალი ვიდეო", "ვცადე!", "საუკეთესო"])} ${hashtags}`, status, reviewNote: status === "revision" ? "დაამატე ბრენდის მონიშვნა." : status === "rejected" ? "პოსტი არ შეესაბამება წესებს." : null, reviewedAt: reviewed, createdAt: created })
        .returning();
      const views = Math.floor(200 + rnd() * 9000);
      await db.insert(s.socialPosts).values({
        userId: u.id,
        missionId: post.id,
        submissionId: sub.id,
        platform: "tiktok",
        url,
        title: "Demo post",
        caption: sub.caption,
        status: status === "approved" ? "verified" : "ownership_check",
        metrics: status === "approved" ? { views, likes: Math.floor(views * (0.05 + rnd() * 0.1)), comments: Math.floor(views * 0.01 * rnd()) } : null,
        metricsSource: status === "approved" ? "demo" : null,
        lastSyncedAt: status === "approved" ? reviewed : null,
        createdAt: created,
      });
      await db.insert(s.missionProgress).values({ userId: u.id, missionId: post.id, status: status === "approved" ? "completed" : status === "pending" ? "pending_review" : "in_progress", completedAt: status === "approved" ? reviewed : null });
      if (status === "approved" && reviewed) {
        xp += c.xp;
        await db.update(s.participations).set({ completedAt: reviewed }).where(and(eq(s.participations.userId, u.id), eq(s.participations.challengeId, ch.id)));
        await db.insert(s.xpEvents).values({ userId: u.id, amount: c.xp, reason: "challenge", refId: ch.id, createdAt: reviewed });
        const redeemed = rnd() < 0.4;
        await db.insert(s.vouchers).values({ rewardId: reward.id, userId: u.id, code: `BF–${c.reward[2] || "GIFT"}–D${Math.floor(rnd() * 1e6).toString(36).toUpperCase()}`, status: redeemed ? "redeemed" : "issued", expiresAt: reward.expiresAt, redeemedAt: redeemed ? after(150) : null, createdAt: reviewed });
      }
      if (xp) await db.update(s.users).set({ xp: (u.xp += xp) }).where(eq(s.users.id, u.id));
    }
    console.log(`${c.en}: ${c.status}`);
  }
  console.log("demo data ready");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
