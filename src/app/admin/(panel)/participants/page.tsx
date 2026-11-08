// Admin 18 მონაწილეთა მიმოხილვა — Figma 7:590. One card per campaign: registered posts and QR visits.
// Pending posts come first and open the review (19). Below: "add a found post" (drives the user's 59).
import { getLocale, getTranslations } from "next-intl/server";
import { AdminBody, AdminHeader, AdminPanel, AdminTable, AdminTitle } from "@/components/admin/shell";
import { ButtonLink } from "@/components/ui";
import type { Locale } from "@/i18n/request";
import { getOpenParticipations, getParticipantWork } from "@/lib/admin-queries";
import { daysAgo } from "@/lib/dates";
import { tr } from "@/lib/i18n-fields";
import { requireAdminPage } from "@/lib/session";
import { FoundPostForm } from "./found-post-form";

export default async function ParticipantsPage({ searchParams }: PageProps<"/admin/participants">) {
  await requireAdminPage();
  const sp = await searchParams;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("admin.participants");
  const c = await getTranslations("admin");
  const [groups, open] = await Promise.all([getParticipantWork(), getOpenParticipations()]);
  const when = (d: Date) => {
    const n = daysAgo(d);
    return n <= 0 ? c("today") : n === 1 ? c("yesterday") : c("daysAgo", { count: n });
  };

  return (
    <>
      <AdminHeader crumb={c("crumb")} />
      <AdminBody>
        <AdminTitle eyebrow={t("eyebrow")} title={t("title")} body={t("body")} />
        {sp.found && <p className="rounded-bf-12 border border-line bg-surface p-3 text-body text-text">{t("foundAdded")}</p>}
        {groups.map(({ challenge, rows }) => (
          <AdminPanel key={challenge.id} className="gap-3 p-4">
            <h2 className="text-h3 text-text">{tr(challenge, "title", locale)}</h2>
            {rows.length === 0 ? (
              <p className="p-[10px] text-body text-muted">{t("empty")}</p>
            ) : (
              <AdminTable
                columns={[t("colName"), t("colMission"), t("colStatus"), t("colTime")]}
                widths={["331px", "300px", "227px", "124px"]}
                rows={rows.map((r) => ({
                  key: r.key,
                  href: r.submissionId ? `/admin/participants/${r.submissionId}` : undefined,
                  cells: [r.name, locale === "en" ? r.missionEn : r.mission, t(`status.${r.status}`), when(r.at)],
                }))}
              />
            )}
          </AdminPanel>
        ))}
        <div className="w-full sm:w-[310px]">
          <ButtonLink href="/admin/participants/winners" className="!h-[52px] !bg-primary !font-bold !text-on-primary">
            {t("winners")}
          </ButtonLink>
        </div>
        <AdminPanel className="gap-4 p-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-h3 text-text">{t("foundTitle")}</h2>
            <p className="text-body text-muted">{t("foundBody")}</p>
          </div>
          <FoundPostForm
            options={open.map((o) => ({ value: o.id, label: `${o.name} · ${locale === "en" ? o.titleEn : o.titleKa}` }))}
            labels={{ participant: t("foundParticipant"), choose: t("foundChoose"), url: t("foundUrl"), caption: t("foundCaption"), submit: t("foundSubmit"), errors: { url: t("foundErrUrl"), participant: t("foundErrParticipant") } }}
          />
        </AdminPanel>
      </AdminBody>
    </>
  );
}
