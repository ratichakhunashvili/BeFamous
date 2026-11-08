// Admin 13 მისიების კონფიგურაცია / 36 (after adding) — Figma 7:408 / 22:831.
// Each visit mission shows its QR code and link to print. Missions lock once anyone has joined.
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { WizardLayout } from "@/components/admin/wizard";
import { ButtonLink } from "@/components/ui";
import type { Locale } from "@/i18n/request";
import { getCampaign, missionsLocked } from "@/lib/admin-campaigns";
import { tr } from "@/lib/i18n-fields";
import { requireAdminPage } from "@/lib/session";

const icon = { visit_qr: "/figma/admin/icon-qr-20.svg", upload: "/figma/admin/icon-camera-20.svg", social_post: "/figma/admin/icon-camera-20.svg", invite: "/figma/icon-team.svg" } as const;

export default async function MissionsStepPage({ params, searchParams }: PageProps<"/admin/campaigns/[id]/edit/missions">) {
  await requireAdminPage();
  const campaign = await getCampaign((await params).id);
  if (!campaign) notFound();
  const sp = await searchParams;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("admin.wizard");
  const id = campaign.challenge.id;
  const locked = missionsLocked(campaign);
  const h = await headers();
  const origin = process.env.APP_URL ?? `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;

  return (
    <WizardLayout campaign={campaign} step="missions" back={`/admin/campaigns/${id}/edit/basics`} title={t("missionsTitle")} body={t("missionsBody")}>
      {locked && <p className="rounded-bf-12 bg-elevated p-3 text-body text-muted">{t("missionsLocked", { count: campaign.joined })}</p>}
      {campaign.missions.length === 0 && <p className="text-body text-muted">{t("noMissions")}</p>}
      {campaign.missions.map((m) => {
        const qr = campaign.qr.find((q) => q.missionId === m.id);
        const sub = [
          sp.saved === m.id ? t("saved") : null,
          m.required ? t("required") : t("optional"),
          `${m.xpReward} XP`,
          m.type === "visit_qr" && m.placeName ? m.placeName : null,
        ]
          .filter(Boolean)
          .join(" · ");
        const content = (
          <>
            <span className="relative size-9 shrink-0 rounded-bf-12 bg-elevated">
              <Image src={icon[m.type]} alt="" width={20} height={20} className="absolute left-2 top-2 size-5" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="whitespace-pre text-label text-text">{`${String(m.position).padStart(2, "0")}  ·  ${tr(m, "title", locale)}`}</span>
              <span className="text-caption text-muted">{sub}</span>
              {qr && (
                <span className="select-all break-all text-caption text-primary">
                  {t("qrCode", { code: qr.code })} · {`${origin}/qr/${qr.code}`}
                </span>
              )}
            </span>
            {!locked && <Image src="/figma/admin/chevron-right-16.svg" alt="" width={16} height={16} className="size-4" />}
          </>
        );
        const cls = "flex items-center gap-3 rounded-bf-16 border border-line bg-surface p-3";
        return locked ? (
          <div key={m.id} className={cls}>
            {content}
          </div>
        ) : (
          <Link key={m.id} href={`/admin/campaigns/${id}/edit/missions/${m.id}`} className={`${cls} transition-colors hover:bg-elevated/40`}>
            {content}
          </Link>
        );
      })}
      {!locked && (
        <ButtonLink href={`/admin/campaigns/${id}/edit/missions/new`} variant="secondary">
          {t("addMission")}
        </ButtonLink>
      )}
      <div className="grid grid-cols-2 gap-2">
        <ButtonLink href="/admin/campaigns?status=draft" variant="secondary">
          {t("saveDraft")}
        </ButtonLink>
        <ButtonLink href={`/admin/campaigns/${id}/edit/rewards`}>{t("toRewards")}</ButtonLink>
      </div>
    </WizardLayout>
  );
}
