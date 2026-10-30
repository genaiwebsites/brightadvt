# Bright Advertising — Astro 5 Website

Production-grade, single-page site for [brightadvt.com](https://brightadvt.com), migrated to **Astro 5** with strict pixel-for-pixel and behaviour-for-behaviour parity.

Prerendered to static HTML at build time for optimal SEO, Core Web Vitals, and no-JS readability, with client-side hydration for smooth scrolling, interactive 3D billboard mechanics, dynamic crowd canvas simulation, and fluid animations.

---

## Quick Start

### Prerequisites
- **Node.js**: v18.17+ or v20+ / v22+
- **npm** or preferred package manager

### Development
```bash
# Install dependencies
npm install

# Start local Astro development server
npm run dev
# -> Opens http://localhost:4321
```

### Production Build & Preview
```bash
# Build static site to dist/
npm run build

# Preview the production static output locally
npm run preview
# -> Serves dist/ on http://localhost:4321
```

---

## Testing & Visual Parity

The project includes an automated visual regression and parity test suite powered by [Playwright](https://playwright.dev/) and `pixelmatch`, diffing the Astro build against the reference build across 7 responsive viewports and key interactive motion states.

```bash
# Run the automated parity test suite
npm run test
# or: npx playwright test
```

Diff images and side-by-side screenshots are generated into `tests/diff/`. See `PARITY_REPORT.md` for full verification details.

---

## Configuration & Environment Variables

### Contact Form Endpoint (`PUBLIC_FORM_ENDPOINT`)

The contact form in `src/components/Contact.tsx` supports posting JSON to an external webhook or form service (such as Formspree, Formkeep, or custom API).

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Set your form endpoint:
   ```env
   PUBLIC_FORM_ENDPOINT=https://formspree.io/f/your_form_id
   ```
3. **Fallback behavior**: If `PUBLIC_FORM_ENDPOINT` is not configured, the form seamlessly falls back to opening the visitor's default email client addressed to `contact@brightadvt.com` with pre-filled subject and inquiry details.

---

## Content Management

All website copy, client logos, campaign imagery, manifesto text, services list, testimonials, FAQs, and contact info live in a single centralized TypeScript module:

```
src/content.ts
```

Updating text, swapping logos, or adding work items can be done cleanly within this file without altering component rendering or animation mechanics.

---

## Project Architecture & Tech Stack

- **Framework**: [Astro 5](https://astro.build/) (`output: "static"`)
- **UI & Islands**: [React 19](https://react.dev/) via `@astrojs/react` (`<AppRoot client:load />`)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/vite` (configured via `@theme` in `src/styles.css`)
- **Motion & Physics**: [Motion 14](https://motion.dev/) (`motion/react`)
- **Smooth Scroll**: [Lenis](https://lenis.darkroom.engineering/) integrated into Motion's frame loop
- **Graphics & Canvas**: Custom WebGL halftone reveal shader (`src/components/Halftone.tsx`) and sprite-based canvas crowd simulation (`src/components/Crowd.tsx`)
- **Typography**: Self-hosted Fontshare fonts (Cabinet Grotesk and Switzer in `src/fonts/`) fingerprinted automatically by Vite during build.

---

## Deployment Guide

The output in `dist/` is 100% static HTML, CSS, JavaScript, fonts, and images. It can be hosted on any static hosting platform or CDN.

### 1. Vercel
Connect your repository to Vercel:
- **Framework Preset**: Astro
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**: Add `PUBLIC_FORM_ENDPOINT` if using custom form submission.

Alternatively, deploy via Vercel CLI:
```bash
npx vercel --prod
```

### 2. Netlify
Connect your repository to Netlify:
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- Configure `PUBLIC_FORM_ENDPOINT` under Site Settings > Environment Variables.

Or deploy via Netlify CLI:
```bash
npx netlify deploy --prod --dir=dist
```

### 3. Cloudflare Pages
- **Framework Preset**: Astro
- **Build Command**: `npm run build`
- **Build Output Directory**: `dist`

### 4. GitHub Pages / Static S3 / Nginx / Apache
Upload the contents of the `dist/` directory directly to your web server root or S3 bucket configured for static website hosting.

---

## Scripts & Asset Generation Tools

The `scripts/` directory retains all original illustration and asset processing pipelines:
- `scripts/sketch2svg.py`: Extracts SVG layers from Open Peeps `.sketch` sources.
- `scripts/peeps-crowd.py`: Assembles crowd sprite sheets from individual Open Peeps assets.
- `scripts/peeps-crowd2.py`: Generates the updated crowd composition and coordinate mappings.
- `scripts/trace-logo.cjs`: Vectorizes and processes client logos.

