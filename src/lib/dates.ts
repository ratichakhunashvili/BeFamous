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
