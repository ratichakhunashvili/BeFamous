// Admin 44 ექსპორტის წინასწარი ნახვა — Figma 22:839. Same numbers as 20/43. Figma has no download
// button; "CSV-ის ჩამოტვირთვა" is added (the file opens correctly in Excel, Georgian included).
import { getLocale, getTranslations } from "next-intl/server";
import { AdminBody, AdminHeader, AdminPanel, AdminTable, AdminTitle } from "@/components/admin/shell";
import type { Locale } from "@/i18n/request";
import { exportRows } from "@/lib/admin-export";
import { requireAdminPage } from "@/lib/session";

export default async function ExportPreviewPage({ searchParams }: PageProps<"/admin/analytics/export">) {
  await requireAdminPage();
  const sp = await searchParams;
  const days = sp.period === "7d" ? 7 : 30;
  const campaignId = typeof sp.campaign === "string" ? sp.campaign : undefined;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("admin.analytics");
  const c = await getTranslations("admin");
  const data = await exportRows(days, campaignId, locale);
  const qs = new URLSearchParams({ ...(campaignId ? { campaign: campaignId } : {}), ...(days === 7 ? { period: "7d" } : {}) }).toString();
  const back = `/admin/analytics${qs ? `?${qs}` : ""}`;
  const period = `${data.start} – ${data.end}`;
  return (
    <>
      <AdminHeader crumb={c("crumb")} back={back} />
      <AdminBody>
        <AdminTitle eyebrow={t("exportEyebrow")} title={t("exportTitle")} body={`${t("exportBody")} ${data.campaignTitle ?? t("allCampaigns")}`} />
        <AdminPanel className="gap-3 p-4">
          <h2 className="text-h3 text-text">{t("csvSample")}</h2>
          <AdminTable
            columns={[t("colMetric"), t("colValue"), t("colPeriod")]}
            widths={["414px", "310px", "227px"]}
            rows={data.rows.map((r) => ({ key: r.key, cells: [t(`metric.${r.key}`), r.value == null ? t("unavailable") : r.value.toLocaleString("en-US"), period] }))}
          />
        </AdminPanel>
        <div className="flex gap-3">
          <a href={`/admin/analytics/export.csv${qs ? `?${qs}` : ""}`} download className="flex h-12 w-[244px] items-center justify-center rounded-bf-12 bg-action text-label text-white hover:opacity-90">
            {t("download")}
          </a>
          <a href={back} className="flex h-12 w-[244px] items-center justify-center rounded-bf-12 border border-line bg-surface text-label text-text hover:bg-elevated">
            {t("backToAnalytics")}
          </a>
        </div>
      </AdminBody>
    </>
  );
}
