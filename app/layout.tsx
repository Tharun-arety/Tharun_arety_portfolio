import type { Metadata } from "next";
import Script from "next/script";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";

import { SiteFooter } from "@/components/site/SiteFooter";
import { AskDock } from "@/components/agent/AskDock";
import { SiteHeader } from "@/components/site/SiteHeader";
import { profile } from "@/content/profile";
import "./globals.css";

/**
 * Three faces, three jobs, and no overlap between them.
 *
 * Bricolage Grotesque letters the sheet — headings, and every field label. Its
 * width axis is the reason it is here rather than a neutral grotesque: a title
 * block is lettered condensed, and squeezing a normal-width face with
 * letter-spacing only ever looks squeezed. Its optical-size axis means the
 * display sizes are drawn for display sizes rather than scaled up from text.
 *
 * Geist carries running text. It was built for interfaces, so it holds up at
 * the small sizes this document spends most of its words in.
 *
 * Geist Mono carries every measurement, and pairs with Geist by construction
 * rather than by luck. All three are self-hosted through next/font — nothing is
 * fetched from a third party, and nothing shifts when the faces arrive.
 */
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--font-display-face",
  display: "swap",
});

const text = Geist({
  subsets: ["latin"],
  variable: "--font-text",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono-face",
  display: "swap",
});

/**
 * Absolute URLs for the share card.
 *
 * Vercel supplies its own hostname per deployment, so previews advertise
 * themselves correctly without configuration; set NEXT_PUBLIC_SITE_URL to the
 * custom domain once there is one, so production stops advertising a
 * *.vercel.app address to anyone who shares a link.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.name} — ${profile.role}`,
    template: `%s — ${profile.name}`,
  },
  description: profile.thesis,
  authors: [{ name: profile.name, url: profile.contact.github }],
  openGraph: {
    title: `${profile.name} — ${profile.role}`,
    description: profile.thesis,
    type: "profile",
  },
};

/**
 * Light is the default, deliberately, and the system preference does not
 * override it. This is a document — a released drawing is white, and someone
 * arriving from a link should meet the design as drawn. Dark is available for
 * anyone who wants it, and only a stored choice turns it on.
 *
 * Applied before first paint so the sheet never flashes the wrong ground.
 * Deliberately tiny and dependency-free: it reads one key and sets one
 * attribute, and it fails silently when storage is unavailable.
 *
 * Carried by `next/script` at `beforeInteractive` rather than by a bare
 * `<script>` in the head. A raw tag renders identically on the server but React
 * refuses to execute one it encounters during a client render, and warns —
 * which on a client-side navigation is both noise and a real hazard.
 */
const THEME_SCRIPT = `
try {
  var t = localStorage.getItem("theme");
  if (t === "dark") document.documentElement.dataset.theme = "dark";
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${text.variable} ${mono.variable}`}
    >
      <body className="min-h-screen">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
        />
        <a
          href="#main"
          className="letter sr-only focus:not-sr-only focus:bg-sheet focus:border-rule focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:border focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <AskDock />
      </body>
    </html>
  );
}
