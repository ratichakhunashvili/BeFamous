// Turns stored notification rows into the cards drawn on 24 / 52 (icon, title, "time · detail", link).
import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { tr } from "@/lib/i18n-fields";
import { tbilisiDate } from "@/lib/progress";

export type NotificationCard = { id: string; icon: string; title: string; caption: string; href: string; read: boolean };
type Data = Record<string, unknown> | null;
const str = (d: Data, k: string) => (typeof d?.[k] === "string" ? (d[k] as string) : undefined);

/** Whole days between two Tbilisi calendar dates. */
function daysAgo(d: Date) {
  const day = (x: string) => Date.UTC(Number(x.slice(0, 4)), Number(x.slice(5, 7)) - 1, Number(x.slice(8, 10)));
  return Math.round((day(tbilisiDate()) - day(tbilisiDate(d))) / 86_400_000);
}

/** Where a notification leads; also used by /notifications/[id] after marking it read. */
export function notificationHref(kind: string, data: Data) {
  const submissionId = str(data, "submissionId");
  const postId = str(data, "postId");
  switch (kind) {
    case "submission_approved":
    case "submission_revision":
    case "submission_rejected":
      return submissionId ? `/submissions/${submissionId}` : "/activity";
    case "reward_added":
      return str(data, "voucherId") ? `/rewards/${str(data, "voucherId")}` : "/rewards";
    case "badge_earned":
      return str(data, "slug") ? `/badges/${str(data, "slug")}` : "/badges";
    case "challenge_completed":
      return str(data, "slug") ? `/challenges/${str(data, "slug")}` : "/activity";
    case "invite_accepted":
      return "/invite";
    case "account_expired":
      return `/accounts/${str(data, "platform") ?? "tiktok"}/expired`;
    case "post_found":
    case "post_ownership":
    case "post_unavailable":
    case "post_metrics_unavailable":
    case "post_refresh_failed":
      return postId ? `/posts/${postId}` : "/activity";
    default:
      return "/notifications";
  }
}

