// Renders the app to static HTML at build time so the page is readable and
// indexable before any JavaScript runs.
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const { render } = await import(pathToFileURL(resolve(root, "dist-ssr/entry-server.js")).href);
const file = resolve(root, "dist/index.html");
const html = readFileSync(file, "utf8").replace("<!--app-->", render());
writeFileSync(file, html);
rmSync(resolve(root, "dist-ssr"), { recursive: true, force: true });
console.log("prerendered", file);
