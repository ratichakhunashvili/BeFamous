// Admin 25 პაროლის აღდგენა — Figma 22:820 (same reset link as the app's 29).
import { getTranslations } from "next-intl/server";
import { AdminAuthShell } from "@/components/admin/auth-shell";
import { AdminResetForm } from "./reset-form";

export default async function AdminResetPage() {
  const t = await getTranslations("admin.auth");
  return (
    <AdminAuthShell>
      <div className="flex flex-col gap-2">
        <p className="text-caption text-muted">{t("resetEyebrow")}</p>
        <h1 className="text-h1 text-text">{t("resetTitle")}</h1>
        <p className="text-body text-muted">{t("resetBody")}</p>
      </div>
      <AdminResetForm labels={{ email: t("emailShort"), submit: t("sendLink"), back: t("backToSignin"), invalid: t("invalidEmail") }} />
    </AdminAuthShell>
  );
}
