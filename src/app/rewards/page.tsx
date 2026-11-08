// 22 ჯილდოები — Figma 87:8224. Active vouchers + entry to the last used one.
import { and, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { BottomNav, TabTopBar } from "@/components/nav";
import { RewardArt } from "@/components/reward-art";
import { CurvesBackdrop, InfoRow, PageTitle, Screen } from "@/components/ui";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { validUntil } from "@/lib/dates";
import { tr } from "@/lib/i18n-fields";
import { requireUser } from "@/lib/session";

export default async function RewardsPage() {
  const user = await requireUser();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("rewardsPage");
  const rows = await db
    .select({ voucher: schema.vouchers, reward: schema.rewards })
    .from(schema.vouchers)
    .innerJoin(schema.rewards, eq(schema.rewards.id, schema.vouchers.rewardId))
    .where(eq(schema.vouchers.userId, user.id))
    .orderBy(desc(schema.vouchers.createdAt));

  const now = new Date();
  const active = rows.filter((r) => r.voucher.status === "issued" && (!r.voucher.expiresAt || r.voucher.expiresAt > now));
  const lastUsed = (
    await db.query.vouchers.findFirst({
      where: and(eq(schema.vouchers.userId, user.id), eq(schema.vouchers.status, "redeemed")),
      orderBy: desc(schema.vouchers.redeemedAt),
    })
  )?.id;

  return (
    <Screen>
      <TabTopBar />
      <CurvesBackdrop clearance={100}>
        <PageTitle eyebrow={t("eyebrow")} title={t("title")} body={t("body")} align="bodyStart" />
        {active.length === 0 && <p className="w-full rounded-bf-16 border border-line bg-surface p-4 text-center text-body text-white">{t("empty")}</p>}
        {active.map(({ voucher, reward }) => (
          <Link key={voucher.id} href={`/rewards/${voucher.id}`} className="flex w-full flex-col gap-5 overflow-clip rounded-bf-16 border border-line bg-surface p-3 text-white transition-colors hover:bg-elevated/40">
            <RewardArt />
            <h2 className="text-center text-h3">{tr(reward, "title", locale)}</h2>
            <p className="whitespace-pre-wrap text-center text-caption">
              {reward.brand}
              {voucher.expiresAt ? `  ·  ${validUntil(voucher.expiresAt, locale)}` : ""}
            </p>
          </Link>
        ))}
        {lastUsed && <InfoRow href={`/rewards/${lastUsed}/used`} layout="centered" icon="/figma/icon-check.svg" chevron="/figma/icon-chevron.svg" title={t("used")} body={t("usedBody")} />}
      </CurvesBackdrop>
      <BottomNav active="rewards" />
    </Screen>
  );
}
