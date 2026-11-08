# KadoBot — Design Direction

**Status:** Sections 1–10 are draft directions. **Section 11 (Design Tokens v1.0) is approved and supersedes them** wherever they differ (palette B, Vazirmatn, token values). Confirmed (✅): modern, warm, friendly, trustworthy, premium, personal and enjoyable; created from scratch; no copying or generic dashboard templates; Persian/RTL/mobile-first from the start.

## 1. Brand Personality (💡)
Like a thoughtful friend who remembers everything: **warm, attentive, a little playful, never pushy.** Premium through restraint and polish, not luxury clichés.
- Voice: friendly, simple Persian; informal-polite (محاوره‌ای محترمانه); no hype or guilt ("you forgot!").
- Avoid: corporate dashboard feel, cartoonish party clichés, aggressive sales tone.

## 2. Visual Design Principles
1. **Person first:** the people (avatars/initials, names) are the main characters, not tables.
2. **One clear action per screen.**
3. **Generous space, soft shapes:** large radii, calm layouts.
4. **Delight in small moments:** gentle motion when adding an occasion, a subtle gift-reveal for results (respect reduced-motion).
5. **Trust cues:** clear privacy copy, honest "price may change" notes.
6. **Distinctive but simple:** a recognizable motif (💡 idea: a ribbon/bow curve or a "gift tag" shape used for cards and dividers) rather than stock illustrations.

## 3. Color Direction (superseded by §11: Palette B — Soft Coral was chosen)
Three candidate palettes, to choose from or mix:

| Option | Mood | Base idea |
|---|---|---|
| A. "Warm Ribbon" | warm, premium | cream background, deep berry/plum primary, apricot accent |
| B. "Soft Coral" | friendly, playful | off-white background, coral primary, deep teal secondary |
| C. "Evergreen Gift" | trustworthy, calm | warm white, deep green primary, gold-ish accent |

💡 My leaning: **A or a blend of A/C** — warm without looking childish, trusted without looking like a bank. Exact hex values are intentionally not set yet; I'll propose swatches with contrast checks after you pick a direction.
Rules: one primary, one accent, neutrals warm-tinted; semantic colors (success/error/warn) separate; all text contrast ≥ 4.5:1; color is never the only signal. Dark mode: Future.

## 4. Typography Recommendations
- **Persian:** 💡 **Vazirmatn** (open source, wide weights, supports Latin, Persian and Arabic-script digits, good screen legibility). Alternatives: Estedad (more modern/character), IRANSans (⚠ license—check before use), Shabnam, Sahel.
- **Latin:** a friendly geometric/humanist sans that harmonizes with Persian x-height, e.g. Inter or Plus Jakarta Sans — or just rely on Vazirmatn's Latin to keep it simple (💡 start with this).
- **Display/brand headings:** optional single expressive font for logo/hero (e.g. Estedad or Lalezar-style), used sparingly.
- Self-host via `next/font` for speed/privacy (no external Google calls ❓ if access is restricted).
- Sizes: body ≥ 16px on mobile; Persian needs ~1.6–1.8 line-height (taller than Latin).
- **Digits:** 💡 Persian digits (۰-۹) in the UI for Persian text; ensure consistent formatting for prices (thousands separators, currency label «ریال» (✅ Rial)).

## 5. Persian and Latin Font Considerations
- Mixed text (brand names, URLs, "iPhone") needs correct bidi handling: wrap with `<bdi>`/`dir="auto"`.
- Don't use letter-spacing on Persian (breaks joining).
- No italics for Persian; use weight for emphasis.
- Avoid uppercase styling (meaningless for Persian).
- Check that fonts include ZWNJ (نیم‌فاصله) support, and keep it in content.
- Fallback stack to system fonts for robustness.

## 6. RTL Design Principles
- `<html lang="fa" dir="rtl">` globally.
- Use **logical** CSS (Tailwind `ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`), never `left/right` unless intentional.
- Mirror directional icons (arrows, back, chevrons); do **not** mirror logos, play icons, clocks, or checkmarks.
- Progress, sliders, steppers and carousels go right→left.
- Numbers and phone/email inputs stay LTR (`dir="ltr"`) inside RTL forms, right-aligned appropriately.
- Product is Persian-only (✅); English is not planned. Still avoid needless hard-coding of direction (use logical properties).
- Test every screen in RTL first, not as an afterthought.

## 7. Component Design Principles
- Small, consistent set: Button, Input, Select/Chips, Date picker (Jalali), Card, Sheet/Modal, Toast, Avatar, EmptyState, Skeleton, ProductCard, OccasionCard.
- Touch targets ≥ 44×44px; thumb-friendly bottom actions.
- All states designed: default, hover, focus, disabled, loading, error, empty.
- Forms: labels always visible, errors in Persian next to the field, never rely on placeholders.
- Design tokens (colors, radii, spacing, type) defined once in Tailwind config; no one-off magic values.
- Product cards: fixed image ratio, price emphasized, store name visible, clear "go to store".
- Build components only when used at least twice or clearly needed.

