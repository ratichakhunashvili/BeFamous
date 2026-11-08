// Hero of a badge collection / reward / campaign: a photo, or the centered drawn cover (CoverArt).
import Image from "next/image";
import { CoverArt } from "./cover-art";


export function CollectionHero({
  heroUrl,
  art,
  height = 160,
}: {
  heroUrl?: string | null;
  art?: { icon: string; kicker: string; label: string } | null;
  height?: number;
  /** @deprecated kept so existing callers compile; the drawn cover is centered now */
  ellipse?: { left: number; top: number; w: number; h: number };
}) {
  return (
    <div className="relative w-full overflow-clip rounded-bf-16 bg-elevated" style={{ height }}>
      {heroUrl ? (
        <Image src={heroUrl} alt="" fill sizes="350px" className="object-cover" priority />
      ) : art ? (
        <CoverArt art={art} size={height < 140 ? "sm" : height < 185 ? "md" : "lg"} />
      ) : null}
    </div>
  );
}
