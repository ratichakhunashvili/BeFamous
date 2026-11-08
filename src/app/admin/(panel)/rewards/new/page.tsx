// Admin 45 ჯილდოს შექმნა — Figma 22:840. Figma draws name, quantity and expiry; English name, value,
// brand and linked campaign are added because the reward needs them (voucher code "BF–{value}–…", issuing).
import { asc, ne } from "drizzle-orm";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminBody, AdminHeader, AdminTitle } from "@/components/admin/shell";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { tr } from "@/lib/i18n-fields";
import { requireAdminPage } from "@/lib/session";
import { RewardForm } from "./reward-form";

export default async function NewRewardPage() {
  await requireAdminPage();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("admin.rewards");
  const c = await getTranslations("admin");
  const challenges = await db.select().from(schema.challenges).where(ne(schema.challenges.status, "ended")).orderBy(asc(schema.challenges.sortOrder));
  return (
    <>
      <AdminHeader crumb={c("crumb")} back="/admin/rewards" />
      <AdminBody>
        <AdminTitle eyebrow={t("newEyebrow")} title={t("newTitle")} body={t("newBody")} />
        <RewardForm
          challenges={challenges.map((ch) => ({ value: ch.id, label: tr(ch, "title", locale) }))}
          labels={{
            heading: t("params"),
            titleKa: t("fTitleKa"),
            titleEn: t("fTitleEn"),
            value: t("fValue"),
            brand: t("fBrand"),
            stock: t("fStock"),
            stockHint: t("fStockHint"),
            expires: t("fExpires"),
            challenge: t("fChallenge"),
            noChallenge: t("fNoChallenge"),
            cancel: t("cancel"),
            submit: t("addSubmit"),
            invalid: t("invalid"),
          }}
        />
      </AdminBody>
    </>
  );
}
