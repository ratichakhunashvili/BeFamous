// DB rows store both languages (e.g. titleKa / titleEn). This picks the one for the current UI language.
import type { Locale } from "@/i18n/request";

type Bilingual<K extends string> = { [P in `${K}Ka` | `${K}En`]: string | null };

export function tr<K extends string>(row: Bilingual<K>, key: K, locale: Locale): string {
  const ka = row[`${key}Ka` as `${K}Ka`];
  const en = row[`${key}En` as `${K}En`];
  return (locale === "en" ? en || ka : ka || en) ?? "";
}
