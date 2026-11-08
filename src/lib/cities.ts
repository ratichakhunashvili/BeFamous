// Cities a challenge can belong to (labels live in messages: cities / citiesIn).
export const cities = ["tbilisi", "batumi", "kutaisi", "outside"] as const;
export type City = (typeof cities)[number];
export const isCity = (v: unknown): v is City => typeof v === "string" && (cities as readonly string[]).includes(v);
