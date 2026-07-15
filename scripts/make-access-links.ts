/**
 * make-access-links.ts — print one unlock-and-tag link per recipient.
 *
 *   node --env-file=.env.local --experimental-strip-types scripts/make-access-links.ts
 *   # or: npm run access:links
 *
 * Reads ACCESS_TOKEN_SECRET + RECIPIENT_MAP from the env and prints, for each
 * recipient code, a single link of the form <BASE_URL>/?k=<code>~<sig>. That link
 * opens the demo (no password page) AND tags who opened it in /usage. Send just the
 * link — no separate "Password:" line (which trips spam/phishing filters).
 *
 * ACCESS_TOKEN_SECRET must be the SAME value here and in Vercel, or prod links won't
 * verify. RECIPIENT_MAP is the same JSON /usage uses. BASE_URL defaults to
 * https://stg.valent.dk (override with BASE_URL=... for local testing).
 *
 * The token format below is intentionally identical to src/lib/gate.ts (HMAC-SHA256
 * over the code, base64url, first 27 chars) — verified byte-for-byte. If you change
 * one, change the other, or existing links stop verifying.
 */
import { createHmac } from "node:crypto";

function makeAccessToken(secret: string, code: string): string {
  const sig = createHmac("sha256", secret).update(code).digest("base64url").slice(0, 27);
  return `${code}~${sig}`;
}

const secret = process.env.ACCESS_TOKEN_SECRET;
if (!secret) {
  console.error("ACCESS_TOKEN_SECRET is not set. Add it to .env.local (and Vercel), then re-run.");
  process.exit(1);
}

const base = (process.env.BASE_URL || "https://stg.valent.dk").replace(/\/+$/, "");

let map: Record<string, string>;
try {
  map = JSON.parse(process.env.RECIPIENT_MAP || "{}");
} catch {
  console.error("RECIPIENT_MAP is not valid JSON.");
  process.exit(1);
}

const codes = Object.keys(map);
if (codes.length === 0) {
  console.error('RECIPIENT_MAP is empty. Set e.g. RECIPIENT_MAP={"10":"STG CEO"}');
  process.exit(1);
}

const rows = codes.map((code) => {
  const token = makeAccessToken(secret, code);
  return {
    label: `${map[code]} (${code})`,
    // App link (lands on the home page) and video link (lands on the walkthrough,
    // whose "open the live prototype" CTA carries the same tag+cookie into the app).
    // Both tag the opener in /usage; send the video link as the single email CTA.
    appLink: `${base}/?k=${token}`,
    videoLink: `${base}/video?k=${token}`,
  };
});

console.log(`\nAccess links  ·  ${base}\n`);
for (const r of rows) {
  console.log(r.label);
  console.log(`  video  ${r.videoLink}`);
  console.log(`  app    ${r.appLink}`);
  console.log("");
}
