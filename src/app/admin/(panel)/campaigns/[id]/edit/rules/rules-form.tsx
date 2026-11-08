"use client";
import Image from "next/image";
import { useActionState } from "react";
import { saveRulesAction } from "@/app/actions/admin-campaigns";
import { TextField } from "@/components/admin/fields";
import { WizardButtons } from "@/components/admin/wizard-buttons";

type Labels = Record<"entry" | "method" | "work" | "ka" | "en" | "consent" | "consentBody" | "draft" | "next" | "invalid", string>;

export function RulesForm({ campaignId, initial, labels }: { campaignId: string; initial: Record<string, string>; labels: Labels }) {
  const [state, action, pending] = useActionState(saveRulesAction, undefined);
  const v = state?.values ?? initial;
  const err = (k: string) => (state?.fieldErrors?.[k] ? labels.invalid : undefined);
  const pair = (key: "entry" | "method" | "work") => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <TextField label={`${labels[key]} · ${labels.ka}`} name={`${key}Ka`} defaultValue={v[`${key}Ka`]} required maxLength={160} error={err(`${key}Ka`)} />
      <TextField label={`${labels[key]} · ${labels.en}`} name={`${key}En`} defaultValue={v[`${key}En`]} required maxLength={160} error={err(`${key}En`)} />
    </div>
  );
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="campaignId" value={campaignId} />
      {pair("entry")}
      {pair("method")}
      {pair("work")}
      <div className="flex flex-col gap-2 rounded-bf-16 bg-elevated p-4">
        <span className="flex items-center gap-2 text-label text-text">
          <Image src="/figma/admin/icon-lock-18.svg" alt="" width={18} height={18} className="size-[18px]" />
          {labels.consent}
        </span>
        <p className="text-body text-muted">{labels.consentBody}</p>
      </div>
      <WizardButtons draft={labels.draft} next={labels.next} pending={pending} />
    </form>
  );
}
