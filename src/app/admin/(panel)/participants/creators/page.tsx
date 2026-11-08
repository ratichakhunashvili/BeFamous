// Admin 52 აღმოაჩინე შემქმნელები — Figma 111:4930 (a placeholder frame). An internal, admin-only list of
// creators with approved work, filtered by interest and city. Users have no "public profile / show me in
// search" setting, so the Figma lines about opt-in and public profiles are not shown.
import { and, asc, count, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminBody, AdminHeader, LilacButton, SimpleTitle } from "@/components/admin/shell";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { cities, isCity } from "@/lib/cities";
import { tr } from "@/lib/i18n-fields";
import { requireAdminPage } from "@/lib/session";

export default async function CreatorsPage({ searchParams }: PageProps<"/admin/participants/creators">) {
  await requireAdminPage();
  const sp = await searchParams;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("admin.creators");
  const tc = await getTranslations("cities");
  const c = await getTranslations("admin");
  const interests = await db.select().from(schema.interests).orderBy(asc(schema.interests.sortOrder));
  const interest = interests.find((i) => i.id === sp.interest);
  const city = isCity(sp.city) ? sp.city : undefined;
  const { users, submissions, userInterests } = schema;

  const interestUsers = interest ? (await db.select({ id: userInterests.userId }).from(userInterests).where(eq(userInterests.interestId, interest.id))).map((r) => r.id) : null;
  const rows = await db
    .select({ id: users.id, name: users.name, city: users.city, approved: count(submissions.id) })
    .from(users)
    .innerJoin(submissions, and(eq(submissions.userId, users.id), eq(submissions.status, "approved")))
    .where(
      and(
        isNull(users.deletedAt),
        city ? eq(users.city, city) : undefined,
        interestUsers ? (interestUsers.length ? inArray(users.id, interestUsers) : sql`false`) : undefined,
      ),
    )
    .groupBy(users.id)
    .orderBy(desc(count(submissions.id)))
    .limit(50);
  const theirInterests = rows.length
    ? await db
        .select({ userId: userInterests.userId, nameKa: schema.interests.nameKa, nameEn: schema.interests.nameEn })
        .from(userInterests)
        .innerJoin(schema.interests, eq(schema.interests.id, userInterests.interestId))
        .where(inArray(userInterests.userId, rows.map((r) => r.id)))
    : [];
  const box = "h-11 rounded-full border border-line bg-surface px-4 text-caption text-text";

  return (
    <>
      <AdminHeader crumb={c("crumb")} back="/admin/participants" />
      <AdminBody>
        <SimpleTitle title={t("title")} body={t("body")} />
        <form action="/admin/participants/creators" className="flex w-full max-w-[900px] items-center gap-2">
          <select name="interest" defaultValue={interest?.id ?? ""} className={box} aria-label={t("interest")}>
            <option value="">{t("allInterests")}</option>
            {interests.map((i) => (
              <option key={i.id} value={i.id}>
                {tr(i, "name", locale)}
              </option>
            ))}
          </select>
          <select name="city" defaultValue={city ?? ""} className={box} aria-label={t("city")}>
            <option value="">{t("allCities")}</option>
            {cities.map((x) => (
              <option key={x} value={x}>
                {tc(x)}
              </option>
            ))}
          </select>
          <button type="submit" className="h-11 rounded-full bg-elevated px-4 text-caption text-text hover:bg-elevated/70">
            {t("apply")}
          </button>
        </form>
        <div className="flex w-full max-w-[900px] flex-col gap-5 rounded-bf-16 bg-surface p-6 text-[15px] text-text">
          <p>{t("note")}</p>
          <p>{`${t("interest")} — ${interest ? tr(interest, "name", locale) : t("allInterests")}`}</p>
          <p>{`${t("city")} — ${city ? tc(city) : t("allCities")}`}</p>
          {rows.length === 0 ? (
            <p className="text-muted">{t("empty")}</p>
          ) : (
            rows.map((r) => {
              const names = theirInterests.filter((x) => x.userId === r.id).map((x) => (locale === "en" ? x.nameEn : x.nameKa));
              return <p key={r.id}>{`${r.name} — ${names[0] ?? "—"} · ${t("approved", { count: r.approved })}${isCity(r.city) ? ` · ${tc(r.city)}` : ""}`}</p>;
            })
          )}
        </div>
        <LilacButton href="/admin">{t("backHome")}</LilacButton>
      </AdminBody>
    </>
  );
}
