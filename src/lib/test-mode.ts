// ⚠️ TEMPORARY TEST ACCOUNT — remove this file (and its uses) before real launch.
// The credentials are hard-coded on purpose (requested for testing). Everything here works ONLY when
// ENABLE_TEST_USER=true is set in .env.local AND the app is not running on Vercel, so the live site
// (which shares the database) refuses this account and its shortcuts.
export const TEST_ACCOUNT = { email: "test@test.com", password: "test123", name: "Test User" } as const;

export function testModeEnabled() {
  return process.env.ENABLE_TEST_USER === "true" && !process.env.VERCEL && process.env.NODE_ENV !== "production";
}

/** True only for the test account, and only in local test mode. */
export function isTestAccount(email: string | null | undefined) {
  return testModeEnabled() && email?.toLowerCase() === TEST_ACCOUNT.email;
}
