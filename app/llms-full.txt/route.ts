/**
 * GET /llms-full.txt. The whole site in one response.
 *
 * The companion to `/llms.txt`, for the case where following four links is
 * worse than fetching one file: every section, every case study, the eval
 * report and the background, so an agent can answer about this work without
 * another request.
 */

import { buildLlmsFullTxt } from "@/lib/llms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);

  return new Response(buildLlmsFullTxt(origin), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
