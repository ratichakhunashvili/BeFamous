// "Logo" component from Figma (node 345:2324). Used everywhere the brand mark appears.
import Image from "next/image";

export function Logo({ size = 29, className = "", priority = false }: { size?: number; className?: string; priority?: boolean }) {
  return (
    <Image
      src="/figma/logo.jpg"
      alt="BEFAMOUS"
      width={size}
      height={size}
      priority={priority}
      className={`object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
