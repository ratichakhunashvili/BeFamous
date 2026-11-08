// 23 ჯილდოს გამოყენება — Figma 87:8345
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { RewardArt } from "@/components/reward-art";
import { AppBar, ButtonLink, CurvesBackdrop, PageTitle, Panel, Screen, StickyBar } from "@/components/ui";
import type { Locale } from "@/i18n/request";
import { dayMonth } from "@/lib/dates";
import { tr } from "@/lib/i18n-fields";
import { requireUser } from "@/lib/session";
import { getMyVoucher } from "@/lib/vouchers";

export default async function RewardPage({ params }: PageProps<"/rewards/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const v = await getMyVoucher(user.id, id);
  if (!v) notFound();
  if (v.voucher.status === "redeemed") redirect(`/rewards/${id}/used`);
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("rewardsPage");
  const c = await getTranslations("common");

  return (
    <Screen>
      <AppBar back="/rewards" brandLabel={c("brand")} />
      <CurvesBackdrop clearance={96}>
        <RewardArt wide />
        <PageTitle eyebrow={v.expired ? t("expired") : t("active")} title={tr(v.reward, "title", locale)} body={t("showAt", { brand: v.reward.brand ?? "" })} />
        <Panel className="flex w-full flex-col gap-3 p-4 text-white">
          <h2 className="text-center text-h3">{t("terms")}</h2>
          {v.voucher.expiresAt && <Row label={t("expires")} value={dayMonth(v.voucher.expiresAt, locale)} />}
          <Row label={t("usage")} value={tr({ usageKa: v.reward.usageKa, usageEn: v.reward.usageEn }, "usage", locale)} />
        </Panel>
      </CurvesBackdrop>
      {!v.expired && (
        <StickyBar>
          <ButtonLink href={`/rewards/${id}/code`}>{t("showCode")}</ButtonLink>
        </StickyBar>
      )}
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex-1 text-caption">{label}</span>
      <span className="text-right text-label">{value}</span>
    </div>
  );
}
