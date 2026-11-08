// Business: my campaigns with status. New ones wait for the BeFamous team to publish them.
import { desc, eq } from "drizzle-orm";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminBody, AdminPanel, AdminTable, AdminTitle } from "@/components/admin/shell";
import { ButtonLink } from "@/components/ui";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { campaignCounts } from "@/lib/admin-campaigns";
import { dateRange } from "@/lib/dates";
import { tr } from "@/lib/i18n-fields";
import { requireBusinessPage } from "@/lib/session";

export default async function BusinessCampaigns({ searchParams }: PageProps<"/business/panel/campaigns">) {
  const me = await requireBusinessPage();
  const sp = await searchParams;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("biz");
  const mine = await db.select().from(schema.challenges).where(eq(schema.challenges.ownerId, me.id)).orderBy(desc(schema.challenges.createdAt));
  const counts = await campaignCounts(mine.map((c) => c.id));
  return (
    <AdminBody>
      <AdminTitle eyebrow={t("campaignsEyebrow")} title={t("myCampaigns")} body={t("campaignsBody")} action={<ButtonLink href="/business/panel/new">{t("createCampaign")}</ButtonLink>} />
      {typeof sp.created === "string" && <p className="rounded-bf-12 border border-line bg-surface p-3 text-body text-accent">{t("created")}</p>}
      <AdminPanel className="gap-3 p-4">
        {mine.length === 0 ? (
          <p className="p-2 text-body text-muted">{t("noCampaigns")}</p>
        ) : (
          <AdminTable
            columns={[t("colName"), t("colStatus"), t("colDates"), t("colJoined")]}
            widths={["360px", "260px", "200px", "120px"]}
            rows={mine.map((c) => ({ key: c.id, cells: [tr(c, "title", locale), t(`status.${c.status}`), dateRange(c.startsAt, c.endsAt, locale), String(counts.get(c.id)?.joined ?? 0)] }))}
          />
        )}
      </AdminPanel>
    </AdminBody>
  );
}
