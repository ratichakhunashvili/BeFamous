// Admin 19 ნამუშევრის შეფასება — Figma 7:620. The work is a link to a public TikTok/Instagram post
// (no uploaded video), so the Figma "file / duration / format" rows become link, account, caption and
// hashtag check. Below the review: post monitoring (metrics, deleted/private, account expired) for 61–64.
import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { approveSubmissionAction, flagAccountExpiredAction, saveMetricsAction, setPostStateAction } from "@/app/actions/admin-review";
import { AdminBody, AdminHeader, AdminPanel, AdminTitle } from "@/components/admin/shell";
import { SubmitButton } from "@/components/submit-button";
import { ButtonLink } from "@/components/ui";
import type { Locale } from "@/i18n/request";
import { getSubmissionForReview } from "@/lib/admin-queries";
import { dayMonth } from "@/lib/dates";
import { tr } from "@/lib/i18n-fields";
import { requireAdminPage } from "@/lib/session";
import { missingHashtags } from "@/lib/social";

function Check({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="flex items-center gap-3 rounded-bf-16 border border-line bg-surface p-3">
      <span className="relative size-9 shrink-0 rounded-bf-12 bg-elevated">
        <Image src={icon} alt="" width={20} height={20} className="absolute left-2 top-2 size-5" />
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-label text-text">{title}</span>
        <span className="text-caption text-muted">{body}</span>
      </span>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-2/5 shrink-0 text-caption text-muted">{label}</span>
      <span className="min-w-0 flex-1 break-words text-right text-label text-text">{children}</span>
    </div>
  );
}

