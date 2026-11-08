"use client";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { requestResetAction } from "@/app/actions/auth";
import { Button, Field } from "@/components/ui";

export function RequestResetForm() {
  const [state, action, pending] = useActionState(requestResetAction, undefined);
  const t = useTranslations("reset");
  const c = useTranslations("common");
  const s = useTranslations("signup");

  return (
    <form action={action} className="flex w-full flex-col gap-5" noValidate>
      <Field
        label={c("email")}
        name="email"
        type="email"
        autoComplete="email"
        required
        icon="/figma/icon-mail.svg"
        placeholder="nino@example.com"
        defaultValue={state?.values?.email}
        error={state?.fieldErrors?.email ? s("errors.email") : undefined}
      />
      <Button type="submit" disabled={pending}>
        {t("send")}
      </Button>
    </form>
  );
}
