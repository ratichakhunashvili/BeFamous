// Admin 01 შესვლა — Figma 7:2. Same accounts as the app; only role "admin" may enter.
// The Figma "რეგისტრაცია" button is left out: admins are added on 54 (team & access).
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { AdminAuthShell } from "@/components/admin/auth-shell";
import { AdminSigninForm } from "./signin-form";

export default async function AdminSigninPage() {
  const session = await auth();
  if (session?.user?.role === "admin") redirect("/admin");
  const t = await getTranslations("admin.auth");
  return (
    <AdminAuthShell>
      <div className="flex flex-col gap-2">
        <p className="text-caption text-muted">BEFAMOUS ADMIN</p>
        <h1 className="text-h1 text-text">{t("signinTitle")}</h1>
        <p className="text-body text-muted">{t("signinBody")}</p>
      </div>
      <AdminSigninForm
        labels={{ email: t("email"), password: t("password"), submit: t("signin"), reset: t("forgot"), invalid: t("invalid"), limited: t("limited") }}
      />
    </AdminAuthShell>
  );
}
