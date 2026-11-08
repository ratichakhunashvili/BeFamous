// Admin 37 გამოქვეყნების დადასტურება — Figma 22:832. "გამოქვეყნება" = live now (or on the start date if
// it is in the future); "დაგეგმვა" = becomes live automatically on the start date from step 12.
import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { publishCampaignAction } from "@/app/actions/admin-campaigns";
import { AdminBody, AdminHeader, AdminTitle } from "@/components/admin/shell";
import { SubmitButton } from "@/components/submit-button";
import { ButtonLink } from "@/components/ui";
import type { Locale } from "@/i18n/request";
import { getCampaign, STEPS, stepDone } from "@/lib/admin-campaigns";
import { dayMonth } from "@/lib/dates";
import { tr } from "@/lib/i18n-fields";
import { requireAdminPage } from "@/lib/session";

export default async function PublishPage({ params, searchParams }: PageProps<"/admin/campaigns/[id]/edit/publish">) {
  await requireAdminPage();
  const campaign = await getCampaign((await params).id);
  if (!campaign) notFound();
  const sp = await searchParams;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("admin.wizard");
  const c = await getTranslations("admin");
  const ch = campaign.challenge;
  const filled = STEPS.slice(0, 4).filter((s) => stepDone(campaign, s)).length + 1; // review = this screen
  const future = ch.startsAt != null && ch.startsAt > new Date();
  return (
    <>
      <AdminHeader crumb={c("crumb")} back={`/admin/campaigns/${ch.id}/edit/review`} action={<ButtonLink href="/admin/campaigns/new" variant="secondary" className="!w-[202px]">{t("newCampaign")}</ButtonLink>} />
      <AdminBody>
        <AdminTitle eyebrow={t("publishEyebrow")} title={t("publishTitle")} body={t("publishBody")} />
        <div className="flex w-full max-w-[768px] flex-col gap-4 rounded-bf-16 border border-line bg-surface p-6">
          <h2 className="text-h2 text-text">{tr(ch, "title", locale)}</h2>
          <div className="flex items-center gap-3 rounded-bf-16 border border-line bg-surface p-3">
            <span className="relative size-9 shrink-0 rounded-bf-12 bg-elevated">
              <Image src="/figma/admin/icon-check-20.svg" alt="" width={20} height={20} className="absolute left-2 top-2 size-5" />
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-label text-text">{t("filled", { n: filled })}</span>
              <span className="text-caption text-muted">{ch.startsAt ? t("startsOn", { date: dayMonth(ch.startsAt, locale) }) : t("filledBody")}</span>
            </span>
          </div>
          {sp.error && <p className="text-body text-chart">{sp.error === "start" ? t("errStart") : t("errIncomplete")}</p>}
          <div className="grid grid-cols-2 gap-2">
            <form action={publishCampaignAction}>
              <input type="hidden" name="campaignId" value={ch.id} />
              <input type="hidden" name="mode" value="schedule" />
              <SubmitButton variant="secondary" disabled={!future}>
                {t("schedule")}
              </SubmitButton>
            </form>
            <form action={publishCampaignAction}>
              <input type="hidden" name="campaignId" value={ch.id} />
              <input type="hidden" name="mode" value="now" />
              <SubmitButton>{t("publish")}</SubmitButton>
            </form>
          </div>
          <ButtonLink href={`/admin/campaigns/${ch.id}/edit/review`} variant="quiet">
            {t("backToReview")}
          </ButtonLink>
        </div>
      </AdminBody>
    </>
  );
}
