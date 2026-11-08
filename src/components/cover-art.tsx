// Drawn cover for campaigns without a photo: everything centered — a soft glow, the topic icon in a
// tile, and the kicker + title underneath. Used on challenge cards and on detail/review heroes.
import Image from "next/image";

const ICONS: Record<string, string> = {
  coffee: "/figma/icon-coffee.svg",
  cafes: "/figma/icon-coffee.svg",
  fashion: "/figma/icon-fashion.svg",
  beauty: "/figma/icon-beauty.svg",
  tech: "/figma/icon-tech-32.svg",
  gift: "/figma/icon-gift-32.svg",
  camera: "/figma/icon-camera.svg",
};

export type Art = { icon: string; kicker: string; label: string };

/** size: "sm" for half cards (~100px tall), "md" for cards (~170px), "lg" for heroes (190px+). */
export function CoverArt({ art, size = "md" }: { art: Art | null; size?: "sm" | "md" | "lg" }) {
  const icon = ICONS[art?.icon ?? ""] ?? ICONS.camera;
  const tile = size === "sm" ? "size-11" : size === "md" ? "size-14" : "size-16";
  const img = size === "sm" ? 22 : size === "md" ? 28 : 32;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-clip text-center">
      {/* soft circles behind the icon */}
      <span className="absolute left-1/2 top-1/2 size-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface/60" />
      <span className="absolute left-1/2 top-1/2 size-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10" />
      <span className={`relative flex ${tile} items-center justify-center rounded-bf-16 bg-bg shadow-[0_6px_20px_rgba(0,0,0,0.35)]`}>
        <Image src={icon} alt="" width={img} height={img} style={{ width: img, height: img }} />
      </span>
      {art && size !== "sm" && (
        <span className="relative flex max-w-[90%] flex-col items-center">
          <span className="text-caption tracking-wide text-muted">{art.kicker}</span>
          <span className="text-h3 leading-tight text-white">{art.label}</span>
        </span>
      )}
    </div>
  );
}
