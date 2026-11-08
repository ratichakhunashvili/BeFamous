// 71 ანგარიში წაიშალა — Figma 300:3845. Public: the session is already gone.
import { getTranslations } from "next-intl/server";
import { StatusScreen } from "@/components/status-screen";
import { ButtonLink } from "@/components/ui";

export default async function AccountDeletedPage() {
  const t = await getTranslations("deletePage");
  return (
    <StatusScreen back="/" icon="/figma/icon-check-26.svg" title={t("doneTitle")} body={t("doneBody")}>
      <ButtonLink href="/">{t("welcome")}</ButtonLink>
      <ButtonLink href="/roles" variant="secondary">
        {t("newAccount")}
      </ButtonLink>
    </StatusScreen>
  );
}
