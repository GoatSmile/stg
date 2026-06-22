// Render every docs/*.md to a print-ready A4 PDF with "Page X of Y" baked into
// the footer — so they print numbered from any service (e.g. the Princh kiosk),
// independent of the print dialog. Markdown has no pages; the numbers are added
// here by the print engine (your installed Chrome/Brave), not stored in the .md.
//
//   npm run docs:pdf            → regenerates docs/print/*.pdf
//   CHROME_PATH=/path npm run docs:pdf   → use a specific Chromium-family browser
//
// Dev-only: uses marked (md→html) + puppeteer-core driving your system browser
// (no Chromium download). Output (docs/print/) is gitignored.

import { readFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import puppeteer from "puppeteer-core";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DOCS = join(ROOT, "docs");
const OUT = join(DOCS, "print");

function findBrowser() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ];
  return candidates.find((p) => existsSync(p));
}

const CHROME = findBrowser();
if (!CHROME) {
  console.error(
    "No Chromium-family browser found. Install Chrome/Brave/Edge, or set CHROME_PATH=/path/to/browser.",
  );
  process.exit(1);
}

const css = `
  @page { size: A4; margin: 22mm 18mm 20mm 18mm; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; font-size: 10.5pt;
         line-height: 1.5; color: #1c1a17; max-width: none; }
  h1 { font-size: 19pt; margin: 0 0 4pt; } h2 { font-size: 14pt; margin: 16pt 0 4pt;
       border-bottom: 1px solid #e7e1d8; padding-bottom: 3pt; } h3 { font-size: 11.5pt; margin: 12pt 0 3pt; }
  h1,h2,h3 { break-after: avoid; } table,pre,blockquote,li { break-inside: avoid; }
  table { border-collapse: collapse; width: 100%; font-size: 9pt; margin: 6pt 0; }
  th,td { border: 1px solid #d9d2c7; padding: 4pt 6pt; text-align: left; vertical-align: top; }
  th { background: #f3efe8; }
  code { background: #f3efe8; padding: 0 3px; border-radius: 3px; font-size: 9pt; }
  pre { background: #f3efe8; padding: 8pt; border-radius: 5px; overflow-x: auto; font-size: 8.5pt; }
  blockquote { border-left: 3px solid #950b31; margin: 6pt 0; padding: 2pt 0 2pt 10pt; color: #3a352f; }
  a { color: #950b31; text-decoration: none; } img { max-width: 100%; }
`;
// darker grays so the numbers stay crisp on a black/white printer
const footerBase = `<div style="font-size:8.5pt; width:100%; padding:0 18mm; color:#444;
  display:flex; justify-content:space-between;"><span>__TITLE__</span>
  <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`;
const header = `<div style="font-size:7.5pt; width:100%; padding:0 18mm; color:#777; text-align:right;">
  Varsel for STG — docs · printed <span class="date"></span></div>`;

const files = readdirSync(DOCS).filter((f) => f.endsWith(".md")).sort();
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
let ok = 0;
for (const f of files) {
  try {
    const md = readFileSync(join(DOCS, f), "utf8");
    const title = (md.match(/^#\s+(.+)$/m)?.[1] ?? basename(f, ".md")).replace(/[<>&]/g, "");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
      <style>${css}</style></head><body>${marked.parse(md)}</body></html>`;
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.pdf({
      path: join(OUT, f.replace(/\.md$/, ".pdf")),
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: header,
      footerTemplate: footerBase.replace("__TITLE__", title),
      margin: { top: "22mm", bottom: "20mm", left: "0", right: "0" },
    });
    await page.close();
    console.log("  ✓", f.replace(/\.md$/, ".pdf"));
    ok++;
  } catch (e) {
    console.error("  ✗", f, "—", e.message);
  }
}
await browser.close();
console.log(`\nDone: ${ok}/${files.length} → ${OUT}  (browser: ${CHROME})`);
