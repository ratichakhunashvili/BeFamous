// Business: AI campaign advisor — describe the business, get 3 campaign ideas, turn one into a campaign.
import { getTranslations } from "next-intl/server";
import { AdminBody, AdminTitle } from "@/components/admin/shell";
import { cities } from "@/lib/cities";
import { requireBusinessPage } from "@/lib/session";
import { AdvisorForm } from "./advisor-form";

export default async function AiAdvisorPage() {
  await requireBusinessPage();
  const t = await getTranslations("biz.ai");
  const tc = await getTranslations("cities");
  return (
    <AdminBody>
      <AdminTitle eyebrow="AI" title={t("title")} body={t("body")} />
      <AdvisorForm
        cities={cities.map((c) => ({ value: tc(c), label: tc(c) }))}
        labels={{
          business: t("business"),
          businessPh: t("businessPh"),
          goal: t("goal"),
          goalPh: t("goalPh"),
          city: t("city"),
          any: t("any"),
          budget: t("budget"),
          budgetPh: t("budgetPh"),
          submit: t("submit"),
          thinking: t("thinking"),
          inputError: t("inputError"),
          unavailable: t("unavailable"),
          why: t("why"),
          use: t("use"),
          visit: t("visit"),
          video: t("video"),
          disclaimer: t("disclaimer"),
        }}
      />
    </AdminBody>
  );
}
