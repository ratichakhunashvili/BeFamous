// Missions of a joined challenge.
// Visit challenges → 11 მისიები (Figma 87:7140): progress + mission list (QR → video → optional invite).
// Video challenges → 38 კრეატიული ვიდეოს მისია (Figma 87:9738): one video mission.
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AppBar, ButtonLink, CurvesBackdrop, InfoRow, PageTitle, Panel, Screen } from "@/components/ui";
import type { Locale } from "@/i18n/request";
import { tr } from "@/lib/i18n-fields";
import { getChallengeBySlug, getMissionsWithProgress, getParticipation } from "@/lib/queries";
import { requireUser } from "@/lib/session";

type MissionConfig = { lockedKa?: string; lockedEn?: string; descriptionCardKa?: string; descriptionCardEn?: string; platformsKa?: string; platformsEn?: string; hashtags?: string };

export default async function MissionsPage({ params }: PageProps<"/challenges/[slug]/missions">) {
  const user = await requireUser();
  const { slug } = await params;
  const data = await getChallengeBySlug(slug);
  if (!data) notFound();
  const { challenge } = data;
  if (!(await getParticipation(user.id, challenge.id))) redirect(`/challenges/${slug}/join`);

  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("missions");
  const c = await getTranslations("common");
  const rows = await getMissionsWithProgress(user.id, challenge.id);

  // ---- 38: single video mission ----
  if (challenge.kind === "video") {
    const video = rows.find((r) => r.mission.type === "upload")?.mission;
    const cfg = (video?.config ?? {}) as MissionConfig;
    return (
      <Screen>
        <AppBar back={`/challenges/${slug}`} brandLabel={c("brand")} />
        <CurvesBackdrop>
          <PageTitle eyebrow={t("videoEyebrow")} title={video ? tr(video, "title", locale) : ""} body={video ? tr(video, "description", locale) : ""} align="bodyStart" />
          <InfoRow layout="centered" icon="/figma/icon-camera-20.svg" title={t("whereTitle")} body={`${locale === "en" ? cfg.platformsEn : cfg.platformsKa} · ${cfg.hashtags ?? challenge.hashtags ?? ""}`} />
          {video && <ButtonLink href={`/missions/${video.id}/upload`}>{t("register")}</ButtonLink>}
        </CurvesBackdrop>
      </Screen>
    );
  }

  // ---- 11: mission list with progress ----
  const doneIds = new Set(rows.filter((r) => r.status === "completed").map((r) => r.mission.id));
  const required = rows.filter((r) => r.mission.required);
  const requiredDone = required.filter((r) => doneIds.has(r.mission.id)).length;
  const pct = required.length ? Math.round((requiredDone / required.length) * 100) : 0;

  const hrefFor = (type: string, id: string) =>
    type === "visit_qr" ? `/missions/${id}/qr` : type === "upload" ? `/missions/${id}/upload` : type === "invite" ? "/invite" : undefined;

  return (
    <Screen>
      <AppBar back="/activity" brandLabel={c("brand")} />
      <CurvesBackdrop>
        <PageTitle eyebrow={tr(challenge, "title", locale)} title={t("title")} body={t("body")} />

        <Panel className="flex w-full flex-col gap-3 p-4 text-white">
          <h2 className="text-center text-h3">{t("progress")}</h2>
          <div className="flex items-center gap-2">
            <span className="flex-1 text-caption">{t("done")}</span>
            <span className="text-right text-label">
              {requiredDone} / {required.length}
            </span>
          </div>
          <div className="h-2 w-full overflow-clip rounded-full bg-elevated" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${pct}%` }} />
          </div>
        </Panel>

        {rows.map(({ mission, status }, index) => {
          const cfg = (mission.config ?? {}) as MissionConfig;
          const locked = Boolean(mission.unlockAfterMissionId && !doneIds.has(mission.unlockAfterMissionId));
          const done = status === "completed";
          const pending = status === "pending_review";
          const kind = mission.required ? t("required") : t("optional");
          const detail = locked
            ? (locale === "en" ? cfg.lockedEn : cfg.lockedKa) ?? ""
            : done
              ? t("completed")
              : pending
                ? t("pending")
                : (locale === "en" ? cfg.descriptionCardEn : cfg.descriptionCardKa) ?? tr(mission, "description", locale);
          const icon = locked ? "/figma/icon-lock-20.svg" : done ? "/figma/icon-check.svg" : mission.type === "visit_qr" ? "/figma/icon-qr.svg" : mission.type === "invite" ? "/figma/icon-team.svg" : "/figma/icon-camera-20.svg";
          const href = locked || done || pending ? undefined : hrefFor(mission.type, mission.id);
          return (
            <InfoRow
              key={mission.id}
              layout="centered"
              icon={icon}
              href={href}
              chevron={href ? "/figma/icon-chevron.svg" : undefined}
              title={`${String(index + 1).padStart(2, "0")}  ·  ${tr(mission, "title", locale)}`}
              body={`${kind} · ${detail}`}
            />
          );
        })}
      </CurvesBackdrop>
    </Screen>
  );
}
