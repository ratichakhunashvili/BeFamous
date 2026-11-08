"use client";
// Step 12 form. Figma draws name, goal, dates and location; English name/description, brand, topic,
// type (visit or video) and hashtags are added because the app needs them.
import { useActionState } from "react";
import { saveBasicsAction } from "@/app/actions/admin-campaigns";
import { SelectField, TextArea, TextField } from "@/components/admin/fields";
import { WizardButtons } from "@/components/admin/wizard-buttons";

type Opt = { value: string; label: string };
export type BasicsLabels = Record<
  "titleKa" | "titleEn" | "goalKa" | "goalEn" | "brand" | "interest" | "noInterest" | "kind" | "city" | "noCity" | "hashtags" | "hashtagsHint" | "startsAt" | "endsAt" | "draft" | "next" | "invalid" | "endsBefore",
  string
>;

export function BasicsForm({ initial, interests, kinds, cities, labels }: { initial: Record<string, string>; interests: Opt[]; kinds: Opt[]; cities: Opt[]; labels: BasicsLabels }) {
  const [state, action, pending] = useActionState(saveBasicsAction, undefined);
  const v = state?.values ?? initial;
  const err = (k: string) => (state?.fieldErrors?.[k] ? (k === "endsAt" ? labels.endsBefore : labels.invalid) : undefined);
  return (
    <form key={state ? JSON.stringify(state) : "initial"} action={action} className="flex flex-col gap-4" noValidate>
      {v.id && <input type="hidden" name="id" value={v.id} />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label={labels.titleKa} name="titleKa" defaultValue={v.titleKa} placeholder="Secret Coffee Moment" required maxLength={80} error={err("titleKa")} />
        <TextField label={labels.titleEn} name="titleEn" defaultValue={v.titleEn} placeholder="Secret Coffee Moment" required maxLength={80} error={err("titleEn")} />
      </div>
      <TextArea label={labels.goalKa} name="descriptionKa" defaultValue={v.descriptionKa} placeholder="პარტნიორ კაფეში მეტი ვიზიტი" maxLength={400} error={err("descriptionKa")} />
      <TextArea label={labels.goalEn} name="descriptionEn" defaultValue={v.descriptionEn} placeholder="More visits to the partner café" maxLength={400} error={err("descriptionEn")} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label={labels.startsAt} name="startsAt" type="date" defaultValue={v.startsAt} required error={err("startsAt")} />
        <TextField label={labels.endsAt} name="endsAt" type="date" defaultValue={v.endsAt} required error={err("endsAt")} />
        <SelectField label={labels.city} name="city" defaultValue={v.city} options={[{ value: "", label: labels.noCity }, ...cities]} error={err("city")} />
        <TextField label={labels.brand} name="brand" defaultValue={v.brand} placeholder="ქარხანა Coffee" maxLength={80} error={err("brand")} />
        <SelectField label={labels.interest} name="interestId" defaultValue={v.interestId} options={[{ value: "", label: labels.noInterest }, ...interests]} error={err("interestId")} />
        <SelectField label={labels.kind} name="kind" defaultValue={v.kind || "video"} options={kinds} error={err("kind")} />
      </div>
      <TextField label={labels.hashtags} name="hashtags" defaultValue={v.hashtags} placeholder="#BeFamous #SecretCoffee" hint={labels.hashtagsHint} error={err("hashtags")} />
      <WizardButtons draft={labels.draft} next={labels.next} pending={pending} />
    </form>
  );
}
