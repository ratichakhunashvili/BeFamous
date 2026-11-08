// 26 პარამეტრები — Figma 87:8711. The "appearance / theme" row (→68) is intentionally left out.
import { getLocale, getTranslations } from "next-intl/server";
import { signoutAction } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { AppBar, CurvesBackdrop, InfoRow, PageTitle, Screen } from "@/components/ui";
import { requireUser } from "@/lib/session";

export default async function SettingsPage() {
  await requireUser();
  const locale = await getLocale();
  const t = await getTranslations("settingsPage");
  const c = await getTranslations("common");
  const chevron = "/figma/icon-chevron.svg";

  return (
    <Screen>
      <AppBar back="/profile" brandLabel={c("brand")} />
      <CurvesBackdrop>
        <PageTitle eyebrow={t("eyebrow")} title={t("title")} body={t("body")} />
        <InfoRow href="/notifications" layout="centered" icon="/figma/icon-bell.svg" chevron={chevron} title={t("notifications")} body={t("notificationsBody")} />
        <InfoRow href="/settings/terms" layout="centered" icon="/figma/icon-lock-20.svg" chevron={chevron} title={t("privacy")} body={t("privacyBody")} />
        <InfoRow href="/settings/accounts" layout="centered" icon="/figma/icon-play-20.svg" chevron={chevron} title={t("accounts")} body={t("accountsBody")} />
        <InfoRow href="/settings/language" layout="centered" icon="/figma/icon-discover-20.svg" chevron={chevron} title={t("language")} body={locale === "en" ? "English" : "ქართული"} />
        <InfoRow href="/settings/delete" layout="centered" icon="/figma/icon-close-20.svg" chevron={chevron} title={t("delete")} body={t("deleteBody")} />
        <form action={signoutAction} className="w-full">
          <SubmitButton variant="secondary">{t("signout")}</SubmitButton>
        </form>
      </CurvesBackdrop>
    </Screen>
  );
}
