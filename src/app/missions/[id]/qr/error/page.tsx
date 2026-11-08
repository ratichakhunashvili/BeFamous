// 40 QR შეცდომა — Figma 87:9846
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AppBar, ButtonLink, CurvesBackdrop, ResultPanel, Screen } from "@/components/ui";
import { getMissionContext } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export default async function QrErrorPage({ params }: PageProps<"/missions/[id]/qr/error">) {
  const user = await requireUser();
  const { id } = await params;
  const ctx = await getMissionContext(user.id, id);
  if (!ctx) notFound();
  const t = await getTranslations("qr");
  const c = await getTranslations("common");

  return (
    <Screen>
      <AppBar back={`/missions/${id}/qr`} brandLabel={c("brand")} />
      <CurvesBackdrop>
        <ResultPanel icon="/figma/icon-qr-26.svg" title={t("failTitle")} body={t("failBody")} />
        <ButtonLink href={`/missions/${id}/qr`}>{t("retry")}</ButtonLink>
        <ButtonLink href={`/challenges/${ctx.challenge.slug}/missions`} variant="secondary">
          {t("backToMissions")}
        </ButtonLink>
      </CurvesBackdrop>
    </Screen>
  );
}
