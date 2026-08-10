"use client";

import { Printer } from "lucide-react";

/**
 * There is no PDF in `public/` on purpose.
 *
 * A committed PDF is a second copy of the résumé that drifts from the first one
 * the moment either changes, and the drift is invisible until a recruiter is
 * holding the stale version. The print stylesheet makes the page itself the
 * source, and the browser makes the PDF on demand.
 */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="border-rule-strong text-ink hover:border-ink inline-flex cursor-pointer items-center gap-2 border px-3 py-1.5 text-sm transition-colors print:hidden"
    >
      <Printer className="size-3.5" />
      Print or save as PDF
    </button>
  );
}
