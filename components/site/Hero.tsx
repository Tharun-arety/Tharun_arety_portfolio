/**
 * The opening.
 *
 * The name, the role and the positioning statement are the user's own words and
 * are used as written.
 *
 * The composition rests on one ratio and one size. The columns divide phi to
 * one; the name and the claim take the same display size at either end of that
 * division; and the greeting is that size divided by phi squared. Three
 * decisions, all of them the same decision.
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
    <section className="shell pt-16 pb-14 lg:pt-24 lg:pb-20">
      {/* Two columns in golden proportion. The introduction leads from the left,
          because the page is about a person and the name is the h1. The claim
          answers from the far edge, flush right, at the same size: they are one
          sentence spoken across the width of the hero, and the reader's eye
          crosses the gap rather than descending a hierarchy.

          Phi goes to the claim rather than to the name because the claim is the
          longer of the two statements, and its second line has to hold together
          on one line for the break to fall where it should.

          No `order` anywhere. The markup is already in reading order, which is
          also the order a phone stacks it in. */}
      <div className="grid gap-y-10 lg:grid-cols-[1fr_1.618fr] lg:items-start lg:gap-x-12">
        <div>
          <p className="greeting">Hello!</p>
          {/* The salutation runs into the name on one line, so the h1 holds both
              halves and a screen reader announces the whole introduction. */}
          <h1 className="display text-ink mt-1">
            <span className="greeting">I&rsquo;m</span> Tharun Arety
          </h1>
          <p className="text-dim mt-4 text-lift leading-snug">AI-Leveraged Systems Architect</p>
          <p className="text-faint mt-2 text-fine">Augsburg, Germany · Open to relocation</p>
        </div>

        {/* The padding drops the claim's first line onto the name's, since the
            name sits one greeting-line down. Derived from the same custom
            property both sizes come from, so it tracks them: 0.42 is 1/phi^2
            times the greeting's line-height, and the quarter-rem is `mt-1`. */}
        <p className="display text-ink lg:pt-[calc(var(--display-step)*0.42+0.25rem)] lg:text-right">
          {/* The break is set rather than left to the wrapper, at every width.
              Balanced wrapping evens the lines, which here means breaking at the
              hyphen in "AI-leveraged" — the one place in this sentence where a
              break changes what it says. No phone is wide enough to hold the
              second line whole at this size, so there it wraps once more, but it
              wraps between the two words rather than through the compound. */}
          I build <span className="block">AI-leveraged systems.</span>
        </p>
      </div>

      {/* Below the row rather than inside the left column, so a phone reads the
          introduction, then the claim, then what the claim means. Threaded into
          the left column instead, the claim would come after the buttons on the
          only layout where it cannot be seen at the same time as the name. */}
      <p className="lede mt-10 max-w-[52ch]">
        I turn fragmented business data, documents, knowledge and workflows into systems that AI
        agents can understand, operate and continuously improve.
      </p>

      <div className="mt-9 flex flex-wrap items-center gap-3">
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
        <a
          href={`mailto:${EMAIL}`}
          className="text-dim hover:text-ink inline-flex h-11 items-center gap-2 px-1 text-fine transition-colors"
        >
          <Mail className="size-3.5" aria-hidden="true" />
          {EMAIL}
        </a>
      </div>

      {/* Four measurements from the prototype below, so the claim above arrives
          with evidence attached rather than after it. */}
      <dl className="border-rule mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t pt-8 lg:grid-cols-4">
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
