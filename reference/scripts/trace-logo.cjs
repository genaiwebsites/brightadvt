// Traces the scraped Bright wordmark PNG into a clean SVG (black glyphs + exact red dot).
const potrace = require('potrace');
const path = require('path');
const fs = require('fs');
const src = path.join(__dirname, '../raw/logo-x4-black.png');
potrace.trace(src, { threshold: 128, turdSize: 40, optTolerance: 0.4, alphaMax: 1.1 }, (err, svg) => {
  if (err) throw err;
  fs.writeFileSync(path.join(__dirname, '../raw/logo-traced.svg'), svg);
  console.log('ok', svg.length);
});
