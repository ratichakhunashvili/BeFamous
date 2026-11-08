// 55 ბმული დაკოპირდა — Figma 300:2153
import { getTranslations } from "next-intl/server";
import { StatusScreen } from "@/components/status-screen";
import { ButtonLink } from "@/components/ui";
import { getMissionContext } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export default async function InviteCopiedPage({ searchParams }: PageProps<"/invite/copied">) {
  const user = await requireUser();
  const sp = await searchParams;
  const t = await getTranslations("invitePage");
  const missionId = typeof sp.mission === "string" && /^[0-9a-f-]{36}$/.test(sp.mission) ? sp.mission : null;
  const ctx = missionId ? await getMissionContext(user.id, missionId) : null;
  const inviteHref = ctx ? `/invite?mission=${ctx.mission.id}` : "/invite";

  return (
    <StatusScreen back={inviteHref} icon="/figma/icon-check-26.svg" title={t("copiedTitle")} body={t("copiedBody")}>
      <ButtonLink href={ctx ? `/challenges/${ctx.challenge.slug}/missions` : "/home"}>{ctx ? t("toMissions") : t("toHome")}</ButtonLink>
      <ButtonLink href={inviteHref} variant="secondary">
        {t("again")}
      </ButtonLink>
    </StatusScreen>
  );
}
