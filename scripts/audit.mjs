import { chromium } from "@playwright/test";
import lighthouse from "lighthouse";

async function audit(url, label) {
  console.log(`Starting Lighthouse audit for ${label} (${url})...`);
  const browser = await chromium.launch({
    args: ["--remote-debugging-port=9222"],
  });

  const options = {
    port: 9222,
    logLevel: "error",
    output: "json",
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    formFactor: "mobile",
    screenEmulation: {
      mobile: true,
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      disabled: false,
    },
    throttlingMethod: "provided",
  };

  const runnerResult = await lighthouse(url, options);
  await browser.close();

  const report = runnerResult.lhr;
  const categories = report.categories;

  const scores = {
    Performance: Math.round((categories.performance?.score || 0) * 100),
    Accessibility: Math.round((categories.accessibility?.score || 0) * 100),
    "Best Practices": Math.round((categories["best-practices"]?.score || 0) * 100),
    SEO: Math.round((categories.seo?.score || 0) * 100),
  };

  console.log(`\n=== Results for ${label} ===`);
  console.table(scores);
  return scores;
}

async function main() {
  const refScores = await audit("http://localhost:4173", "Reference (Vite + React 19)");
  const astroScores = await audit("http://localhost:4321", "Astro 5 (Static + Island)");

  console.log("\n=== Final Score Comparison ===");
  console.table({
    "Reference (Vite)": refScores,
    "Astro 5": astroScores,
  });
}

main().catch(console.error);

