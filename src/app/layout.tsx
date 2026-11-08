import type { Metadata, Viewport } from "next";
import { Noto_Sans_Georgian } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { UserSidebar } from "@/components/user-sidebar";
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
  const [session, t, tp] = await Promise.all([auth(), getTranslations("nav"), getTranslations("desktopNav")]);
  return (
    <html lang={locale} className={`${noto.variable} h-full antialiased`}>
      <body className="min-h-full bg-bg font-sans text-text">
        <NextIntlClientProvider>
          {session?.user && (
            <UserSidebar
              isAdmin={session.user.role === "admin"}
              isBusiness={session.user.role === "business"}
              adminLabel={tp("admin")}
              businessLabel={tp("business")}
              labels={{ home: t("home"), discover: t("discover"), activity: t("activity"), rewards: t("rewards"), profile: t("profile"), notifications: t("notifications"), badges: tp("badges"), settings: tp("settings"), invite: tp("invite") }}
            />
          )}
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
