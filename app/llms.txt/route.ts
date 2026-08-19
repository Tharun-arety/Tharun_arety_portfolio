/**
 * GET /llms.txt. The site's index, for a model rather than a browser.
 *
 * The convention from llmstxt.org: one Markdown file at a known path, holding
 * what this site is and where the rest of it lives. The body is generated in
 * `lib/llms.ts` from the same modules the pages render from.
 *
 * Served as `text/plain` on purpose. `text/markdown` makes a browser download
 * the file instead of showing it, and the first thing anyone does with this URL
 * is open it to check that it works.
 *
 * The origin comes from the request rather than from an environment variable,
 * so every preview deployment links to itself instead of to production.
 */

import { buildLlmsTxt } from "@/lib/llms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);

  return new Response(buildLlmsTxt(origin), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
