// 42 ნამუშევარი იტვირთება / პოსტი მოწმდება — Figma 87:9968.
// Runs the real check (hashtags via TikTok preview) while the bar fills, then opens the result (14 or 15).
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AppBar, CurvesBackdrop, ResultPanel, Screen } from "@/components/ui";
import { requireUser } from "@/lib/session";
import { CheckingProgress } from "./checking-progress";

export default async function CheckingPage({ params }: PageProps<"/missions/[id]/upload/[submissionId]/checking">) {
  await requireUser();
  const { id, submissionId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(submissionId)) notFound();
  const t = await getTranslations("post");
  const c = await getTranslations("common");
  const back = `/missions/${id}/upload/${submissionId}`;

  return (
    <Screen>
      <AppBar back={back} brandLabel={c("brand")} />
      <CurvesBackdrop>
        <ResultPanel icon="/figma/icon-upload-26.svg" title={t("checkingTitle")} body={t("checkingBody")} centerTitle />
        <CheckingProgress submissionId={submissionId} cancelHref={back} cancelLabel={t("cancel")} />
      </CurvesBackdrop>
    </Screen>
  );
}
