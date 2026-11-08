"use client";
// 38 / 39 reason card: comment + cancel / send. The reason is required (the participant sees it).
import { useActionState } from "react";
import { decideWithNoteAction } from "@/app/actions/admin-review";
import { Button, ButtonLink } from "@/components/ui";

type Labels = { heading: string; comment: string; placeholder: string; cancel: string; submit: string; error: string };

export function NoteForm({ submissionId, decision, labels }: { submissionId: string; decision: "revision" | "rejected"; labels: Labels }) {
  const [state, action, pending] = useActionState(decideWithNoteAction, undefined);
  return (
    <form action={action} className="flex w-full max-w-[768px] flex-col gap-4 rounded-bf-16 border border-line bg-surface p-6" noValidate>
      <input type="hidden" name="submissionId" value={submissionId} />
      <input type="hidden" name="decision" value={decision} />
      <h2 className="text-h3 text-text">{labels.heading}</h2>
      <label className="flex flex-col gap-2">
        <span className="text-label text-text">{labels.comment}</span>
        <textarea
          name="note"
          required
          minLength={3}
          maxLength={500}
          rows={2}
          placeholder={labels.placeholder}
          className="min-h-12 resize-y rounded-bf-12 border border-line bg-surface px-[15px] py-3 text-body text-text outline-none placeholder:text-muted focus:ring-2 focus:ring-inset focus:ring-primary/60"
        />
        {state?.error && (
          <span role="alert" className="text-caption text-chart">
            {labels.error}
          </span>
        )}
      </label>
      <div className="grid grid-cols-2 gap-2">
        <ButtonLink href={`/admin/participants/${submissionId}`} variant="secondary">
          {labels.cancel}
        </ButtonLink>
        <Button type="submit" disabled={pending}>
          {labels.submit}
        </Button>
      </div>
    </form>
  );
}
