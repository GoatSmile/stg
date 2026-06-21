"use client";

import { useCallback, useEffect, useState } from "react";
import { Sparkles, RefreshCw, CircleCheck } from "lucide-react";
import { CitationChip } from "./CitationChip";

type ValidatedLineItem = {
  claim: string;
  value: string | null;
  sourceRef: string | null;
  status: "cited" | "abstained";
  reason: string | null;
};

type AiResponse = {
  mode: "live" | "offline";
  model: string;
  fallback?: boolean;
  narrative: string;
  lineItems: ValidatedLineItem[];
};

export function AiRead({
  eventId,
  assumptions,
}: {
  eventId: string;
  assumptions: Record<string, number>;
}) {
  const [data, setData] = useState<AiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const key = JSON.stringify({ eventId, assumptions });

  const run = useCallback(async () => {
    setLoading(true);
    setError(false);
    // Client-side backstop: the route serves the golden at its ~9s SDK timeout, so
    // a 12s abort only fires if the whole function hangs — the spinner can never
    // last forever on flaky wifi. !res.ok routes a platform 504/5xx to the retry UI
    // instead of trying to JSON-parse an error/HTML body.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch("/api/ai/impact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ eventId, assumptions }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`AI route responded ${res.status}`);
      const json = (await res.json()) as AiResponse;
      setData(json);
      setGeneratedKey(JSON.stringify({ eventId, assumptions }));
    } catch {
      setError(true);
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }, [eventId, assumptions]);

  // Initial read on mount, and a fresh read whenever the threat changes.
  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const stale = data != null && generatedKey !== key;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Sparkles className="size-4 text-primary" aria-hidden="true" />
        <h3 className="text-sm font-medium">AI read</h3>
        {data && (
          <span
            className={
              data.mode === "live"
                ? "inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400"
                : "inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400"
            }
            title={
              data.mode === "live"
                ? `Live call to ${data.model}`
                : data.fallback
                  ? "Live call unavailable — serving the cached golden response"
                  : "Offline mode — serving the cached golden response"
            }
          >
            {data.mode === "live"
              ? `live · ${data.model}`
              : data.fallback
                ? "offline · cached (live unavailable)"
                : "offline · cached"}
          </span>
        )}
        {stale && !loading && (
          <button
            onClick={run}
            className="ml-auto inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <RefreshCw className="size-3" aria-hidden="true" /> re-run for current assumptions
          </button>
        )}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Generating the scenario read…</p>}

      {error && !loading && (
        <p className="text-sm text-muted-foreground">
          Couldn&apos;t reach the AI route.{" "}
          <button onClick={run} className="underline underline-offset-2">
            retry
          </button>
        </p>
      )}

      {data && !loading && (
        <>
          <p className="text-sm leading-relaxed">{data.narrative}</p>
          <ul className="flex flex-col gap-1.5">
            {data.lineItems.map((li, i) => (
              <li key={i} className="text-[13px]">
                {li.status === "cited" ? (
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <CircleCheck className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    <span className="text-muted-foreground">{li.claim}</span>
                    {li.value && <span className="tabular-nums">{li.value}</span>}
                    {li.sourceRef && <CitationChip sourceRef={li.sourceRef} />}
                  </span>
                ) : (
                  <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-amber-700 dark:text-amber-400">
                    <span className="font-medium">{li.claim}</span>
                    <span className="text-muted-foreground">— {li.reason}</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-muted-foreground">
            Every figure above is value-matched to the curated corpus at the route layer; anything
            unsourced is abstained, not guessed. The band itself is the local model, not the AI.
          </p>
        </>
      )}
    </div>
  );
}
