import { Link2 } from "lucide-react";

/**
 * Inline source reference — the citation rail. Every published number in the
 * Impact Room carries one. If a value has no source, it abstains (see Abstain),
 * it does not show a bare chip.
 */
export function CitationChip({
  sourceRef,
  url,
  asOf,
  derived = false,
}: {
  sourceRef: string;
  url?: string;
  asOf?: string;
  derived?: boolean;
}) {
  const title = [derived ? "analyst derivation" : "source", sourceRef, asOf && `as of ${asOf}`]
    .filter(Boolean)
    .join(" · ");
  const body = (
    <>
      <Link2 className="size-3" aria-hidden="true" />
      <span>{sourceRef}</span>
      {derived && <span className="opacity-70">· derived</span>}
    </>
  );
  const className =
    "inline-flex items-center gap-1 rounded border border-border bg-secondary/60 px-1.5 py-0.5 text-[11px] text-muted-foreground";
  return url ? (
    <a href={url} target="_blank" rel="noreferrer" title={title} className={`${className} hover:text-foreground hover:underline`}>
      {body}
    </a>
  ) : (
    <span title={title} className={className}>
      {body}
    </span>
  );
}
