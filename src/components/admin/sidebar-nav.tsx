"use client";
// Admin sidebar links (docs/specs/admin/_shell.md §2). The active item follows the URL.
// "AI Studio" and the theme row from Figma are intentionally left out.
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; icon: string };

export function SidebarNav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => {
        const active = item.href === items[0].href ? path === item.href : path.startsWith(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex h-[46px] items-center gap-3 rounded-bf-12 px-[14px] text-label transition-colors ${active ? "bg-elevated text-text" : "text-muted hover:bg-elevated/50"}`}
            >
              {active && <span className="absolute left-0 top-[13px] h-5 w-[3px] rounded-full bg-primary" />}
              <Image src={item.icon} alt="" width={20} height={20} className="size-5" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Horizontal tab row for small screens. */
export function MobileTabs({ items }: { items: NavItem[] }) {
  const path = usePathname();
  return (
    <ul className="flex gap-1">
      {items.map((item) => {
        const active = item.href === items[0].href ? path === item.href : path.startsWith(item.href);
        return (
          <li key={item.href} className="shrink-0">
            <Link href={item.href} aria-current={active ? "page" : undefined} className={`flex h-10 items-center rounded-full px-3 text-caption ${active ? "bg-primary text-on-primary" : "text-muted hover:bg-elevated"}`}>
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
