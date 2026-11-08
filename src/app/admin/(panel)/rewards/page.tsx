// Admin 22 ჯილდოების მართვა — Figma 7:742; after creating one it shows 46 (title "ჯილდო დამატებულია").
import { count, desc, eq, sql } from "drizzle-orm";
import { getLocale, getTranslations } from "next-intl/server";
import { toggleRewardAction } from "@/app/actions/admin-rewards";
import { AdminBody, AdminHeader, AdminPanel, AdminTable, AdminTitle } from "@/components/admin/shell";
import { SubmitButton } from "@/components/submit-button";
import { ButtonLink } from "@/components/ui";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { tr } from "@/lib/i18n-fields";
import { requireAdminPage } from "@/lib/session";

const shortMonthKa = ["იან", "თებ", "მარ", "აპრ", "მაი", "ივნ", "ივლ", "აგვ", "სექ", "ოქტ", "ნოე", "დეკ"];

export default async function RewardsAdminPage({ searchParams }: PageProps<"/admin/rewards">) {
  await requireAdminPage();
  const sp = await searchParams;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("admin.rewards");
  const c = await getTranslations("admin");
  const rows = await db
    .select({
      reward: schema.rewards,
      issued: count(schema.vouchers.id),
      used: sql<number>`count(*) filter (where ${schema.vouchers.status} = 'redeemed')`.mapWith(Number),
    })
    .from(schema.rewards)
    .leftJoin(schema.vouchers, eq(schema.vouchers.rewardId, schema.rewards.id))
    .groupBy(schema.rewards.id)
    .orderBy(desc(schema.rewards.createdAt));
  const date = (d: Date | null) => {
    if (!d) return "—";
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tbilisi", day: "numeric", month: "numeric" }).formatToParts(d);
    const day = parts.find((p) => p.type === "day")?.value;
    const m = Number(parts.find((p) => p.type === "month")?.value) - 1;
    return locale === "en" ? new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tbilisi", day: "numeric", month: "short" }).format(d) : `${day} ${shortMonthKa[m]}`;
  };
  const added = typeof sp.added === "string";

  return (
    <>
      <AdminHeader crumb={c("crumb")} action={<ButtonLink href="/admin/rewards/check" variant="secondary" className="!w-[202px]">{t("checkVoucher")}</ButtonLink>} />
      <AdminBody>
        <AdminTitle
          eyebrow={t("eyebrow")}
          title={added ? t("addedTitle") : t("title")}
          body={t("body")}
          action={<ButtonLink href="/admin/rewards/new">{t("add")}</ButtonLink>}
        />
        <AdminPanel className="gap-3 p-4">
          <h2 className="text-h3 text-text">{t("vouchers")}</h2>
          <AdminTable
            columns={[t("colReward"), t("colStock"), t("colUsed"), t("colExpires"), ""]}
            widths={["372px", "240px", "160px", "140px", "110px"]}
            rows={rows.map(({ reward, issued, used }) => ({
              key: reward.id,
              cells: [
                <span key="t" className={reward.active ? "" : "opacity-50"}>
                  {tr(reward, "title", locale)}
                  {sp.added === reward.id && <span className="ml-2 text-caption text-accent">{t("new")}</span>}
                </span>,
                reward.stock == null ? t("unlimited", { issued }) : t("stockLeft", { left: reward.stock, issued }),
                String(used),
                date(reward.expiresAt),
                <form key="f" action={toggleRewardAction}>
                  <input type="hidden" name="rewardId" value={reward.id} />
                  <SubmitButton variant="quiet" className="!h-9 !w-auto px-3 !text-caption">
                    {reward.active ? t("pause") : t("resume")}
                  </SubmitButton>
                </form>,
              ],
            }))}
          />
          {rows.length === 0 && <p className="p-[10px] text-body text-muted">{t("empty")}</p>}
        </AdminPanel>
      </AdminBody>
    </>
  );
}
