"use client";
// Form for 45. The save button lives in the sticky bottom bar, as in Figma.
import Image from "next/image";
import { useActionState } from "react";
import { updateProfileAction } from "@/app/actions/account";
import { Button, Field, StickyBar } from "@/components/ui";

type Labels = { name: string; location: string; noCity: string; bio: string; save: string; errors: Record<"name" | "bio" | "city", string> };

export function ProfileForm({ initial, cities, labels }: { initial: { name: string; city: string; bio: string }; cities: { value: string; label: string }[]; labels: Labels }) {
  const [state, action, pending] = useActionState(updateProfileAction, undefined);
  const v = state?.values ?? initial;
  const err = state?.fieldErrors ?? {};
  const box = "w-full rounded-bf-12 border border-line bg-surface px-[15px] text-body text-white outline-none focus:ring-2 focus:ring-inset focus:ring-primary/60";

  return (
    <form action={action} className="flex w-full flex-col gap-5" noValidate>
      <Field label={labels.name} name="name" defaultValue={v.name} maxLength={80} required autoComplete="name" error={err.name ? labels.errors.name : undefined} />
      <label className="flex w-full flex-col gap-2">
        <span className="text-label text-white">{labels.location}</span>
        <span className="relative block">
          <select name="city" defaultValue={v.city} className={`${box} h-12 appearance-none pr-11`}>
            <option value="">{labels.noCity}</option>
            {cities.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <Image src="/figma/icon-chevron.svg" alt="" width={16} height={16} className="pointer-events-none absolute right-[15px] top-4 size-4 rotate-90" />
        </span>
        {err.city && (
          <span className="text-caption text-chart" role="alert">
            {labels.errors.city}
          </span>
        )}
      </label>
      <label className="flex w-full flex-col gap-2">
        <span className="text-label text-white">{labels.bio}</span>
        <textarea name="bio" defaultValue={v.bio} rows={2} maxLength={160} className={`${box} h-[68px] resize-none py-[11px]`} />
        {err.bio && (
          <span className="text-caption text-chart" role="alert">
            {labels.errors.bio}
          </span>
        )}
      </label>
      <StickyBar>
        <Button type="submit" disabled={pending}>
          {labels.save}
        </Button>
      </StickyBar>
    </form>
  );
}
