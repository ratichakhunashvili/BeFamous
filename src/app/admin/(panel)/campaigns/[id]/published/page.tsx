// Admin 17 გამოქვეყნებულია — Figma 7:565.
import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminBody, AdminHeader, AdminTitle } from "@/components/admin/shell";
import { ButtonLink } from "@/components/ui";
import type { Locale } from "@/i18n/request";
import { getCampaign } from "@/lib/admin-campaigns";
import { dayMonth } from "@/lib/dates";
import { tr } from "@/lib/i18n-fields";
import { requireAdminPage } from "@/lib/session";

export default async function PublishedPage({ params }: PageProps<"/admin/campaigns/[id]/published">) {
  await requireAdminPage();
  const campaign = await getCampaign((await params).id);
  if (!campaign) notFound();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("admin.wizard");
  const tc = await getTranslations("admin.campaigns");
  const c = await getTranslations("admin");
  const ch = campaign.challenge;
  const scheduled = ch.status === "scheduled";
  return (
    <>
      <AdminHeader crumb={c("crumb")} back="/admin/campaigns" />
      <AdminBody>
        <AdminTitle eyebrow={tc("eyebrowShort")} title={scheduled ? t("scheduledTitle") : t("publishedTitle")} body={scheduled && ch.startsAt ? t("scheduledBody", { date: dayMonth(ch.startsAt, locale) }) : t("publishedBody")} />
        <div className="flex w-[768px] flex-col gap-4 rounded-bf-16 border border-line bg-surface p-6">
          <h2 className="text-h2 text-text">{tr(ch, "title", locale)}</h2>
          <div className="flex items-center gap-3 rounded-bf-16 border border-line bg-surface p-3">
            <span className="relative size-9 shrink-0 rounded-bf-12 bg-elevated">
              <Image src="/figma/admin/icon-check-20.svg" alt="" width={20} height={20} className="absolute left-2 top-2 size-5" />
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-label text-text">{tc("status")}</span>
              <span className="text-caption text-muted">{tc(`statusLabel.${ch.status}`)}</span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <ButtonLink href="/admin/campaigns" variant="secondary">
              {tc("all")}
            </ButtonLink>
            <ButtonLink href={`/admin/campaigns/${ch.id}`}>{t("seeResults")}</ButtonLink>
          </div>
        </div>
      </AdminBody>
    </>
  );
}
