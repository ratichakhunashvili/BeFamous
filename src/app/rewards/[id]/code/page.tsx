// 43 ვაუჩერის კოდი — Figma 87:10013
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AppBar, ButtonLink, CurvesBackdrop, PageTitle, Panel, Screen, StickyBar } from "@/components/ui";
import { requireUser } from "@/lib/session";
import { getMyVoucher } from "@/lib/vouchers";

export default async function VoucherCodePage({ params }: PageProps<"/rewards/[id]/code">) {
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
      <AppBar back={`/rewards/${id}`} brandLabel={c("brand")} />
      <CurvesBackdrop clearance={96}>
        <PageTitle eyebrow={t("codeEyebrow")} title={t("codeTitle")} body={t("codeBody")} align="bodyStart" />
        <Panel className="flex w-full flex-col gap-5 p-6 text-center text-white">
          <p className="select-all text-h1 tracking-normal">{v.voucher.code}</p>
          <p className="text-label">
            {v.reward.brand}
            {v.reward.valueGel ? ` · ${v.reward.valueGel} ₾` : ""}
          </p>
        </Panel>
      </CurvesBackdrop>
      <StickyBar>
        <ButtonLink href={`/rewards/${id}/confirm`}>{t("confirmUse")}</ButtonLink>
      </StickyBar>
    </Screen>
  );
}
