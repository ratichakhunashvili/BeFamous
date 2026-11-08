"use client";
// Post-link field from 13: paste a TikTok/Instagram link, press Enter or the play icon → 41.
import Image from "next/image";
import { useActionState } from "react";
import { registerPostAction } from "@/app/actions/missions";

type Labels = { label: string; placeholder: string; submit: string; errors: Record<"invalid" | "locked" | "done", string> };

export function PostLinkForm({ missionId, labels }: { missionId: string; labels: Labels }) {
  const [state, action, pending] = useActionState(registerPostAction, undefined);
  return (
    <form action={action} className="flex w-full flex-col gap-2" noValidate>
      <input type="hidden" name="missionId" value={missionId} />
      <label htmlFor="post-url" className="text-label text-white">
        {labels.label}
      </label>
      <div className="relative h-12 w-full overflow-clip rounded-bf-12 border border-line bg-surface">
        <input
          id="post-url"
          name="url"
          type="url"
          inputMode="url"
          required
          placeholder={labels.placeholder}
          className="h-full w-full bg-transparent pl-[15px] pr-12 text-body text-white outline-none placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-primary/60"
        />
        <button type="submit" disabled={pending} aria-label={labels.submit} className="absolute right-[6px] top-[5px] flex size-9 items-center justify-center rounded-bf-8 hover:bg-elevated disabled:opacity-50">
          <Image src="/figma/icon-play-18.svg" alt="" width={18} height={18} className="size-[18px]" />
        </button>
      </div>
      {state?.error && (
        <p role="alert" className="text-caption text-chart">
          {labels.errors[state.error]}
        </p>
      )}
    </form>
  );
}
