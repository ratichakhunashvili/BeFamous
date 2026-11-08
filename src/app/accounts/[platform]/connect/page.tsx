// Handle entry — not a Figma frame. There is no TikTok/Instagram login yet, so "connecting" means
// saving the public username; the admin compares it with each post's author. Styled like 13/45.
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AppBar, CurvesBackdrop, PageTitle, Screen } from "@/components/ui";
import { db, schema } from "@/db";
import { isPlatform, missionParam, platformName, withMission } from "@/lib/params";
import { requireUser } from "@/lib/session";
import { HandleForm } from "./handle-form";

export default async function HandleEntryPage({ params, searchParams }: PageProps<"/accounts/[platform]/connect">) {
  const user = await requireUser();
  const { platform } = await params;
  if (!isPlatform(platform)) notFound();
  const missionId = missionParam(await searchParams);
  const t = await getTranslations("accountsPage");
  const c = await getTranslations("common");
  const existing = await db.query.linkedSocialAccounts.findFirst({
    where: and(eq(schema.linkedSocialAccounts.userId, user.id), eq(schema.linkedSocialAccounts.platform, platform)),
  });
  const name = platformName[platform];

  return (
    <Screen>
      <AppBar back={withMission("/accounts/connect", missionId)} brandLabel={c("brand")} />
      <CurvesBackdrop>
        <PageTitle eyebrow={t("handleEyebrow", { platform: name })} title={t("handleTitle")} body={t("handleBody", { platform: name })} align="bodyStart" />
        <HandleForm
          platform={platform}
          missionId={missionId}
          defaultHandle={existing?.handle ?? ""}
          labels={{ label: t("handleLabel"), placeholder: t("handlePlaceholder"), error: t("handleError"), save: t("save") }}
        />
      </CurvesBackdrop>
    </Screen>
  );
}
