import { HelpCircle } from "lucide-react";

/**
 * The abstention rail — the credibility move. When a source is silent on a
 * number, we say so out loud rather than guessing. A wrong euro figure repeated
 * to a CEO kills the pitch; a visible "needs human lookup" builds trust.
 */
export function Abstain({ claim, reason }: { claim: string; reason: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2">
      <HelpCircle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
      <div className="text-[13px] leading-snug">
        <span className="font-medium">{claim}</span>
        <span className="text-muted-foreground"> — {reason}</span>
      </div>
    </div>
  );
}
