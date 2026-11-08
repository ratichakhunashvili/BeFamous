"use client";
import { useActionState } from "react";
import { adminRequestResetAction } from "@/app/actions/auth";
import { Button, ButtonLink, Field } from "@/components/ui";

type Labels = { email: string; submit: string; back: string; invalid: string };

export function AdminResetForm({ labels, defaultEmail }: { labels: Labels; defaultEmail?: string }) {
  const [state, action, pending] = useActionState(adminRequestResetAction, undefined);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <Field
        label={labels.email}
        name="email"
        type="email"
        autoComplete="email"
        placeholder="hello@example.com"
        icon="/figma/icon-mail.svg"
        defaultValue={state?.values?.email ?? defaultEmail}
        required
        error={state?.fieldErrors?.email ? labels.invalid : undefined}
      />
      <Button type="submit" disabled={pending}>
        {labels.submit}
      </Button>
      <ButtonLink href="/admin/signin" variant="secondary">
        {labels.back}
      </ButtonLink>
    </form>
  );
}
