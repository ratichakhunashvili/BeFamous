"use client";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { resetPasswordAction } from "@/app/actions/auth";
import { Button, ButtonLink, Field } from "@/components/ui";

export function NewPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, undefined);
  const t = useTranslations("reset");
  const s = useTranslations("signup");

  return (
    <form action={action} className="flex w-full flex-col gap-5" noValidate>
      <input type="hidden" name="token" value={token} />
      <Field
        label={t("newPassword")}
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        icon="/figma/icon-lock.svg"
        hint={s("passwordHint")}
        error={state?.fieldErrors?.password ? s("errors.password") : undefined}
      />
      {state?.error && (
        <p role="alert" className="text-caption text-chart">
          {t("invalidLink")}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {t("save")}
      </Button>
      {state?.error && (
        <ButtonLink href="/reset" variant="secondary">
          {t("resend")}
        </ButtonLink>
      )}
    </form>
  );
}
