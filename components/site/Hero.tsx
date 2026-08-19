/**
 * The opening.
 *
 * The name, the role and the positioning statement are the user's own words and
 * are used as written.
 *
 * Two statements, each set to the full measure of the page, one under the
 * other. The name is the masthead — computed from the column's own width rather
 * than picked off the type scale, so it runs edge to edge at every size — and
 * the claim is the widest line the scale has. Between them sit a hairline and a
 * faceplate legend, which is the vocabulary the rest of the site is written in,
 * and which is what stops a name at this size reading as vanity rather than as
 * a masthead.
 *
 * This replaces a two-column arrangement that had the name and the claim
 * competing for one row. Neither could be as large as it wanted, and the claim
 * could not hold its line: "AI-leveraged systems." needs 9.7 times its font
 * size, and no share of that row ever gave it that. Stacked, both take the
 * whole width, and the break problem stops existing.
 *
 * The figure strip underneath is what separates this from every other
 * freelancer landing page: four numbers, none of them typed into the markup.
 * Three come from `public/eval-report.json`, which `npm run eval:full` writes,
 * and the fourth is read from the running database. If a re-run moves them, the
 * page moves with it.
 */

import { ArrowDown, FileText, Mail } from "lucide-react";

import { LiveCorpusCount } from "@/components/site/LiveCorpusCount";
import { caseTotals, overallScore, type EvalReport } from "@/components/EvalMetrics";
import { EMAIL, GROUNDING_FLOOR, MANIFEST_SOURCES, SEPARATION } from "@/components/site/site-data";

export function Hero({ report }: { report: EvalReport }) {
  const overall = overallScore(report);
  const cases = caseTotals(report);

  return (
    <section className="shell pt-10 pb-12 lg:pt-14 lg:pb-16">
      {/* The greeting and the name are one heading, so the introduction is
          announced as a sentence rather than as a name with a fragment loose
          above it. `masthead-fit` is the size container the name measures
          itself against; it is a bare wrapper and does nothing else. */}
      <div className="masthead-fit">
        <h1 className="text-ink">
          <span className="greeting block">Hello! I&rsquo;m</span>
          <span className="masthead mt-2 block">Tharun Arety</span>
        </h1>
      </div>

      {/* The faceplate legend: everything a letterhead would carry, engraved
          under the rule the masthead sits on. The role is the one line here set
          at reading size, because it is the one that has to be read rather than
          scanned. */}
      <div className="border-rule mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t pt-4 lg:mt-8">
        <span className="micro">portfolio</span>
        <p className="text-ink text-lift leading-snug">AI-Leveraged Systems Architect</p>
        <p className="text-faint text-fine sm:ml-auto">Augsburg, Germany · Open to relocation</p>
      </div>

      {/* The claim, at the top of the scale and across the whole measure, which
          is what lets it hold one line at every width down to a small phone.
          The span forces the break for the widths below that: balanced wrapping
          would take the hyphen in "AI-leveraged", the one break in this sentence
          that changes what it says. */}
      <p className="display text-ink mt-10 lg:mt-12">
        I build <span className="block sm:inline">AI-leveraged systems.</span>
      </p>

      <div className="mt-10 grid gap-y-8 lg:grid-cols-[1.618fr_1fr] lg:items-start lg:gap-x-12">
        <p className="lede max-w-[52ch]">
          I turn fragmented business data, documents, knowledge and workflows into systems that AI
          agents can understand, operate and continuously improve.
        </p>

        {/* Stacked in the narrow column rather than run on beside the lede, so
            the whole action group fits one row of it and the row's height stays
            the lede's. */}
        <div className="flex flex-col items-start gap-3 lg:items-end">
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#systems"
              className="border-cold/50 bg-cold/10 text-cold hover:bg-cold/20 inline-flex h-11 items-center gap-2 rounded-full border px-5 text-fine transition-colors"
            >
              Explore the systems
              <ArrowDown className="size-3.5" aria-hidden="true" />
            </a>
            <a
              href="#resume"
              className="border-rule text-dim hover:text-ink hover:border-rule-strong inline-flex h-11 items-center gap-2 rounded-full border px-5 text-fine transition-colors"
            >
              <FileText className="size-3.5" aria-hidden="true" />
              Résumé
            </a>
          </div>
          <a
            href={`mailto:${EMAIL}`}
            className="text-dim hover:text-ink inline-flex items-center gap-2 text-fine transition-colors"
          >
            <Mail className="size-3.5" aria-hidden="true" />
            {EMAIL}
          </a>
        </div>
      </div>

      {/* Four measurements from the prototype below, so the claim above arrives
          with evidence attached rather than after it. */}
      <dl className="border-rule mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t pt-8 lg:mt-12 lg:grid-cols-4">
        <Figure
          value={`${(overall * 100).toFixed(1)}%`}
          label="mean eval score"
          detail={`${cases.passed} of ${cases.total} cases across ${report.metrics.length} metrics`}
        />
        <Figure value="3" label="guardrail layers" detail="input, tool arguments, grounding" />
        <Figure
          value={GROUNDING_FLOOR.toFixed(2)}
          label="similarity floor"
          detail={`calibrated, ${SEPARATION.toFixed(3)} separation`}
        />
        <LiveCorpusCount manifestSources={MANIFEST_SOURCES} />
      </dl>
    </section>
  );
}

export function Figure({
  value,
  label,
  detail,
}: {
  value: string;
  label: string;
  detail: string;
}) {
  return (
    <div>
      <dt className="micro">{label}</dt>
      <dd className="mt-1.5">
        <span className="tnum text-ink font-mono text-title leading-none">{value}</span>
        <span className="text-faint mt-2 block text-micro leading-relaxed">{detail}</span>
      </dd>
    </div>
  );
}
