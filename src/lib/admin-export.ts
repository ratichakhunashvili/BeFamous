// Rows for the analytics export (44 preview and the CSV file) — the same numbers as the analytics page.
import "server-only";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { periodStats } from "@/lib/admin-stats";
import { tr } from "@/lib/i18n-fields";

export async function exportRows(days: number, campaignId: string | undefined, locale: Locale) {
  const campaign = campaignId && /^[0-9a-f-]{36}$/i.test(campaignId) ? await db.query.challenges.findFirst({ where: eq(schema.challenges.id, campaignId) }) : undefined;
  const stats = await periodStats(days, campaign?.id);
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tbilisi" });
  const end = new Date();
  const start = new Date(end.getTime() - (days - 1) * 86_400_000);
  return {
    campaignTitle: campaign ? tr(campaign, "title", locale) : null,
    start: fmt.format(start),
    end: fmt.format(end),
    rows: [
      // value null = unknown (left empty in the file), never 0
      { key: "views", value: stats.views, source: stats.views == null ? "" : `admin${stats.lastSynced ? ` ${stats.lastSynced.toISOString()}` : ""}` },
      { key: "participants", value: stats.joined as number | null, source: "befamous" },
      { key: "works", value: stats.approved as number | null, source: "befamous" },
      { key: "visits", value: stats.visits, source: stats.visits == null ? "" : "befamous" },
    ],
  };
}

/** One CSV cell: quoted, and formula-looking text (=, +, -, @) neutralised so spreadsheets don't run it. */
export function csvCell(v: string | number | null) {
  if (v == null) return "";
  let s = String(v);
  if (typeof v === "string" && /^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}
