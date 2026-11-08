// Admin 54 გუნდი და წვდომა — Figma 111:5367 (a placeholder frame). Here it means: who can enter this
// admin. One role ("ადმინი"); access is given to an existing account by email and can be removed
// (not from yourself, and never from the last admin). Every change is written to the audit log.
import { asc, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { revokeAdminAction } from "@/app/actions/admin-misc";
import { AdminBody, AdminHeader, LilacButton, SimpleTitle } from "@/components/admin/shell";
import { SubmitButton } from "@/components/submit-button";
import { db, schema } from "@/db";
import { requireAdminPage } from "@/lib/session";
import { GrantForm } from "./grant-form";

export default async function AccessPage({ searchParams }: PageProps<"/admin/settings/access">) {
  const me = await requireAdminPage();
  const sp = await searchParams;
  const t = await getTranslations("admin.access");
  const c = await getTranslations("admin");
  const admins = await db.select({ id: schema.users.id, name: schema.users.name, email: schema.users.email }).from(schema.users).where(eq(schema.users.role, "admin")).orderBy(asc(schema.users.createdAt));
  return (
    <>
      <AdminHeader crumb={c("crumb")} back="/admin/settings" />
      <AdminBody>
        <SimpleTitle title={t("title")} body={t("body")} />
        {sp.granted && <p className="w-[900px] rounded-bf-12 border border-line bg-surface p-3 text-body text-accent">{t("granted")}</p>}
        {sp.error && <p className="w-[900px] rounded-bf-12 border border-line bg-surface p-3 text-body text-chart">{sp.error === "self" ? t("errSelf") : t("errLast")}</p>}
        <div className="flex w-[900px] flex-col gap-5 rounded-bf-16 bg-surface p-6 text-[15px] text-text">
          {admins.map((a) => (
            <div key={a.id} className="flex items-center gap-3">
              <p className="flex-1">{`${a.name} · ${a.email} · ${t("role")} · ${t("active")}${a.id === me.id ? ` · ${t("you")}` : ""}`}</p>
              {a.id !== me.id && admins.length > 1 && (
                <form action={revokeAdminAction}>
                  <input type="hidden" name="userId" value={a.id} />
                  <SubmitButton variant="quiet" className="!h-9 !w-auto px-3 !text-caption">
                    {t("revoke")}
                  </SubmitButton>
                </form>
              )}
            </div>
          ))}
        </div>
        <GrantForm labels={{ heading: t("grantTitle"), email: t("email"), submit: t("grant"), email_err: t("errEmail"), noAccount: t("errNoAccount") }} />
        <LilacButton href="/admin">{t("backHome")}</LilacButton>
      </AdminBody>
    </>
  );
}
