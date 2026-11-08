// Admin 48 გამარჯვებულების შერჩევა — Figma 106:3475. The Figma frame shows the rules only; the pickers
// (one approved post per category) are added so a real choice can be made. No automatic scoring: the
// weights need platform data we don't have, so the admin decides and the choice is kept in the history.
import { and, eq, ne } from "drizzle-orm";
import { getLocale, getTranslations } from "next-intl/server";
import { saveWinnersAction } from "@/app/actions/admin-misc";
import { AdminBody, AdminHeader, SimpleTitle } from "@/components/admin/shell";
import { SubmitButton } from "@/components/submit-button";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { tr } from "@/lib/i18n-fields";
import { requireAdminPage } from "@/lib/session";

const categories = ["creative", "audience", "business"] as const;

export default async function WinnersPage({ searchParams }: PageProps<"/admin/participants/winners">) {
  await requireAdminPage();
  const sp = await searchParams;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("admin.winners");
  const c = await getTranslations("admin");
  const campaigns = await db.select().from(schema.challenges).where(ne(schema.challenges.status, "draft")).orderBy(schema.challenges.sortOrder);
  const selected = campaigns.find((x) => x.id === sp.campaign) ?? campaigns[0];
  const [approved, winners] = selected
    ? await Promise.all([
        db
          .select({ id: schema.submissions.id, name: schema.users.name, url: schema.submissions.mediaUrl, metrics: schema.socialPosts.metrics })
          .from(schema.submissions)
          .innerJoin(schema.missions, eq(schema.missions.id, schema.submissions.missionId))
          .innerJoin(schema.users, eq(schema.users.id, schema.submissions.userId))
          .leftJoin(schema.socialPosts, eq(schema.socialPosts.submissionId, schema.submissions.id))
          .where(and(eq(schema.missions.challengeId, selected.id), eq(schema.submissions.status, "approved"))),
        db.select().from(schema.challengeWinners).where(eq(schema.challengeWinners.challengeId, selected.id)),
      ])
    : [[], []];
  const label = (a: (typeof approved)[number]) => {
    const m = a.metrics as { views: number | null } | null;
    return `${a.name} · ${m?.views != null ? t("views", { n: m.views.toLocaleString("en-US") }) : t("viewsUnknown")}`;
  };
  const box = "h-12 w-full rounded-bf-12 border border-line bg-surface px-[15px] text-body text-text outline-none focus:ring-2 focus:ring-inset focus:ring-primary/60";

  return (
    <>
      <AdminHeader crumb={c("crumb")} back="/admin/participants" />
      <AdminBody>
        <SimpleTitle title={t("title")} body={t("body")} />
        <div className="flex w-[900px] flex-col gap-5 rounded-bf-16 bg-surface p-6 text-[15px] text-text">
          {(t.raw("rules") as string[]).map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <form className="flex w-[900px] items-end gap-3" action="/admin/participants/winners">
          <label className="flex flex-1 flex-col gap-2">
            <span className="text-label text-text">{t("campaign")}</span>
            <select name="campaign" defaultValue={selected?.id} className={box}>
              {campaigns.map((x) => (
                <option key={x.id} value={x.id}>
                  {tr(x, "title", locale)}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="h-12 rounded-bf-12 border border-line bg-surface px-5 text-label text-text hover:bg-elevated">
            {t("show")}
          </button>
        </form>
        {selected && (
          <form action={saveWinnersAction} className="flex w-[900px] flex-col gap-5 rounded-bf-16 border border-line bg-surface p-6">
            <input type="hidden" name="challengeId" value={selected.id} />
            {approved.length === 0 && <p className="text-body text-muted">{t("noApproved")}</p>}
            {categories.map((cat) => {
              const w = winners.find((x) => x.category === cat);
              return (
                <div key={cat} className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-2">
                    <span className="text-label text-text">{t(`cat.${cat}`)}</span>
                    <select name={cat} defaultValue={w?.submissionId ?? ""} disabled={Boolean(w?.confirmedAt)} className={box}>
                      <option value="">{t("notChosen")}</option>
                      {approved.map((a) => (
                        <option key={a.id} value={a.id}>
                          {label(a)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-label text-text">{t("note")}</span>
                    <input name={`${cat}Note`} defaultValue={w?.note ?? ""} disabled={Boolean(w?.confirmedAt)} placeholder={cat === "business" ? t("notePlaceholderBusiness") : t("notePlaceholder")} className={box} />
                  </label>
                </div>
              );
            })}
            <div className="w-[310px]">
              <SubmitButton className="!h-[52px] !bg-primary !font-bold !text-on-primary">{t("next")}</SubmitButton>
            </div>
          </form>
        )}
      </AdminBody>
    </>
  );
}
