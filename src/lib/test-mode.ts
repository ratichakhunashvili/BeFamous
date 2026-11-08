// ⚠️ TEMPORARY TEST ACCOUNT — remove this file (and its uses) before real launch.
// The credentials are hard-coded on purpose (requested for testing). Everything here works only where
// ENABLE_TEST_USER=true is set — locally in .env.local and, by the owner's choice, on the live site too.
// Turn it off on Vercel (remove the variable) to lock the account out again.
export const TEST_ACCOUNT = { email: "test@test.com", password: "test123", name: "Test User" } as const;

export function testModeEnabled() {
  return process.env.ENABLE_TEST_USER === "true";
}

/** True only for the test account, and only in local test mode. */
export function isTestAccount(email: string | null | undefined) {
  return testModeEnabled() && email?.toLowerCase() === TEST_ACCOUNT.email;
}
