"use client";
import { useActionState } from "react";
import { grantAdminAction } from "@/app/actions/admin-misc";
import { TextField } from "@/components/admin/fields";
import { Button } from "@/components/ui";

type Labels = { heading: string; email: string; submit: string; email_err: string; noAccount: string };

export function GrantForm({ labels }: { labels: Labels }) {
  const [state, action, pending] = useActionState(grantAdminAction, undefined);
  const error = state?.error === "email" ? labels.email_err : state?.error === "noAccount" ? labels.noAccount : undefined;
  return (
    <form action={action} className="flex w-full max-w-[900px] flex-col gap-4 rounded-bf-16 border border-line bg-surface p-6" noValidate>
      <h2 className="text-h3 text-text">{labels.heading}</h2>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex-1">
          <TextField label={labels.email} name="email" type="email" defaultValue={state?.values?.email} placeholder="name@example.com" error={error} />
        </div>
        <div className="w-full sm:mt-[30px] sm:w-[220px]">
          <Button type="submit" disabled={pending}>
            {labels.submit}
          </Button>
        </div>
      </div>
    </form>
  );
}
