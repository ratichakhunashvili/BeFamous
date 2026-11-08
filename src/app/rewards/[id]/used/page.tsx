// 44 ვაუჩერი გამოყენებულია — Figma 87:10062
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AppBar, ButtonLink, CurvesBackdrop, ResultPanel, Screen } from "@/components/ui";
import { requireUser } from "@/lib/session";
import { getMyVoucher } from "@/lib/vouchers";

export default async function VoucherUsedPage({ params }: PageProps<"/rewards/[id]/used">) {
  const user = await requireUser();
  const { id } = await params;
  const v = await getMyVoucher(user.id, id);
  if (!v) notFound();
  if (v.voucher.status !== "redeemed") redirect(`/rewards/${id}`);
  const t = await getTranslations("rewardsPage");
  const c = await getTranslations("common");

  return (
    <Screen>
      <AppBar back="/rewards" brandLabel={c("brand")} />
      <CurvesBackdrop>
        <ResultPanel icon="/figma/icon-check-26.svg" title={t("usedTitle")} body={v.reward.valueGel ? t("usedBodyValue", { value: v.reward.valueGel }) : t("usedBodyGift")} />
        <ButtonLink href="/rewards">{t("backToRewards")}</ButtonLink>
      </CurvesBackdrop>
    </Screen>
  );
}
