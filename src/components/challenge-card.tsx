// Challenge cards used on home (06) and discover (07/33).
// "full" = full-width card; "half" = two-column card. Cyber Evolution has drawn art instead of a photo.
import Image from "next/image";
import Link from "next/link";

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
      <div className="relative w-full overflow-clip rounded-bf-16 bg-elevated" style={{ height: half ? 104 : mediaHeight }}>
        {c.coverUrl ? (
          <Image src={c.coverUrl} alt="" fill sizes={half ? "145px" : "326px"} className="object-cover" />
        ) : (
          <CoverArt small={half} />
        )}
      </div>
      <h3 className={`text-h3 ${half && c.coverUrl ? "text-left" : "text-center"}`}>{c.title}</h3>
      <p className="whitespace-pre text-center text-caption">{c.meta}</p>
    </Link>
  );
}

/** Drawn cover (tech challenge): surface ellipse bleeding off the corner + icon tile. */
function CoverArt({ small }: { small: boolean }) {
  return small ? (
    <>
      <span className="absolute left-[82.79px] top-[-16.64px] h-[118.56px] w-[94.25px] rounded-full bg-surface" />
      <span className="absolute left-4 top-4 flex size-11 items-center justify-center rounded-bf-16 bg-bg">
        <Image src="/figma/icon-tech-24.svg" alt="" width={24} height={24} className="size-6" />
      </span>
    </>
  ) : (
    <span className="absolute left-4 top-4 flex size-[62px] items-center justify-center rounded-bf-16 bg-bg">
      <Image src="/figma/icon-tech-32.svg" alt="" width={32} height={32} className="size-8" />
    </span>
  );
}
