import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

/**
 * Three families, each with one job, and no overlap between them.
 *
 * Bricolage Grotesque letters the page: headings, legends, every field label.
 * Its width axis is the reason it is here rather than a neutral grotesque — a
 * legend is lettered condensed, and squeezing a normal-width face with
 * letter-spacing only ever looks squeezed. Its optical-size axis means the
 * display sizes are drawn for display sizes rather than scaled up from text.
 *
 * Geist carries running text. It was built for interfaces, so it holds up at
 * the small sizes this page spends most of its words in — which is the job a
 * display face was doing here before, and doing badly.
 *
 * Geist Mono carries every measurement, because scores, limits, source handles
 * and tool arguments get read in columns and compared, and proportional digits
 * make that harder than it needs to be. It pairs with Geist by construction
 * rather than by luck.
 *
 * All three self-hosted through next/font, so there is no third-party request
 * on load and nothing shifts when the faces arrive.
 */
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--font-bricolage",
  display: "swap",
});

const text = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tharun Arety · AI-Leveraged Systems Architect",
  description:
    "I turn fragmented business data, documents, knowledge and workflows into " +
    "systems that AI agents can understand, operate and continuously improve. " +
    "Includes a working prototype you can query, with its guardrails and eval " +
    "scores on the page.",
  authors: [{ name: "Tharun Arety" }],
  openGraph: {
    type: "website",
    title: "Tharun Arety · AI-Leveraged Systems Architect",
    description:
      "A working agent prototype with its guardrail verdicts, retrieval scores " +
      "and offline eval results visible in the interface.",
    locale: "en_GB",
  },
};

/**
 * `themeColor` follows the system preference so mobile browser chrome matches
 * the ground rather than sitting as a pale band above it. `color-scheme` is set
 * per theme in `globals.css` instead of here, because the toggle can override
 * the system preference and this export is static.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f2ee" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0c" },
  ],
};

/**
 * Runs before the first paint, which is the only way to avoid a dark page
 * flashing white (or the reverse) while React boots. Kept to one expression and
 * wrapped in try/catch, since a thrown error here would block rendering.
 */
const THEME_SCRIPT = `
try {
  var stored = localStorage.getItem("theme");
  var system = matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  document.documentElement.dataset.theme = stored === "light" || stored === "dark" ? stored : system;
} catch (e) {
  document.documentElement.dataset.theme = "dark";
}
`.trim();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
