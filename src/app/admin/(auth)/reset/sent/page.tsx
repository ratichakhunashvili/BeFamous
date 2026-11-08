// Admin 26 ელფოსტა გაგზავნილია — Figma 22:821. "ხელახლა გაგზავნა" sends the link again to the same address.
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { adminRequestResetAction } from "@/app/actions/auth";
import { AdminAuthShell } from "@/components/admin/auth-shell";
import { SubmitButton } from "@/components/submit-button";
import { ButtonLink } from "@/components/ui";

export default async function AdminResetSentPage({ searchParams }: PageProps<"/admin/reset/sent">) {
  const sp = await searchParams;
  const email = typeof sp.email === "string" ? sp.email.slice(0, 200) : "";
  const t = await getTranslations("admin.auth");
  // A plain form action can't use useActionState's (prev, form) signature, so wrap it.
  async function resend(form: FormData) {
    "use server";
    await adminRequestResetAction(undefined, form);
  }
  return (
    <AdminAuthShell>
      <div className="flex flex-col gap-4 rounded-bf-16 border border-line bg-surface p-6">
        <span className="relative size-[52px] rounded-bf-16 bg-elevated">
          <Image src="/figma/icon-mail-26.svg" alt="" width={26} height={26} className="absolute left-[13px] top-[13px] size-[26px]" />
        </span>
        <h1 className="text-h2 text-text">{t("sentTitle")}</h1>
        <p className="text-body text-muted">{t("sentBody", { email })}</p>
      </div>
      <ButtonLink href="/admin/signin">{t("backToSignin")}</ButtonLink>
      <form action={resend}>
        <input type="hidden" name="email" value={email} />
        <SubmitButton variant="secondary">{t("resend")}</SubmitButton>
      </form>
    </AdminAuthShell>
  );
}
