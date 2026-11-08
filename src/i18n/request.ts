// Picks the UI language for each request from the "locale" cookie (default Georgian).
import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export const locales = ["ka", "en"] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async () => {
  const value = (await cookies()).get("locale")?.value;
  const locale: Locale = value === "en" ? "en" : "ka";
  return { locale, messages: (await import(`../../messages/${locale}.json`)).default };
});
