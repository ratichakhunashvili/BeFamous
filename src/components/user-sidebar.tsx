"use client";
// Desktop navigation for the user app (≥1024px). On phones the Figma bottom tab bar is used instead.
// Hidden on the admin panel and on the signed-out screens (welcome, sign-in, sign-up, reset, terms).
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";

export type SidebarLabels = Record<"home" | "discover" | "activity" | "rewards" | "profile" | "notifications" | "badges" | "settings" | "invite", string>;

const HIDDEN = ["/admin", "/signin", "/signup", "/reset", "/roles", "/terms", "/business", "/account-deleted", "/i/"];

export function UserSidebar({ labels, isAdmin, isBusiness, adminLabel, businessLabel }: { labels: SidebarLabels; isAdmin: boolean; isBusiness: boolean; adminLabel: string; businessLabel: string }) {
  const path = usePathname();
  if (path === "/" || HIDDEN.some((p) => path.startsWith(p))) return null;
  const items = [
    { href: "/home", label: labels.home, icon: "/figma/nav-float-home.svg" },
    { href: "/discover", label: labels.discover, icon: "/figma/nav-float-discover.svg" },
    { href: "/activity", label: labels.activity, icon: "/figma/nav-float-activity.svg" },
    { href: "/rewards", label: labels.rewards, icon: "/figma/nav-float-gift.svg" },
    { href: "/profile", label: labels.profile, icon: "/figma/nav-float-profile.svg" },
    { href: "/notifications", label: labels.notifications, icon: "/figma/icon-bell.svg" },
    { href: "/badges", label: labels.badges, icon: "/figma/icon-badge-20.svg" },
    { href: "/invite", label: labels.invite, icon: "/figma/icon-team.svg" },
    { href: "/settings", label: labels.settings, icon: "/figma/icon-settings-20.svg" },
  ];
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-line bg-surface p-4 lg:flex" aria-label="BEFAMOUS">
      <Link href="/home" className="mb-8 flex items-center gap-[10px] px-2 pt-2">
        <Logo size={32} />
        <span className="text-label text-text">BEFAMOUS</span>
      </Link>
      <nav>
        <ul className="flex flex-col gap-1">
          {items.map((it) => {
            const active = path === it.href || path.startsWith(`${it.href}/`);
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex h-11 items-center gap-3 rounded-bf-12 px-3 text-label transition-colors ${active ? "bg-elevated text-text" : "text-muted hover:bg-elevated/50 hover:text-text"}`}
                >
                  {active && <span className="absolute left-0 top-3 h-5 w-[3px] rounded-full bg-primary" />}
                  <Image src={it.icon} alt="" width={20} height={20} className="size-5" />
                  {it.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {(isAdmin || isBusiness) && (
        <div className="mt-auto flex flex-col gap-2">
          <Link href="/business/panel" className="flex h-11 items-center justify-center rounded-bf-12 bg-action text-label text-white hover:opacity-90">
            {businessLabel}
          </Link>
          {isAdmin && (
            <Link href="/admin" className="flex h-11 items-center justify-center rounded-bf-12 border border-line text-label text-text hover:bg-elevated">
              {adminLabel}
            </Link>
          )}
        </div>
      )}
    </aside>
  );
}
