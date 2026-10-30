# Prompt: migrate the Bright Advertising site to Astro with zero visual difference

> Paste everything below the line into Google Antigravity. Attach two things:
> 1. **`bright-source.zip`** (the original source project, unzipped into the workspace as `reference/`).
> 2. **`bright-preview.html`** (the single-file build, the visual reference to match).

---

## Role and goal

You are a senior frontend engineer doing a **lossless framework migration**. Port the website in `reference/` (Vite + React 19 + TypeScript + Tailwind CSS 4) to **Astro 5** so the result is **pixel-for-pixel and behaviour-for-behaviour identical** to `bright-preview.html`.

This is a port, not a redesign. **Do not** change any of these:
- copy
- spacing, colours or fonts
- animation timings, easing or interaction logic
- breakpoints
- component structure, unless the port strictly requires it

If something seems wrong or could be "improved", leave it exactly as it is and note it in your final report instead.

## Source of truth

- **Code:** `reference/src/**`, `reference/public/**`, `reference/index.html`, `reference/vite.config.ts`, `reference/package.json`. Port from this code. **Do not** reverse-engineer the minified `bright-preview.html`; it inlines everything as base64 and is a *visual reference only*.
- **Visual:** `bright-preview.html`. Open it in a browser. Your Astro build must look and behave the same.

## Current stack (match these versions; do not upgrade majors)

| Package | Version |
|---|---|
| react, react-dom | ^19.3.1 |
| motion (import path `motion/react`) | ^14.6.0 |
| lenis | ^1.3.27 |
| tailwindcss + @tailwindcss/vite | ^4.3.3 (Tailwind v4, CSS-first config via `@theme` in `src/styles.css`; there is **no** `tailwind.config.js`) |
| typescript | ^5.9 |

