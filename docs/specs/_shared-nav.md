# Shared chrome: tab-screen top bar + bottom navigation (dark)
Used by 06, 07, 33 (and other tab screens 17, 18, 22, 24, 25, 27, 52). Frame = 390x844. Tokens per docs/figma-dark-frames.md.
Ignore the 42px fake status bar (9:41 / battery) and the theme-switch moon icon (removed).

## Vertical structure (390x844 frame)
- 0-42: status bar (omit; real device provides it). App bar occupies y 42-91 in Figma (49px tall, bg #0e121c). In app: header height 49px.
- Scroll area: top 90 (Figma) to 768 (flat nav, 06) / to bottom (floating nav). Page content padding 20, gap 20, width 350.
- On 07/33/08/05/32 the page-content panel (bg #0e121c) starts 58px below the app bar, exposing the curves backdrop (`/figma/bg-curves.png`, 390x754 at y=90, identical file to existing bg-curves.png) in that 58px strip -> use `CurvesBackdrop`. On 06 content starts at top 0 (no backdrop strip).

## Tab-screen top bar (App bar variant "tabs": no back button)
- Height 49px, bg bg (#0e121c). (A 1px #242934 line sits at y=55, outside the 49px clip, i.e. invisible.)
- Left: BEFAMOUS brand link at left 20, top 5, 155x44: logo mark 29x29 at (0,7) (`/figma/logo.png`), text "BEFAMOUS" Label (14/22 M) white at left 38 top 10. Link: 06 -> 06 (signed in) / 01 (signed out).
- Right: two 44x44 icon buttons, radius 12, bg bg (#0e121c), icon 20x20 at (12,12):
  - left 286 (top 5): search icon `/figma/icon-search.svg` -> screen 08.  aria-label "ძებნა"
  - left 334 (top 5): bell icon `/figma/icon-bell.svg` -> screen 24. aria-label "შეტყობინებები" (right edge 378 = 12px margin; gap 4 between buttons)
  - (a theme-switch button sits at left 238 in Figma: REMOVE.)
- Icon stroke colour is muted (#aaa7c0) in the SVGs.
- Back-variant app bar (08 etc.): 44x44 back button left 12 top 5, bg surface, r12, icon-back.svg 20 at (12,12); brand at left 64.

## Bottom navigation - two variants drawn in Figma (INCONSISTENT; see ambiguity)
Items (left->right): მთავარი -> 06 | ძებნა -> 07 | აქტივობა -> 17 | ჯილდო -> 22 | პროფილი -> 25.
Icons (all stroke #aaa7c0 regardless of state): home `/figma/nav-home.svg`, discover `/figma/nav-discover.svg`, activity `/figma/nav-activity.svg`, gift `/figma/nav-gift.svg`, profile `/figma/nav-profile.svg` (21x21). Labels are Caption 12/18 R, white, centered.

### Variant A: flat bar (frame 06)
- Absolute at top 768, 390x76, bg surface, 1px top border (border token) full width. overflow clip.
- 5 items each 74x62, radius 12, top 5, lefts 4 / 82 / 160 / 238 / 316 (4px gap).
- Item internals: icon 21x21 at left 26 top 8; label centered at x=37 (width 72) top 35.
- Active item: bg elevated; + indicator bar 18x3, bg primary (#ad91ff), radius 999, at left 28 top 55 (inside item). Inactive: transparent, no bar.
- 06: active = მთავარი.

### Variant B: floating pill (frames 07, 33)
- Absolute at left 15.6, top 762.08 (12px from bottom), 358.8x69.92, radius 20, bg surface, 1px border #45475c, drop shadow 0 5px 8px rgba(13,10,31,0.32).
- 5 items each 68.08x57.04, radius 11.04, top 3.6, lefts 2.68 / 74.44 / 146.2 / 217.96 / 289.72.
- Item internals: icon 19.32x19.32 at left 23.92 top 7.36 (use `/figma/nav-float-*.svg`: home/discover/activity/gift/profile, 19.32px versions, or scale the 21px ones to 19.32); label 11.04/16.56 R white centered at x=34.04 (width 66.24) top 32.2.
- Active: indicator bar 16.56x2.76 primary radius 999 at left 25.76 top 50.6. In 33 the active item (ძებნა) also has bg elevated; in 07 it has the bar only (no bg).
- 07, 33: active = ძებნა.
- Recommendation: implement ONE component; use Variant B look (newer, later frames) with active = elevated bg + primary bar, unless the integrator prefers A for consistency with 06. Content bottom padding must clear the nav (>= 100px for B, 76px for A).
