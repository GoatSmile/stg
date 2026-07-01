// Shared token for the prod password gate. The Edge proxy and the Node
// route both compute the same SHA-256 of SITE_PASSWORD, so the auth cookie can
// be validated without storing the raw password in the cookie. Web Crypto is
// available in both runtimes. This gates a public-data demo (no secrets behind
// it) — a shared password the owner emails with the link, not real auth.
export const GATE_COOKIE = "varsel_gate";

export async function gateToken(secret: string): Promise<string> {
  const data = new TextEncoder().encode(`varsel-gate:${secret}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ── Access-link tokens ───────────────────────────────────────────────────────
// A forwardable, per-recipient unlock link: /?k=<code>~<sig>. The proxy verifies
// the HMAC over <code> with ACCESS_TOKEN_SECRET, then unlocks (sets the gate cookie)
// and rewrites to /?v=<code> so the existing UsageTracker tags who opened it. This
// lets one link both open the demo AND identify the recipient, with no separate
// "password:" line in the email (which reads as phishing). Same low-stakes model as
// the shared password: whoever holds the link gets in (public-data demo, no secrets
// behind it). Web Crypto works in both the Edge proxy and Node (the link-generator
// script), so this one implementation serves both.
function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return b64url(new Uint8Array(mac)).slice(0, 27); // ~160 bits, unguessable
}

export async function makeAccessToken(secret: string, code: string): Promise<string> {
  return `${code}~${await sign(secret, code)}`;
}

// Returns the recipient code if the token's signature checks out, else null.
export async function verifyAccessToken(secret: string, token: string): Promise<string | null> {
  const sep = token.lastIndexOf("~");
  if (sep <= 0) return null;
  const code = token.slice(0, sep);
  const sig = token.slice(sep + 1);
  const expected = await sign(secret, code);
  if (sig.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0 ? code : null;
}
