// Every admin page is behind this check, and every admin server action repeats it (requireAdmin),
// because actions can be called without this layout running.
import { AdminMobileNav, AdminSidebar } from "@/components/admin/shell";
import { requireAdminPage } from "@/lib/session";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdminPage();
  return (
    <div className="flex min-h-dvh bg-bg">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminMobileNav />
        {children}
      </div>
    </div>
  );
}
