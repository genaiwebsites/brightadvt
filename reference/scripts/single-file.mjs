// Bundles dist/ into one self-contained HTML file (scripts, styles, fonts and
// images inlined) so the site can be previewed without a server.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, extname } from "node:path";

const dist = resolve(import.meta.dirname, "../dist");
const mime = { ".webp": "image/webp", ".woff2": "font/woff2", ".svg": "image/svg+xml" };
const dataUri = (p) =>
  `data:${mime[extname(p)]};base64,${readFileSync(resolve(dist, p)).toString("base64")}`;
const inlineMedia = (s) =>
  s
    .replace(/\.\/((?:img|logos|peeps)\/[\w.-]+\.webp)/g, (_, p) => dataUri(p))
    .replace(/(["'`])((?:img|logos|peeps)\/[\w.-]+\.webp)\1/g, (_, q, p) => q + dataUri(p) + q)
    .replace(/((?:img|logos|peeps)\/[\w.-]+\.webp)( \d+w)/g, (_, p, w) => dataUri(p) + w)
    .replace(/url\(((?:img|logos|peeps)\/[\w.-]+\.webp)\)/g, (_, p) => `url(${dataUri(p)})`);

let html = readFileSync(resolve(dist, "index.html"), "utf8");
html = html.replace(/<link rel="stylesheet" crossorigin href="\.\/(assets\/[^"]+\.css)">/, (_, p) => {
  const css = readFileSync(resolve(dist, p), "utf8").replace(/url\(\.\/([^)]+\.woff2)\)/g, (_, f) => `url(${dataUri("assets/" + f)})`);
  return `<style>${css}</style>`;
});
html = html.replace(/<script type="module" crossorigin src="\.\/(assets\/[^"]+\.js)"><\/script>/, (_, p) => {
  const js = inlineMedia(readFileSync(resolve(dist, p), "utf8")).replaceAll("</script", "<\\/script");
  return `<script type="module">${js}</script>`;
});
html = html.replace(/<link rel="preload"[^>]*>/g, "");
html = inlineMedia(html).replace('href="./favicon.svg"', `href="${dataUri("favicon.svg")}"`);

mkdirSync(resolve(dist, "../preview"), { recursive: true });
const out = resolve(dist, "../preview/bright-preview.html");
writeFileSync(out, html);
console.log("wrote", out, (html.length / 1e6).toFixed(2), "MB");
