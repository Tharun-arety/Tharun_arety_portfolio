import Link from "next/link";

import { systems } from "@/content/systems";

/**
 * A missing sheet, said the way a drawing set would say it.
 *
 * The useful thing on a 404 is a way onward, so the sheet index is right here
 * rather than a link to a homepage the reader then has to search.
 */
export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-24 sm:px-8">
      <div className="letter">Error 404</div>
      <h1 className="text-ink mt-4 text-3xl sm:text-4xl">No sheet at this number.</h1>
      <p className="prose-doc mt-4 max-w-xl">
        The page you asked for is not part of this set. Everything that is:
      </p>

      <ul className="mt-8 space-y-px">
        {systems.map((system) => (
          <li key={system.slug}>
            <Link
              href={`/systems/${system.slug}`}
              className="border-rule hover:bg-sheet hover:border-rule-strong group flex items-center gap-4 border px-4 py-3 transition-colors"
            >
              <span className="text-ink-faint font-mono text-xs">{system.sheet}</span>
              <span className="text-ink group-hover:text-verdigris text-sm transition-colors">
                {system.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="/"
        className="letter text-ink-faint hover:text-ink mt-8 inline-block transition-colors"
      >
        ← Back to the start
      </Link>
    </div>
  );
}
