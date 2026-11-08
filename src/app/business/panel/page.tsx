// Business overview: my campaigns at a glance (only this business's campaigns; admins see the ones they created here).
import { desc, eq } from "drizzle-orm";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminBody, AdminTable, AdminTitle, AdminPanel, StatCard } from "@/components/admin/shell";
import { ButtonLink } from "@/components/ui";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { campaignCounts } from "@/lib/admin-campaigns";
import { tr } from "@/lib/i18n-fields";
import { requireBusinessPage } from "@/lib/session";

export default async function BusinessOverview() {
  const me = await requireBusinessPage();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("biz");
  const mine = await db.select().from(schema.challenges).where(eq(schema.challenges.ownerId, me.id)).orderBy(desc(schema.challenges.createdAt));
  const counts = await campaignCounts(mine.map((c) => c.id));
  const joined = [...counts.values()].reduce((a, b) => a + b.joined, 0);
  const visits = [...counts.values()].reduce((a, b) => a + b.visits, 0);
  return (
    <AdminBody>
      <AdminTitle eyebrow="BEFAMOUS BUSINESS" title={t("hello", { name: me.name ?? "" })} body={t("helloBody")} action={<ButtonLink href="/business/panel/new">{t("createCampaign")}</ButtonLink>} />
      <div className="grid grid-cols-2 gap-3 lg:flex lg:gap-4">
        <StatCard icon="/figma/admin/stat-campaign-16.svg" label={t("statCampaigns")} value={String(mine.length)} sub={t("statLive", { n: mine.filter((c) => c.status === "active").length })} />
        <StatCard icon="/figma/admin/stat-team-16.svg" label={t("statJoined")} value={String(joined)} sub={t("statAll")} />
        <StatCard icon="/figma/admin/stat-qr-16.svg" label={t("statVisits")} value={String(visits)} sub={t("statConfirmed")} />
        <StatCard href="/business/panel/ai" icon="/figma/admin/nav-spark-20.svg" label={t("statAi")} value="AI" sub={t("statAiSub")} />
      </div>
      <AdminPanel className="gap-3 p-4">
        <h2 className="text-h3 text-text">{t("myCampaigns")}</h2>
        {mine.length === 0 ? (
          <p className="p-2 text-body text-muted">{t("noCampaigns")}</p>
        ) : (
          <AdminTable
            columns={[t("colName"), t("colStatus"), t("colJoined"), t("colVisits")]}
            widths={["414px", "238px", "165px", "155px"]}
            rows={mine.map((c) => ({ key: c.id, cells: [tr(c, "title", locale), t(`status.${c.status}`), String(counts.get(c.id)?.joined ?? 0), c.kind === "visit" ? String(counts.get(c.id)?.visits ?? 0) : "—"] }))}
          />
        )}
      </AdminPanel>
    </AdminBody>
  );
}
