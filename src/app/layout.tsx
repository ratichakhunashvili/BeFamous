import type { Metadata, Viewport } from "next";
import { Noto_Sans_Georgian } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import "./globals.css";

const noto = Noto_Sans_Georgian({
  variable: "--font-noto-georgian",
  subsets: ["georgian", "latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "BEFAMOUS",
  description: "Challenges, missions and rewards for creators.",
};

export const viewport: Viewport = { themeColor: "#0e121c" };

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${noto.variable} h-full antialiased`}>
      <body className="min-h-full bg-bg font-sans text-text">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
