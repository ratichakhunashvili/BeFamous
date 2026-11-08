"use client";
import { useActionState } from "react";
import { connectAccountAction } from "@/app/actions/social";
import { Button, Field } from "@/components/ui";

type Labels = { label: string; placeholder: string; error: string; save: string };

export function HandleForm({ platform, missionId, defaultHandle, labels }: { platform: string; missionId: string | null; defaultHandle: string; labels: Labels }) {
  const [state, action, pending] = useActionState(connectAccountAction, undefined);
  return (
    <form action={action} className="flex w-full flex-col gap-5" noValidate>
      <input type="hidden" name="platform" value={platform} />
      {missionId && <input type="hidden" name="missionId" value={missionId} />}
      <Field
        label={labels.label}
        name="handle"
        key={state?.value ?? "initial"}
        defaultValue={state?.value ?? defaultHandle}
        placeholder={labels.placeholder}
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        required
        error={state?.error ? labels.error : undefined}
      />
      <Button type="submit" disabled={pending}>
        {labels.save}
      </Button>
    </form>
  );
}
