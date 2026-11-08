"use client";
import Link from "next/link";
import { useActionState } from "react";
import { adviseCampaignAction } from "@/app/actions/business";
import { SelectField, TextArea, TextField } from "@/components/admin/fields";
import { Button } from "@/components/ui";

type Labels = Record<"business" | "businessPh" | "goal" | "goalPh" | "city" | "any" | "budget" | "budgetPh" | "submit" | "thinking" | "inputError" | "unavailable" | "why" | "use" | "visit" | "video" | "disclaimer", string>;

export function AdvisorForm({ cities, labels }: { cities: { value: string; label: string }[]; labels: Labels }) {
  const [state, action, pending] = useActionState(adviseCampaignAction, undefined);
  const v = state?.values ?? {};
  return (
    <div className="flex w-full max-w-[860px] flex-col gap-5">
      <form key={state ? JSON.stringify(state.values) : "initial"} action={action} className="flex flex-col gap-4 rounded-bf-16 border border-line bg-surface p-4 sm:p-6" noValidate>
        <TextArea label={labels.business} name="business" defaultValue={v.business} placeholder={labels.businessPh} rows={3} maxLength={600} error={state?.error === "input" ? labels.inputError : undefined} />
        <TextField label={labels.goal} name="goal" defaultValue={v.goal} placeholder={labels.goalPh} maxLength={300} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField label={labels.city} name="city" defaultValue={v.city ?? ""} options={[{ value: "", label: labels.any }, ...cities]} />
          <TextField label={labels.budget} name="budget" defaultValue={v.budget} placeholder={labels.budgetPh} maxLength={40} />
        </div>
        <div className="w-full sm:w-[280px]">
          <Button type="submit" disabled={pending}>
            {pending ? labels.thinking : labels.submit}
          </Button>
        </div>
        {state?.error === "unavailable" && <p className="rounded-bf-12 bg-elevated p-3 text-caption text-chart">{labels.unavailable}</p>}
      </form>
      {state?.ideas && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {state.ideas.map((idea) => {
            const q = new URLSearchParams({ titleKa: idea.titleKa, titleEn: idea.titleEn, topic: idea.topic, kind: idea.kind, hashtag: idea.hashtag, rewardKa: idea.rewardKa, descriptionKa: idea.descriptionKa });
            return (
              <article key={idea.titleEn} className="flex flex-col gap-3 rounded-bf-16 border border-line bg-surface p-5">
                <p className="text-caption text-muted">
                  {idea.kind === "visit" ? labels.visit : labels.video} · {idea.hashtag}
                </p>
                <h3 className="text-h3 text-text">{idea.titleKa}</h3>
                <p className="text-body text-text">{idea.descriptionKa}</p>
                <p className="text-caption text-muted">🎁 {idea.rewardKa}</p>
                <p className="text-caption text-muted">
                  <span className="text-text">{labels.why}:</span> {idea.whyKa}
                </p>
                <Link href={`/business/panel/new?${q}`} className="mt-auto flex h-11 items-center justify-center rounded-bf-12 bg-action text-label text-white hover:opacity-90">
                  {labels.use}
                </Link>
              </article>
            );
          })}
        </div>
      )}
      {state?.ideas && <p className="text-caption text-muted">{labels.disclaimer}</p>}
    </div>
  );
}
