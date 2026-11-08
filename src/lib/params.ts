// Small helpers for reading URL search params safely.
export type Platform = "tiktok" | "instagram";
export const platformName: Record<Platform, string> = { tiktok: "TikTok", instagram: "Instagram" };
export const isPlatform = (v: unknown): v is Platform => v === "tiktok" || v === "instagram";

/** ?mission=<uuid> carried through the post flow (13 → 56 → 57). */
export function missionParam(sp: Record<string, string | string[] | undefined>) {
  const v = sp.mission;
  return typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v) ? v : null;
}

export const withMission = (path: string, missionId: string | null) => (missionId ? `${path}?mission=${missionId}` : path);
