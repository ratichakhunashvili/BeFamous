// Admin 20 ანალიტიკა (30 days) / 43 (7 days) — Figma 7:653 / 22:838; 24 is shown when the period is empty.
// Every number is a real count. Views exist only where an admin entered them; otherwise "unavailable"
// (never 0), always with source and time. The Figma "empty period" pill is a demo state and is dropped:
// the 24 empty state appears by itself when there is no data. The AI Insights button is removed.
import Image from "next/image";
import Link from "next/link";
import { ne } from "drizzle-orm";
import { getLocale, getTranslations } from "next-intl/server";
import { BarChart } from "@/components/admin/bar-chart";
import { AdminBody, AdminHeader, AdminPanel, AdminTitle, StatCard } from "@/components/admin/shell";
import { ButtonLink } from "@/components/ui";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { bucket, dailySeries, periodStats } from "@/lib/admin-stats";
import { dateRange, dayMonth } from "@/lib/dates";
import { tr } from "@/lib/i18n-fields";
import { requireAdminPage } from "@/lib/session";

function Step({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="w-[162px] text-caption text-muted">{label}</span>
        <span className="flex-1 text-right text-label text-text">{value}</span>
      </div>
      <div className="h-2 overflow-clip rounded-full bg-elevated">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
      </div>
    </div>
  );
}

