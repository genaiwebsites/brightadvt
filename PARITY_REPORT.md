# Parity Verification & Audit Report

**Project**: Bright Advertising Website Migration (Vite + React 19 -> Astro 5)  
**Date**: October 30, 2026  
**Status**: **100% Passed (Strict Parity Verified)**  
**Threshold Target**: $\le 0.1\%$ difference across all viewports and motion states

---

## 1. Executive Summary

The migration from Vite + React 19 to Astro 5 (`output: "static"` with single client island `<AppRoot client:load />`) has been completed with **zero visual regressions, zero console errors, zero 404 network requests**, and **strict pixel-for-pixel and behaviour-for-behaviour parity**.

- **Playwright Visual Parity Tests**: **13 / 13 passed**
- **Full-Page Viewports**: All 7 viewports achieved $\le 0.0052\%$ pixel difference (with 3 viewports achieving **0.0000%** / absolute 0-pixel diff).
- **Interactive Motion States**: All 5 dynamic states achieved $\le 0.0817\%$ difference (with Work Lightbox achieving **0.0000%**).
- **Lighthouse Scores**: Astro 5 matched or outperformed the reference build across all categories (SEO improved from 92 to **100**; Performance improved from 75 to **76**).
- **No-JS SSR Readability**: Fully validated; all critical brand content, client names, and contact details are present in the static prerendered HTML without client JavaScript.

---

## 2. Visual Parity Test Results

Automated regression suite run with Playwright + `pixelmatch` (threshold 0.1). Comparison against reference build served from `reference/` on port 4173.

### A. Full Page Diffs (Reduced Motion)

Full-page screenshots taken after stepped scrolling to trigger IntersectionObserver reveals across all sections.

| Viewport | Device / Form Factor | Reference Dimensions | Diff Pixels | Diff Percentage | Threshold | Status |
|---|---|---|---|---|---|---|
| **1920 × 1080** | Large Desktop | 1920 × 12,565 | **0** | **0.0000%** | $\le 0.1\%$ | **PASS** |
| **1440 × 900** | Desktop Standard | 1440 × 11,749 | **0** | **0.0000%** | $\le 0.1\%$ | **PASS** |
| **1440 × 760** | Desktop Widescreen | 1440 × 11,589 | **0** | **0.0000%** | $\le 0.1\%$ | **PASS** |
| **1280 × 720** | Small Laptop / 720p | 1280 × 11,285 | 215 | **0.0015%** | $\le 0.1\%$ | **PASS** |
| **1024 × 768** | Tablet Landscape | 1024 × 10,978 | 290 | **0.0026%** | $\le 0.1\%$ | **PASS** |
| **768 × 1024** | Tablet Portrait | 768 × 11,823 | 469 | **0.0052%** | $\le 0.1\%$ | **PASS** |
| **390 × 844** | Mobile (iPhone 14) | 390 × 14,905 | 184 | **0.0032%** | $\le 0.1\%$ | **PASS** |

*All diff images and side-by-side screenshots are generated into `tests/diff/`.*

### B. Interactive Motion States (1440 × 900, Motion Enabled)

Captured with `prefers-reduced-motion: no-preference` after settling:

| Interactive State | Target Element | Wait / Settle Time | Diff Percentage | Threshold | Status |
|---|---|---|---|---|---|
| **Hero after 4.5s** | `#top` | 4,500 ms | **0.0009%** | $\le 0.1\%$ | **PASS** |
| **Services Row 2 Expanded** | `#services` | 1,000 ms post-click | **0.0817%** | $\le 0.1\%$ | **PASS** |
| **Work Lightbox Open** | `div[role="dialog"]` | 1,000 ms post-click | **0.0000%** | $\le 0.1\%$ | **PASS** |
| **FAQ Question 2 Open** | `#faq` | 1,000 ms post-click | **0.0097%** | $\le 0.1\%$ | **PASS** |
| **Footer after 4s** | `footer` | 4,000 ms post-scroll | **0.0015%** | $\le 0.1\%$ | **PASS** |

### C. No-JS SSR Readability Test
- **Status**: **PASS** (174 ms)
- Confirmed full text content rendered in initial static response:
  - "Advertising"
  - "made simple"
  - "Life Insurance Corporation of India"
  - "SBI Card"
  - "Keventer"
  - "Now open in Bengaluru"
  - "contact@brightadvt.com"
  - "90512 33310"

---

## 3. Lighthouse Audit Comparison (Mobile)

Audits run via Lighthouse 12.3 under mobile emulation (390 × 844, 2× DPR, simulated mobile viewport):

| Category | Reference Build (Vite) | Astro 5 Build | Parity / Delta |
|---|---|---|---|
| **Performance** | 75 | **76** | **+1** (Astro $\ge$ Reference) |
| **Accessibility** | 96 | **96** | **Equal** |
| **Best Practices** | 100 | **100** | **Equal** |
| **SEO** | 92 | **100** | **+8** (Astro $\ge$ Reference) |

---

## 4. Console & Network Integrity

Audited via automated Playwright listeners across both Reference and Astro production preview builds:

- **Console Errors**:
  - Reference: `0`
  - Astro 5: `0`
- **404 Failed Requests**:
  - Reference: `0`
  - Astro 5: `0`
- **Font Assets**: Verified in `dist/_astro/`:
  - `cabinet-grotesk-500.*.woff2`
  - `cabinet-grotesk-700.*.woff2`
  - `cabinet-grotesk-800.*.woff2`
  - `cabinet-grotesk-900.*.woff2`
  - `switzer-400.*.woff2`
  - `switzer-500.*.woff2`
  - `switzer-600.*.woff2`
  - All 7 fingerprinted font files loaded successfully without 404s.

---

## 5. Technical Deviations & Implementation Notes

All modifications strictly adhered to the mandatory adjustments specified in `ASTRO_MIGRATION_PROMPT.md`:

1. **Asset Paths**:
   - `src/lib/media.ts` updated to root-absolute path resolution:
     ```ts
     export const asset = (p: string) => (p.startsWith("/") || p.startsWith("data:") ? p : "/" + p);
     ```
   - All references to `img/`, `logos/`, and `peeps/` in components resolved to root-absolute URLs.
2. **Environment Variables**:
   - Renamed `VITE_FORM_ENDPOINT` to `PUBLIC_FORM_ENDPOINT` in `src/components/Contact.tsx`.
   - `.env.example` created documenting `PUBLIC_FORM_ENDPOINT`.
   - Maintained native `mailto:` fallback behavior when unconfigured.
3. **Strict Mode Island**:
   - Created `src/AppRoot.tsx` wrapping `<App />` in `<StrictMode>` to preserve development double-mount lifecycle behavior.
   - Mounted as a single cohesive island in `src/pages/index.astro`: `<AppRoot client:load />`.
4. **Layout & Head Integrity**:
   - `src/layouts/Base.astro` reproduces the exact meta tags, og properties, favicon, preloaded font (`cg800`), and character-for-character bootstrap script with `is:inline` for `sessionStorage["bright-intro"]`.
5. **Deterministic Testing Details**:
   - `Crowd.tsx` uses `Math.random()` to generate peep coordinates and characteristics. In `tests/parity.spec.ts`, a lightweight deterministic Linear Congruential Generator (LCG) seed was injected via `page.addInitScript()` to ensure the sprite layout is bit-for-bit identical between Reference and Astro builds during full-page regression tests.

