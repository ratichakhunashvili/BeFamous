# Admin shell + shared components  (Figma page "04 • Business — Dark", desktop 1440x960)
Source frames: 04 Dashboard 7:82 (main), 05 7:138, 27 22:822, 24 7:815. Screenshots: docs/specs/admin/img/04.png, 05.png, 27.png. All frames = `BEFAMOUS Experience` 1440x960, bg `#0e121c`, overflow clip. Product use: this is the site-wide ADMIN (route prefix /admin). Business name "ქარხანა Coffee" in the design is SAMPLE DATA (replace with admin identity / drop).
Font everywhere: Noto Sans Georgian. Tokens = docs/figma-dark-frames.md (bg #0e121c, surface #222437, elevated #2b2d43, primary #ad91ff, accent #d9f66f, text #f8f7ff, muted #aaa7c0, border #3a3c50, chart #ff91af, onPrimary #0e121c). EXTRA (not in token list): **button primary fill is hardcoded `#7524c5`** (white-ish text `#f8f7ff`), NOT the token primary.
Type scale (Figma styles): Caption 12/18 R | Label 14/22 M(500) | Body 14/22 R | H3 18/27 B | H2 24/34 B | H1 32/44 B. letterSpacing 0.

## 1. Frame geometry (absolute in Figma; translate to flex)
- Sidebar: x0 y0, **228 x 960** (the 228 includes a 1px right border: rect 1x960 `#3a3c50` at x=227; i.e. 227 content + 1 border; brief said 224 - actual is 228). bg surface `#222437`.
- Header: x228 y0, **1212 x 76**, bg surface; bottom border 1px `#3a3c50` (rect at y=75, 1212x1).
- Scroll area: x228 y76, **1212 x 884**, bg `#0e121c`, overflow-y auto. Inside: "Page content" flex-col, gap 20, **padding 40** (all sides), width 1212 => content width **1132**. Page grows beyond 884 and scrolls.
- Next layout: grid `228px 1fr`, sidebar fixed/sticky full height; header sticky top 76 high; content scrolls.

## 2. Sidebar (x-offsets relative to sidebar)
Logo block (link -> dashboard `/admin`): x16 y16, 196x60. Mark 34x34 at (10,9) = `/figma/logo.png` mark (existing, raster 32.75x32.3 at 0.57,0.85). Text "BEFAMOUS" Label 14/22 M text-colour at (54,7) w130; below "BUSINESS" Caption 12/18 R muted at (54,30). In product: keep "BEFAMOUS"; the "BUSINESS" sub-label -> suggest "ADMIN" (decision; design says BUSINESS).
Section label: "სამუშაო სივრცე" Caption 12/18 R muted, x24 y110 w184. (suggest keep or rename "ადმინისტრირება"; copy as in Figma.)
Nav items: each 196x46 at x16, **radius 12**, gap 8 (pitch 54: y=140,194,248,302,356,410,464). Icon 20x20 at (14,13); label Label 14/22 M at x46 y12 w148.
- Inactive: no bg, label muted `#aaa7c0`. Hover: not designed (suggest bg elevated @50%).
- Active: bg elevated `#2b2d43`; left accent bar 3x20 at (0,13) radius 999 fill primary `#ad91ff`; label colour text `#f8f7ff`. (Active icon uses identical asset hash; stroke baked muted `#AAA7C0`. Keep same file, or tint if desired.)
Items in order (label -> Figma proto target -> suggested route -> icon file):
1. მიმოხილვა -> dashboard -> /admin -> `/figma/admin/nav-home-20.svg`
2. კამპანიები -> campaigns (05) -> /admin/campaigns -> `nav-campaign-20.svg`
3. **AI Studio -> brief — REMOVE (AI feature)**; icon spark not downloaded. Remaining items shift up; keep pitch 54.
4. მონაწილეები -> participants -> /admin/participants -> `nav-team-20.svg`
5. ანალიტიკა -> analytics -> /admin/analytics -> `nav-chart-20.svg`
6. ჯილდოები -> vouchers -> /admin/rewards -> `nav-gift-20.svg`
7. პარამეტრები -> settings -> /admin/settings -> `nav-settings-20.svg`
Active mapping: 04 -> მიმოხილვა; 05,27,28,29,30 -> კამპანიები; 24 -> ანალიტიკა; 57 -> მონაწილეები (!).
Bottom group: divider 180x1 `#3a3c50` at (24,754). Items (same 196x46/r12 style, all muted):
- y768 "მუქი თემა" (theme switch Dark->Light, icon theme) — **REMOVE (theme toggle removed)**. (icon not kept.)
- y824 "User სივრცე" -> user app welcome (`@user:welcome`; in product = `/` or the user home) -> `nav-profile-20.svg`
- y880 "გასვლა" -> login (sign out then /login) -> `nav-logout-20.svg` (arrow-left icon, stroke 1.5)
After removing theme row, suggested: divider, User სივრცე, გასვლა pinned to bottom (keep y824/y880 or bottom-aligned with 8 gap; design keeps 56 pitch).
Icons all 20x20, stroke #AAA7C0 baked, `preserveAspectRatio=none`; use as `<img>` at natural size.

## 3. Top header (1212x76, surface, bottom border)
Variant A (root pages 04,05-list,57): breadcrumb text only at x40,y26 w660: "ქარხანა Coffee  /  სამუშაო სივრცე" Label 14/22 M muted (two spaces around "/"). Sample data -> in product e.g. "BEFAMOUS  /  სამუშაო სივრცე" or the section name.
Variant B (detail/sub pages 24,27-30): 44x44 back button at x32,y16 (bg surface, r12, no border, icon back 20x20 at (12,12) = `nav-logout-20.svg` file, arrow-left) -> returns to parent (see each spec); breadcrumb shifts to x90. Plus secondary button "+ ახალი კამპანია" at x860 y13, 202x48 (Action/Secondary) -> new-campaign wizard (frame 31/basics; ask owning spec) — present on 24,27,28,29(not present),30,57.
 NOTE: 29 has back button but NO header "+ ახალი კამპანია"; 05 and 04 have neither back nor the header button.
Right icon button (all frames): 44x44 at x1128,y15 (bg surface, r12, no border), settings icon 20x20 at (12,12) `nav-settings-20.svg` -> settings (`/admin/settings`). Right margin 1212-1172=40.
No search, no user avatar, no notifications in header.

## 4. Page-title block (inside page content, width 1132)
Row "Columns": flex, gap 24, items-start, width 1132. Left "Page title": flex-col gap 8, **width 868** (full 1132 when no action button).
 - Eyebrow/breadcrumb: Caption 12/18 R muted, e.g. "BEFAMOUS BUSINESS  /  მიმოხილვა".
 - H1: 32/44 Bold, text colour.
 - Subtitle: Body 14/22 R muted.
Right: primary button 240x48 (see buttons) aligned top; page-title width 868 + gap 24 + 240 = 1132.

## 5. Stat cards (dashboard)
Row: flex gap 16, width 1132, 4 cards each **271 wide** (4*271+3*16=1132). Card = `<a>` link: bg surface, border 1px `#3a3c50`, **radius 16**, padding 16, flex-col gap 8, inner width 239.
 - Heading row: flex gap 8 items-center; icon 16x16 + label Caption 12/18 R muted (213 wide).
 - Value: H2 24/34 Bold text colour.
 - Sub: Caption 12/18 R muted ("↑ 18% წინა პერიოდთან" uses plain muted, arrow glyph in text; no green/red colour).
Card height ~ 100 (16+18+8+34+8+18+16 = 118 incl. borders ~ 120).
Icons: `stat-campaign-16.svg`, `stat-team-16.svg`, `stat-qr-16.svg`, `stat-gift-16.svg`.

## 6. Cards / panels
- Standard panel: bg surface `#222437`, border 1px `#3a3c50`, radius 16, overflow clip, flex-col.
 - Padding 16 / gap 12 (table panels); padding 20 / gap 12 or 16 (chart & side panels, width 340 side, 768 main); padding 24 / gap 16 (content/detail panels, 768 main, inner 720).
 - Two-column layouts: main 768 + gap 24 + side 340 = 1132.
 - Panel title: H3 18/27 Bold text colour.
- Nested panel (e.g. 24, 30 status row): same surface+border+r16, padding 12 or 24.
- Media/hero block: bg elevated, radius 16, height 126 (dashboard) / 246 (detail), decorative circle (surface, 999 radius) clipped top-right, 44/62px bg-coloured r16 icon tile at (16,16), eyebrow Caption muted, title H3 text.
- Divider: 1px `#3a3c50`, full inner width.

## 7. Tables (e.g. "ბოლო კამპანიები", "კამპანიების სია", "შენახული სამუშაო")
Inside a panel (padding 16, gap 12, inner width 1100):
- Header row: bg elevated `#2b2d43`, radius 8, padding 10, gap 8, flex items-center; cells Caption 12/18 R muted. Column widths: **414 | 238 (227 on list pages) | 165 | 155** (+ 16px chevron slot with 8 gap at row end, header has no chevron cell; sum 414+238+165+155+3*8=996 + chevron/gap -> the rest is free space; keep fixed widths then right area free).
- Body row: `<a>` flex gap 8 items-center, **min-height 54**, padding 10, radius 8. Cells: col1 Label 14/22 M text colour (campaign name); other cols Body 14/22 R muted; empty value = "—" (em dash). End: chevron 16x16 `chevron-right-16.svg` (stroke 1.2, #AAA7C0).
- Row separator: 1px `#3a3c50` after EVERY row incl. last.
- Row hover/selected: not designed.
- Status in table is plain muted text, NOT a pill (e.g. "აქტიური", "მონახაზი", "დაგეგმილი").

## 8. Buttons (all 48 high, radius 12, padding 0 12, label centred, Label 14/22 M)
- **Primary**: bg `#7524c5`, no border, label `#f8f7ff`. Widths seen: 240 (page-title action), 300/356/248 etc. (fill container).
- **Secondary**: bg surface `#222437`, border 1px `#3a3c50`, label text colour. e.g. header "+ ახალი კამპანია" 202w.
- **Quiet**: bg elevated `#2b2d43`, no border, label text colour (used for the "pause/resume" action in 27/28; no destructive style exists in these frames).
- **Destructive**: not present in my frames (campaign pause uses Quiet). Define later if needed.
- Icon button: 44x44, bg surface, r12, 20px icon.
- Pill tab: height 44, radius 999, label Caption 12/18 R centred (top 13). Active: bg primary `#ad91ff`, label onPrimary `#0e121c`. Inactive: bg elevated, label text colour. Widths 108 / 138 / 142, gap 8.
- Full-width brand-lilac CTA (frame 57 only, off-pattern): 310x52 r12 bg primary `#ad91ff`, label 14 Bold onPrimary.

## 9. Inputs / badges / status pills
No text inputs, selects, or badges/pills appear in 04,05,24,27-30,57 (statuses are plain text; tabs are pill-shaped filters). Status mark tile: 36x36 r12 bg elevated with 20px icon (30) or 52x52 r16 with 26px icon (24). Inputs: see other specs (frames 31+ wizard).

## 10. Charts (style)
Bar chart: plot area bars fill primary `#ad91ff`, radius 8, width 29.12, highlighted/last bar fill chart `#ff91af`. Grid: 1px `#3a3c50` horizontal lines, y labels Caption muted right-aligned (x=38 right edge), x labels Caption muted centred.

## 11. Assets (public/figma/admin/)
nav-home-20, nav-campaign-20, nav-team-20, nav-chart-20, nav-gift-20, nav-settings-20, nav-profile-20, nav-logout-20 (20px) | stat-campaign-16, stat-team-16, stat-qr-16, stat-gift-16, chevron-right-16 (16px) | icon-coffee-32 | icon-check-20 | icon-chart-26 (identical to existing /figma/icon-chart-26.svg). Not downloaded on purpose: spark (AI Studio), theme (toggle), camera (AI card art). Logo = /figma/logo.png.
Other files in that folder (icon-activity-20, icon-gift-18, etc.) belong to other helpers.

## 12. Real-data mapping (admin context)
campaign = challenge with missions | participants = users who joined | QR ვიზიტი = check-ins (QR scans) | გაცემული ჯილდოები = vouchers issued | ბიზნესი name = sample only. Analytics numbers need source + timestamp; "unavailable" must not be shown as 0 (use "—").
