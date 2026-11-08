// Admin 27 კამპანიის დეტალი / 28 შეჩერებული (Figma 22:822 / 22:823) and 30 დაგეგმილია (22:825).
// Drafts open in the wizard instead.
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { setCampaignPausedAction } from "@/app/actions/admin-campaigns";
import { CollectionHero } from "@/components/collection-hero";
import { AdminBody, AdminHeader, AdminPanel, AdminTitle } from "@/components/admin/shell";
import { SubmitButton } from "@/components/submit-button";
import { ButtonLink } from "@/components/ui";
import type { Locale } from "@/i18n/request";
import { getCampaign, syncChallengeStatuses } from "@/lib/admin-campaigns";
import { isCity } from "@/lib/cities";
import { dateRange, dayMonth } from "@/lib/dates";
import { tr } from "@/lib/i18n-fields";
import { requireAdminPage } from "@/lib/session";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-[162px] text-caption text-muted">{label}</span>
      <span className="flex-1 text-right text-label text-text">{value}</span>
    </div>
  );
}

export default async function CampaignDetailPage({ params }: PageProps<"/admin/campaigns/[id]">) {
  await requireAdminPage();
  await syncChallengeStatuses();
  const campaign = await getCampaign((await params).id);
  if (!campaign) notFound();
  const { challenge: ch } = campaign;
  if (ch.status === "draft") redirect(`/admin/campaigns/${ch.id}/edit/basics`);
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("admin.campaigns");
  const tw = await getTranslations("admin.wizard");
  const tc = await getTranslations("cities");
  const c = await getTranslations("admin");
  const header = <AdminHeader crumb={c("crumb")} back="/admin/campaigns" action={<ButtonLink href="/admin/campaigns/new" variant="secondary" className="!w-[202px]">{tw("newCampaign")}</ButtonLink>} />;

  // 30: scheduled — not started yet, so no numbers.
  if (ch.status === "scheduled") {
    return (
      <>
        {header}
        <AdminBody>
          <AdminTitle eyebrow={t("eyebrowShort")} title={t("scheduledDetailTitle")} body={ch.startsAt ? t("scheduledDetailBody", { date: dayMonth(ch.startsAt, locale) }) : t("scheduledDetailBodyNoDate")} />
          <AdminPanel className="w-full max-w-[768px] gap-4 p-6">
            <h2 className="text-h2 text-text">{tr(ch, "title", locale)}</h2>
            <div className="flex items-center gap-3 rounded-bf-16 border border-line bg-surface p-3">
              <span className="relative size-9 shrink-0 rounded-bf-12 bg-elevated">
                <Image src="/figma/admin/icon-check-20.svg" alt="" width={20} height={20} className="absolute left-2 top-2 size-5" />
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-label text-text">{t("status")}</span>
                <span className="text-caption text-muted">{t("statusLabel.scheduled")}</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ButtonLink href="/admin/campaigns" variant="secondary">
                {t("all")}
              </ButtonLink>
              <ButtonLink href={`/admin/campaigns/${ch.id}/edit/basics`}>{t("edit")}</ButtonLink>
            </div>
          </AdminPanel>
        </AdminBody>
      </>
    );
  }

  const city = isCity(ch.city) ? tc(ch.city) : null;
  const subtitle =
    ch.status === "paused" ? t("pausedBody") : [t(`statusShort.${ch.status}`), ch.startsAt && ch.endsAt ? dateRange(ch.startsAt, ch.endsAt, locale) : null, city].filter(Boolean).join(" · ");
  return (
    <>
      {header}
      <AdminBody>
        <AdminTitle eyebrow={t("eyebrowDetail")} title={tr(ch, "title", locale)} body={subtitle} action={<ButtonLink href={`/admin/analytics?campaign=${ch.id}`}>{t("analytics")}</ButtonLink>} />
        <div className="flex flex-col items-stretch gap-6 lg:flex-row lg:items-start">
          <AdminPanel className="w-full lg:w-[768px] lg:shrink-0 gap-4 p-6">
            <h2 className="text-h3 text-text">{t("content")}</h2>
            <CollectionHero heroUrl={ch.heroUrl ?? ch.coverUrl} art={ch.coverArt} height={246} ellipse={{ left: 512, top: -39, w: 314.88, h: 280.44 }} />
            <h3 className="text-h2 text-text">{campaign.missions.map((m) => tr(m, "title", locale)).join(" · ") || tr(ch, "title", locale)}</h3>
            <p className="text-body text-muted">{tr(ch, "description", locale)}</p>
            <div className="grid grid-cols-2 gap-2">
              <ButtonLink href="/admin/participants" variant="secondary">
                {t("participants")}
              </ButtonLink>
              {ch.status === "ended" ? (
                <ButtonLink href={`/admin/campaigns/${ch.id}/edit/basics`} variant="quiet">
                  {t("edit")}
                </ButtonLink>
              ) : (
                <form action={setCampaignPausedAction}>
                  <input type="hidden" name="campaignId" value={ch.id} />
                  <input type="hidden" name="pause" value={ch.status === "active" ? "1" : "0"} />
                  <SubmitButton variant="quiet">{ch.status === "active" ? t("pause") : t("resume")}</SubmitButton>
                </form>
              )}
            </div>
          </AdminPanel>
          <AdminPanel className="w-full lg:w-[340px] lg:shrink-0 gap-4 p-5">
            <h2 className="text-h3 text-text">{t("summary")}</h2>
            <Row label={t("status")} value={t(`statusShort.${ch.status}`)} />
            <Row label={t("colJoined")} value={String(campaign.joined)} />
            <Row label={t("colVisits")} value={ch.kind === "visit" ? String(campaign.visits) : "—"} />
            <ButtonLink href={`/admin/campaigns/${ch.id}/edit/basics`} variant="secondary">
              {t("edit")}
            </ButtonLink>
            <ButtonLink href="/admin/campaigns" variant="secondary">
              {t("all")}
            </ButtonLink>
          </AdminPanel>
        </div>
      </AdminBody>
    </>
  );
}

