// Shared token for the prod password gate. The Edge middleware and the Node
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
