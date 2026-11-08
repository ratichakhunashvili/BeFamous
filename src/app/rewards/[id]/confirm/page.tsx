// 67 ვაუჩერის დადასტურება — Figma 300:3409
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { redeemVoucherAction } from "@/app/actions/rewards";
import { AppBar, Button, ButtonLink, CurvesBackdrop, ResultPanel, Screen } from "@/components/ui";
import { requireUser } from "@/lib/session";
import { getMyVoucher } from "@/lib/vouchers";

export default async function ConfirmVoucherPage({ params }: PageProps<"/rewards/[id]/confirm">) {
  const user = await requireUser();
  const { id } = await params;
  const v = await getMyVoucher(user.id, id);
  if (!v) notFound();
  if (v.voucher.status === "redeemed") redirect(`/rewards/${id}/used`);
  if (v.expired) redirect(`/rewards/${id}`);
  const t = await getTranslations("rewardsPage");
  const c = await getTranslations("common");

  return (
    <Screen>
      <AppBar back={`/rewards/${id}/code`} brandLabel={c("brand")} />
      <CurvesBackdrop>
        <ResultPanel icon="/figma/icon-gift-26.svg" title={t("confirmTitle")} body={t("confirmBody", { brand: v.reward.brand ?? "" })} />
        <form action={redeemVoucherAction} className="w-full">
          <input type="hidden" name="voucherId" value={id} />
          <Button type="submit">{t("yesUsed")}</Button>
        </form>
        <ButtonLink href={`/rewards/${id}/code`} variant="secondary">
          {t("cancel")}
        </ButtonLink>
      </CurvesBackdrop>
    </Screen>
  );
}
