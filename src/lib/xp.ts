// XP → level. Every level needs the same amount of XP (Figma shows 1,250 XP = level 04).
export const XP_PER_LEVEL = 400;

export function levelFor(xp: number) {
  return Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1;
}

/** Two-digit level label as drawn in Figma ("04"). */
export function levelLabel(xp: number) {
  return String(levelFor(xp)).padStart(2, "0");
}
