// Server-side guards. Call these at the top of pages and server actions.
import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/");
  return user;
}

/** For admin pages: signed-out visitors go to the admin sign-in (01), non-admins to the user app. */
export async function requireAdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/signin");
  if (session.user.role !== "admin") redirect("/home");
  return session.user;
}
