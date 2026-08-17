"use client";

import * as React from "react";
import Link from "next/link";

import { ThemeToggle } from "@/components/site/ThemeToggle";
import { profile } from "@/content/profile";

/**
 * `always` survives the narrow viewport. The in-page anchors do not: on a phone
 * the page is one scroll and a jump list costs more room than it saves, so they
 * drop rather than being folded into a hamburger nobody opens.
 */
const NAV = [
  { href: "/#systems", label: "Systems", always: false },
  { href: "/#ask", label: "Ask", always: true },
  { href: "/#reliability", label: "Reliability", always: false },
  { href: "/#background", label: "Background", always: false },
  { href: "/method", label: "Method", always: true },
  { href: "/resume", label: "Résumé", always: true },
];

/**
 * A translucent strip the sheet scrolls under, rather than an opaque bar that
 * consumes a fixed band of the page.
 *
 * The separation appears only once there is something to separate from: at
 * scroll top there is no rule at all, and it fades in as content arrives
 * beneath. A permanent 1px border under a floating header is a line drawn
 * against nothing.
 */
export function SiteHeader() {
  const [lifted, setLifted] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`bg-ground/80 supports-[backdrop-filter]:bg-ground/65 sticky top-0 z-40 backdrop-blur-lg transition-[border-color] duration-300 print:hidden ${
        lifted ? "border-rule border-b" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-5 sm:px-8">
        <Link href="/" className="group flex items-baseline gap-2.5">
          {/* The sheet identifier, lettered the way a drawing number is. */}
          <span className="border-rule-strong text-ink group-hover:border-verdigris flex size-7 shrink-0 items-center justify-center border font-mono text-[11px] font-medium transition-colors">
            TA
          </span>
          {/* The name stays at every width. A site whose author is only legible
              on a laptop has failed at the one job a portfolio has. */}
          <span className="letter text-ink">{profile.name}</span>
        </Link>

        <nav className="ml-auto flex min-w-0 items-center gap-1">
          {NAV.map((item) =>
            // Hash targets go through a native anchor. Next's router treats a
            // same-page hash as a route change with nothing to do and skips the
            // scroll entirely, which reads to a visitor as a dead link.
            item.href.includes("#") ? (
              <a
                key={item.href}
                href={item.href}
                className={`letter text-ink-faint hover:text-ink px-2 py-2 whitespace-nowrap transition-colors ${
                  item.always ? "" : "hidden md:inline-block"
                }`}
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`letter text-ink-faint hover:text-ink px-2 py-2 whitespace-nowrap transition-colors ${
                  item.always ? "" : "hidden md:inline-block"
                }`}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}
