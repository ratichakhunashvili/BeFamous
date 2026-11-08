// 66 დაკავშირებული ანგარიშები — Figma 300:3253
import { eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { AppBar, ButtonLink, CurvesBackdrop, InfoRow, PageTitle, Screen } from "@/components/ui";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/session";

export default async function LinkedAccountsPage() {
  const user = await requireUser();
  const t = await getTranslations("accountsPage");
  const c = await getTranslations("common");
  const accounts = await db.select().from(schema.linkedSocialAccounts).where(eq(schema.linkedSocialAccounts.userId, user.id));
  const caption = (platform: "tiktok" | "instagram") => {
    const a = accounts.find((x) => x.platform === platform);
    if (!a) return t("notConnected");
    return a.status === "expired" ? t("expired", { handle: a.handle }) : t("connected", { handle: a.handle });
  };

  return (
    <Screen>
      <AppBar back="/settings" brandLabel={c("brand")} />
      <CurvesBackdrop>
        <PageTitle eyebrow={t("linkedEyebrow")} title={t("linkedTitle")} body={t("linkedBody")} />
        <InfoRow href="/accounts/tiktok/connect" layout="centered" icon="/figma/icon-play-20.svg" chevron="/figma/icon-chevron.svg" title="TikTok" body={caption("tiktok")} />
        <InfoRow href="/accounts/instagram/connect" layout="centered" icon="/figma/icon-camera-20.svg" chevron="/figma/icon-chevron.svg" title="Instagram" body={caption("instagram")} />
        <InfoRow href="/settings/terms" layout="centered" icon="/figma/icon-lock-26.svg" chevron="/figma/icon-chevron.svg" title={t("dataAccess")} body={t("dataAccessBody")} />
        <ButtonLink href="/accounts/connect" variant="secondary">
          {t("connectNew")}
        </ButtonLink>
      </CurvesBackdrop>
    </Screen>
  );
}
