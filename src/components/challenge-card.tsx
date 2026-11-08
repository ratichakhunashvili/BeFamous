// Challenge cards used on home (06) and discover (07/33).
// "full" = full-width card; "half" = two-column card. Cyber Evolution has drawn art instead of a photo.
import Image from "next/image";
import Link from "next/link";
import { CoverArt } from "./cover-art";

export type CardChallenge = {
  slug: string;
  title: string;
  meta: string; // e.g. "ქარხანა Coffee  ·  +250 XP"
  coverUrl: string | null;
  coverArt: { icon: string; kicker: string; label: string } | null;
};

export function ChallengeCard({ c, size = "full", mediaHeight = 168 }: { c: CardChallenge; size?: "full" | "half"; mediaHeight?: number }) {
  const half = size === "half";
  return (
    <Link href={`/challenges/${c.slug}`} className={`flex flex-col gap-5 overflow-clip rounded-bf-16 border border-line bg-surface p-3 text-white transition-colors hover:bg-elevated/40 ${half ? "min-w-0 flex-1" : "w-full"}`}>
      <div className="bf-card-media relative w-full overflow-clip rounded-bf-16 bg-elevated" style={{ height: half ? 104 : mediaHeight }}>
        {c.coverUrl ? (
          <Image src={c.coverUrl} alt="" fill sizes={half ? "145px" : "326px"} className="object-cover" />
        ) : (
          <CoverArt art={c.coverArt} size={half ? "sm" : "md"} />
        )}
      </div>
      <h3 className={`text-h3 ${half && c.coverUrl ? "text-left" : "text-center"}`}>{c.title}</h3>
      <p className="whitespace-pre text-center text-caption">{c.meta}</p>
    </Link>
  );
}