## 8. Mobile-First Layout Strategy
- Design at 360–390px width first; scale up to tablet/desktop with a centered max-width container.
- Bottom navigation (Home · People · Gifts · Profile) on mobile — 💡 limited to ≤4 items; sidebar/top-nav on desktop.
- Primary actions reachable by thumb; sheets instead of full-page modals.
- Content-first lists, avoid dense tables.
- Performance: optimized images (`next/image`), minimal JS, skeleton loading.
- PWA-ready: safe-area insets, theme-color, manifest, app icons (later).

## 9. Accessibility Considerations
- WCAG 2.1 AA target: contrast, focus rings, keyboard navigation, semantic HTML, ARIA only when needed.
- Correct `lang` and `dir`; screen-reader labels in Persian.
- Respect `prefers-reduced-motion`.
- Text can scale to 200% without breaking layout.
- Error messages are descriptive and associated to fields.
- Don't rely on color alone for status; alt text for product images.

## 10. Next Design Steps (steps 1–2 done in §11; step 3 = §11.7)
1. You choose palette direction (A/B/C/blend) and mood references.
2. I propose a small token set (colors, type scale, radii) with contrast checks.
3. Build a one-page "style tile" in the app (no features) to review in the browser on a phone.

---

# 11. Design Tokens v1.0 — سیستم توکن‌های طراحی

**Status:** Approved Direction — Implementation Ready

**Design Decisions:**
- Color Palette: B — Soft Coral
- Typography: Vazirmatn
- Border Radius: Soft & Rounded
- Layout Density: Balanced
- Language: Persian (fa)
- Direction: RTL
- Design Priority: Mobile First
- Accessibility: WCAG 2.1 AA

این بخش، تصمیم‌های نهایی مرحله دوم طراحی کادوبات را مشخص می‌کند. تمام کامپوننت‌ها و صفحات محصول باید از این توکن‌ها استفاده کنند تا یکپارچگی بصری و قابلیت توسعه محصول حفظ شود.

## 11.1 Color Tokens

### Brand Colors

| Token | HEX | Usage |
|---|---|---|
| Primary | `#B94E48` | Primary buttons, main actions, brand identity |
| Primary Hover | `#A9433E` | Hover and pressed states |
| Secondary | `#174F50` | Secondary actions and trust elements |
| Accent | `#F3B6A5` | Decorative elements and soft highlights |

### Neutral Colors

| Token | HEX | Usage |
|---|---|---|
| White | `#FFFFFF` | Cards and surfaces |
| Background | `#FAF8F5` | Main application background |
| Surface | `#F4EDE8` | Secondary backgrounds |
| Border | `#E8DED8` | Dividers and borders |
| Text Muted | `#756B66` | Secondary text |
| Text Body | `#514943` | Body text |
| Text Heading | `#30272D` | Headings and important text |

### Semantic Colors

| Token | HEX | Usage |
|---|---|---|
| Success | `#347653` | Success states |
| Error | `#B54747` | Error states |
| Warning | `#A96724` | Warning states |
| Info | `#386B91` | Informational states |

**Rules:**
- Primary is the main brand color.
- Secondary supports trust and visual balance.
- Accent must be used sparingly.
- Semantic colors must remain independent of brand colors.
- Color must never be the only indicator of status.

## 11.2 Typography Tokens

**Primary Font:** Vazirmatn Variable

Use Vazirmatn for both Persian and Latin text wherever possible.

| Token | Size | Weight |
|---|---:|---:|
| Display | 32px | 700 |
| H1 | 28px | 700 |
| H2 | 24px | 700 |
| H3 | 20px | 600 |
| H4 | 18px | 600 |
| Body Large | 18px | 400 |
| Body | 16px | 400 |
| Body Small | 14px | 400 |
| Caption | 12px | 400 |
| Button | 16px | 500 |

**Typography Rules:**
- Persian line-height: 1.6–1.8.
- Minimum mobile body text: 16px.
- Use Persian digits in Persian UI.
- Support ZWNJ (نیم‌فاصله).
- Never apply letter-spacing to Persian text.
- Use font weight instead of italics for emphasis.
- Handle mixed RTL/LTR content correctly.

## 11.3 Border Radius Tokens

Design Direction: Soft & Rounded.

| Token | Value | Usage |
|---|---:|---|
| XS | 6px | Badges |
| SM | 10px | Inputs |
| MD | 14px | Buttons |
| LG | 18px | Cards |
| XL | 24px | Feature cards |
| 2XL | 28px | Modals and sheets |
| Full | 9999px | Avatars and chips |

