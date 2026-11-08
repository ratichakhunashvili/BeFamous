// Admin 49 შედეგების დადასტურება — Figma 106:3693. Figma has no confirm button; one is added so the
// choice is actually saved to the history and the winners are notified.
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { confirmWinnersAction } from "@/app/actions/admin-misc";
import { AdminBody, AdminHeader, LilacButton, SimpleTitle } from "@/components/admin/shell";
import { SubmitButton } from "@/components/submit-button";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { dayMonth } from "@/lib/dates";
import { tr } from "@/lib/i18n-fields";
import { requireAdminPage } from "@/lib/session";

const categories = ["creative", "audience", "business"] as const;

export default async function ConfirmWinnersPage({ searchParams }: PageProps<"/admin/participants/winners/confirm">) {
  await requireAdminPage();
  const sp = await searchParams;
  const id = typeof sp.campaign === "string" && /^[0-9a-f-]{36}$/i.test(sp.campaign) ? sp.campaign : null;
  const campaign = id ? await db.query.challenges.findFirst({ where: eq(schema.challenges.id, id) }) : undefined;
  if (!campaign) notFound();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("admin.winners");
  const c = await getTranslations("admin");
  const winners = await db
    .select({ w: schema.challengeWinners, name: schema.users.name })
    .from(schema.challengeWinners)
    .innerJoin(schema.users, eq(schema.users.id, schema.challengeWinners.userId))
    .where(eq(schema.challengeWinners.challengeId, campaign.id));
  const pending = winners.some((x) => !x.w.confirmedAt);

  return (
    <>
      <AdminHeader crumb={c("crumb")} back={`/admin/participants/winners?campaign=${campaign.id}`} />
      <AdminBody>
        <SimpleTitle title={t("confirmTitle")} body={`${tr(campaign, "title", locale)} · ${t("confirmBody")}`} />
        {sp.done && <p className="w-full max-w-[900px] rounded-bf-12 border border-line bg-surface p-3 text-body text-accent">{t("confirmed")}</p>}
        <div className="flex w-full max-w-[900px] flex-col gap-5 rounded-bf-16 bg-surface p-6 text-[15px] text-text">
          {categories.map((cat) => {
            const x = winners.find((r) => r.w.category === cat);
            return (
              <p key={cat}>
                {t(`cat.${cat}`)} — {x ? x.name : t("toChoose")}
                {x?.w.confirmedAt && <span className="text-muted">{` · ${t("confirmedOn", { date: dayMonth(x.w.confirmedAt, locale) })}`}</span>}
                {x?.w.note && <span className="text-muted">{` · ${x.w.note}`}</span>}
              </p>
            );
          })}
          <p>{t("prizeLine")}</p>
          <p>{t("policyLine")}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {pending && (
            <form action={confirmWinnersAction} className="w-full sm:w-[310px]">
              <input type="hidden" name="challengeId" value={campaign.id} />
              <SubmitButton className="!h-[52px]">{t("confirm")}</SubmitButton>
            </form>
          )}
          <LilacButton href={`/admin/campaigns/${campaign.id}`}>{t("campaignOverview")}</LilacButton>
        </div>
      </AdminBody>
    </>
  );
}
