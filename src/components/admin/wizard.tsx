// Campaign wizard layout (docs/specs/admin/12.md): form panel 768 + stepper "გამოქვეყნების გზა" 340.
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { AdminBody, AdminHeader, AdminTitle } from "@/components/admin/shell";
import { ButtonLink } from "@/components/ui";
import { STEPS, stepDone, type Campaign, type Step } from "@/lib/admin-campaigns";

export async function WizardLayout({
  campaign,
  step,
  back,
  title,
  body,
  children,
  below,
}: {
  campaign: Campaign | null;
  step: Step;
  back: string;
  title: string;
  body: string;
  children: ReactNode;
  below?: ReactNode;
}) {
  const t = await getTranslations("admin.wizard");
  const c = await getTranslations("admin");
  const index = STEPS.indexOf(step);
  return (
    <>
      <AdminHeader crumb={c("crumb")} back={back} action={<ButtonLink href="/admin/campaigns/new" variant="secondary" className="!w-[202px]">{t("newCampaign")}</ButtonLink>} />
      <AdminBody>
        <AdminTitle eyebrow={t("eyebrow", { n: index + 1 })} title={title} body={body} />
        <div className="flex items-start gap-6">
          <div className="flex w-[768px] shrink-0 flex-col gap-4 rounded-bf-16 border border-line bg-surface p-6">{children}</div>
          <aside className="flex w-[340px] shrink-0 flex-col gap-3 rounded-bf-16 border border-line bg-surface p-5">
            <h2 className="text-h3 text-text">{t("path")}</h2>
            {STEPS.map((s, i) => {
              const current = s === step;
              const done = !current && campaign != null && stepDone(campaign, s);
              const row = (
                <>
                  <span className="relative size-9 shrink-0 rounded-bf-12 bg-elevated">
                    <Image src={done ? "/figma/admin/icon-check-20.svg" : "/figma/admin/icon-activity-20.svg"} alt="" width={20} height={20} className="absolute left-2 top-2 size-5" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-label text-text">{`${i + 1}. ${t(`steps.${s}`)}`}</span>
                    <span className="text-caption text-muted">{current ? t("current") : done ? t("done") : t("upcoming")}</span>
                  </span>
                  {done && <Image src="/figma/admin/chevron-right-16.svg" alt="" width={16} height={16} className="size-4" />}
                </>
              );
              const cls = "flex items-center gap-3 rounded-bf-16 border border-line bg-surface p-3";
              return done && campaign ? (
                <Link key={s} href={`/admin/campaigns/${campaign.challenge.id}/edit/${s}`} className={`${cls} transition-colors hover:bg-elevated/40`}>
                  {row}
                </Link>
              ) : (
                <div key={s} className={cls} aria-current={current ? "step" : undefined}>
                  {row}
                </div>
              );
            })}
            <p className="text-caption text-muted">{campaign?.challenge.titleKa ?? t("untitled")}</p>
            <div className="h-2 overflow-clip rounded-full bg-elevated" role="progressbar" aria-valuenow={(index + 1) * 20} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-primary" style={{ width: `${(index + 1) * 20}%` }} />
            </div>
          </aside>
        </div>
        {below}
      </AdminBody>
    </>
  );
}

/** Info strip under the wizard (14, 15): surface, radius 12, padding 20, one paragraph per line. */
export function InfoStrip({ lines }: { lines: string[] }) {
  return (
    <div className="flex flex-col gap-[10px] rounded-bf-12 bg-surface p-5 text-[14px] text-text">
      {lines.map((l) => (
        <p key={l}>{l}</p>
      ))}
    </div>
  );
}

/** Elevated notice box with an 18px icon (14 "გამოთვლილი ჯამი", 15 "თანხმობა"). */
export function Notice({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-bf-16 bg-elevated p-4">
      <span className="flex items-center gap-2 text-label text-text">
        <Image src={icon} alt="" width={18} height={18} className="size-[18px]" />
        {title}
      </span>
      <p className="text-body text-muted">{body}</p>
    </div>
  );
}
