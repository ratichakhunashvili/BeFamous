// Admin 51 აუდიტორიის მიმოხილვა — Figma 111:4710 (a placeholder frame). Aggregates only, last 30 days:
// new vs returning participants, self-reported city, top interests. Groups smaller than 5 people are
// merged into "other" so no individual can be picked out. There is no age/gender/reach data — not shown.
import { sql } from "drizzle-orm";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminBody, AdminHeader, LilacButton, SimpleTitle } from "@/components/admin/shell";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { sinceDays } from "@/lib/admin-stats";
import { isCity } from "@/lib/cities";
import { requireAdminPage } from "@/lib/session";

const MIN_GROUP = 5;

export default async function AudiencePage() {
  await requireAdminPage();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("admin.audience");
  const tc = await getTranslations("cities");
  const c = await getTranslations("admin");
  const since = sinceDays(30);
  const p = schema.participations;

  // People who joined anything in the period; "new" = their first-ever join is in the period.
  // (participations.joinedAt is stored in the "created_at" column.)
  const people = await db.execute<{ user_id: string; first: string }>(sql`
    select x.user_id, min(all_p.created_at) as first
    from ${p} x join ${p} all_p on all_p.user_id = x.user_id
    where x.created_at >= ${since}
    group by x.user_id`);
  const rows = people.rows;
  const total = rows.length;
  const fresh = rows.filter((r) => new Date(r.first) >= since).length;
  const ids = rows.map((r) => r.user_id);

  const [cityRows, interestRows] = ids.length
    ? await Promise.all([
        db.execute<{ city: string | null; n: number }>(sql`select city, count(*)::int as n from ${schema.users} where id in ${ids} group by city order by n desc`),
        db.execute<{ name_ka: string; name_en: string; n: number }>(
          sql`select i.name_ka, i.name_en, count(distinct ui.user_id)::int as n from ${schema.userInterests} ui join ${schema.interests} i on i.id = ui.interest_id where ui.user_id in ${ids} group by i.id order by n desc limit 3`,
        ),
      ])
    : [{ rows: [] }, { rows: [] }];
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
  const cities = cityRows.rows.filter((r) => r.n >= MIN_GROUP && isCity(r.city));

  return (
    <>
      <AdminHeader crumb={c("crumb")} back="/admin/participants" />
      <AdminBody>
        <SimpleTitle title={t("title")} body={t("body")} />
        <div className="flex w-full max-w-[900px] flex-col gap-5 rounded-bf-16 bg-surface p-6 text-[15px] text-text">
          <p>{t("note", { min: MIN_GROUP })}</p>
          {total === 0 ? (
            <p className="text-muted">{t("empty")}</p>
          ) : total < MIN_GROUP ? (
            <p className="text-muted">{t("tooFew", { min: MIN_GROUP })}</p>
          ) : (
            <>
              <p>{cities.length ? t("geo", { list: cities.map((r) => `${tc(r.city as "tbilisi")} ${pct(r.n)}%`).join(" · ") }) : t("geoUnknown")}</p>
              <p>{t("newLine", { n: fresh, pct: pct(fresh) })}</p>
              <p>{t("returningLine", { n: total - fresh, pct: pct(total - fresh) })}</p>
              {interestRows.rows
                .filter((r) => r.n >= MIN_GROUP)
                .map((r) => (
                  <p key={r.name_ka}>{t("interestLine", { name: locale === "en" ? r.name_en : r.name_ka, n: r.n, pct: pct(r.n) })}</p>
                ))}
            </>
          )}
        </div>
        <LilacButton href="/admin">{t("backHome")}</LilacButton>
      </AdminBody>
    </>
  );
}