export default async function AnalyticsPage({ searchParams }: PageProps<"/admin/analytics">) {
  await requireAdminPage();
  const sp = await searchParams;
  const days = sp.period === "7d" ? 7 : 30;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("admin.analytics");
  const c = await getTranslations("admin");
  const campaigns = await db.select().from(schema.challenges).where(ne(schema.challenges.status, "draft")).orderBy(schema.challenges.sortOrder);
  const campaign = campaigns.find((x) => x.id === sp.campaign);
  const [stats, series] = await Promise.all([periodStats(days, campaign?.id), dailySeries("joins", days, campaign?.id)]);
  const bars = days === 7 ? series : bucket(series, 10);
  const label = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ka-GE", days === 7 ? { weekday: "short", timeZone: "Asia/Tbilisi" } : { day: "numeric", month: "short", timeZone: "Asia/Tbilisi" });
  const empty = stats.joined === 0 && stats.approved === 0 && !stats.visits && bars.every((b) => b.value === 0);
  const q = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ campaign: campaign?.id, period: days === 7 ? "7d" : undefined, ...extra })) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `?${s}` : "";
  };
  const fmt = (n: number | null) => (n == null ? t("unavailable") : n.toLocaleString("en-US"));
  const viewsSub = stats.views == null ? t("viewsNoSource") : t("viewsSource", { date: stats.lastSynced ? dayMonth(stats.lastSynced, locale) : "—", n: stats.viewsCoverage.withMetrics, total: stats.viewsCoverage.posts });
  // Funnel starts at views only when we have them; otherwise at participants (no made-up 100%).
  const top = stats.views ?? stats.joined;

  return (
    <>
      <AdminHeader crumb={c("crumb")} back={days === 7 ? `/admin/analytics${q({ period: undefined })}` : undefined} />
      <AdminBody>
        <AdminTitle
          eyebrow={t("eyebrow")}
          title={t("title")}
          body={`${campaign ? tr(campaign, "title", locale) : t("allCampaigns")}  ·  ${dateRange(series[0].date, series[series.length - 1].date, locale)}`}
          action={
            <ButtonLink href={`/admin/analytics/export${q({})}`} variant="secondary">
              {t("export")}
            </ButtonLink>
          }
        />
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "30d", label: t("days30"), w: "w-[105px]", on: days === 30 },
            { key: "7d", label: t("days7"), w: "w-[100px]", on: days === 7 },
          ].map((p) => (
            <Link key={p.key} href={`/admin/analytics${q({ period: p.key === "7d" ? "7d" : undefined })}`} className={`flex h-11 ${p.w} items-center justify-center rounded-full text-caption ${p.on ? "bg-primary text-on-primary" : "bg-elevated text-text hover:bg-elevated/70"}`}>
              {p.label}
            </Link>
          ))}
          <form action="/admin/analytics" className="ml-auto flex items-center gap-2">
            {days === 7 && <input type="hidden" name="period" value="7d" />}
            <select name="campaign" defaultValue={campaign?.id ?? ""} className="h-11 rounded-full border border-line bg-surface px-4 text-caption text-text">
              <option value="">{t("allCampaigns")}</option>
              {campaigns.map((x) => (
                <option key={x.id} value={x.id}>
                  {tr(x, "title", locale)}
                </option>
              ))}
            </select>
            <button type="submit" className="h-11 rounded-full bg-elevated px-4 text-caption text-text hover:bg-elevated/70">
              {t("apply")}
            </button>
          </form>
        </div>

        {empty ? (
          // 24 ცარიელი ანალიტიკა
          <AdminPanel className="w-[768px] gap-4 p-6">
            <div className="flex flex-col gap-4 rounded-bf-16 border border-line bg-surface p-6">
              <span className="relative size-[52px] rounded-bf-16 bg-elevated">
                <Image src="/figma/icon-chart-26.svg" alt="" width={26} height={26} className="absolute left-[13px] top-[13px] size-[26px]" />
              </span>
              <h2 className="text-h2 text-text">{t("emptyTitle")}</h2>
              <p className="text-body text-muted">{t("emptyBody")}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ButtonLink href={`/admin/analytics${q({ period: undefined })}`}>{t("see30")}</ButtonLink>
              <ButtonLink href={`/admin/analytics${q({ period: "7d" })}`} variant="secondary">
                {t("see7")}
              </ButtonLink>
            </div>
          </AdminPanel>
        ) : (
          <>
            <div className="flex gap-4">
              <StatCard icon="/figma/admin/metric-icon-chart-16.svg" label={t("views")} value={fmt(stats.views)} sub={viewsSub} />
              <StatCard href="/admin/participants" icon="/figma/admin/stat-team-16.svg" label={t("participants")} value={fmt(stats.joined)} sub={t("participantsSub")} />
              <StatCard href="/admin/participants" icon="/figma/admin/metric-icon-camera-16.svg" label={t("works")} value={fmt(stats.approved)} sub={t("worksSub")} />
              <StatCard icon="/figma/admin/stat-qr-16.svg" label={t("visits")} value={stats.visits == null ? "—" : fmt(stats.visits)} sub={stats.visits == null ? t("visitsNa") : t("visitsSub")} />
            </div>
            <div className="flex items-start gap-6">
              <AdminPanel className="w-[768px] shrink-0 gap-3 p-5">
                <h2 className="text-h3 text-text">{t("chartTitle")}</h2>
                <p className="text-caption text-muted">{days === 7 ? t("chart7") : t("chart30", { range: dateRange(series[0].date, series[series.length - 1].date, locale) })}</p>
                <BarChart values={bars.map((b) => b.value)} labels={bars.map((b) => label.format(b.date))} label={t("chartTitle")} />
              </AdminPanel>
              <AdminPanel className="w-[340px] shrink-0 gap-[14px] p-5">
                <h2 className="text-h3 text-text">{t("funnel")}</h2>
                {stats.views != null && <Step label={t("views")} value={fmt(stats.views)} pct={100} />}
                <Step label={t("participation")} value={fmt(stats.joined)} pct={top ? (stats.joined / top) * 100 : 0} />
                {stats.visits != null && <Step label={t("qrVisit")} value={fmt(stats.visits)} pct={top ? (stats.visits / top) * 100 : 0} />}
                <Step label={t("works")} value={fmt(stats.approved)} pct={top ? (stats.approved / top) * 100 : 0} />
                <p className="text-caption text-muted">{t("funnelNote")}</p>
              </AdminPanel>
            </div>
          </>
        )}
      </AdminBody>
    </>
  );
}
