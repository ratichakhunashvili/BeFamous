"use client";
import { useActionState } from "react";
import { createRewardAction } from "@/app/actions/admin-rewards";
import { Button, ButtonLink, Field } from "@/components/ui";

type Labels = Record<"heading" | "titleKa" | "titleEn" | "value" | "brand" | "stock" | "stockHint" | "expires" | "challenge" | "noChallenge" | "cancel" | "submit" | "invalid", string>;

export function RewardForm({ challenges, labels }: { challenges: { value: string; label: string }[]; labels: Labels }) {
  const [state, action, pending] = useActionState(createRewardAction, undefined);
  const v = state?.values ?? {};
  const err = (k: string) => (state?.fieldErrors?.[k] ? labels.invalid : undefined);
  return (
    <form key={state ? JSON.stringify(state) : "initial"} action={action} className="flex w-[768px] flex-col gap-4 rounded-bf-16 border border-line bg-surface p-6" noValidate>
      <h2 className="text-h3 text-text">{labels.heading}</h2>
      <Field label={labels.titleKa} name="titleKa" defaultValue={v.titleKa} placeholder="20 ₾ ყავის ვაუჩერი" required error={err("titleKa")} />
      <Field label={labels.titleEn} name="titleEn" defaultValue={v.titleEn} placeholder="20 ₾ coffee voucher" required error={err("titleEn")} />
      <div className="grid grid-cols-2 gap-4">
        <Field label={labels.value} name="valueGel" inputMode="numeric" defaultValue={v.valueGel} placeholder="20" error={err("valueGel")} />
        <Field label={labels.brand} name="brand" defaultValue={v.brand} placeholder="ქარხანა Coffee" error={err("brand")} />
        <Field label={labels.stock} name="stock" inputMode="numeric" defaultValue={v.stock} placeholder="25" hint={labels.stockHint} error={err("stock")} />
        <Field label={labels.expires} name="expiresAt" type="date" defaultValue={v.expiresAt} required error={err("expiresAt")} />
      </div>
      <label className="flex flex-col gap-2">
        <span className="text-label text-text">{labels.challenge}</span>
        <select name="challengeId" defaultValue={v.challengeId ?? ""} className="h-12 rounded-bf-12 border border-line bg-surface px-[15px] text-body text-text outline-none focus:ring-2 focus:ring-inset focus:ring-primary/60">
          <option value="">{labels.noChallenge}</option>
          {challenges.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-2">
        <ButtonLink href="/admin/rewards" variant="secondary">
          {labels.cancel}
        </ButtonLink>
        <Button type="submit" disabled={pending}>
          {labels.submit}
        </Button>
      </div>
    </form>
  );
}
