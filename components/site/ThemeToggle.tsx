"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

/**
 * The DOM is the source of truth here, so it is what the component subscribes to.
 *
 * The theme is set on `<html>` by an inline script before first paint and can
 * change from two places — this button, and the operating system. Mirroring
 * that into React state means keeping two copies in step; reading it through
 * `useSyncExternalStore` means there is only ever one, and both change sources
 * are handled by the same subscription.
 *
 * Two states, not three. A light/dark/system cycle sounds more considerate but
 * forces the reader through a state whose effect they cannot predict from the
 * button. The pre-paint script already honours the system preference; this
 * exists for the reader who wants the other one.
 */

function subscribe(onChange: () => void): () => void {
  // The button writes the attribute rather than calling back, so the observer
  // is the whole subscription. The OS preference is deliberately not watched:
  // light is this document's default and only an explicit choice changes it.
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

/** Light on the server, because light is the default everywhere. */
function getServerSnapshot(): Theme {
  return "light";
}

export function ThemeToggle() {
  const theme = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    if (next === "dark") document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private browsing. The attribute is set; only persistence is lost.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      // Labelled by destination, not by current state — the reader is choosing
      // where to go, not reading a status.
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="border-rule text-ink-mid hover:text-ink hover:border-rule-strong flex size-8 cursor-pointer items-center justify-center border transition-colors print:hidden"
    >
      {theme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
    </button>
  );
}
