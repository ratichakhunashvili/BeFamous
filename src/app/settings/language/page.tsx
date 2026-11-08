// 69 ენა — Figma 300:3627. Figma marks English "coming soon"; the product brief makes both languages
// selectable here, so the selected row shows the check icon + "არჩეულია" and the other row switches.
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { setLocaleAction } from "@/app/actions/account";
import { AppBar, CurvesBackdrop, PageTitle, Screen } from "@/components/ui";
import { requireUser } from "@/lib/session";

const options = [
  { value: "ka", label: "ქართული", switchKey: "switchKa" },
  { value: "en", label: "English", switchKey: "switchEn" },
] as const;

export default async function LanguagePage() {
  await requireUser();
  const locale = await getLocale();
  const t = await getTranslations("languagePage");
  const c = await getTranslations("common");

  return (
    <Screen>
      <AppBar back="/settings" brandLabel={c("brand")} />
      <CurvesBackdrop>
        <PageTitle eyebrow={t("eyebrow")} title={t("title")} body={t("body")} />
        {options.map((o) => {
          const selected = o.value === locale;
          return (
            <form key={o.value} action={setLocaleAction} className="w-full">
              <input type="hidden" name="locale" value={o.value} />
              <button
                type="submit"
                lang={o.value}
                aria-pressed={selected}
                className="flex w-full items-center gap-3 overflow-clip rounded-bf-16 border border-line bg-surface p-3 transition-colors hover:bg-elevated/60"
              >
                <span className="relative size-9 shrink-0 overflow-clip rounded-bf-12 bg-elevated">
                  <Image src={selected ? "/figma/icon-check.svg" : "/figma/icon-discover-20.svg"} alt="" width={20} height={20} className="absolute left-2 top-2 size-5" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-5 text-center text-white">
                  <span className="text-label">{o.label}</span>
                  <span className="text-caption">{selected ? t("selected") : t(o.switchKey)}</span>
                </span>
                <Image src="/figma/icon-chevron.svg" alt="" width={16} height={16} className="size-4 shrink-0" />
              </button>
            </form>
          );
        })}
      </CurvesBackdrop>
    </Screen>
  );
}