Add `astro` (latest 5.x) and `@astrojs/react`. Do **not** add `@astrojs/tailwind` (that's the Tailwind 3 integration). Use `@tailwindcss/vite` as a Vite plugin inside `astro.config.mjs`.

## Required architecture (this is what guarantees zero difference)

The current site is **one React tree** (`src/App.tsx`), rendered to static HTML at build time (`scripts/prerender.mjs` via `renderToString`) and then **hydrated** on the client (`src/main.tsx` uses `hydrateRoot`). Astro's React island with SSR and `client:load` does exactly the same thing. So:

1. Create `src/pages/index.astro` that renders **`<App client:load />`** as a **single island**. Do not split the page into many islands in this migration. The components share global state through `window` events (`bright:billboard-flip`), the global Lenis instance, `MotionConfig`, shared `layoutId` animations (Work lightbox, Nav pill) and the custom cursor. Splitting them would break these.
2. Copy `src/components/**`, `src/lib/**`, `src/content.ts`, `src/App.tsx`, `src/styles.css` and `src/fonts/**` **unchanged** into the Astro `src/` folder. Only make the edits listed in "Mandatory adjustments" below.
3. Delete what Astro replaces: `src/main.tsx`, `src/entry-server.tsx`, `scripts/prerender.mjs`, `index.html`, `vite.config.ts`.
4. Copy `public/**` unchanged (`img/`, `logos/`, `peeps/`, `favicon.svg`).
5. Output mode: `output: "static"`.

### Layout (`src/layouts/Base.astro`)

Reproduce `reference/index.html`'s `<head>` **exactly**:
- `<html lang="en-IN">`
- charset and viewport meta
- the same `<title>` and meta description
- `theme-color` `#f4f2ec`
- the og:title and og:description tags
- favicon `/favicon.svg`
- the preload for the Cabinet Grotesk 800 font. Point it at the **built** font URL by importing it: `import cg800 from "../fonts/cabinet-grotesk-800.woff2?url"`.
- The **inline bootstrap script**, copied character for character, marked **`is:inline`** so Astro doesn't bundle or defer it. It must run before first paint. It adds the class `js` to `<html>`, and adds `intro` on the first visit per session, using `sessionStorage` key `bright-intro`, unless the visitor has reduced motion on. All entrance animations and the preloader depend on these classes.

Import `../styles.css` in the layout frontmatter.

## Mandatory adjustments (and only these)

1. **Asset paths.** `src/lib/media.ts` currently returns paths *relative* to the page (`img/…`, no leading slash). That was for the single-file preview. In Astro, make it root-absolute: `export const asset = (p: string) => (p.startsWith("/") || p.startsWith("data:") ? p : "/" + p);`. Also search all components for hard-coded `"img/`, `"logos/` or `"peeps/` strings outside `asset()` (for example inside CSS `url()` or `srcSet`) and make them root-absolute too. Do not move or rename any asset.
2. **Fonts in CSS.** `src/styles.css` uses `@font-face … url("./fonts/xxx.woff2")`. Keep the fonts in `src/fonts/` so Vite fingerprints them, and confirm the relative URLs still resolve from `src/styles.css`. Verify in the built `dist/` that all **7** font files load: Cabinet Grotesk 500/700/800/900 and Switzer 400/500/600.
3. **`import.meta.env.VITE_FORM_ENDPOINT`** (in `Contact.tsx`). Astro only exposes `PUBLIC_`-prefixed variables to the client. Rename it to `PUBLIC_FORM_ENDPOINT` in both the code and `.env.example`. Keep the existing fallback: if it is unset, the form opens a `mailto:` to `contact@brightadvt.com`.
4. **Server-safe code.** The components already guard `window`, `matchMedia`, `IntersectionObserver`, `ResizeObserver`, canvas and WebGL inside `useEffect`/`useLayoutEffect`. Astro will server-render them. If any build-time error appears, fix it with the smallest possible guard (`typeof window === "undefined"`). **Do not** switch the island to `client:only`. That would remove the prerendered HTML, and the page must stay readable and indexable without JavaScript.
5. **Strict mode.** The original wraps `<App/>` in `<StrictMode>` in `main.tsx`. Keep the same double-invoke behaviour in development by wrapping `App`'s return in `<StrictMode>` inside an `AppRoot.tsx`, and render that as the island.

## Things that must keep working (checklist; test every one)

**Global**
- [ ] Lenis smooth scroll, driven from Motion's frame loop (`src/lib/smooth.ts`). Anchor links in the nav and footer scroll smoothly. The scroll pauses while the lightbox or mobile menu is open.
- [ ] First-visit preloader (letters rise, red dot drops and bounces), shown only once per browser session.
- [ ] Custom cursor: a red dot that grows into a "View" disc over work items. Fine pointers only.
- [ ] Every animation is disabled or simplified under `prefers-reduced-motion: reduce`.
- [ ] Text selection is red, the caret is red, and focus rings are red.

**Nav**
- [ ] On scroll the wordmark folds to "B." and the red dot slides in.
- [ ] Hovering the dot makes it hop.
- [ ] The active section pill slides between links (`layoutId="nav-pill"`).
- [ ] Full-screen mobile menu below 1024px.

**Hero**
- [ ] Headline lines rise in.
- [ ] One-line "Now open in Bengaluru" link.
- [ ] Magnetic CTA buttons with the red-disc fill and rolling label.
- [ ] **Billboard:**
  - 14-slat tri-vision flip every 5.2s, with a seamless face once settled.
  - Lamps flicker on.
  - Cursor glint and post-flip sheen.
  - Hanging "now showing" plate with the ring timer and pause button.
  - It dispatches the `bright:billboard-flip` window event.
- [ ] **Crowd canvas** (`Crowd.tsx`, sprite sheet `public/peeps/crowd2.webp` plus `src/components/crowd2-sheet.ts`):
  - Three tinted rows, body and head layers.
  - Walk bob and hip sway; standing people breathe.
  - Spring-driven head glances and look-backs.
  - People look up when the billboard flips.
  - Front-row heads follow the cursor.
  - On desktop the full crowd is visible on load without scrolling.

**Content sections**
- [ ] Client logo belt in full colour. It speeds up and reverses with scroll velocity.
- [ ] Manifesto words fill in on scroll. Hovering the four phrases shows image previews.
- [ ] Count-up stats.
- [ ] Work:
  - Justified two-row grid.
  - WebGL halftone reveal (`Halftone.tsx`).
  - Shared-element lightbox (`layoutId="work-…"`) with Esc to close and focus returned to the card.
- [ ] Services:
  - All rows **collapsed by default**.
  - The ink fill rises on row hover.
  - Click to expand one row at a time.
  - Each row has its animated SVG scene (`ServiceArt.tsx`, CSS classes `.sa-*` in `styles.css`).
- [ ] Process:
  - Railway track drawn from the measured layout.
  - The tram rides the path on scroll.
  - Stations light up.
  - The "Live." terminus with platform peeps hopping on arrival.
- [ ] Testimonials slider.
- [ ] FAQ:
  - Card accordion.
  - Two-peep conversation scene ("?" bubble, typing dots, "Sorted.").
  - Opening a question triggers the answer.
- [ ] Contact:
  - Dark section with channel chips.
  - Floating labels and validation messages.
  - Mailto fallback.

**Footer**
- [ ] Wordmark builds letter by letter, the dot bounces in, and four peeps drop onto the letters.
- [ ] Hovering the dot makes everyone jump. Idle hops between.
- [ ] A cyclist rides across, turns around off-screen, and returns with a fluttering pennant.

## Verification (mandatory; do not report done without it)

Build both versions and compare them automatically.

1. Serve the reference build (`cd reference && npm ci && npm run build && npx vite preview --port 4173`) and the Astro build (`npm run build && npx astro preview --port 4321`).
2. Write a Playwright script (`tests/parity.spec.ts`, using `pixelmatch` + `pngjs`) that, for **each viewport**: 1920×1080, 1440×900, 1440×760, 1280×720, 1024×768, 768×1024, 390×844:
   - Sets `sessionStorage['bright-intro']='1'` before load, so the preloader is skipped in both builds.
   - Emulates `reducedMotion: 'reduce'`, so canvases, marquees and timers are static and frames are deterministic.
   - Scrolls the full page in steps (to trigger reveals), then takes a **full-page screenshot** of each build.
   - Diffs the two images. Requirement: **≤ 0.1% differing pixels** (threshold 0.1). Save diff images to `tests/diff/`.
3. Repeat at 1440×900 **with motion on**, screenshotting fixed states (wait for the stated settle time):
   - hero after 4.5s
   - the Services section with row 2 expanded
   - the Work lightbox open
   - FAQ question 2 open
   - the footer after 4s

   Animated canvases (crowd, halftone) will differ frame to frame. For those states, mask the `<canvas>` elements and compare everything else.
4. Run a Lighthouse check (mobile) on the Astro build. Performance, Accessibility and SEO must be **≥ the reference build's scores**.
5. Confirm there are **zero console errors** and **no 404s** in the browser network log on both builds.
6. Confirm the page is readable with JavaScript disabled: the prerendered HTML contains all section text.

If any diff exceeds the limit, fix the cause and re-run. **Never** loosen the threshold to make a test pass.

## Deliverables

- A complete Astro project at the workspace root that runs with `npm install && npm run dev`, and builds with `npm run build` to `dist/`.
- `README.md` covering: run, build, deploy (static to Vercel, Netlify or any host), the `PUBLIC_FORM_ENDPOINT` variable, and where content lives (`src/content.ts`).
- `tests/parity.spec.ts`, plus a short `PARITY_REPORT.md` with the per-viewport diff percentages, the Lighthouse scores for both builds, and any deviations, each with its reason.
- Keep `scripts/sketch2svg.py`, `scripts/peeps-crowd.py`, `scripts/peeps-crowd2.py` and `scripts/trace-logo.cjs` (asset-generation tools; not part of the build).

## Hard rules

- Do not rewrite components in `.astro` syntax. Keep them as React `.tsx`, unchanged except for the mandatory adjustments.
- Do not swap libraries: Motion stays Motion, Lenis stays Lenis, and there is no GSAP, Framer Motion v10, or swapped Tailwind version.
- Do not "optimise" images, fonts or CSS in ways that change rendering (no automatic image conversion and no font subsetting).
- Do not change the copy, including placeholder copy.
- If you're unsure about anything, stop and ask rather than guess.
