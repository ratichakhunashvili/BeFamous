"use client";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { signinAction } from "@/app/actions/auth";
import { Button, ButtonLink, Field } from "@/components/ui";

export function SigninForm() {
  const [state, action, pending] = useActionState(signinAction, undefined);
  const t = useTranslations("signin");
  const c = useTranslations("common");

  return (
    <form action={action} className="flex w-full flex-col gap-5" noValidate>
      <Field label={c("email")} name="email" type="email" autoComplete="email" required icon="/figma/icon-mail.svg" placeholder="nino@example.com" defaultValue={state?.values?.email} />
      <Field label={c("password")} name="password" type="password" autoComplete="current-password" required icon="/figma/icon-lock.svg" placeholder="••••••••" />
      {state?.error && (
        <p role="alert" className="-mt-2 text-caption text-chart">
          {t("invalid")}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {c("signin")}
      </Button>
      <ButtonLink href="/reset" variant="quiet">
        {t("forgot")}
      </ButtonLink>
      <ButtonLink href="/signup" variant="secondary">
        {c("signup")}
      </ButtonLink>
    </form>
  );
}
