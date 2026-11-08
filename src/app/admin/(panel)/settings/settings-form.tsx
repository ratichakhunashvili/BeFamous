"use client";
import { useActionState } from "react";
import { saveAdminSettingsAction } from "@/app/actions/admin-misc";
import { SelectField, TextField } from "@/components/admin/fields";
import { Button } from "@/components/ui";

type Labels = Record<"name" | "email" | "emailHint" | "language" | "save" | "invalid", string>;

export function SettingsForm({ initial, email, labels }: { initial: { name: string; locale: string }; email: string; labels: Labels }) {
  const [state, action, pending] = useActionState(saveAdminSettingsAction, undefined);
  const v = state?.values ?? initial;
  return (
    <form key={state ? JSON.stringify(state) : "initial"} action={action} className="flex flex-col gap-4" noValidate>
      <TextField label={labels.name} name="name" defaultValue={v.name} maxLength={80} required error={state?.error ? labels.invalid : undefined} />
      <TextField label={labels.email} value={email} readOnly hint={labels.emailHint} />
      <SelectField
        label={labels.language}
        name="locale"
        defaultValue={v.locale}
        options={[
          { value: "ka", label: "ქართული" },
          { value: "en", label: "English" },
        ]}
      />
      <Button type="submit" disabled={pending}>
        {labels.save}
      </Button>
    </form>
  );
}
