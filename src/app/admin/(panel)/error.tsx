"use client";
// Admin 57 კავშირი შეწყდა — Figma 111:6021. Shown when an admin page or save fails (e.g. the network
// or database is down). Form inputs on the page stay as typed; "ხელახლა ცდა" retries.
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui";

export default function AdminError({ error, retry }: { error: unknown; retry: () => void }) {
  const t = useTranslations("admin.error");
  useEffect(() => console.error(error), [error]);
  return (
    <main className="flex flex-col gap-5 p-4 sm:p-6 lg:p-10">
      <h1 className="text-[28px] font-bold leading-normal text-text">{t("title")}</h1>
      <div className="w-full max-w-[900px] max-w-full rounded-bf-16 bg-surface p-6 text-[15px] text-text">{t("body")}</div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="w-full sm:w-[310px]">
          <Button type="button" onClick={() => retry()} className="!h-[52px] !bg-primary !font-bold !text-on-primary">
            {t("retry")}
          </Button>
        </div>
        <div className="w-full sm:w-[310px]">
          <ButtonLink href="/admin" variant="secondary" className="!h-[52px]">
            {t("home")}
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