export default async function ReviewPage({ params }: PageProps<"/admin/participants/[id]">) {
  await requireAdminPage();
  const { id } = await params;
  const data = await getSubmissionForReview(id);
  if (!data) notFound();
  const { sub, challenge, user, post, visited, accounts } = data;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("admin.review");
  const c = await getTranslations("admin");
  const missing = missingHashtags(challenge.hashtags, sub.caption);
  const art = challenge.coverArt as { icon?: string; kicker?: string; label?: string } | null;
  const back = `/admin/participants/${sub.id}`;
  const metrics = post?.metrics as { views: number | null; likes: number | null; comments: number | null } | null;
  const fmt = (n: number | null | undefined) => (n == null ? "—" : n.toLocaleString("en-US"));
  const account = accounts.find((a) => a.platform === sub.platform);

  return (
    <>
      <AdminHeader crumb={c("crumb")} back="/admin/participants" />
      <AdminBody>
        <AdminTitle eyebrow={t("eyebrow")} title={t("title")} body={`${user.name} · ${tr(challenge, "title", locale)}`} />
        <div className="flex flex-col items-stretch gap-6 lg:flex-row lg:items-start">
          <AdminPanel className="w-full lg:w-[768px] lg:shrink-0 gap-4 p-6">
            <h2 className="text-h3 text-text">{t("work")}</h2>
            <div className="relative h-[324px] overflow-clip rounded-bf-16 bg-elevated">
              {sub.thumbnailUrl ? (
                // Cover image from the platform's public preview.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sub.thumbnailUrl} alt="" className="absolute inset-0 size-full object-contain" />
              ) : (
                <>
                  <span className="absolute -top-[52px] left-[446px] h-[369px] w-[415px] rounded-full bg-surface" />
                  <span className="absolute left-4 top-4 flex size-[62px] items-center justify-center rounded-bf-16 bg-bg">
                    <Image src="/figma/admin/icon-coffee-32.svg" alt="" width={32} height={32} className="size-8" />
                  </span>
                  <p className="absolute left-4 top-[266px] text-caption text-muted">{art?.kicker ?? "BEFAMOUS"}</p>
                  <p className="absolute left-4 top-[286px] text-h3 text-text">{art?.label ?? tr(challenge, "title", locale)}</p>
                </>
              )}
            </div>
            <Row label={t("link")}>
              <a href={sub.mediaUrl} target="_blank" rel="noopener noreferrer nofollow" className="text-primary underline-offset-2 hover:underline">
                {sub.mediaUrl}
              </a>
            </Row>
            <Row label={t("account")}>
              {sub.platform === "instagram" ? "Instagram" : "TikTok"} · {sub.handle ?? "—"}
              {account ? ` (${t("linked")}: ${account.handle})` : ""}
            </Row>
            <Row label={t("caption")}>{sub.caption ?? t("captionUnknown")}</Row>
            <Row label={t("submitted")}>{dayMonth(sub.createdAt, locale)}</Row>
          </AdminPanel>

          <AdminPanel className="w-full lg:w-[340px] lg:shrink-0 gap-3 p-5">
            <h2 className="text-h3 text-text">{t("assessment")}</h2>
            {visited !== null && <Check icon={visited ? "/figma/admin/icon-check-20.svg" : "/figma/icon-clock-20.svg"} title={t("qr")} body={visited ? t("qrDone") : t("qrMissing")} />}
            <Check
              icon={missing.length ? "/figma/icon-close-20.svg" : "/figma/admin/icon-check-20.svg"}
              title={t("hashtags")}
              body={sub.caption == null ? t("hashtagsUnknown") : missing.length ? t("hashtagsMissing", { tags: missing.join(" ") }) : t("hashtagsOk")}
            />
            {sub.status === "pending" ? (
              <>
                <form action={approveSubmissionAction}>
                  <input type="hidden" name="submissionId" value={sub.id} />
                  <SubmitButton>{t("approve")}</SubmitButton>
                </form>
                <ButtonLink href={`/admin/participants/${sub.id}/revision`} variant="secondary">
                  {t("revision")}
                </ButtonLink>
                <ButtonLink href={`/admin/participants/${sub.id}/reject`} variant="quiet">
                  {t("reject")}
                </ButtonLink>
              </>
            ) : (
              <div className="flex flex-col gap-1 rounded-bf-16 bg-elevated p-3">
                <span className="text-label text-text">{t(`decided.${sub.status}`)}</span>
                {sub.reviewedAt && <span className="text-caption text-muted">{dayMonth(sub.reviewedAt, locale)}</span>}
                {sub.reviewNote && !sub.reviewNote.startsWith("missing:") && <span className="text-caption text-muted">{sub.reviewNote}</span>}
              </div>
            )}
          </AdminPanel>
        </div>

        {post && (
          <AdminPanel className="w-full max-w-[768px] gap-4 p-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-h3 text-text">{t("monitorTitle")}</h2>
              <p className="text-body text-muted">{t("monitorBody")}</p>
            </div>
            <Row label={t("postStatus")}>{t(`postStatusLabel.${post.status}`)}</Row>
            <Row label={t("metrics")}>
              {t("metricsLine", { views: fmt(metrics?.views), likes: fmt(metrics?.likes), comments: fmt(metrics?.comments) })}
            </Row>
            <Row label={t("source")}>{post.metricsSource && post.lastSyncedAt ? `${post.metricsSource} · ${dayMonth(post.lastSyncedAt, locale)}` : t("noMetrics")}</Row>
            <form action={saveMetricsAction} className="grid grid-cols-2 items-end gap-2 sm:grid-cols-4">
              <input type="hidden" name="postId" value={post.id} />
              <input type="hidden" name="back" value={back} />
              {(["views", "likes", "comments"] as const).map((k) => (
                <label key={k} className="flex flex-col gap-2">
                  <span className="text-caption text-muted">{t(k)}</span>
                  <input name={k} inputMode="numeric" defaultValue={metrics?.[k] ?? ""} placeholder="—" className="h-12 rounded-bf-12 border border-line bg-surface px-3 text-body text-text outline-none focus:ring-2 focus:ring-inset focus:ring-primary/60" />
                </label>
              ))}
              <SubmitButton variant="secondary">{t("saveMetrics")}</SubmitButton>
            </form>
            <div className="flex flex-wrap gap-2">
              {(["unavailable", "metrics_unavailable", "refresh_failed"] as const).map((state) => (
                <form key={state} action={setPostStateAction}>
                  <input type="hidden" name="postId" value={post.id} />
                  <input type="hidden" name="state" value={state} />
                  <input type="hidden" name="back" value={back} />
                  <SubmitButton variant="quiet" className="!w-auto px-4" disabled={post.status === state}>
                    {t(`set.${state}`)}
                  </SubmitButton>
                </form>
              ))}
              {account && account.status !== "expired" && (
                <form action={flagAccountExpiredAction}>
                  <input type="hidden" name="userId" value={user.id} />
                  <input type="hidden" name="platform" value={account.platform} />
                  <input type="hidden" name="back" value={back} />
                  <SubmitButton variant="quiet" className="!w-auto px-4">
                    {t("flagExpired")}
                  </SubmitButton>
                </form>
              )}
            </div>
          </AdminPanel>
        )}
      </AdminBody>
    </>
  );
}
