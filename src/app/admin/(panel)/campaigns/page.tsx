// Admin 05 კამპანიების სია (Figma 7:138), with the tabs 29 მონახაზები and 30 დაგეგმილი as ?status=.
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminBody, AdminHeader, AdminPanel, AdminTable, AdminTitle } from "@/components/admin/shell";
import { ButtonLink } from "@/components/ui";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { campaignCounts, syncChallengeStatuses } from "@/lib/admin-campaigns";
import { tr } from "@/lib/i18n-fields";
import { requireAdminPage } from "@/lib/session";

const tabs = [
  { key: "all", width: "w-[108px]" },
  { key: "draft", width: "w-[138px]" },
  { key: "scheduled", width: "w-[142px]" },
] as const;

export default async function CampaignsPage({ searchParams }: PageProps<"/admin/campaigns">) {
  await requireAdminPage();
  await syncChallengeStatuses();
  const sp = await searchParams;
  const filter = sp.status === "draft" || sp.status === "scheduled" ? sp.status : "all";
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("admin.campaigns");
  const c = await getTranslations("admin");
  const list = await db
    .select()
    .from(schema.challenges)
    .where(filter === "all" ? undefined : eq(schema.challenges.status, filter))
    .orderBy(desc(schema.challenges.createdAt));
  const counts = await campaignCounts(list.map((ch) => ch.id));
  const started = (s: string) => s === "active" || s === "paused" || s === "ended";

  return (
    <>
      <AdminHeader crumb={c("crumb")} back={filter === "all" ? undefined : "/admin/campaigns"} />
      <AdminBody>
        <AdminTitle
          eyebrow={t("eyebrow")}
          title={filter === "draft" ? t("draftsTitle") : filter === "scheduled" ? t("scheduledTitle") : t("title")}
          body={t("body")}
          action={<ButtonLink href="/admin/campaigns/new">{t("new")}</ButtonLink>}
        />
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const on = tab.key === filter;
            return (
              <Link
                key={tab.key}
                href={tab.key === "all" ? "/admin/campaigns" : `/admin/campaigns?status=${tab.key}`}
                aria-current={on ? "page" : undefined}
                className={`flex h-11 ${tab.width} items-center justify-center rounded-full text-caption ${on ? "bg-primary text-on-primary" : "bg-elevated text-text hover:bg-elevated/70"}`}
              >
                {t(`tab.${tab.key}`)}
              </Link>
            );
          })}
        </div>
        <AdminPanel className="gap-3 p-4">
          <h2 className="text-h3 text-text">{filter === "draft" ? t("savedWork") : t("list")}</h2>
          {list.length === 0 ? (
            <p className="p-[10px] text-body text-muted">{t("empty")}</p>
          ) : (
            <AdminTable
              columns={[t("colName"), t("colStatus"), t("colJoined"), t("colVisits")]}
              widths={["414px", "227px", "165px", "155px"]}
              rows={list.map((ch) => {
                const n = counts.get(ch.id);
                return {
                  key: ch.id,
                  href: ch.status === "draft" ? `/admin/campaigns/${ch.id}/edit/basics` : `/admin/campaigns/${ch.id}`,
                  cells: [tr(ch, "title", locale), t(`statusLabel.${ch.status}`), started(ch.status) ? String(n?.joined ?? 0) : "—", started(ch.status) && ch.kind === "visit" ? String(n?.visits ?? 0) : "—"],
                };
              })}
            />
          )}
        </AdminPanel>
      </AdminBody>
    </>
  );
}
