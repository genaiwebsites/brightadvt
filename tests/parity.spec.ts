import { test, expect, type Page } from "@playwright/test";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";

const REF_BASE = "http://localhost:4173";
const ASTRO_BASE = "http://localhost:4321";

const VIEWPORTS = [
  { width: 1920, height: 1080, name: "1920x1080" },
  { width: 1440, height: 900, name: "1440x900" },
  { width: 1440, height: 760, name: "1440x760" },
  { width: 1280, height: 720, name: "1280x720" },
  { width: 1024, height: 768, name: "1024x768" },
  { width: 768, height: 1024, name: "768x1024" },
  { width: 390, height: 844, name: "390x844" },
];

const DIFF_DIR = path.resolve(process.cwd(), "tests/diff");

// Helper to normalize images if dimensions differ slightly
function alignImages(img1: PNG, img2: PNG) {
  const width = Math.max(img1.width, img2.width);
  const height = Math.max(img1.height, img2.height);

  const norm1 = new PNG({ width, height });
  const norm2 = new PNG({ width, height });

  // Fill default background (#f4f2ec: 244, 242, 236, 255)
  for (let i = 0; i < width * height * 4; i += 4) {
    norm1.data[i] = 244;
    norm1.data[i + 1] = 242;
    norm1.data[i + 2] = 236;
    norm1.data[i + 3] = 255;

    norm2.data[i] = 244;
    norm2.data[i + 1] = 242;
    norm2.data[i + 2] = 236;
    norm2.data[i + 3] = 255;
  }

  PNG.bitblt(img1, norm1, 0, 0, img1.width, img1.height, 0, 0);
  PNG.bitblt(img2, norm2, 0, 0, img2.width, img2.height, 0, 0);

  return { norm1, norm2, width, height };
}

function diffBuffers(buf1: Buffer, buf2: Buffer, diffName: string) {
  const raw1 = PNG.sync.read(buf1);
  const raw2 = PNG.sync.read(buf2);

  const { norm1, norm2, width, height } = alignImages(raw1, raw2);
  const diff = new PNG({ width, height });

  const numDiffPixels = pixelmatch(norm1.data, norm2.data, diff.data, width, height, {
    threshold: 0.1,
  });

  const totalPixels = width * height;
  const diffPercent = (numDiffPixels / totalPixels) * 100;

  fs.mkdirSync(DIFF_DIR, { recursive: true });
  fs.writeFileSync(path.join(DIFF_DIR, `${diffName}.png`), PNG.sync.write(diff));
  fs.writeFileSync(path.join(DIFF_DIR, `${diffName}-ref.png`), buf1);
  fs.writeFileSync(path.join(DIFF_DIR, `${diffName}-astro.png`), buf2);

  return { numDiffPixels, totalPixels, diffPercent };
}

async function preparePage(page: Page, options: { reducedMotion?: "reduce" | "no-preference" } = {}) {
  const consoleErrors: string[] = [];
  const notFoundUrls: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  page.on("response", (res) => {
    if (res.status() === 404) {
      notFoundUrls.push(res.url());
    }
  });

  await page.addInitScript(() => {
    sessionStorage.setItem("bright-intro", "1");
    // Deterministic PRNG for reducedMotion / visual parity
    let s = 123456789;
    (window as any).__resetPrng = (seed = 123456789) => {
      s = seed;
    };
    Math.random = () => {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };
  });

  if (options.reducedMotion) {
    await page.emulateMedia({ reducedMotion: options.reducedMotion });
  }

  return { consoleErrors, notFoundUrls };
}

async function scrollFullPageSteps(page: Page) {
  await page.evaluate(async () => {
    const step = 300;
    const max = document.body.scrollHeight;
    for (let y = 0; y <= max; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 20)));
    }
    for (let y = max; y >= 0; y -= step) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 20)));
    }
    window.scrollTo(0, 0);
  });

  await page.waitForTimeout(400);
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  // Ensure mouse cursor is parked away so no hover states are active
  await page.mouse.move(-100, -100);
}

test.describe("Parity - Reduced Motion Full Page", () => {
  for (const vp of VIEWPORTS) {
    test(`full page match at ${vp.name}`, async ({ browser }) => {
      const refContext = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const astroContext = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });

      const refPage = await refContext.newPage();
      const astroPage = await astroContext.newPage();

      const refLogs = await preparePage(refPage, { reducedMotion: "reduce" });
      const astroLogs = await preparePage(astroPage, { reducedMotion: "reduce" });

      await refPage.goto(REF_BASE, { waitUntil: "networkidle" });
      await astroPage.goto(ASTRO_BASE, { waitUntil: "networkidle" });

      await scrollFullPageSteps(refPage);
      await scrollFullPageSteps(astroPage);

      const refShot = await refPage.screenshot({ fullPage: true });
      const astroShot = await astroPage.screenshot({ fullPage: true });

      await refContext.close();
      await astroContext.close();

      expect(refLogs.consoleErrors).toEqual([]);
      expect(refLogs.notFoundUrls).toEqual([]);
      expect(astroLogs.consoleErrors).toEqual([]);
      expect(astroLogs.notFoundUrls).toEqual([]);

      const result = diffBuffers(refShot, astroShot, `fullpage-${vp.name}`);
      console.log(`Viewport ${vp.name} diff: ${result.diffPercent.toFixed(4)}% (${result.numDiffPixels}/${result.totalPixels})`);
      expect(result.diffPercent).toBeLessThanOrEqual(0.1);
    });
  }
});

