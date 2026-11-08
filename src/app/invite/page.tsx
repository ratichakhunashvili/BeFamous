// 54 მეგობრის მოწვევა — Figma 300:2008. Opened from the optional invite mission (?mission=<id>).
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AppBar, ButtonLink, CurvesBackdrop, InfoRow, PageTitle, Screen } from "@/components/ui";
import { countInvited, getOrCreateInviteCode } from "@/lib/invites";
import { getMissionContext } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { InviteActions } from "./invite-actions";

export default async function InvitePage({ searchParams }: PageProps<"/invite">) {
  const user = await requireUser();
  const sp = await searchParams;
  const t = await getTranslations("invitePage");
  const c = await getTranslations("common");

  const missionId = typeof sp.mission === "string" && /^[0-9a-f-]{36}$/.test(sp.mission) ? sp.mission : null;
  const ctx = missionId ? await getMissionContext(user.id, missionId) : null;
  const backHref = ctx ? `/challenges/${ctx.challenge.slug}/missions` : "/profile";
  const copiedHref = ctx ? `/invite/copied?mission=${ctx.mission.id}` : "/invite/copied";

  const [code, invited] = await Promise.all([getOrCreateInviteCode(user.id, user.name ?? ""), countInvited(user.id)]);
  const h = await headers();
  const origin = process.env.APP_URL ?? `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  const link = `${origin}/i/${code}`;

  return (
    <Screen>
      <AppBar back={backHref} brandLabel={c("brand")} />
      <CurvesBackdrop>
        <PageTitle eyebrow={ctx ? t("eyebrow", { n: ctx.number }) : t("eyebrowPlain")} title={t("title")} body={t("body")} />
        <InviteActions
          code={code}
          link={link}
          copiedHref={copiedHref}
          labels={{ code: t("code"), codeBody: t("codeBody", { code }), share: t("share"), shareText: t("shareText") }}
        >
          <InfoRow
            href={ctx ? `/challenges/${ctx.challenge.slug}/rules` : undefined}
            layout="centered"
            icon="/figma/icon-team.svg"
            chevron={ctx ? "/figma/icon-chevron.svg" : undefined} title={t("how")} body={`${t("howBody")}\n${t("invited", { count: invited })}`} />
        </InviteActions>
        <ButtonLink href={backHref} variant="secondary">
          {t("notNow")}
        </ButtonLink>
      </CurvesBackdrop>
    </Screen>
  );
}
