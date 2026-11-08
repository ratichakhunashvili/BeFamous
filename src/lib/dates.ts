// Date labels in Georgian/English, in Tbilisi time.
import type { Locale } from "@/i18n/request";

/** "30 ნოემბერი" / "30 November" */
export function dayMonth(d: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ka-GE", { day: "numeric", month: "long", timeZone: "Asia/Tbilisi" }).format(d);
}

// Georgian "until <month>" forms (ნოემბერი → ნოემბრამდე), as drawn on screen 22.
const untilKa = ["იანვრამდე", "თებერვლამდე", "მარტამდე", "აპრილამდე", "მაისამდე", "ივნისამდე", "ივლისამდე", "აგვისტომდე", "სექტემბრამდე", "ოქტომბრამდე", "ნოემბრამდე", "დეკემბრამდე"];

/** "მოქმედია 30 ნოემბრამდე" / "valid until 30 November" */
export function validUntil(d: Date, locale: Locale) {
  if (locale === "en") return `valid until ${dayMonth(d, "en")}`;
  const parts = new Intl.DateTimeFormat("en-CA", { day: "numeric", month: "numeric", timeZone: "Asia/Tbilisi" }).formatToParts(d);
  const day = parts.find((p) => p.type === "day")?.value;
  const month = Number(parts.find((p) => p.type === "month")?.value) - 1;
  return `მოქმედია ${day} ${untilKa[month]}`;
}

// Georgian number words for small counts, as Figma writes them ("ხუთი კოლექცია" on 25).
const kaWords = ["ნული", "ერთი", "ორი", "სამი", "ოთხი", "ხუთი", "ექვსი", "შვიდი", "რვა", "ცხრა", "ათი"];

/** "ხუთი" for 5 in Georgian (up to 10), digits otherwise / in English. */
export function countWord(n: number, locale: Locale) {
  return locale === "ka" && n >= 0 && n <= 10 ? kaWords[n] : String(n);
}

const tbilisiDay = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tbilisi", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

/** Whole calendar days (Tbilisi) between d and now: 0 = today, 1 = yesterday. */
export function daysAgo(d: Date, now = new Date()) {
  const ms = (x: string) => Date.UTC(Number(x.slice(0, 4)), Number(x.slice(5, 7)) - 1, Number(x.slice(8, 10)));
  return Math.round((ms(tbilisiDay(now)) - ms(tbilisiDay(d))) / 86_400_000);
}

/** "1–30 ნოემბერი" (same month) or "28 ოქტომბერი – 5 ნოემბერი". */
export function dateRange(start: Date | null, end: Date | null, locale: Locale) {
  if (!start || !end) return "—";
  const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ka-GE", { timeZone: "Asia/Tbilisi", ...o }).format(d);
  const sameMonth = fmt(start, { month: "numeric", year: "numeric" }) === fmt(end, { month: "numeric", year: "numeric" });
  return sameMonth ? `${fmt(start, { day: "numeric" })}–${dayMonth(end, locale)}` : `${dayMonth(start, locale)} – ${dayMonth(end, locale)}`;
}
