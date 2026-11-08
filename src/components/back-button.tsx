"use client";
// Back button: either a fixed link, or "history" = go to the previous page (Figma "→ history").
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function BackButton({ href, filled }: { href: string; filled: boolean; label?: string }) {
  const router = useRouter();
  const t = useTranslations("common");
  const cls = `absolute left-3 top-[5px] flex size-11 items-center justify-center rounded-bf-12 ${filled ? "bg-surface" : ""}`;
  const icon = <Image src="/figma/icon-back.svg" alt="" width={20} height={20} className="size-5" />;

  if (href === "history") {
    return (
      <button
        type="button"
        aria-label={t("back")}
        className={cls}
        onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
      >
        {icon}
      </button>
    );
  }
  return (
    <Link href={href} aria-label={t("back")} className={cls}>
      {icon}
    </Link>
  );
}
