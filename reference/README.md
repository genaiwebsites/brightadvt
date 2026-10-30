# Bright Advertising — website

Single-page site for brightadvt.com. All copy, logos and images were taken from the current site (`raw/` holds the originals).

## Run

```bash
npm install
npm run dev          # local development
npm run build        # static, prerendered build in dist/ (deploy anywhere: Vercel, Netlify, S3, cPanel)
npm run preview:file # optional: one self-contained HTML file in preview/
```

## Contact form

Set `VITE_FORM_ENDPOINT` (e.g. a Formspree form URL) before building and the form posts there as JSON.
Without it, submitting opens the visitor's email app addressed to contact@brightadvt.com.

## Stack

Vite, React 19, TypeScript, Tailwind CSS 4, Motion, Lenis. One hand-written WebGL shader (`src/components/Halftone.tsx`).

Type system (self-hosted, Fontshare, free for commercial use): Cabinet Grotesk (display), Zodiak italic (editorial emphasis), Switzer (text).

Illustrations: Open Peeps by Pablo Stanley (CC0), rendered from the supplied Sketch library with
`python3 scripts/sketch2svg.py <unzipped .sketch> <out>`, then rasterised to `public/peeps/`. The hero crowd is a sprite sheet (`public/peeps/crowd.webp`) of 79 unique figures recombined from the library's poses, heads, faces, facial hair and accessories by `scripts/peeps-crowd.py`.
The page is rendered to static HTML at build time (`scripts/prerender.mjs`), so it reads and indexes without JavaScript.

## Where things live

- `src/content.ts` — every piece of copy and media on the page
- `src/components/Hero.tsx`, `Billboard.tsx`, `Crowd.tsx` — tri-vision billboard and the walking crowd
- `src/components/Logo.tsx`, `Preloader.tsx`, `Footer.tsx` — per-letter animated wordmark
- `src/components/Process.tsx` — scroll-drawn path
- `src/components/Halftone.tsx` — print-halftone reveal for campaign images
- `src/components/Work.tsx` — portfolio grid and shared-element lightbox
- `src/styles.css` — design tokens (colour, type, easing) and motion rules, including reduced-motion fallbacks
