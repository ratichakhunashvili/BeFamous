"use client";
import { useActionState } from "react";
import { adminSigninAction } from "@/app/actions/auth";
import { Button, ButtonLink, Field } from "@/components/ui";

type Labels = { email: string; password: string; submit: string; reset: string; invalid: string };

export function AdminSigninForm({ labels }: { labels: Labels }) {
  const [state, action, pending] = useActionState(adminSigninAction, undefined);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <Field label={labels.email} name="email" type="email" autoComplete="email" placeholder="hello@example.com" icon="/figma/icon-mail.svg" defaultValue={state?.values?.email} required />
      <Field label={labels.password} name="password" type="password" autoComplete="current-password" placeholder="••••••••" icon="/figma/icon-lock.svg" required error={state?.error ? labels.invalid : undefined} />
      <Button type="submit" disabled={pending}>
        {labels.submit}
      </Button>
      <ButtonLink href="/admin/reset" variant="quiet">
        {labels.reset}
      </ButtonLink>
    </form>
  );
}
