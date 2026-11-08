// Admin 04 Dashboard — Figma 7:82. Real counts only; the AI Studio card is removed, so the chart is full width.
import { desc } from "drizzle-orm";
import { getLocale, getTranslations } from "next-intl/server";
import { BarChart } from "@/components/admin/bar-chart";
import { AdminBody, AdminHeader, AdminPanel, AdminTable, AdminTitle, StatCard } from "@/components/admin/shell";
import { ButtonLink } from "@/components/ui";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { campaignCounts, syncChallengeStatuses } from "@/lib/admin-campaigns";
import { bucket, dailySeries, dashboardStats, joinTrend } from "@/lib/admin-stats";
import { dateRange } from "@/lib/dates";
import { tr } from "@/lib/i18n-fields";
import { requireAdminPage } from "@/lib/session";

export default async function AdminDashboard() {
  const admin = await requireAdminPage();
  await syncChallengeStatuses();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("admin.dashboard");
  const tc = await getTranslations("admin.campaigns");
  const c = await getTranslations("admin");
  const [stats, trend, series, recent] = await Promise.all([
    dashboardStats(),
    joinTrend(),
    dailySeries("joins", 30),
    db.select().from(schema.challenges).orderBy(desc(schema.challenges.createdAt)).limit(5),
  ]);
  const bars = bucket(series, 10);
  const counts = await campaignCounts(recent.map((r) => r.id));
  const short = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ka-GE", { timeZone: "Asia/Tbilisi", day: "numeric", month: "short" });
  const started = (s: string) => s === "active" || s === "paused" || s === "ended";

  return (
    <>
      <AdminHeader crumb={c("crumb")} />
      <AdminBody>
        <AdminTitle
          eyebrow={t("eyebrow")}
          title={t("hello", { name: admin.name ?? "" })}
          body={t("body")}
          action={<ButtonLink href="/admin/campaigns/new">{t("create")}</ButtonLink>}
        />
        <div className="flex gap-4">
          <StatCard href="/admin/campaigns" icon="/figma/admin/stat-campaign-16.svg" label={t("active")} value={String(stats.active)} sub={t("today")} />
          <StatCard
            href="/admin/participants"
            icon="/figma/admin/stat-team-16.svg"
            label={t("participants")}
            value={String(stats.participants)}
            sub={trend == null ? t("noBaseline") : t("trend", { sign: trend >= 0 ? "↑" : "↓", pct: Math.abs(trend) })}
          />
          <StatCard href="/admin/analytics" icon="/figma/admin/stat-qr-16.svg" label={t("visits")} value={String(stats.visits)} sub={t("confirmed")} />
          <StatCard href="/admin/rewards" icon="/figma/admin/stat-gift-16.svg" label={t("vouchers")} value={String(stats.vouchersThisMonth)} sub={t("thisMonth")} />
        </div>
        <AdminPanel className="gap-3 p-5">
          <h2 className="text-h3 text-text">{t("activity")}</h2>
          <p className="text-caption text-muted">{t("activityBody", { range: dateRange(series[0].date, series[series.length - 1].date, locale) })}</p>
          {bars.every((b) => b.value === 0) ? (
            <p className="py-10 text-center text-body text-muted">{t("noActivity")}</p>
          ) : (
            <BarChart width={1092} values={bars.map((b) => b.value)} labels={bars.map((b) => short.format(b.date))} label={t("activity")} />
          )}
        </AdminPanel>
        <AdminPanel className="gap-3 p-4">
          <h2 className="text-h3 text-text">{t("recent")}</h2>
          <AdminTable
            columns={[tc("colName"), tc("colStatus"), tc("colJoined"), tc("colVisits")]}
            widths={["414px", "238px", "165px", "155px"]}
            rows={recent.map((ch) => ({
              key: ch.id,
              href: ch.status === "draft" ? `/admin/campaigns/${ch.id}/edit/basics` : `/admin/campaigns/${ch.id}`,
              cells: [
                tr(ch, "title", locale),
                tc(`statusLabel.${ch.status}`),
                started(ch.status) ? String(counts.get(ch.id)?.joined ?? 0) : "—",
                started(ch.status) && ch.kind === "visit" ? String(counts.get(ch.id)?.visits ?? 0) : "—",
              ],
            }))}
          />
        </AdminPanel>
      </AdminBody>
    </>
  );
}
