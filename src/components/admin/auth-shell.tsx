// Admin sign-in / reset layout (docs/specs/admin/01.md): top bar, form card on the left,
// decorative story panel on the right. The theme switch from Figma is left out.
import Image from "next/image";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui";
import { Logo } from "@/components/logo";

export async function AdminAuthShell({ children }: { children: ReactNode }) {
  const t = await getTranslations("admin.auth");
  return (
    <div className="min-h-dvh bg-bg">
      <header className="flex h-16 items-center border-b border-line bg-surface px-4 sm:h-[78px] sm:px-11">
        <Logo size={38} priority />
        <span className="ml-[14px] hidden whitespace-pre text-label text-text sm:inline">BEFAMOUS  /  ADMIN</span>
        <ButtonLink href="/" variant="secondary" className="ml-auto !w-auto px-4 sm:!w-[232px]">
          {t("userSpace")}
        </ButtonLink>
      </header>
      <div className="mx-auto flex max-w-[1256px] items-start justify-center gap-10 px-4 pb-16 pt-8 sm:pt-[66px] lg:justify-between lg:px-[92px]">
        <div className="flex w-full max-w-[576px] flex-col gap-5 rounded-bf-24 border border-line bg-surface p-6 sm:p-11">{children}</div>
        <aside className="hidden w-[600px] flex-col gap-4 rounded-bf-24 bg-elevated p-7 min-[1100px]:flex" aria-hidden>
          <div className="relative h-[360px] overflow-clip rounded-bf-16 bg-elevated">
            <span className="absolute -top-[58px] left-[311px] h-[410px] w-[354px] rounded-full bg-surface" />
            <span className="absolute left-4 top-4 flex size-[62px] items-center justify-center rounded-bf-16 bg-bg">
              <Image src="/figma/icon-camera.svg" alt="" width={32} height={32} className="size-8" />
            </span>
            <p className="absolute left-4 top-[302px] text-caption text-muted">CREATE / SHARE / EARN</p>
            <p className="absolute left-4 top-[322px] text-h3 text-text">MAKE IT YOURS.</p>
          </div>
          <h2 className="text-h2 text-text">{t("storyTitle")}</h2>
          <p className="text-body text-muted">{t("storyBody")}</p>
        </aside>
      </div>
    </div>
  );
}
