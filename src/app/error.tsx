"use client";
// 28 შეცდომა — Figma 87:8894. Shown when a page fails to load (e.g. the database or network is down).
// "ხელახლა ცდა" re-renders the failed page; "ჩემი აქტივობა" goes to 17.
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { AppBar, Button, ButtonLink, CurvesBackdrop, ResultPanel, Screen } from "@/components/ui";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  const t = useTranslations("statusPages");
  const c = useTranslations("common");
  useEffect(() => console.error(error), [error]);

  return (
    <Screen>
      <AppBar back="history" brandLabel={c("brand")} />
      <CurvesBackdrop>
        <ResultPanel icon="/figma/icon-activity-26.svg" title={t("errorTitle")} body={t("errorBody")} centerTitle />
        <Button type="button" onClick={() => retry()}>
          {t("retry")}
        </Button>
        <ButtonLink href="/activity" variant="secondary">
          {t("myActivity")}
        </ButtonLink>
      </CurvesBackdrop>
    </Screen>
  );
}
