// 12 QR შემოწმება — Figma 87:7242. Live camera scanner + manual code entry.
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AppBar, CurvesBackdrop, PageTitle, Screen } from "@/components/ui";
import { getMissionContext } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { QrScanner } from "./qr-scanner";

export default async function QrPage({ params, searchParams }: PageProps<"/missions/[id]/qr">) {
  const user = await requireUser();
  const { id } = await params;
  const ctx = await getMissionContext(user.id, id);
  if (!ctx || ctx.mission.type !== "visit_qr") notFound();
  if (!ctx.joined) redirect(`/challenges/${ctx.challenge.slug}/join`);
  const { code } = await searchParams;
  const t = await getTranslations("qr");
  const c = await getTranslations("common");

  return (
    <Screen>
      <AppBar back={`/challenges/${ctx.challenge.slug}/missions`} brandLabel={c("brand")} />
      <CurvesBackdrop>
        <PageTitle eyebrow={t("eyebrow", { n: ctx.number })} title={t("title")} body={t("body")} />
        <QrScanner
          missionId={id}
          initialCode={typeof code === "string" ? code : undefined}
          labels={{
            ready: t("ready"),
            starting: t("starting"),
            denied: t("denied"),
            unsupported: t("unsupported"),
            found: t("found"),
            scan: t("scan"),
            manual: t("manual"),
            codeLabel: t("codeLabel"),
            codePlaceholder: t("codePlaceholder"),
            check: t("check"),
          }}
        />
      </CurvesBackdrop>
    </Screen>
  );
}
