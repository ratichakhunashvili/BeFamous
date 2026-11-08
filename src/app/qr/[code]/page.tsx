// Printed QR codes point here (…/qr/CODE), so scanning with the phone's own camera also works.
// We only look up which mission the code belongs to and hand it to the scanner screen,
// which submits it through the normal (POST) check-in action.
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/session";

export default async function QrLinkPage({ params }: PageProps<"/qr/[code]">) {
  await requireUser();
  const { code } = await params;
  const normalized = code.toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 64);
  const qr = await db.query.qrCodes.findFirst({ where: and(eq(schema.qrCodes.code, normalized), eq(schema.qrCodes.active, true)) });
  if (!qr) redirect("/home");
  redirect(`/missions/${qr.missionId}/qr?code=${encodeURIComponent(normalized)}`);
}
