// Admin 56 შეტყობინებები — Figma 111:5803 (a placeholder frame). Built from live data, no extra table:
// posts waiting for review, campaigns ending within 7 days, found posts participants declined,
// and linked accounts flagged for reconnection.
import Link from "next/link";
import { and, asc, desc, eq, gte, isNotNull, lte } from "drizzle-orm";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminBody, AdminHeader, LilacButton, SimpleTitle } from "@/components/admin/shell";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { dayMonth } from "@/lib/dates";
import { tr } from "@/lib/i18n-fields";
import { requireAdminPage } from "@/lib/session";

export default async function AdminNotificationsPage() {
  await requireAdminPage();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("admin.notifications");
  const c = await getTranslations("admin");
  const now = new Date();
  const bizDrafts = await db.select().from(schema.challenges).where(and(eq(schema.challenges.status, "draft"), isNotNull(schema.challenges.ownerId)));
  const [pending, ending, declined, expired] = await Promise.all([
    db
      .select({ id: schema.submissions.id, name: schema.users.name, at: schema.submissions.createdAt })
      .from(schema.submissions)
      .innerJoin(schema.users, eq(schema.users.id, schema.submissions.userId))
      .where(eq(schema.submissions.status, "pending"))
      .orderBy(desc(schema.submissions.createdAt))
      .limit(20),
    db
      .select()
      .from(schema.challenges)
      .where(and(eq(schema.challenges.status, "active"), gte(schema.challenges.endsAt, now), lte(schema.challenges.endsAt, new Date(now.getTime() + 7 * 86_400_000))))
      .orderBy(asc(schema.challenges.endsAt)),
    db
      .select({ id: schema.socialPosts.id, name: schema.users.name })
      .from(schema.socialPosts)
      .innerJoin(schema.users, eq(schema.users.id, schema.socialPosts.userId))
      .where(eq(schema.socialPosts.status, "dismissed"))
      .orderBy(desc(schema.socialPosts.updatedAt))
      .limit(10),
    db
      .select({ id: schema.linkedSocialAccounts.id, name: schema.users.name, handle: schema.linkedSocialAccounts.handle })
      .from(schema.linkedSocialAccounts)
      .innerJoin(schema.users, eq(schema.users.id, schema.linkedSocialAccounts.userId))
      .where(eq(schema.linkedSocialAccounts.status, "expired"))
      .limit(10),
  ]);
  const items = [
    ...bizDrafts.map((ch) => ({ key: ch.id, href: `/admin/campaigns/${ch.id}/edit/review`, text: t("bizDraft", { title: tr(ch, "title", locale), brand: ch.brand ?? "" }) })),
    ...pending.map((p) => ({ key: p.id, href: `/admin/participants/${p.id}`, text: t("newWork", { name: p.name }) })),
    ...ending.map((ch) => ({ key: ch.id, href: `/admin/campaigns/${ch.id}`, text: t("endingSoon", { title: tr(ch, "title", locale), date: ch.endsAt ? dayMonth(ch.endsAt, locale) : "" }) })),
    ...declined.map((d) => ({ key: d.id, href: "/admin/participants", text: t("declined", { name: d.name }) })),
    ...expired.map((e) => ({ key: e.id, href: "/admin/participants", text: t("expired", { name: e.name, handle: e.handle }) })),
  ];
  return (
    <>
      <AdminHeader crumb={c("crumb")} back="/admin/settings" />
      <AdminBody>
        <SimpleTitle title={t("title")} body={t("body")} />
        <div className="flex w-full max-w-[900px] flex-col gap-5 rounded-bf-16 bg-surface p-6 text-[15px] text-text">
          {items.length === 0 ? (
            <p className="text-muted">{t("empty")}</p>
          ) : (
            items.map((i) => (
              <Link key={i.key} href={i.href} className="hover:text-primary">
                {i.text}
              </Link>
            ))
          )}
        </div>
        <LilacButton href="/admin">{t("backHome")}</LilacButton>
      </AdminBody>
    </>
  );
}