export async function getNotificationCards(userId: string, locale: Locale): Promise<NotificationCard[]> {
  const t = await getTranslations("notificationsPage");
  const rows = await db.select().from(schema.notifications).where(eq(schema.notifications.userId, userId)).orderBy(desc(schema.notifications.createdAt)).limit(50);

  // Look up the challenge / XP / voucher behind each row in a few batched queries.
  const subIds = rows.map((r) => str(r.data as Data, "submissionId")).filter(Boolean) as string[];
  const postIds = rows.map((r) => str(r.data as Data, "postId")).filter(Boolean) as string[];
  const voucherIds = rows.map((r) => str(r.data as Data, "voucherId")).filter(Boolean) as string[];
  const levelIds = rows.map((r) => str(r.data as Data, "levelId")).filter(Boolean) as string[];
  const challengeIds = rows.map((r) => str(r.data as Data, "challengeId")).filter(Boolean) as string[];
  const inviteeIds = rows.map((r) => str(r.data as Data, "inviteeId")).filter(Boolean) as string[];

  const [subs, posts, vouchers, levels, challenges, invitees] = await Promise.all([
    subIds.length
      ? db
          .select({ id: schema.submissions.id, note: schema.submissions.reviewNote, xp: schema.missions.xpReward, challenge: schema.challenges })
          .from(schema.submissions)
          .innerJoin(schema.missions, eq(schema.missions.id, schema.submissions.missionId))
          .innerJoin(schema.challenges, eq(schema.challenges.id, schema.missions.challengeId))
          .where(and(inArray(schema.submissions.id, subIds), eq(schema.submissions.userId, userId)))
      : [],
    postIds.length
      ? db
          .select({ id: schema.socialPosts.id, challenge: schema.challenges })
          .from(schema.socialPosts)
          .innerJoin(schema.missions, eq(schema.missions.id, schema.socialPosts.missionId))
          .innerJoin(schema.challenges, eq(schema.challenges.id, schema.missions.challengeId))
          .where(and(inArray(schema.socialPosts.id, postIds), eq(schema.socialPosts.userId, userId)))
      : [],
    voucherIds.length
      ? db
          .select({ id: schema.vouchers.id, valueGel: schema.rewards.valueGel, reward: schema.rewards })
          .from(schema.vouchers)
          .innerJoin(schema.rewards, eq(schema.rewards.id, schema.vouchers.rewardId))
          .where(and(inArray(schema.vouchers.id, voucherIds), eq(schema.vouchers.userId, userId)))
      : [],
    levelIds.length ? db.select().from(schema.badgeLevels).where(inArray(schema.badgeLevels.id, levelIds)) : [],
    challengeIds.length ? db.select().from(schema.challenges).where(inArray(schema.challenges.id, challengeIds)) : [],
    inviteeIds.length ? db.select({ id: schema.users.id, name: schema.users.name, deletedAt: schema.users.deletedAt }).from(schema.users).where(inArray(schema.users.id, inviteeIds)) : [],
  ]);

  return rows.map((r) => {
    const data = r.data as Data;
    const sub = subs.find((s) => s.id === str(data, "submissionId"));
    const post = posts.find((p) => p.id === str(data, "postId"));
    const challengeTitle = sub ? tr(sub.challenge, "title", locale) : post ? tr(post.challenge, "title", locale) : undefined;
    const n = daysAgo(r.createdAt);
    const when = n <= 0 ? t("today") : n === 1 ? t("yesterday") : t("daysAgo", { count: n });

    let icon = "/figma/icon-activity.svg";
    let title = t("generic");
    let detail = "";
    switch (r.kind) {
      case "submission_approved":
        icon = "/figma/icon-check.svg";
        title = t("approved");
        // Same figure as 17 / 16: the mission's XP plus the challenge XP its approval unlocks.
        detail = sub ? `+${sub.xp + sub.challenge.xpReward} XP` : (challengeTitle ?? "");
        break;
      case "submission_revision":
        title = sub?.note?.startsWith("missing:") ? t("hashtagMissing") : t("revision");
        detail = challengeTitle ?? "";
        break;
      case "submission_rejected":
        icon = "/figma/icon-close-20.svg";
        title = t("rejected");
        detail = challengeTitle ?? "";
        break;
      case "reward_added": {
        const v = vouchers.find((x) => x.id === str(data, "voucherId"));
        icon = "/figma/icon-gift-20.svg";
        title = t("reward");
        detail = v?.valueGel ? t("voucherValue", { value: v.valueGel }) : v ? tr(v.reward, "title", locale) : "";
        break;
      }
      case "badge_earned": {
        const lvl = levels.find((x) => x.id === str(data, "levelId"));
        icon = "/figma/icon-badge.svg";
        title = t("badge");
        detail = lvl ? (locale === "en" ? lvl.nameEn : lvl.nameKa) : "";
        break;
      }
      case "challenge_completed": {
        const ch = challenges.find((x) => x.id === str(data, "challengeId"));
        icon = "/figma/icon-check.svg";
        title = t("challengeDone");
        detail = ch ? tr(ch, "title", locale) : "";
        break;
      }
      case "invite_accepted":
        icon = "/figma/icon-team.svg";
        title = t("inviteAccepted");
        {
          const friend = invitees.find((x) => x.id === str(data, "inviteeId"));
          detail = friend && !friend.deletedAt ? friend.name : ""; // deleted accounts have no name to show
        }
        break;
      case "post_found":
        icon = "/figma/icon-search.svg";
        title = t("postFound");
        detail = challengeTitle ?? "";
        break;
      case "post_ownership":
        icon = "/figma/icon-clock-20.svg";
        title = t("ownership");
        detail = challengeTitle ?? "";
        break;
      case "account_expired":
        icon = "/figma/icon-lock-20.svg";
        title = t("accountExpired", { platform: str(data, "platform") === "instagram" ? "Instagram" : "TikTok" });
        detail = t("reconnect");
        break;
      case "post_unavailable":
        icon = "/figma/icon-close-20.svg";
        title = t("postUnavailable");
        detail = challengeTitle ?? "";
        break;
      case "post_metrics_unavailable":
        icon = "/figma/icon-chart-20.svg";
        title = t("metricsUnavailable");
        detail = challengeTitle ?? "";
        break;
      case "post_refresh_failed":
        icon = "/figma/icon-clock-20.svg";
        title = t("refreshFailed");
        detail = t("maybeStale");
        break;
    }
    return { id: r.id, icon, title, caption: detail ? `${when} · ${detail}` : when, href: notificationHref(r.kind, data), read: r.readAt != null };
  });
}
