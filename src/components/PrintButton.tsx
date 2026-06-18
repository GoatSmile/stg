"use client";

import { FileDown } from "lucide-react";

/** Triggers the browser's native print → "Save as PDF", which produces the forwardable attachment.
 *  Hidden in the printed output itself (print:hidden). */
export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 print:hidden"
    >
      <FileDown className="size-4" aria-hidden="true" /> Save as PDF
    </button>
  );
}
