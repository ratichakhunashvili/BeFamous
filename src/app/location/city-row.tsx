// One city option (a submit button: tapping a city saves it, as in the prototype).
import Image from "next/image";

export function CityRow({ city, name, caption, selected }: { city: string; name: string; caption: string; selected: boolean }) {
  return (
    <button
      type="submit"
      name="city"
      value={city}
      aria-pressed={selected}
      className="flex w-full items-center gap-3 overflow-clip rounded-bf-16 border border-line bg-surface p-3 text-white transition-colors hover:bg-elevated/60"
    >
      <span className="relative size-9 shrink-0 overflow-clip rounded-bf-12 bg-elevated">
        <Image src={selected ? "/figma/icon-check.svg" : "/figma/icon-discover-20.svg"} alt="" width={20} height={20} className="absolute left-2 top-2 size-5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-5 text-center">
        <span className="text-label">{name}</span>
        <span className="text-caption">{caption}</span>
      </span>
      <Image src="/figma/icon-chevron.svg" alt="" width={16} height={16} className="size-4 shrink-0" />
    </button>
  );
}
