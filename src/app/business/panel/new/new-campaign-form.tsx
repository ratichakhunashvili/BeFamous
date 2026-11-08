"use client";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { createBusinessCampaignAction } from "@/app/actions/business";
import { SelectField, TextArea, TextField } from "@/components/admin/fields";
import { Button } from "@/components/ui";

type Labels = Record<
  "topic" | "titleKa" | "titleEn" | "descKa" | "descEn" | "brand" | "kind" | "kindVisit" | "kindVideo" | "city" | "allCities" | "hashtags" | "hashtagsHint" | "startsAt" | "endsAt" | "rewardKa" | "rewardEn" | "rewardValue" | "rewardStock" | "submit" | "note" | "invalid" | "aiHint",
  string
>;

export function NewCampaignForm({ initial, topics, cities, labels }: { initial: Record<string, string>; topics: { id: string; label: string; icon: string }[]; cities: { value: string; label: string }[]; labels: Labels }) {
  const [state, action, pending] = useActionState(createBusinessCampaignAction, undefined);
  const v = state?.values ?? initial;
  const [topic, setTopic] = useState(v.interestId ?? "");
  const [kind, setKind] = useState(v.kind || "video");
  const err = (k: string) => (state?.fieldErrors?.[k] ? labels.invalid : undefined);
  const card = (on: boolean) => `flex items-center gap-3 rounded-bf-16 border p-3 text-left transition-colors ${on ? "border-primary bg-elevated" : "border-line bg-surface hover:bg-elevated/50"}`;
  return (
    <form key={state ? JSON.stringify(state) : "initial"} action={action} className="flex w-full max-w-[860px] flex-col gap-5 rounded-bf-16 border border-line bg-surface p-4 sm:p-6" noValidate>
      <Link href="/business/panel/ai" className="rounded-bf-12 bg-elevated p-3 text-caption text-muted hover:text-text">
        ✨ {labels.aiHint}
      </Link>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-label text-text">{labels.topic}</legend>
        <input type="hidden" name="interestId" value={topic} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {topics.map((t) => (
            <button key={t.id} type="button" onClick={() => setTopic(t.id)} aria-pressed={topic === t.id} className={card(topic === t.id)}>
              <span className="relative size-9 shrink-0 rounded-bf-12 bg-bg">
                <Image src={t.icon} alt="" width={20} height={20} className="absolute left-2 top-2 size-5" />
              </span>
              <span className="text-label text-text">{t.label}</span>
            </button>
          ))}
        </div>
        {err("interestId") && <span className="text-caption text-chart">{labels.invalid}</span>}
      </fieldset>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-label text-text">{labels.kind}</legend>
        <input type="hidden" name="kind" value={kind} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(["video", "visit"] as const).map((k) => (
            <button key={k} type="button" onClick={() => setKind(k)} aria-pressed={kind === k} className={card(kind === k)}>
              <span className="text-label text-text">{k === "visit" ? labels.kindVisit : labels.kindVideo}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label={labels.titleKa} name="titleKa" defaultValue={v.titleKa} required maxLength={80} error={err("titleKa")} />
        <TextField label={labels.titleEn} name="titleEn" defaultValue={v.titleEn} required maxLength={80} error={err("titleEn")} />
      </div>
      <TextArea label={labels.descKa} name="descriptionKa" defaultValue={v.descriptionKa} required maxLength={400} error={err("descriptionKa")} />
      <TextArea label={labels.descEn} name="descriptionEn" defaultValue={v.descriptionEn} maxLength={400} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label={labels.brand} name="brand" defaultValue={v.brand} required error={err("brand")} />
        <SelectField label={labels.city} name="city" defaultValue={v.city ?? ""} options={[{ value: "", label: labels.allCities }, ...cities]} />
        <TextField label={labels.startsAt} name="startsAt" type="date" defaultValue={v.startsAt} error={err("startsAt")} />
        <TextField label={labels.endsAt} name="endsAt" type="date" defaultValue={v.endsAt} error={err("endsAt")} />
      </div>
      <TextField label={labels.hashtags} name="hashtags" defaultValue={v.hashtags} placeholder="#SecretCoffee" hint={labels.hashtagsHint} error={err("hashtags")} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label={labels.rewardKa} name="rewardKa" defaultValue={v.rewardKa} placeholder="30 ₾ ვაუჩერი" required error={err("rewardKa")} />
        <TextField label={labels.rewardEn} name="rewardEn" defaultValue={v.rewardEn} placeholder="30 ₾ voucher" />
        <TextField label={labels.rewardValue} name="rewardValue" inputMode="numeric" defaultValue={v.rewardValue} placeholder="30" error={err("rewardValue")} />
        <TextField label={labels.rewardStock} name="rewardStock" inputMode="numeric" defaultValue={v.rewardStock} placeholder="20" error={err("rewardStock")} />
      </div>
      <p className="text-caption text-muted">{labels.note}</p>
      <div className="w-full sm:w-[280px]">
        <Button type="submit" disabled={pending}>
          {labels.submit}
        </Button>
      </div>
    </form>
  );
}
