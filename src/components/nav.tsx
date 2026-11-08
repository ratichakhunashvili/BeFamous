// Tab-screen chrome: top bar (brand + search + notifications) and the bottom navigation.
// The tab screens render the floating pill nav (06, 07, 33); the active tab gets the purple bar.
// A flat-bar variant also exists in the Figma layers and is kept here as `variant="flat"`. Spec: docs/specs/_shared-nav.md
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "./logo";

export async function TabTopBar() {
  const t = await getTranslations("nav");
  const c = await getTranslations("common");
  const btn = "absolute top-[5px] flex size-11 items-center justify-center rounded-bf-12 bg-bg transition-colors hover:bg-surface";
  return (
    <header className="relative z-10 h-[49px] w-full bg-bg">
      <Link href="/home" className="absolute left-5 top-[5px] flex h-11 w-[155px] items-center gap-[9px]">
        <Logo size={29} priority />
        <span className="text-label text-white">{c("brand")}</span>
      </Link>
      <Link href="/discover/filters" aria-label={t("search")} className={`${btn} left-[286px]`}>
        <Image src="/figma/icon-search.svg" alt="" width={20} height={20} className="size-5" />
      </Link>
      <Link href="/notifications" aria-label={t("notifications")} className={`${btn} left-[334px]`}>
        <Image src="/figma/icon-bell.svg" alt="" width={20} height={20} className="size-5" />
      </Link>
    </header>
  );
}

export type NavTab = "home" | "discover" | "activity" | "rewards" | "profile";
const tabs: { key: NavTab; href: string; icon: string }[] = [
  { key: "home", href: "/home", icon: "home" },
  { key: "discover", href: "/discover", icon: "discover" },
  { key: "activity", href: "/activity", icon: "activity" },
  { key: "rewards", href: "/rewards", icon: "gift" },
  { key: "profile", href: "/profile", icon: "profile" },
];

/** Bottom navigation. `variant="flat"` = 06 bar, `variant="float"` = 07/33 pill. */
export async function BottomNav({ active, variant = "float" }: { active: NavTab; variant?: "flat" | "float" }) {
  const t = await getTranslations("nav");

  if (variant === "flat") {
    return (
      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto h-[76px] lg:hidden w-full max-w-[390px] border-t border-line bg-surface">
        <ul className="flex h-full items-start gap-1 px-1 pt-[5px]">
          {tabs.map((tab) => {
            const on = tab.key === active;
            return (
              <li key={tab.key} className="flex-1">
                <Link href={tab.href} aria-current={on ? "page" : undefined} className={`relative flex h-[62px] flex-col items-center rounded-bf-12 ${on ? "bg-elevated" : ""}`}>
                  <Image src={`/figma/nav-${tab.icon}.svg`} alt="" width={21} height={21} className="mt-2 size-[21px]" />
                  <span className="mt-[6px] text-caption text-white">{t(tab.key)}</span>
                  {on && <span className="absolute bottom-1 h-[3px] w-[18px] rounded-full bg-primary" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav className="fixed inset-x-0 bottom-3 z-20 mx-auto w-[calc(100%-31.2px)] lg:hidden max-w-[358.8px] rounded-[20px] border border-[#45475c] bg-surface shadow-[0_5px_8px_rgba(13,10,31,0.32)]">
      <ul className="flex h-[69.92px] items-start gap-[3.68px] px-[2.68px] pt-[3.6px]">
        {tabs.map((tab) => {
          const on = tab.key === active;
          return (
            <li key={tab.key} className="flex-1">
              <Link href={tab.href} aria-current={on ? "page" : undefined} className="relative flex h-[57.04px] flex-col items-center rounded-[11.04px] transition-colors hover:bg-elevated/60">
                <Image src={`/figma/nav-float-${tab.icon}.svg`} alt="" width={19.32} height={19.32} className="mt-[7.36px] size-[19.32px]" />
                <span className="mt-[5.52px] text-[11.04px] leading-[16.56px] text-white">{t(tab.key)}</span>
                {on && <span className="absolute top-[50.6px] h-[2.76px] w-[16.56px] rounded-full bg-primary" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
