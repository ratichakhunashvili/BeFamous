"use client";
import { useActionState } from "react";
import { addFoundPostAction } from "@/app/actions/admin-review";
import { Button, Field } from "@/components/ui";

type Labels = { participant: string; choose: string; url: string; caption: string; submit: string; errors: Record<"url" | "participant", string> };

export function FoundPostForm({ options, labels }: { options: { value: string; label: string }[]; labels: Labels }) {
  const [state, action, pending] = useActionState(addFoundPostAction, undefined);
  const box = "h-12 w-full rounded-bf-12 border border-line bg-surface px-[15px] text-body text-text outline-none focus:ring-2 focus:ring-inset focus:ring-primary/60";
  return (
    <form key={state ? JSON.stringify(state) : "initial"} action={action} className="grid max-w-[720px] gap-4" noValidate>
      <label className="flex flex-col gap-2">
        <span className="text-label text-text">{labels.participant}</span>
        <select name="participationId" defaultValue="" className={box}>
          <option value="" disabled>
            {labels.choose}
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {state?.error === "participant" && <span className="text-caption text-chart">{labels.errors.participant}</span>}
      </label>
      <Field label={labels.url} name="url" type="url" placeholder="https://www.tiktok.com/@…/video/…" error={state?.error === "url" ? labels.errors.url : undefined} />
      <Field label={labels.caption} name="caption" placeholder="#BeFamous #SecretCoffee" />
      <div className="w-full sm:w-[240px]">
        <Button type="submit" disabled={pending}>
          {labels.submit}
        </Button>
      </div>
    </form>
  );
}
