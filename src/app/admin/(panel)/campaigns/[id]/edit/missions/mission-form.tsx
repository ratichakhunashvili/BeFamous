"use client";
import { useActionState } from "react";
import { deleteMissionAction, saveMissionAction } from "@/app/actions/admin-campaigns";
import { CheckField, SelectField, TextField } from "@/components/admin/fields";
import { Button, ButtonLink } from "@/components/ui";

type Labels = Record<"heading" | "titleKa" | "titleEn" | "type" | "criteriaKa" | "criteriaEn" | "xp" | "required" | "place" | "cancel" | "save" | "remove" | "invalid", string>;

export function MissionForm({ campaignId, initial, types, labels }: { campaignId: string; initial: Record<string, string>; types: { value: string; label: string }[]; labels: Labels }) {
  const [state, action, pending] = useActionState(saveMissionAction, undefined);
  const v = state?.values ?? initial;
  const err = (k: string) => (state?.fieldErrors?.[k] ? labels.invalid : undefined);
  return (
    <div className="flex w-full max-w-[768px] flex-col gap-4">
      <form key={state ? JSON.stringify(state) : "initial"} action={action} className="flex flex-col gap-4 rounded-bf-16 border border-line bg-surface p-6" noValidate>
        <input type="hidden" name="campaignId" value={campaignId} />
        {v.missionId && <input type="hidden" name="missionId" value={v.missionId} />}
        <h2 className="text-h3 text-text">{labels.heading}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label={labels.titleKa} name="titleKa" defaultValue={v.titleKa} placeholder="კრეატიული ვიდეო" required error={err("titleKa")} />
          <TextField label={labels.titleEn} name="titleEn" defaultValue={v.titleEn} placeholder="Creative video" required error={err("titleEn")} />
        </div>
        <SelectField label={labels.type} name="type" defaultValue={v.type} options={types} error={err("type")} />
        <TextField label={labels.criteriaKa} name="descriptionKa" defaultValue={v.descriptionKa} placeholder="ვერტიკალური ვიდეო, 15–30 წამი" error={err("descriptionKa")} />
        <TextField label={labels.criteriaEn} name="descriptionEn" defaultValue={v.descriptionEn} placeholder="Vertical video, 15–30 seconds" error={err("descriptionEn")} />
        <TextField label={labels.place} name="placeName" defaultValue={v.placeName} placeholder="ქარხანა Coffee" error={err("placeName")} />
        <div className="grid grid-cols-2 items-end gap-4">
          <TextField label={labels.xp} name="xpReward" inputMode="numeric" defaultValue={v.xpReward} error={err("xpReward")} />
          <CheckField label={labels.required} name="required" defaultChecked={v.required === "on"} />
        </div>
        {state?.error && <p className="text-caption text-chart">{labels.invalid}</p>}
        <div className="grid grid-cols-2 gap-2">
          <ButtonLink href={`/admin/campaigns/${campaignId}/edit/missions`} variant="secondary">
            {labels.cancel}
          </ButtonLink>
          <Button type="submit" disabled={pending}>
            {labels.save}
          </Button>
        </div>
      </form>
      {v.missionId && (
        <form action={deleteMissionAction}>
          <input type="hidden" name="campaignId" value={campaignId} />
          <input type="hidden" name="missionId" value={v.missionId} />
          <Button type="submit" variant="quiet">
            {labels.remove}
          </Button>
        </form>
      )}
    </div>
  );
}
