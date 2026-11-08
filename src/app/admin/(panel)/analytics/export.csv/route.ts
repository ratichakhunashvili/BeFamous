// CSV download for 44. Route handlers don't run the admin layout, so the admin check is repeated here.
import { getLocale, getTranslations } from "next-intl/server";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import type { Locale } from "@/i18n/request";
import { csvCell, exportRows } from "@/lib/admin-export";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") return new NextResponse("Forbidden", { status: 403 });
  const sp = req.nextUrl.searchParams;
  const days = sp.get("period") === "7d" ? 7 : 30;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("admin.analytics");
  const data = await exportRows(days, sp.get("campaign") ?? undefined, locale);
  const header = [t("colMetric"), t("colValue"), "period_start", "period_end", t("colCampaign"), "source", "generated_at"];
  const generated = new Date().toISOString();
  const lines = [
    header.map(csvCell).join(","),
    ...data.rows.map((r) => [t(`metric.${r.key}`), r.value, data.start, data.end, data.campaignTitle ?? t("allCampaigns"), r.source, generated].map((v) => csvCell(v)).join(",")),
  ];
  // BOM so Excel reads the Georgian text as UTF-8.
  const body = "﻿" + lines.join("\r\n") + "\r\n";
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="befamous-analytics-${data.start}-${data.end}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
