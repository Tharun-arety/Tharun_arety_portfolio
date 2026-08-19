/**
 * Three backgrounds under the same hero, for choosing between.
 *
 * Temporary, and `noindex` because it is three h1s and three copies of the same
 * name — correct for a comparison and wrong for anything a crawler reads. Delete
 * the route once the choice is made.
 */

import type { Metadata } from "next";

import report from "@/public/eval-report.json";
import { type EvalReport } from "@/components/EvalMetrics";
import { BackgroundPaths } from "@/components/site/BackgroundPaths";
import { Hero } from "@/components/site/Hero";
import { SiteHeader } from "@/components/site/SiteChrome";

const evalReport = report as EvalReport;

export const metadata: Metadata = {
  title: "Hero backgrounds · comparison",
  robots: { index: false, follow: false },
};

const VARIANTS = [
  {
    key: "aurora",
    label: "A · washes only",
    note: "What is live now. Colour and depth, no structure and nothing that moves quickly enough to notice.",
    field: "field",
    paths: false,
  },
  {
    key: "paths",
    label: "B · flowing paths only",
    note: "The 21st.dev component, standing in for the washes. Structure and motion, but the field goes monochrome — the only colour left in the hero is the crest on the name.",
    field: "field field--paths",
    paths: true,
  },
  {
    key: "both",
    label: "C · paths over the washes",
    note: "The washes keep the colour and the depth; the paths add the structure and the movement they were missing.",
    field: "field",
    paths: true,
  },
];

export default function HeroPreview() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        {VARIANTS.map((variant) => (
          <section key={variant.key}>
            <div className="shell pt-10">
              <h2 className="legend">{variant.label}</h2>
              <p className="text-dim mt-3 max-w-[70ch] text-fine leading-relaxed">{variant.note}</p>
            </div>

            <div className={variant.field}>
              {variant.paths && <BackgroundPaths />}
              <Hero report={evalReport} />
            </div>
          </section>
        ))}

        <div className="shell py-16">
          <p className="text-faint text-fine">
            Temporary comparison page. Say which one and it goes on the real hero; this route then
            gets deleted.
          </p>
        </div>
      </main>
    </>
  );
}
