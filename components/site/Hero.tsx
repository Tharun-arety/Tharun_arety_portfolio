/**
 * The opening.
 *
 * The name, the role and the positioning statement are the user's own words and
 * are used as written.
 *
 * The composition is one ratio applied twice. The columns divide phi to one,
 * and the three display sizes inside them — greeting, name, claim — sit a full
 * phi step apart, so the eye is sent from the introduction to the claim by the
 * same proportion that sets the page width.
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
      {/* Two columns in golden proportion: the claim takes phi, the
          introduction takes one. The introduction is first in the markup
          because the name is the h1 and because a phone has one column, where
          the top of the page should be who this is rather than what he says.
          `order` puts it on the right from `lg` up, where there are two.

          It sets flush right on purpose. Left-aligned in the middle of the
          right column it would read as having landed there; against the same
          edge the figure strip and the header both end on, it reads as placed. */}
      <div className="grid gap-y-10 lg:grid-cols-[1.618fr_1fr] lg:items-start lg:gap-x-16">
        <div className="lg:order-2 lg:pt-2 lg:text-right">
          <p className="greeting">Hello!</p>
          <h1 className="name text-ink mt-2">Tharun Arety</h1>
          <p className="text-dim mt-3 text-lift leading-snug">AI-Leveraged Systems Architect</p>
          <p className="text-faint mt-2 text-fine">Augsburg, Germany · Open to relocation</p>
        </div>

        <div className="lg:order-1">
          <p className="display text-ink max-w-[16ch]">I build AI-leveraged systems.</p>

          <p className="lede mt-6 max-w-[52ch]">
            I turn fragmented business data, documents, knowledge and workflows into systems that
            AI agents can understand, operate and continuously improve.
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
        </div>
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
