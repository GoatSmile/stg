import { NextResponse, type NextRequest } from "next/server";
import { GATE_COOKIE, gateToken } from "@/lib/gate";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const pw = process.env.SITE_PASSWORD;
  const form = await req.formData();
  const entered = String(form.get("password") ?? "");
  const fromRaw = String(form.get("from") ?? "/");
  // Only allow same-site relative redirects (no open-redirect via ?from=).
  const dest = fromRaw.startsWith("/") && !fromRaw.startsWith("//") ? fromRaw : "/";

  if (!pw || entered !== pw) {
    const url = req.nextUrl.clone();
    url.pathname = "/gate";
    url.search = "";
    url.searchParams.set("from", dest);
    url.searchParams.set("error", "1");
    return NextResponse.redirect(url, { status: 303 });
  }

  const res = NextResponse.redirect(new URL(dest, req.url), { status: 303 });
  res.cookies.set(GATE_COOKIE, await gateToken(pw), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
