// Business panel (Figma page 04 "Business"): businesses propose campaigns and use the AI advisor.
// Campaigns they create arrive in the admin panel as drafts; the BeFamous team publishes them.
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { signoutAction } from "@/app/actions/auth";
import { MobileTabs, SidebarNav } from "@/components/admin/sidebar-nav";
import { Logo } from "@/components/logo";
import { requireBusinessPage } from "@/lib/session";

export default async function BusinessLayout({ children }: LayoutProps<"/business/panel">) {
  const me = await requireBusinessPage();
  const t = await getTranslations("biz.nav");
  const items = [
    { href: "/business/panel", label: t("overview"), icon: "/figma/admin/nav-home-20.svg" },
    { href: "/business/panel/campaigns", label: t("campaigns"), icon: "/figma/admin/nav-campaign-20.svg" },
    { href: "/business/panel/new", label: t("new"), icon: "/figma/admin/nav-gift-20.svg" },
    { href: "/business/panel/ai", label: t("ai"), icon: "/figma/admin/nav-spark-20.svg" },
  ];
  const bottom = "flex h-[46px] w-full items-center gap-3 rounded-bf-12 px-[14px] text-label text-muted transition-colors hover:bg-elevated/50";
  return (
    <div className="flex min-h-dvh bg-bg">
      <aside className="sticky top-0 hidden h-dvh w-[228px] shrink-0 flex-col border-r border-line bg-surface p-4 lg:flex">
        <Link href="/business/panel" className="flex h-[60px] items-center gap-[10px] px-[10px]">
          <Logo size={34} />
          <span className="flex flex-col">
            <span className="text-label text-text">BEFAMOUS</span>
            <span className="text-caption text-muted">BUSINESS</span>
          </span>
        </Link>
        <p className="mb-3 mt-[34px] px-2 text-caption text-muted">{t("section")}</p>
        <SidebarNav items={items} />
        <div className="mt-auto flex flex-col gap-[10px]">
          <span className="mx-2 mb-1 h-px bg-line" />
          {me.role === "admin" && (
            <Link href="/admin" className={bottom}>
              <Image src="/figma/admin/nav-settings-20.svg" alt="" width={20} height={20} className="size-5" />
              {t("admin")}
            </Link>
          )}
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
      <div className="min-w-0 flex-1">
        <div className="border-b border-line bg-surface lg:hidden">
          <div className="flex h-14 items-center gap-2 px-4">
            <Logo size={28} />
            <span className="text-label text-text">BEFAMOUS</span>
            <span className="text-caption text-muted">BUSINESS</span>
            <Link href="/home" className="ml-auto text-caption text-muted">
              {t("userSpace")}
            </Link>
          </div>
          <nav className="overflow-x-auto px-2 pb-2">
            <MobileTabs items={items} />
          </nav>
        </div>
        {children}
      </div>
    </div>
  );
}
