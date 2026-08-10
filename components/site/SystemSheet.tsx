import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

import { EVIDENCE_LABEL, type System } from "@/content/systems";

/**
 * One system, as an index card for its sheet.
 *
 * The number in the corner is a real ordinal — these are meant to be read in
 * order, professional work first — so numbering them is information rather than
 * the decorative 01/02/03 that gets stamped on any three things.
 *
 * The evidence badge is the honest part. A reader deciding how much to believe
 * should not have to work out which of these they can open and which they
 * cannot, so each card says so before it says anything else.
 */

function EvidenceBadge({ evidence }: { evidence: System["evidence"] }) {
  const tone =
    evidence === "live"
      ? "border-verdigris text-verdigris bg-verdigris-soft"
      : evidence === "under-nda"
        ? "border-rule-strong text-ink-faint"
        : "border-rule-strong text-ink-mid";

  return (
    <span className={`letter shrink-0 border px-2 py-1 whitespace-nowrap ${tone}`}>
      {EVIDENCE_LABEL[evidence]}
    </span>
  );
}

export function SystemSheet({ system }: { system: System }) {
  return (
    <article className="sheet group hover:border-rule-strong transition-colors">
      <div className="border-rule flex items-stretch border-b">
        <div className="border-rule text-ink-faint flex w-14 shrink-0 items-center justify-center border-r font-mono text-sm">
          {system.sheet}
        </div>
        {/* Wraps rather than truncates. A system whose name is cut to
            "Agentic Enterpris…" has been made unfindable to save one line. */}
        <div className="flex min-w-0 flex-1 flex-wrap items-start gap-x-3 gap-y-2 px-4 py-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-ink text-lg leading-tight">{system.name}</h3>
            <div className="letter mt-1">{system.context}</div>
          </div>
          <EvidenceBadge evidence={system.evidence} />
        </div>
      </div>

      {/* The number column is only worth indenting under once there is room for
          it to read as a margin rather than as lost width. */}
      <div className="px-4 py-4 sm:pl-[4.5rem]">
        <p className="text-ink-mid text-sm leading-relaxed">{system.tagline}</p>

        {system.headline && (
          <div className="mt-4">
            <div
              className={`text-ink text-xl leading-tight font-medium ${
                /\d/.test(system.headline.value) ? "tnum" : ""
              }`}
            >
              {system.headline.value}
            </div>
            <div className="letter mt-1.5">{system.headline.label}</div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-1.5">
          {system.tags.map((tag) => (
            <span key={tag} className="border-rule text-ink-faint border px-1.5 py-0.5 text-xs">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link
            href={`/systems/${system.slug}`}
            className="text-ink hover:text-verdigris inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            Read the case study
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          {system.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className={
                link.kind === "live"
                  ? "border-verdigris bg-verdigris-soft text-verdigris hover:bg-verdigris hover:text-sheet inline-flex items-center gap-2 border px-3 py-2 text-sm font-semibold shadow-sm transition-colors"
                  : "text-ink-faint hover:text-ink inline-flex items-center gap-1.5 text-sm transition-colors"
              }
            >
              {link.kind === "live" && (
                <span className="size-1.5 bg-current" aria-hidden="true" />
              )}
              {link.label}
              <ExternalLink className={link.kind === "live" ? "size-3.5" : "size-3"} />
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}
