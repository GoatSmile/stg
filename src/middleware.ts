import { NextResponse, type NextRequest } from "next/server";
import { GATE_COOKIE, gateToken } from "@/lib/gate";

// Prod password gate. Active only when SITE_PASSWORD is set (so local dev and
// any environment without it stay open). Unauthenticated requests are redirected
// to the styled /gate page; the password page + its POST handler are always
// allowed through. Authenticated requests (valid cookie) — including the
// client-side /api/feeds/* fetches — pass, because the cookie rides along.
// /gate + its POST handler must be reachable to log in. /opengraph-image is a
// public, no-data share card — it stays open so forwarded-link previews still
// render once prod is gated (the app behind it still needs the password).
const ALWAYS_ALLOW = ["/gate", "/api/gate", "/opengraph-image", "/_vercel"];

export async function middleware(req: NextRequest) {
  const pw = process.env.SITE_PASSWORD;
  if (!pw) return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (ALWAYS_ALLOW.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(GATE_COOKIE)?.value;
  if (cookie && cookie === (await gateToken(pw))) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/gate";
  url.search = "";
  // Preserve the full path + query so a forwarded deep-link (?lens=, ?event=)
  // survives the login round-trip — the gate's same-site guards (leading "/" only)
  // still hold for "/impact?event=fr-ban", and new URL(dest, req.url) re-attaches it.
  url.searchParams.set("from", pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  // Run on everything except Next internals + static asset files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)"],
};
