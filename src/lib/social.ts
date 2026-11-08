// Reading social post links. TikTok has a public preview API (oEmbed) that returns the cover
// image, author and caption without any key — so we can check hashtags for real.
// Instagram's preview API needs a Meta app token, so Instagram posts go straight to admin review.
import "server-only";

export type ParsedPost = { platform: "tiktok" | "instagram"; url: string; handle: string | null };

export function parsePostUrl(raw: string): ParsedPost | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;
  const host = u.hostname.replace(/^www\.|^m\./, "");
  if (host === "tiktok.com" || host === "vm.tiktok.com" || host === "vt.tiktok.com") {
    const handle = u.pathname.match(/^\/(@[\w.]+)/)?.[1] ?? null;
    return { platform: "tiktok", url: u.toString(), handle };
  }
  if (host === "instagram.com") {
    if (!/^\/(p|reel|reels|tv)\/[\w-]+/.test(u.pathname)) return null;
    return { platform: "instagram", url: u.toString(), handle: null };
  }
  return null;
}

export type PostPreview = { thumbnailUrl: string | null; author: string | null; caption: string | null };

export async function fetchPreview(post: ParsedPost): Promise<PostPreview | null> {
  if (post.platform !== "tiktok") return null;
  try {
    const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(post.url)}`, { signal: AbortSignal.timeout(6000), cache: "no-store" });
    if (!res.ok) return null;
    const j = (await res.json()) as { thumbnail_url?: string; author_unique_id?: string; author_name?: string; title?: string };
    return { thumbnailUrl: j.thumbnail_url ?? null, author: j.author_unique_id ? `@${j.author_unique_id}` : j.author_name ?? null, caption: j.title ?? null };
  } catch {
    return null;
  }
}

/** Hashtags (from "#A #B") that are not in the caption. Case-insensitive. */
export function missingHashtags(required: string | null | undefined, caption: string | null | undefined) {
  const want = (required ?? "").match(/#[\p{L}\p{N}_]+/gu) ?? [];
  const have = new Set(((caption ?? "").match(/#[\p{L}\p{N}_]+/gu) ?? []).map((t) => t.toLowerCase()));
  return want.filter((t) => !have.has(t.toLowerCase()));
}
