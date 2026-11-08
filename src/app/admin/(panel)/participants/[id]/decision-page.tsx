// Shared body of 38 (request changes) and 39 (reject).
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AdminBody, AdminHeader, AdminTitle } from "@/components/admin/shell";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { requireAdminPage } from "@/lib/session";
import { NoteForm } from "./note-form";

export async function DecisionPage({ id, decision }: { id: string; decision: "revision" | "rejected" }) {
  await requireAdminPage();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const sub = await db.query.submissions.findFirst({ where: eq(schema.submissions.id, id), columns: { id: true, status: true } });
  if (!sub) notFound();
  if (sub.status !== "pending") redirect(`/admin/participants/${id}`);
  const t = await getTranslations("admin.review");
  const c = await getTranslations("admin");
  const key = decision === "revision" ? "rev" : "rej";
  return (
    <>
      <AdminHeader crumb={c("crumb")} back={`/admin/participants/${id}`} />
      <AdminBody>
        <AdminTitle eyebrow={t("decisionEyebrow")} title={t(`${key}Title`)} body={t("decisionBody")} />
        <NoteForm
          submissionId={id}
          decision={decision}
          labels={{ heading: t("reason"), comment: t("comment"), placeholder: t(`${key}Placeholder`), cancel: t("cancel"), submit: t(`${key}Submit`), error: t("noteError") }}
        />
      </AdminBody>
    </>
  );
}
