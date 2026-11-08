// Hero of a badge collection / reward: a photo, or the drawn card (surface ellipse + icon tile + two lines).
import Image from "next/image";

const icons: Record<string, string> = { tech: "/figma/icon-tech-32.svg", camera: "/figma/icon-camera.svg", gift: "/figma/icon-gift-32.svg" };

export function CollectionHero({
  heroUrl,
  art,
  height = 160,
  ellipse = { left: 214.83, top: -25.6, w: 204.8, h: 182.4 },
}: {
  heroUrl?: string | null;
  art?: { icon: string; kicker: string; label: string } | null;
  height?: number;
  ellipse?: { left: number; top: number; w: number; h: number };
}) {
  return (
    <div className="relative w-full overflow-clip rounded-bf-16 bg-elevated" style={{ height }}>
      {heroUrl ? (
        <Image src={heroUrl} alt="" fill sizes="350px" className="object-cover" priority />
      ) : art ? (
        <>
          <span className="absolute rounded-full bg-surface" style={{ left: ellipse.left, top: ellipse.top, width: ellipse.w, height: ellipse.h }} />
          <span className="absolute left-4 top-4 flex size-[62px] items-center justify-center rounded-bf-16 bg-bg">
            <Image src={icons[art.icon] ?? icons.camera} alt="" width={32} height={32} className="size-8" />
          </span>
          <span className="absolute left-4 text-caption text-white" style={{ top: height - 58 }}>
            {art.kicker}
          </span>
          <span className="absolute left-4 text-h3 text-white" style={{ top: height - 38 }}>
            {art.label}
          </span>
        </>
      ) : null}
    </div>
  );
}
