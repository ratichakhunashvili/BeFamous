// Admin 23 ანგარიშის პარამეტრები / 47 შენახულია — Figma 7:775 / 22:842. There is no business profile
// (one site, one admin team), so the card holds the admin's own name and language; the email is the
// login and is shown read-only. The extra pages list keeps only screens that exist in this admin.
import Link from "next/link";
import { eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { AdminBody, AdminHeader, AdminTitle } from "@/components/admin/shell";
import { ButtonLink } from "@/components/ui";
import { db, schema } from "@/db";
import { requireAdminPage } from "@/lib/session";
import { SettingsForm } from "./settings-form";

export default async function AdminSettingsPage({ searchParams }: PageProps<"/admin/settings">) {
  const admin = await requireAdminPage();
  const sp = await searchParams;
  const saved = Boolean(sp.saved);
  const t = await getTranslations("admin.settings");
  const c = await getTranslations("admin");
  const me = await db.query.users.findFirst({ where: eq(schema.users.id, admin.id) });
  const pages = [
    { href: "/admin/rewards/check", label: t("pageVoucher") },
    { href: "/admin/settings/access", label: t("pageTeam") },
    { href: "/admin/settings/notifications", label: t("pageNotifications") },
    { href: "/admin/participants/audience", label: t("pageAudience") },
    { href: "/admin/participants/creators", label: t("pageCreators") },
  ];
  return (
    <>
      <AdminHeader crumb={c("crumb")} back={saved ? "/admin/settings" : undefined} />
      <AdminBody>
        <AdminTitle eyebrow={t("eyebrow")} title={saved ? t("savedTitle") : t("title")} body={t("body")} />
        <div className="flex w-full max-w-[768px] flex-col gap-4 rounded-bf-16 border border-line bg-surface p-6">
          <h2 className="text-h3 text-text">{t("profile")}</h2>
          {saved ? (
            <>
              <p className="text-body text-text">{me?.name}</p>
              <p className="text-body text-muted">{me?.email}</p>
              <ButtonLink href="/admin/settings" variant="secondary">
                {t("back")}
              </ButtonLink>
            </>
          ) : (
            <SettingsForm
              initial={{ name: me?.name ?? "", locale: me?.locale ?? "ka" }}
              email={me?.email ?? ""}
              labels={{ name: t("name"), email: t("email"), emailHint: t("emailHint"), language: t("language"), save: t("save"), invalid: t("invalid") }}
            />
          )}
        </div>
        {!saved && (
          <div className="flex w-full max-w-[660px] flex-col gap-3 rounded-bf-16 bg-surface p-5">
            <h2 className="text-h3 text-text">{t("pages")}</h2>
            {pages.map((p) => (
              <Link key={p.href} href={p.href} className="flex h-11 items-center rounded-bf-8 bg-elevated pl-3 text-[14px] text-text transition-colors hover:bg-elevated/70">
                {`${p.label}  →`}
              </Link>
            ))}
          </div>
        )}
      </AdminBody>
    </>
  );
}
