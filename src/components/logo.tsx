// "Logo" component from Figma (node 345:2324). Used everywhere the brand mark appears.
// logo.png = the Figma image with its light background removed and cropped to the mark.
import Image from "next/image";

export function Logo({ size = 29, className = "", priority = false }: { size?: number; className?: string; priority?: boolean }) {
  return (
    <Image
      src="/figma/logo.png"
      alt="BEFAMOUS"
      width={size}
      height={size}
      priority={priority}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
