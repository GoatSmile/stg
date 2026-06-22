"use client";

// DocSend-style engagement tracking for the forwarded demo. Cookieless: the
// per-recipient tag comes from the link (?v=yulia) and is held in sessionStorage
// (not a cookie → no consent banner). On each page it logs a "view", and on
// leave/visibility-hidden it logs a "dwell" (time on that page) via sendBeacon.
// Country is added server-side from Vercel's geo header. Fire-and-forget — it can
// never break or block the page. Only authenticated (post-gate) visits reach the
// write endpoint, because the gate cookie rides along with the request.

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function recipient(): string | null {
  try {
    return sessionStorage.getItem("varsel_v");
  } catch {
    return null;
  }
}

// Read the ?v= tag once, stash it, then strip it from the address bar so the
// recipient sees a clean URL (nothing that reads as "tracking"). Use opaque
// codes (?v=13) — they're meaningless to the viewer and gone a beat after load.
// Other params (?lens=, ?event=) are preserved.
function captureTag() {
  try {
    const url = new URL(window.location.href);
    const v = url.searchParams.get("v");
    if (!v) return;
    sessionStorage.setItem("varsel_v", v.slice(0, 40));
    url.searchParams.delete("v");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  } catch {
    /* ignore */
  }
}

function sessionId(): string {
  try {
    let s = sessionStorage.getItem("varsel_s");
    if (!s) {
      s = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem("varsel_s", s);
    }
    return s;
  } catch {
    return "na";
  }
}

function device(): "mobile" | "desktop" {
  try {
    const uaMobile = (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData?.mobile;
    if (typeof uaMobile === "boolean") return uaMobile ? "mobile" : "desktop";
    return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? "mobile" : "desktop";
  } catch {
    return "desktop";
  }
}

function send(event: "view" | "dwell", path: string, dwellMs: number, beacon: boolean) {
  try {
    const body = JSON.stringify({
      event,
      path,
      dwellMs,
      recipient: recipient(),
      session: sessionId(),
      device: device(),
      referrer: document.referrer || null,
    });
    if (beacon && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    /* never surface */
  }
}

export function UsageTracker() {
  const pathname = usePathname();
  const curPath = useRef("");
  const enteredAt = useRef(0);

  // Capture + strip the ?v= tag once, before any event is sent.
  useEffect(() => {
    captureTag();
  }, []);

  useEffect(() => {
    const now = Date.now();
    // SPA navigation: close out time on the previous page before opening the new one.
    if (curPath.current && enteredAt.current) {
      send("dwell", curPath.current, now - enteredAt.current, true);
    }
    curPath.current = pathname;
    enteredAt.current = now;
    // Prefer sendBeacon for the view too (fall back to fetch). A keepalive fetch to
    // /api/track gets dropped by privacy browsers/shields (Brave) that let the beacon
    // through — observed in prod as dwells landing but views never arriving, which
    // would zero out the "Opens" column. sendBeacon is the more reliable primitive here.
    send("view", pathname, 0, true);

    const flush = () => {
      if (curPath.current && enteredAt.current) {
        send("dwell", curPath.current, Date.now() - enteredAt.current, true);
        enteredAt.current = Date.now(); // reset so a return visit counts fresh
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, [pathname]);

  return null;
}
