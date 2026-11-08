"use client";
import Image from "next/image";
import { useActionState, useState } from "react";
import { saveCampaignRewardAction } from "@/app/actions/admin-campaigns";
import { TextField } from "@/components/admin/fields";
import { WizardButtons } from "@/components/admin/wizard-buttons";

type Labels = Record<"rewardKa" | "rewardEn" | "value" | "stock" | "stockHint" | "expires" | "xp" | "xpHint" | "total" | "totalBody" | "totalUnknown" | "draft" | "next" | "invalid", string>;

export function RewardStepForm({ campaignId, initial, labels }: { campaignId: string; initial: Record<string, string>; labels: Labels }) {
  const [state, action, pending] = useActionState(saveCampaignRewardAction, undefined);
  const v = state?.values ?? initial;
  const [value, setValue] = useState(v.valueGel ?? "");
  const [stock, setStock] = useState(v.stock ?? "");
  const err = (k: string) => (state?.fieldErrors?.[k] ? labels.invalid : undefined);
  const n = (s: string) => (/^\d+$/.test(s.trim()) ? Number(s) : null);
  const total = n(value) != null && n(stock) != null ? labels.totalBody.replace("{stock}", stock).replace("{value}", value).replace("{total}", String(n(value)! * n(stock)!)) : labels.totalUnknown;
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="campaignId" value={campaignId} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label={labels.rewardKa} name="rewardKa" defaultValue={v.rewardKa} placeholder="50 ₾ ყავის ვაუჩერი" error={err("rewardKa")} />
        <TextField label={labels.rewardEn} name="rewardEn" defaultValue={v.rewardEn} placeholder="50 ₾ coffee voucher" error={err("rewardEn")} />
        <TextField label={labels.value} name="valueGel" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} placeholder="50" error={err("valueGel")} />
        <TextField label={labels.stock} name="stock" inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="10" hint={labels.stockHint} error={err("stock")} />
        <TextField label={labels.expires} name="expiresAt" type="date" defaultValue={v.expiresAt} error={err("expiresAt")} />
        <TextField label={labels.xp} name="xpReward" inputMode="numeric" defaultValue={v.xpReward} hint={labels.xpHint} error={err("xpReward")} />
      </div>
      <div className="flex flex-col gap-2 rounded-bf-16 bg-elevated p-4">
        <span className="flex items-center gap-2 text-label text-text">
          <Image src="/figma/admin/icon-gift-18.svg" alt="" width={18} height={18} className="size-[18px]" />
          {labels.total}
        </span>
        <p className="text-body text-muted">{total}</p>
      </div>
      <WizardButtons draft={labels.draft} next={labels.next} pending={pending} />
    </form>
  );
}
