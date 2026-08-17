"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { AskPanel } from "@/components/agent/AskPanel";
import { asksFor } from "@/content/ask";

/**
 * The agent, reachable from every page.
 *
 * The panel itself argues against a floating chat bubble, and that argument
 * still holds — a rounded pill hovering over the corner of a drawing sheet
 * would be the one element admitting the whole site is a landing page. So this
 * is not one. It is an index tab: square, hairline-ruled, lettered, clipped to
 * the edge of the sheet the way a divider tab is clipped to a document. The
 * same affordance a paper document already has for "there is more behind this".
 *
 * Two behaviours worth knowing about:
 *
 *   It withdraws. When a panel is already on screen — the section on the
 *   landing page, the block at the foot of a case study — the tab hides, so a
 *   reader is never offered a second door to the room they are standing in.
 *
 *   It knows where it is. The starter questions come from the route, because
 *   "do you use retrieval?" is a good opener under the thesis and a strange one
 *   halfway down the TalentFlow sheet.
 */
export function AskDock() {
  const pathname = usePathname();
  const openerRef = React.useRef<HTMLButtonElement>(null);
  const drawerRef = React.useRef<HTMLDivElement>(null);

  /**
   * Open state is stored as the route it was opened on, so a navigation closes
   * the drawer by making the comparison false. Derived rather than reset in an
   * effect: syncing it after the fact would render the drawer once more over
   * the page the reader just left.
   */
  const [openedAt, setOpenedAt] = React.useState<string | null>(null);
  const open = openedAt === pathname;
  const setOpen = (next: boolean) => setOpenedAt(next ? pathname : null);

  const [inlineVisible, setInlineVisible] = React.useState(false);
  const [trackedPath, setTrackedPath] = React.useState(pathname);

  // Adjusting state during render, which is the supported way to reset on a
  // changed input — the alternative is an effect that paints a stale tab first.
  if (trackedPath !== pathname) {
    setTrackedPath(pathname);
    setInlineVisible(false);
  }

  /**
   * Watch every inline panel on the page and hide the tab while one is in view.
   *
   * Re-run on pathname so the observer picks up the panels of the page just
   * navigated to rather than holding references to unmounted ones.
   */
  React.useEffect(() => {
    const inline = document.querySelectorAll("[data-ask-inline]");
    // Nothing to observe; the reset above has already cleared the flag.
    if (inline.length === 0) return;

    const seen = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) seen.add(entry.target);
          else seen.delete(entry.target);
        }
        setInlineVisible(seen.size > 0);
      },
      // A sliver counts: the tab should be gone before the reader reaches the
      // real thing, not at the moment they arrive.
      { rootMargin: "-64px 0px -20% 0px" },
    );

    for (const element of inline) observer.observe(element);
    return () => observer.disconnect();
  }, [pathname]);

  // Escape closes, and focus goes back to the tab that opened it.
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // The setter directly, not the `setOpen` wrapper: that closes over
        // `pathname` and is rebuilt each render, so depending on it would
        // rebind this listener on every render.
        setOpenedAt(null);
        openerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    // The textarea, not the close button: someone who opened this wants to type.
    drawerRef.current?.querySelector("textarea")?.focus();
  }, [open]);

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`border-rule-strong bg-sheet text-ink hover:border-verdigris hover:text-verdigris fixed right-0 bottom-6 z-30 flex cursor-pointer items-center gap-2 border border-r-0 py-2.5 pr-4 pl-3.5 shadow-sm transition-all duration-300 print:hidden ${
          open || inlineVisible
            ? "pointer-events-none translate-x-full opacity-0"
            : "translate-x-0 opacity-100"
        }`}
      >
        {/* Square, because the two accents on this site mean something and
            verdigris means live. */}
        <span className="bg-verdigris size-1.5 shrink-0" aria-hidden="true" />
        <span className="letter">Ask the agent</span>
      </button>

      {open && (
        <>
          <div
            className="bg-ink/25 fixed inset-0 z-40 backdrop-blur-[2px] print:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Ask the agent"
            className="bg-ground border-rule-strong fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l shadow-xl print:hidden"
          >
            <div className="border-rule flex shrink-0 items-center gap-3 border-b px-5 py-3.5">
              <span className="letter border-verdigris text-verdigris bg-verdigris-soft border px-2 py-1">
                Live
              </span>
              <span className="letter text-ink-faint">Ask the agent</span>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openerRef.current?.focus();
                }}
                aria-label="Close"
                className="border-rule text-ink-mid hover:text-ink hover:border-rule-strong ml-auto flex size-7 cursor-pointer items-center justify-center border transition-colors"
              >
                <X className="size-3.5" />
              </button>
            </div>

            {/* The panel manages its own scrolling in compact mode, with the
                composer pinned at the foot. */}
            <div className="min-h-0 flex-1">
              <AskPanel suggestions={asksFor(pathname)} compact />
            </div>
          </div>
        </>
      )}
    </>
  );
}
