# BeFamous — QA report (live site, 8 Nov 2026)

Tested on https://befamous-six.vercel.app with test@test.com (user + admin).

## ✅ Works (tested live)

**User**
- All 39 user screens open without errors (home, discover + filters, challenge detail/rules/join, missions, activity, XP, streak, badges, rewards, notifications, profile, settings, language, linked accounts, invite, terms).
- Join a challenge → missions list shows progress per mission.
- Register a TikTok post link → preview (41) → "checking" (42) → "in review" (14).
- Admin approves → "challenge completed +200 XP" (16), badge earned (+100 XP), voucher issued, 4 notifications.
- Voucher: code screen (43) → confirm (67) → used (44); voucher leaves the active list.
- Admin asks for changes → user sees the reason (15) → "re-check" sends it back to review.
- Profile edit → saved (46). Connect TikTok handle → linked accounts (66) shows it. Invite code + link (54).
- XP, level, streak, badge and notification counts update correctly after each step.

**Admin**
- All 18 admin screens open without errors.
- Review: request changes with a required reason → result screen (41) + participant notified.
- (Tested earlier locally, same code): approve/reject, post monitoring states, rewards create/pause, voucher check at the counter, campaign wizard draft → missions with QR → reward → rules → publish/schedule, pause/resume, analytics + CSV, winners pick/confirm, team access, settings.

## ⚠️ Not tested (on purpose or impossible here)
- Real camera QR scan (only the test shortcut; the scanner itself was tested in Phase 3).
- Account deletion (would delete the test account).
- Password reset email — **no email is sent yet**; the link only appears in Vercel logs.

## 🔴 Problems / gaps — pick what to fix

### Must-know before launch
1. **Public admin login.** test@test.com / test123 is in the public GitHub repo and is a full admin on the live site. Anyone can approve posts, issue/redeem vouchers, change campaigns, give admin to others.
2. **Password reset doesn't send emails** (needs Resend or similar). Users who forget their password are stuck.
3. **Seed/demo data on the live database**: test campaign draft, test reward "20 ₾ ყავის ვაუჩერი", test users and posts, café prize text reused in other challenges' rules, mission card text "ატვირთე ვიდეო" (says upload, but we only take links).

### User side
4. After "needs changes", **re-check re-sends the same link** — the user can't swap in a corrected post from that screen (they'd have to register a new post from the mission).
5. TikTok's public preview returns no caption on the live server, so the **automatic hashtag check never runs**; every post goes to manual admin review.
6. Instagram posts show **no preview image** (needs a Meta app token).
7. Language switch works, but some seed content (challenge descriptions, rules) has **no English text** for every row.

### Admin side — what an admin would still need
8. **No user management**: no list of all users, no way to block/delete a user or remove a spam post (only reject).
9. **Rewards can only be paused**, not edited (wrong expiry/stock needs a new reward).
10. **No cover image upload** for campaigns — only the drawn cover art.
11. **No admin alerts by email** for new posts to review (only the in-panel notifications list).
12. Dashboard card "აქტიური კამპანია · დღეს" — the "დღეს" subtitle is from Figma and means nothing.
13. Views/likes are **entered by hand** per post (no TikTok/Instagram API) — expected, but admins should know.