test.describe("Parity - Motion On Interactive States (1440x900)", () => {
  const vp = { width: 1440, height: 900 };

  test("hero after 4.5s", async ({ browser }) => {
    const refContext = await browser.newContext({ viewport: vp });
    const refPage = await refContext.newPage();
    await preparePage(refPage, { reducedMotion: "no-preference" });
    await refPage.goto(REF_BASE, { waitUntil: "domcontentloaded" });
    await refPage.evaluate(() => document.fonts.ready);
    await refPage.waitForTimeout(4500);
    const maskLocatorRef = await refPage.locator("canvas").all();
    const refShot = await refPage.locator("#top").screenshot({ mask: maskLocatorRef });
    await refContext.close();

    const astroContext = await browser.newContext({ viewport: vp });
    const astroPage = await astroContext.newPage();
    await preparePage(astroPage, { reducedMotion: "no-preference" });
    await astroPage.goto(ASTRO_BASE, { waitUntil: "domcontentloaded" });
    await astroPage.evaluate(() => document.fonts.ready);
    await astroPage.waitForTimeout(4500);
    const maskLocatorAstro = await astroPage.locator("canvas").all();
    const astroShot = await astroPage.locator("#top").screenshot({ mask: maskLocatorAstro });
    await astroContext.close();

    const result = diffBuffers(refShot, astroShot, "motion-hero-4.5s");
    console.log(`Hero after 4.5s diff: ${result.diffPercent.toFixed(4)}%`);
    expect(result.diffPercent).toBeLessThanOrEqual(0.1);
  });

  test("Services row 2 expanded", async ({ browser }) => {
    const refContext = await browser.newContext({ viewport: vp });
    const astroContext = await browser.newContext({ viewport: vp });
    const refPage = await refContext.newPage();
    const astroPage = await astroContext.newPage();

    await preparePage(refPage, { reducedMotion: "no-preference" });
    await preparePage(astroPage, { reducedMotion: "no-preference" });

    await refPage.goto(REF_BASE, { waitUntil: "networkidle" });
    await astroPage.goto(ASTRO_BASE, { waitUntil: "networkidle" });

    // Scroll to services
    await refPage.locator("#services").scrollIntoViewIfNeeded();
    await astroPage.locator("#services").scrollIntoViewIfNeeded();
    await refPage.waitForTimeout(600);
    await astroPage.waitForTimeout(600);

    // Expand row 2 (index 1)
    await refPage.locator("#services button[aria-expanded]").nth(1).click();
    await astroPage.locator("#services button[aria-expanded]").nth(1).click();

    await refPage.waitForTimeout(1000);
    await astroPage.waitForTimeout(1000);

    const maskLocatorRef = await refPage.locator("canvas").all();
    const maskLocatorAstro = await astroPage.locator("canvas").all();

    const refShot = await refPage.locator("#services").screenshot({ mask: maskLocatorRef });
    const astroShot = await astroPage.locator("#services").screenshot({ mask: maskLocatorAstro });

    await refContext.close();
    await astroContext.close();

    const result = diffBuffers(refShot, astroShot, "motion-services-row2");
    console.log(`Services row 2 diff: ${result.diffPercent.toFixed(4)}%`);
    expect(result.diffPercent).toBeLessThanOrEqual(0.1);
  });

  test("Work lightbox open", async ({ browser }) => {
    const refContext = await browser.newContext({ viewport: vp });
    const astroContext = await browser.newContext({ viewport: vp });
    const refPage = await refContext.newPage();
    const astroPage = await astroContext.newPage();

    await preparePage(refPage, { reducedMotion: "no-preference" });
    await preparePage(astroPage, { reducedMotion: "no-preference" });

    await refPage.goto(REF_BASE, { waitUntil: "networkidle" });
    await astroPage.goto(ASTRO_BASE, { waitUntil: "networkidle" });

    await refPage.locator("#work").scrollIntoViewIfNeeded();
    await astroPage.locator("#work").scrollIntoViewIfNeeded();
    await refPage.waitForTimeout(600);
    await astroPage.waitForTimeout(600);

    // Click first work piece to open lightbox
    await refPage.locator('#work button[data-cursor="View"]').first().click();
    await astroPage.locator('#work button[data-cursor="View"]').first().click();

    await refPage.waitForTimeout(1000);
    await astroPage.waitForTimeout(1000);

    const maskLocatorRef = await refPage.locator("canvas").all();
    const maskLocatorAstro = await astroPage.locator("canvas").all();

    const refShot = await refPage.locator('div[role="dialog"]').screenshot({ mask: maskLocatorRef });
    const astroShot = await astroPage.locator('div[role="dialog"]').screenshot({ mask: maskLocatorAstro });

    await refContext.close();
    await astroContext.close();

    const result = diffBuffers(refShot, astroShot, "motion-work-lightbox");
    console.log(`Work lightbox diff: ${result.diffPercent.toFixed(4)}%`);
    expect(result.diffPercent).toBeLessThanOrEqual(0.1);
  });

  test("FAQ question 2 open", async ({ browser }) => {
    const refContext = await browser.newContext({ viewport: vp });
    const astroContext = await browser.newContext({ viewport: vp });
    const refPage = await refContext.newPage();
    const astroPage = await astroContext.newPage();

    await preparePage(refPage, { reducedMotion: "no-preference" });
    await preparePage(astroPage, { reducedMotion: "no-preference" });

    await refPage.goto(REF_BASE, { waitUntil: "networkidle" });
    await astroPage.goto(ASTRO_BASE, { waitUntil: "networkidle" });

    await refPage.locator("#faq").scrollIntoViewIfNeeded();
    await astroPage.locator("#faq").scrollIntoViewIfNeeded();
    await refPage.waitForTimeout(600);
    await astroPage.waitForTimeout(600);

    // Click question 2 (index 1)
    await refPage.locator("#faq button[aria-expanded]").nth(1).click();
    await astroPage.locator("#faq button[aria-expanded]").nth(1).click();

    await refPage.waitForTimeout(1000);
    await astroPage.waitForTimeout(1000);

    const maskLocatorRef = await refPage.locator("canvas").all();
    const maskLocatorAstro = await astroPage.locator("canvas").all();

    const refShot = await refPage.locator("#faq").screenshot({ mask: maskLocatorRef });
    const astroShot = await astroPage.locator("#faq").screenshot({ mask: maskLocatorAstro });

    await refContext.close();
    await astroContext.close();

    const result = diffBuffers(refShot, astroShot, "motion-faq-q2");
    console.log(`FAQ question 2 diff: ${result.diffPercent.toFixed(4)}%`);
    expect(result.diffPercent).toBeLessThanOrEqual(0.1);
  });

  test("footer after 4s", async ({ browser }) => {
    const refContext = await browser.newContext({ viewport: vp });
    const refPage = await refContext.newPage();
    await preparePage(refPage, { reducedMotion: "no-preference" });
    await refPage.goto(REF_BASE, { waitUntil: "networkidle" });
    await refPage.evaluate(() => (window as any).__resetPrng?.(123456789));
    await refPage.locator("footer").scrollIntoViewIfNeeded();
    await refPage.waitForTimeout(4000);
    const maskLocatorRef = await refPage.locator("canvas").all();
    const refShot = await refPage.locator("footer").screenshot({ mask: maskLocatorRef });
    await refContext.close();

    const astroContext = await browser.newContext({ viewport: vp });
    const astroPage = await astroContext.newPage();
    await preparePage(astroPage, { reducedMotion: "no-preference" });
    await astroPage.goto(ASTRO_BASE, { waitUntil: "networkidle" });
    await astroPage.evaluate(() => (window as any).__resetPrng?.(123456789));
    await astroPage.locator("footer").scrollIntoViewIfNeeded();
    await astroPage.waitForTimeout(4000);
    const maskLocatorAstro = await astroPage.locator("canvas").all();
    const astroShot = await astroPage.locator("footer").screenshot({ mask: maskLocatorAstro });
    await astroContext.close();

    const result = diffBuffers(refShot, astroShot, "motion-footer-4s");
    console.log(`Footer after 4s diff: ${result.diffPercent.toFixed(4)}%`);
    expect(result.diffPercent).toBeLessThanOrEqual(0.1);
  });
});

test("No-JS SSR readability test", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(ASTRO_BASE, { waitUntil: "domcontentloaded" });

  const bodyText = await page.locator("body").innerText();
  expect(bodyText).toContain("Advertising");
  expect(bodyText).toContain("made simple");
  expect(bodyText).toContain("Life Insurance Corporation of India");
  expect(bodyText).toContain("SBI Card");
  expect(bodyText).toContain("Keventer");
  expect(bodyText).toContain("Now open in Bengaluru");
  expect(bodyText).toContain("contact@brightadvt.com");
  expect(bodyText).toContain("90512 33310");

  await context.close();
});