**Rule:** Rounded shapes should feel friendly and premium, never childish.

## 11.4 Spacing Tokens

Base spacing unit: 4px.

| Token | Value |
|---|---:|
| Space 1 | 4px |
| Space 2 | 8px |
| Space 3 | 12px |
| Space 4 | 16px |
| Space 5 | 20px |
| Space 6 | 24px |
| Space 8 | 32px |
| Space 10 | 40px |
| Space 12 | 48px |
| Space 16 | 64px |

**Layout Density:** Balanced.

Avoid both excessive whitespace and crowded interfaces.

## 11.5 Accessibility & Contrast

Target: WCAG 2.1 AA.

| Color Combination | Approx. Contrast Ratio |
|---|---:|
| White on Primary | 4.95:1 |
| White on Secondary | 9.25:1 |
| Heading on Background | 13.63:1 |
| Body on Background | 8.31:1 |
| Muted on Background | 4.89:1 |

**Requirements:**
- Normal text contrast: minimum 4.5:1.
- Large text contrast: minimum 3:1.
- UI component boundaries and meaningful graphical elements: minimum 3:1 where applicable.
- Visible keyboard focus.
- Reduced motion support.
- Screen-reader compatibility.
- Text scaling up to 200%.

All final component states and color combinations must be verified before production release.

### 11.5.1 Verified Contrast Addendum (calculated with the WCAG formula)

The table above is correct. These additional combinations were calculated and **impose usage rules**:

| Combination | Ratio | Result | Rule |
|---|---:|---|---|
| White on Primary Hover | 5.90:1 | Pass | OK for text |
| Primary on Background (text/links/icons) | 4.67:1 | Pass | OK for text |
| Success / Error / Info on Background | 5.13 / 5.01 / 5.38:1 | Pass | OK for text |
| **Warning on Background** | **4.26:1** | **Fails 4.5 for normal text** | Use only for large text (≥18.66px bold / 24px) or icons with a text label. For small warning text use Text Body color with a warning icon/border instead. |
| **Text Muted on Surface** | **4.47:1** | **Fails 4.5 (marginally)** | Use Text Muted only on White or Background. On Surface use Text Body. |
| **Border on Background** | **1.25:1** | **Fails 3:1** | Fine for decorative dividers and card edges. **Input and control boundaries must not rely on Border alone**: use a darker control-border or a visible fill/focus treatment (≥3:1). A control-border token must be defined and approved at implementation (see open item below). |
| **Accent on Background** | **1.64:1** | Decorative only | Never use Accent for text, icons that carry meaning, or boundaries. |

**✅ Approved by owner:** token `border-control` = `#8A7E78`, for input and control boundaries. Verified contrast: 3.94:1 on White, 3.71:1 on Background (both ≥3:1, pass WCAG 1.4.11). Not for text. Use it in code only via the token, not as a raw hex.

## 11.6 Implementation Rules

- Define design tokens centrally.
- Use CSS variables as the source of truth.
- Map tokens to Tailwind theme variables.
- Avoid hardcoded colors and spacing values inside individual components.
- Use logical CSS properties for RTL compatibility.
- Keep the design system clean and maintainable (Persian-only ✅; English not planned).
- Build reusable components only when needed.

### Recommended Project Structure

(Aligned with `CLAUDE.md`, which uses a `src/` folder. Create folders only when they hold a real file.)

```text
src/
  app/
    globals.css        <- CSS variables (tokens) + Tailwind mapping
    layout.tsx         <- lang="fa" dir="rtl", Vazirmatn
    page.tsx
  components/
    ui/
    layout/
    cards/

public/
  fonts/               <- only if Vazirmatn is self-hosted as a file

docs/
  DESIGN_DIRECTION.md  <- this file (single source of truth)
```

### Implementation Technology

- Next.js
- React
- TypeScript
- Tailwind CSS
- Vazirmatn Variable

**Note:** Tailwind configuration must match the installed major version (v3 or v4). Installing packages still requires explicit approval per `CLAUDE.md`.

## 11.7 Next Step — Style Tile

After implementing the tokens, build a dedicated Design System Preview page.

The page must demonstrate:

1. Brand color palette.
2. Typography scale.
3. Buttons and input fields.
4. Cards and occasion components.
5. Border radius and spacing.
6. Badges and semantic states.
7. RTL behavior.
8. Mobile and desktop responsiveness.

No actual product features should be implemented at this stage.

**Acceptance Criteria:**
- All tokens are implemented and reusable.
- Persian RTL is the default.
- Typography is consistent.
- Color contrast passes WCAG requirements (including the rules in §11.5.1).
- The page works at 360–390px mobile widths.
- The design is ready for visual review before building product screens.
