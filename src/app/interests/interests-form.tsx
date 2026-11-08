"use client";
// Multi-select interest rows. Selected look = Figma component "Interest row / Dark" (300:4665):
// 2px #7524c5 border, caption "არჩეულია" and a purple check on the right.
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { saveInterestsAction } from "@/app/actions/challenges";
import { Button } from "@/components/ui";

type Item = { slug: string; name: string; icon: string; selected: boolean };

export function InterestsForm({ interests, labels }: { interests: Item[]; labels: { tap: string; selected: string; finish: string; skip: string } }) {
  const [chosen, setChosen] = useState(() => new Set(interests.filter((i) => i.selected).map((i) => i.slug)));
  const toggle = (slug: string) =>
    setChosen((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  return (
    <form action={saveInterestsAction} className="flex w-full flex-col gap-5">
      {interests.map((i) => {
        const on = chosen.has(i.slug);
        return (
          <button
            key={i.slug}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(i.slug)}
            className={`flex w-full items-center gap-3 overflow-clip rounded-bf-16 bg-surface p-3 text-white transition-colors ${on ? "border-2 border-action p-[11px]" : "border border-line"}`}
          >
            <span className="relative size-9 shrink-0 overflow-clip rounded-bf-12 bg-elevated">
              <Image src={i.icon} alt="" width={20} height={20} className="absolute left-2 top-2 size-5" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-5 text-center">
              <span className="text-label">{i.name}</span>
              <span className="text-caption">{on ? labels.selected : labels.tap}</span>
            </span>
            {on && <Image src="/figma/icon-check-purple-16.svg" alt="" width={16} height={16} className="size-4 shrink-0" />}
          </button>
        );
      })}
      {[...chosen].map((slug) => (
        <input key={slug} type="hidden" name="interest" value={slug} />
      ))}
      <Button type="submit">{labels.finish}</Button>
      <Link href="/home" className="flex h-12 w-full items-center justify-center rounded-bf-12 border border-line bg-surface px-3 text-label text-white hover:opacity-90">
        {labels.skip}
      </Link>
    </form>
  );
}
