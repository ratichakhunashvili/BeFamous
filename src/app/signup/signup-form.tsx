"use client";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { signupAction } from "@/app/actions/auth";
import { Button, ButtonLink, Field, InfoRow } from "@/components/ui";

export function SignupForm() {
  const [state, action, pending] = useActionState(signupAction, undefined);
  const t = useTranslations("signup");
  const c = useTranslations("common");
  const err = (field: string) => {
    const code = state?.fieldErrors?.[field];
    return code ? t(`errors.${code}` as "errors.name") : undefined;
  };

  return (
    <form action={action} className="flex w-full flex-col gap-5" noValidate>
      <Field label={c("name")} name="name" autoComplete="name" required placeholder="ნინო ბერიძე" defaultValue={state?.values?.name} error={err("name")} />
      <Field label={c("email")} name="email" type="email" autoComplete="email" required icon="/figma/icon-mail.svg" placeholder="nino@example.com" defaultValue={state?.values?.email} error={err("email")} />
      <Field label={c("password")} name="password" type="password" autoComplete="new-password" required minLength={8} icon="/figma/icon-lock.svg" placeholder="••••••••" hint={t("passwordHint")} hintGap error={err("password")} />
      <InfoRow href="/terms" layout="centered" icon="/figma/icon-activity.svg" chevron="/figma/icon-chevron.svg" title={t("termsTitle")} body={t("termsBody")} />
      <Button type="submit" disabled={pending}>
        {t("submit")}
      </Button>
      <ButtonLink href="/signin" variant="secondary">
        {c("signin")}
      </ButtonLink>
    </form>
  );
}
