// 70 ანგარიშის წაშლა — Figma 300:3770. Deleting runs on the server (deleteAccountAction), then 71.
import { getTranslations } from "next-intl/server";
import { deleteAccountAction } from "@/app/actions/account";
import { StatusScreen } from "@/components/status-screen";
import { SubmitButton } from "@/components/submit-button";
import { ButtonLink } from "@/components/ui";
import { requireUser } from "@/lib/session";

export default async function DeleteAccountPage() {
  await requireUser();
  const t = await getTranslations("deletePage");
  return (
    <StatusScreen back="/settings" icon="/figma/icon-close-26.svg" title={t("title")} body={t("body")}>
      <form action={deleteAccountAction} className="w-full">
        <SubmitButton>{t("confirm")}</SubmitButton>
      </form>
      <ButtonLink href="/settings" variant="secondary">
        {t("cancel")}
      </ButtonLink>
    </StatusScreen>
  );
}
