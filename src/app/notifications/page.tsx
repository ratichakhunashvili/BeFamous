// 24 შეტყობინებები (Figma 87:8429) / 52 ყველა წაკითხულია (87:10730) — same list, the state decides the subtitle + button.
// Figma draws no unread marker on the cards, so read/unread only changes the header and the "mark all" button.
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { markAllReadAction, openNotificationAction } from "@/app/actions/account";
import { BottomNav } from "@/components/nav";
import { SubmitButton } from "@/components/submit-button";
import { AppBar, CurvesBackdrop, PageTitle, Screen } from "@/components/ui";
import type { Locale } from "@/i18n/request";
import { getNotificationCards } from "@/lib/notifications";
import { requireUser } from "@/lib/session";

export default async function NotificationsPage() {
  const user = await requireUser();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("notificationsPage");
  const c = await getTranslations("common");
  const cards = await getNotificationCards(user.id, locale);
  const unread = cards.some((n) => !n.read);

  return (
    <Screen>
      <AppBar back="/home" brandLabel={c("brand")} />
      <CurvesBackdrop clearance={100}>
        <PageTitle
          eyebrow={t("eyebrow")}
          title={t("title")}
          body={cards.length === 0 ? t("empty") : unread ? t("body") : t("allRead")}
          align={unread ? "bodyStart" : "center"}
        />
        {cards.map((n) => (
          <form key={n.id} action={openNotificationAction} className="w-full">
            <input type="hidden" name="id" value={n.id} />
            <button
              type="submit"
              className="flex w-full items-center gap-3 overflow-clip rounded-bf-16 border border-line bg-surface p-3 text-left transition-colors hover:bg-elevated/60"
            >
              <span className="relative size-9 shrink-0 overflow-clip rounded-bf-12 bg-elevated">
                <Image src={n.icon} alt="" width={20} height={20} className="absolute left-2 top-2 size-5" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-5 text-center text-white">
                <span className="text-label">{n.title}</span>
                <span className="text-caption">{n.caption}</span>
              </span>
              <Image src="/figma/icon-chevron.svg" alt="" width={16} height={16} className="size-4 shrink-0" />
            </button>
          </form>
        ))}
        {unread && (
          <form action={markAllReadAction} className="w-full">
            <SubmitButton variant="secondary">{t("markAll")}</SubmitButton>
          </form>
        )}
      </CurvesBackdrop>
      <BottomNav active="home" />
    </Screen>
  );
}
