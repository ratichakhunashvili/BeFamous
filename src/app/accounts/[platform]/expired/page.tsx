// 61 ავტორიზაცია ამოიწურა — Figma 300:2769. Shown when an admin flags a linked account as needing
// reconnection (there are no platform tokens yet, so it never expires on its own).
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { StatusScreen } from "@/components/status-screen";
import { ButtonLink } from "@/components/ui";
import { isPlatform, platformName } from "@/lib/params";
import { requireUser } from "@/lib/session";

export default async function AccountExpiredPage({ params }: PageProps<"/accounts/[platform]/expired">) {
  await requireUser();
  const { platform } = await params;
  if (!isPlatform(platform)) notFound();
  const t = await getTranslations("postStates");
  return (
    <StatusScreen back="/notifications" icon="/figma/icon-lock-26.svg" title={t("expiredTitle")} body={t("expiredBody", { platform: platformName[platform] })}>
      <ButtonLink href={`/accounts/${platform}/connect`}>{t("reconnect")}</ButtonLink>
      <ButtonLink href="/notifications" variant="secondary">
        {t("later")}
      </ButtonLink>
    </StatusScreen>
  );
}
