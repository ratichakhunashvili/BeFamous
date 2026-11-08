// Unit tests for the pure business rules. Run: npm test
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

const { missingHashtags, parsePostUrl } = await import("../src/lib/social");
const { normaliseVoucherCode } = await import("../src/lib/vouchers");
const { csvCell } = await import("../src/lib/admin-export");
const { slugify } = await import("../src/lib/admin-campaigns");
const { levelFor, levelLabel } = await import("../src/lib/xp");
const { countWord, dateRange, daysAgo, validUntil } = await import("../src/lib/dates");
const { isCity } = await import("../src/lib/cities");
const { isInviteCode } = await import("../src/lib/invites");
const { missionParam, isPlatform } = await import("../src/lib/params");

describe("post links", () => {
  it("accepts public TikTok and Instagram post links", () => {
    assert.equal(parsePostUrl("https://www.tiktok.com/@nino.creates/video/123")?.platform, "tiktok");
    assert.equal(parsePostUrl("https://www.tiktok.com/@nino.creates/video/123")?.handle, "@nino.creates");
    assert.equal(parsePostUrl("https://www.instagram.com/reel/AbC_1/")?.platform, "instagram");
  });
  it("rejects other sites, profiles and plain http", () => {
    assert.equal(parsePostUrl("https://example.com/video/1"), null);
    assert.equal(parsePostUrl("https://www.instagram.com/nino/"), null);
    assert.equal(parsePostUrl("http://www.tiktok.com/@a/video/1"), null);
    assert.equal(parsePostUrl("not a url"), null);
  });
});

describe("hashtag check", () => {
  it("lists missing tags, case-insensitive, Georgian included", () => {
    assert.deepEqual(missingHashtags("#BeFamous #SecretCoffee", "my day #befamous"), ["#SecretCoffee"]);
    assert.deepEqual(missingHashtags("#BeFamous #ყავა", "#BeFamous #ყავა ✨"), []);
    assert.deepEqual(missingHashtags("#BeFamous", null), ["#BeFamous"]);
  });
  it("does not count a longer tag as the required one", () => {
    assert.deepEqual(missingHashtags("#Coffee", "#CoffeeTime"), ["#Coffee"]);
  });
});

describe("voucher codes", () => {
  it("matches what staff type to the stored en-dash form", () => {
    assert.equal(normaliseVoucherCode(" bf-50-ab2c "), "BF–50–AB2C");
    assert.equal(normaliseVoucherCode("BF—50—AB2C"), "BF–50–AB2C");
    assert.equal(normaliseVoucherCode("BF – 50 – AB2C"), "BF–50–AB2C");
  });
});

describe("CSV export", () => {
  it("leaves unknown values empty instead of 0", () => assert.equal(csvCell(null), ""));
  it("escapes quotes and neutralises formulas", () => {
    assert.equal(csvCell('say "hi"'), '"say ""hi"""');
    assert.equal(csvCell("=HYPERLINK(1)"), `"'=HYPERLINK(1)"`);
    assert.equal(csvCell(42), '"42"');
  });
});

describe("campaign slug", () => {
  it("makes URL-safe ids", () => {
    assert.equal(slugify("Secret Coffee Moment"), "secret-coffee-moment");
    assert.equal(slugify("  Café & Co!! "), "cafe-co");
    assert.equal(slugify("ქართული"), "campaign");
  });
});

describe("XP levels", () => {
  it("400 XP per level, two-digit label", () => {
    assert.equal(levelFor(0), 1);
    assert.equal(levelFor(399), 1);
    assert.equal(levelFor(400), 2);
    assert.equal(levelLabel(1250), "04");
    assert.equal(levelFor(-5), 1);
  });
});

describe("dates (Tbilisi)", () => {
  const nov = (d: number, h = 12) => new Date(Date.UTC(2026, 10, d, h));
  it("counts calendar days in Georgia time", () => {
    assert.equal(daysAgo(nov(8), nov(8)), 0);
    assert.equal(daysAgo(nov(7), nov(8)), 1);
    // 21:00 UTC on the 7th is already the 8th in Tbilisi (UTC+4).
    assert.equal(daysAgo(nov(7, 21), nov(8, 9)), 0);
  });
  it("formats ranges and the Georgian 'until' form", () => {
    assert.equal(dateRange(nov(1), nov(30), "ka"), "1–30 ნოემბერი");
    assert.equal(dateRange(null, nov(30), "ka"), "—");
    assert.equal(validUntil(nov(30), "ka"), "მოქმედია 30 ნოემბრამდე");
  });
  it("spells small numbers in Georgian", () => {
    assert.equal(countWord(5, "ka"), "ხუთი");
    assert.equal(countWord(12, "ka"), "12");
    assert.equal(countWord(5, "en"), "5");
  });
});

describe("input guards", () => {
  it("cities, invite codes, platforms, mission ids", () => {
    assert.ok(isCity("tbilisi"));
    assert.ok(!isCity("paris"));
    assert.ok(isInviteCode("NINO-BF26"));
    assert.ok(!isInviteCode("nino-bf26"));
    assert.ok(!isInviteCode("NINO-BF26; drop"));
    assert.ok(isPlatform("tiktok") && !isPlatform("facebook"));
    assert.equal(missionParam({ mission: "00000000-0000-4000-8000-000000000000" }), "00000000-0000-4000-8000-000000000000");
    assert.equal(missionParam({ mission: "../x" }), null);
  });
});
