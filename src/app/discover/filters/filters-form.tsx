"use client";
// Keyword + location + one category. "შედეგების ნახვა" opens /discover with these filters in the URL.
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui";

type Props = {
  initial: { q: string; city: string; category: string };
  cities: { id: string; label: string }[];
  categories: { slug: string; name: string; empty: boolean }[];
  labels: { keyword: string; keywordPlaceholder: string; location: string; selected: string; tap: string; none: string; show: string; clear: string };
};

export function FiltersForm({ initial, cities, categories, labels }: Props) {
  const [category, setCategory] = useState(initial.category);
  const box = "relative block h-12 w-full overflow-clip rounded-bf-12 border border-line bg-surface";

  return (
    <form action="/discover" method="get" className="flex w-full flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="text-label text-white">{labels.keyword}</span>
        <span className={box}>
          <input name="q" defaultValue={initial.q} placeholder={labels.keywordPlaceholder} maxLength={80} className="h-full w-full bg-transparent pl-[15px] pr-11 text-body text-white outline-none placeholder:text-muted focus:ring-2 focus:ring-inset focus:ring-primary/60" />
          <Image src="/figma/icon-search-18.svg" alt="" width={18} height={18} className="pointer-events-none absolute right-[15px] top-[14px] size-[18px]" />
        </span>
      </label>

      {/* Location → 53 (the chosen city is saved on the profile and passed back here). */}
      <div className="flex flex-col gap-2">
        <span className="text-label text-white">{labels.location}</span>
        <Link href="/location" className={`${box} hover:bg-elevated/60`}>
          <span className="absolute left-[15px] top-3 text-body text-white">{cities.find((c) => c.id === initial.city)?.label}</span>
          <Image src="/figma/icon-chevron-24.svg" alt="" width={24} height={24} className="absolute right-[13px] top-[11px] size-6" />
        </Link>
        <input type="hidden" name="city" value={initial.city} />
      </div>

      <input type="hidden" name="category" value={category} />
      {categories.map((c) => {
        const on = category === c.slug;
        return (
          <button
            key={c.slug}
            type="button"
            aria-pressed={on}
            onClick={() => setCategory(on ? "" : c.slug)}
            className={`flex w-full items-center gap-3 overflow-clip rounded-bf-16 bg-surface p-3 text-white ${on ? "border-2 border-action p-[11px]" : "border border-line"}`}
          >
            <span className="relative size-9 shrink-0 overflow-clip rounded-bf-12 bg-elevated">
              <Image src={on ? "/figma/icon-check.svg" : c.empty ? "/figma/icon-filter.svg" : "/figma/icon-check.svg"} alt="" width={20} height={20} className={`absolute left-2 top-2 size-5 ${!on && !c.empty ? "opacity-40" : ""}`} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-5 text-center">
              <span className="text-label">{c.name}</span>
              <span className="text-caption">{on ? labels.selected : c.empty ? labels.none : labels.tap}</span>
            </span>
            <Image src="/figma/icon-chevron.svg" alt="" width={16} height={16} className="size-4 shrink-0" />
          </button>
        );
      })}

      <Button type="submit">{labels.show}</Button>
      <Link href="/discover" className="flex h-12 w-full items-center justify-center rounded-bf-12 border border-line bg-surface px-3 text-label text-white hover:opacity-90">
        {labels.clear}
      </Link>
    </form>
  );
}
