// 46 პროფილი შენახულია — Figma 87:10170
import { getTranslations } from "next-intl/server";
import { StatusScreen } from "@/components/status-screen";
import { ButtonLink } from "@/components/ui";
import { requireUser } from "@/lib/session";

export default async function ProfileSavedPage() {
  await requireUser();
  const t = await getTranslations("profilePage");
  return (
    <StatusScreen back="/profile" icon="/figma/icon-check-26.svg" title={t("savedTitle")} body={t("savedBody")} centerTitle centerBody>
      <ButtonLink href="/profile">{t("back")}</ButtonLink>
    </StatusScreen>
  );
}
