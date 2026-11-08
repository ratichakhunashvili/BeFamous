// Admin chrome (Figma page 04, docs/specs/admin/_shell.md): 228px sidebar, 76px header, scrolling content.
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { signoutAction } from "@/app/actions/auth";
import { Logo } from "@/components/logo";
import { SidebarNav } from "./sidebar-nav";

export async function AdminSidebar() {
  const t = await getTranslations("admin.nav");
  const items = [
    { href: "/admin", label: t("overview"), icon: "/figma/admin/nav-home-20.svg" },
    { href: "/admin/campaigns", label: t("campaigns"), icon: "/figma/admin/nav-campaign-20.svg" },
    { href: "/admin/participants", label: t("participants"), icon: "/figma/admin/nav-team-20.svg" },
    { href: "/admin/analytics", label: t("analytics"), icon: "/figma/admin/nav-chart-20.svg" },
    { href: "/admin/rewards", label: t("rewards"), icon: "/figma/admin/nav-gift-20.svg" },
    { href: "/admin/settings", label: t("settings"), icon: "/figma/admin/nav-settings-20.svg" },
  ];
  const bottom = "flex h-[46px] w-full items-center gap-3 rounded-bf-12 px-[14px] text-label text-muted transition-colors hover:bg-elevated/50";
  return (
    <aside className="sticky top-0 flex h-dvh w-[228px] shrink-0 flex-col border-r border-line bg-surface px-4 pb-4 pt-4">
      <Link href="/admin" className="flex h-[60px] items-center gap-[10px] px-[10px]">
        <Logo size={34} />
        <span className="flex flex-col">
          <span className="text-label text-text">BEFAMOUS</span>
          <span className="text-caption text-muted">ADMIN</span>
        </span>
      </Link>
      <p className="mb-3 mt-[34px] px-2 text-caption text-muted">{t("section")}</p>
      <nav aria-label={t("section")}>
        <SidebarNav items={items} />
      </nav>
      <div className="mt-auto flex flex-col gap-[10px]">
        <span className="mx-2 mb-1 h-px bg-line" />
        <Link href="/home" className={bottom}>
          <Image src="/figma/admin/nav-profile-20.svg" alt="" width={20} height={20} className="size-5" />
          {t("userSpace")}
        </Link>
        <form action={signoutAction}>
          <button type="submit" className={bottom}>
            <Image src="/figma/admin/nav-logout-20.svg" alt="" width={20} height={20} className="size-5" />
            {t("signout")}
          </button>
        </form>
      </div>
    </aside>
  );
}

/** Top bar: optional back button, breadcrumb, optional action, settings shortcut (variant A/B in _shell.md §3). */
export async function AdminHeader({ crumb, back, action }: { crumb: string; back?: string; action?: ReactNode }) {
  const t = await getTranslations("admin.nav");
  return (
    <header className="sticky top-0 z-10 flex h-[76px] items-center gap-3 border-b border-line bg-surface pl-8 pr-10">
      {back && (
        <Link href={back} aria-label={t("back")} className="flex size-11 items-center justify-center rounded-bf-12 bg-surface hover:bg-elevated">
          <Image src="/figma/admin/nav-logout-20.svg" alt="" width={20} height={20} className="size-5" />
        </Link>
      )}
      <p className={`whitespace-pre text-label text-muted ${back ? "" : "pl-2"}`}>{crumb}</p>
      <div className="ml-auto flex items-center gap-6">
        {action}
        <Link href="/admin/settings" aria-label={t("settings")} className="flex size-11 items-center justify-center rounded-bf-12 bg-surface hover:bg-elevated">
          <Image src="/figma/admin/nav-settings-20.svg" alt="" width={20} height={20} className="size-5" />
        </Link>
      </div>
    </header>
  );
}

/** Page title block (_shell.md §4): eyebrow, H1, subtitle, optional action on the right. */
export function AdminTitle({ eyebrow, title, body, action }: { eyebrow: string; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="whitespace-pre text-caption text-muted">{eyebrow}</p>
        <h1 className="text-h1 text-text">{title}</h1>
        {body && <p className="text-body text-muted">{body}</p>}
      </div>
      {action && <div className="w-[240px] shrink-0">{action}</div>}
    </div>
  );
}

/** Scrolling page body: padding 40, gap 20 (content width 1132 at 1440). */
export function AdminBody({ children }: { children: ReactNode }) {
  return <main className="flex flex-col gap-5 p-10">{children}</main>;
}

/** Bordered surface panel (_shell.md §6). */
export function AdminPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`flex flex-col overflow-clip rounded-bf-16 border border-line bg-surface ${className}`}>{children}</section>;
}

/** Table (_shell.md §7): elevated header row, 54px rows with a divider and chevron. */
export function AdminTable({ columns, rows, widths }: { columns: string[]; widths: string[]; rows: { key: string; href?: string; cells: ReactNode[] }[] }) {
  const grid = { gridTemplateColumns: `${widths.join(" ")} 1fr 16px` };
  return (
    <div className="flex flex-col">
      <div className="grid items-center gap-2 rounded-bf-8 bg-elevated p-[10px] text-caption text-muted" style={grid}>
        {columns.map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>
      {rows.map((r) => {
        const inner = (
          <>
            {r.cells.map((cell, i) => (
              <span key={i} className={`min-w-0 ${typeof cell === "string" ? "truncate" : ""} ${i === 0 ? "text-label text-text" : "text-body text-muted"}`}>
                {cell}
              </span>
            ))}
            <span />
            {r.href ? <Image src="/figma/admin/chevron-right-16.svg" alt="" width={16} height={16} className="size-4" /> : <span />}
          </>
        );
        const cls = "grid min-h-[54px] items-center gap-2 rounded-bf-8 border-b border-line p-[10px]";
        return r.href ? (
          <Link key={r.key} href={r.href} className={`${cls} transition-colors hover:bg-elevated/40`} style={grid}>
            {inner}
          </Link>
        ) : (
          <div key={r.key} className={cls} style={grid}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}

/** Stat card (_shell.md §5). */
export function StatCard({ href, icon, label, value, sub }: { href?: string; icon: string; label: string; value: string; sub: string }) {
  const body = (
    <>
      <span className="flex items-center gap-2 text-caption text-muted">
        <Image src={icon} alt="" width={16} height={16} className="size-4" />
        {label}
      </span>
      <span className="text-h2 text-text">{value}</span>
      <span className="text-caption text-muted">{sub}</span>
    </>
  );
  const cls = "flex flex-1 flex-col gap-2 rounded-bf-16 border border-line bg-surface p-4";
  return href ? (
    <Link href={href} className={`${cls} transition-colors hover:bg-elevated/40`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
