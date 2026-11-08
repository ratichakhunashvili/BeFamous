// Admin 53 ვაუჩერის შემოწმება — Figma 111:5150 (a placeholder frame: "check owner, validity and usage").
// Staff type the code shown on the customer's phone (43); a valid, unused code can be marked used here.
// The customer's email is not shown — the reward, status and expiry are enough at the counter.
import { eq } from "drizzle-orm";
import { getLocale, getTranslations } from "next-intl/server";
import { redeemVoucherAdminAction } from "@/app/actions/admin-rewards";
import { AdminBody, AdminHeader, AdminPanel } from "@/components/admin/shell";
import { SubmitButton } from "@/components/submit-button";
import { Button, ButtonLink, Field } from "@/components/ui";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { dayMonth, validUntil } from "@/lib/dates";
import { tr } from "@/lib/i18n-fields";
import { requireAdminPage } from "@/lib/session";
import { normaliseVoucherCode } from "@/lib/vouchers";

export default async function VoucherCheckPage({ searchParams }: PageProps<"/admin/rewards/check">) {
  await requireAdminPage();
  const sp = await searchParams;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("admin.voucher");
  const c = await getTranslations("admin");
  const raw = typeof sp.code === "string" ? sp.code.slice(0, 40) : "";
  const code = raw ? normaliseVoucherCode(raw) : "";
  const found = code
    ? (
        await db
          .select({ voucher: schema.vouchers, reward: schema.rewards, owner: schema.users.name })
          .from(schema.vouchers)
          .innerJoin(schema.rewards, eq(schema.rewards.id, schema.vouchers.rewardId))
          .innerJoin(schema.users, eq(schema.users.id, schema.vouchers.userId))
          .where(eq(schema.vouchers.code, code))
      )[0]
    : undefined;
  const expired = found && found.voucher.status === "issued" && found.voucher.expiresAt != null && found.voucher.expiresAt < new Date();
  const state = !found ? null : found.voucher.status === "redeemed" ? "redeemed" : expired || found.voucher.status === "expired" ? "expired" : "valid";

  return (
    <>
      <AdminHeader crumb={c("crumb")} back="/admin/rewards" />
      <AdminBody>
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-bold leading-normal text-text">{t("title")}</h1>
          <p className="text-[15px] text-muted">{t("body")}</p>
        </div>
        <AdminPanel className="w-full max-w-[900px] gap-5 p-6">
          <form className="flex items-end gap-3" action="/admin/rewards/check">
            <div className="flex-1">
              <Field label={t("code")} name="code" defaultValue={raw} placeholder="BF–50–AB2C" autoComplete="off" autoCapitalize="characters" spellCheck={false} />
            </div>
            <div className="w-[200px]">
              <Button type="submit">{t("check")}</Button>
            </div>
          </form>
          {code && !found && <p className="rounded-bf-12 bg-elevated p-4 text-body text-chart">{t("notFound", { code })}</p>}
          {found && (
            <div className="flex flex-col gap-3 rounded-bf-16 bg-elevated p-5 text-[15px] text-text">
              {sp.redeemed && <p className="text-label text-accent">{t("justRedeemed")}</p>}
              <p className="text-h3">{tr(found.reward, "title", locale)}</p>
              <p>{t("codeLine", { code: found.voucher.code })}</p>
              <p>{t("owner", { name: found.owner })}</p>
              <p>{found.voucher.expiresAt ? validUntil(found.voucher.expiresAt, locale) : t("noExpiry")}</p>
              <p className={state === "valid" ? "text-accent" : "text-chart"}>
                {state === "redeemed" && found.voucher.redeemedAt ? t("statusRedeemed", { date: dayMonth(found.voucher.redeemedAt, locale) }) : t(`status.${state}`)}
              </p>
              {state === "valid" && (
                <form action={redeemVoucherAdminAction} className="w-full sm:w-[310px]">
                  <input type="hidden" name="voucherId" value={found.voucher.id} />
                  <input type="hidden" name="code" value={found.voucher.code} />
                  <SubmitButton>{t("redeem")}</SubmitButton>
                </form>
              )}
            </div>
          )}
        </AdminPanel>
        <div className="w-full sm:w-[310px]">
          <ButtonLink href="/admin" className="!h-[52px] !bg-primary !font-bold !text-on-primary">
            {t("backHome")}
          </ButtonLink>
        </div>
      </AdminBody>
    </>
  );
}
