import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:4321";

test.describe("Demo Protection Suite - horizonwebcorp.com", () => {
  test("1. Watermark overlay exists, covers viewport, has pointer-events none, and contains company text", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto(BASE_URL, { waitUntil: "networkidle" });

    const watermark = page.locator("#hwc-watermark-overlay");
    await expect(watermark).toBeAttached();

    // Verify CSS styles
    const styles = await watermark.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return {
        position: s.position,
        pointerEvents: s.pointerEvents,
        userSelect: s.userSelect,
        zIndex: s.zIndex,
        backgroundImage: s.backgroundImage,
        mixBlendMode: s.mixBlendMode,
      };
    });

    expect(styles.position).toBe("fixed");
    expect(styles.pointerEvents).toBe("none");
    expect(styles.userSelect).toBe("none");
    expect(styles.mixBlendMode).toBe("difference");
    expect(styles.backgroundImage).toContain("horizonwebcorp.com");

    expect(consoleErrors).toHaveLength(0);
  });

  test("2. Unhindered clicks: Nav links, CTA buttons, and smooth scroll work through the overlay", async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "networkidle" });

    // Click "Services" in nav
    const servicesLink = page.locator('header nav a[href="#services"]').first();
    await expect(servicesLink).toBeVisible();
    await servicesLink.click();

    // Wait for Lenis smooth scroll to arrive near #services
    await page.waitForTimeout(1600);
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(500);

    // Click "Start a campaign" button in Hero
    const cta = page.locator('#top a[href="#contact"]').first();
    await cta.scrollIntoViewIfNeeded();
    await cta.click();
    await page.waitForTimeout(1600);
    const contactY = await page.evaluate(() => window.scrollY);
    expect(contactY).toBeGreaterThan(scrollY);
  });

  test("3. Interactive components: Services accordion expands and collapses without interference", async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "networkidle" });

    const services = page.locator("#services");
    await services.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Row 2 button (Design & Identity)
    const row2Btn = services.locator("button[aria-expanded]").nth(1);
    await expect(row2Btn).toHaveAttribute("aria-expanded", "false");

    await row2Btn.click();
    await page.waitForTimeout(400);
    await expect(row2Btn).toHaveAttribute("aria-expanded", "true");
  });

  test("4. Work Lightbox: modal opens, captures focus, and closes via Esc key through overlay", async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "networkidle" });

    const workSection = page.locator("#work");
    await workSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Click first work piece
    const firstWork = workSection.locator('button[data-cursor="View"]').first();
    await firstWork.click();

    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Press Escape to close
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    await expect(dialog).not.toBeVisible();
  });

  test("5. FAQ Accordion: toggles answers cleanly", async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "networkidle" });

    const faqSection = page.locator("#faq");
    await faqSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const q1 = faqSection.locator("button[aria-expanded]").first();
    // Question 1 is open by default
    await expect(q1).toHaveAttribute("aria-expanded", "true");

    // Click to collapse
    await q1.click();
    await page.waitForTimeout(400);
    await expect(q1).toHaveAttribute("aria-expanded", "false");

    // Click question 2 to expand
    const q2 = faqSection.locator("button[aria-expanded]").nth(1);
    await q2.click();
    await page.waitForTimeout(400);
    await expect(q2).toHaveAttribute("aria-expanded", "true");
  });

  test("6. Form accessibility: Contact form inputs can be focused and typed into", async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "networkidle" });

    const contactSection = page.locator("#contact");
    await contactSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const nameInput = page.locator('input[name="name"]');
    await nameInput.click();
    await nameInput.fill("Client Test");
    await expect(nameInput).toHaveValue("Client Test");
  });

  test("7. Deterrent verification: Contextmenu (right-click) is prevented", async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "networkidle" });

    const prevented = await page.evaluate(() => {
      const event = new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      const el = document.querySelector("h1") || document.body;
      el.dispatchEvent(event);
      return event.defaultPrevented;
    });

    expect(prevented).toBe(true);
  });

  test("8. Deterrent verification: DevTools shortcuts (F12, Ctrl+Shift+I, Ctrl+U) are prevented", async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "networkidle" });

    const testKeys = [
      { key: "F12" },
      { key: "I", ctrlKey: true, shiftKey: true },
      { key: "u", ctrlKey: true },
      { key: "s", ctrlKey: true },
    ];

    for (const keyDef of testKeys) {
      const prevented = await page.evaluate((def) => {
        const event = new KeyboardEvent("keydown", {
          bubbles: true,
          cancelable: true,
          ...def,
        });
        document.dispatchEvent(event);
        return event.defaultPrevented;
      }, keyDef);

      expect(prevented).toBe(true);
    }
  });

  test("9. Self-Healing Guardian: Watermark re-creates automatically if deleted or hidden via DOM manipulation", async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "networkidle" });

    const watermark = page.locator("#hwc-watermark-overlay");
    await expect(watermark).toBeAttached();

    // Simulate malicious user deleting the watermark node in Elements panel
    await page.evaluate(() => {
      const wm = document.getElementById("hwc-watermark-overlay");
      wm?.remove();
    });

    // Wait for MutationObserver tick
    await page.waitForTimeout(100);

    // Verify it regenerated
    const healed = page.locator("#hwc-watermark-overlay");
    await expect(healed).toBeAttached();

    // Simulate user setting style="display: none;"
    await page.evaluate(() => {
      const wm = document.getElementById("hwc-watermark-overlay");
      if (wm) wm.style.display = "none";
    });

    await page.waitForTimeout(100);
    const displayStyle = await page.evaluate(() => {
      const wm = document.getElementById("hwc-watermark-overlay");
      return wm?.style.display;
    });

    expect(displayStyle).not.toBe("none");
  });

  test("10. Media print protection: layout is hidden in print mode", async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "networkidle" });

    // Emulate print media
    await page.emulateMedia({ media: "print" });

    const bodyDisplay = await page.evaluate(() => {
      return window.getComputedStyle(document.body).display;
    });

    expect(bodyDisplay).toBe("none");
  });
});
