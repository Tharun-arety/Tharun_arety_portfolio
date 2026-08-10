import evals from "@/data/evals.json";

/**
 * The eval suite, including the parts that did not score well.
 *
 * Two of these twelve are visibly below the rest. They stay on the page. A
 * scorecard reading 100% across the board is what marketing looks like; a
 * scorecard with a soft spot in it is what measurement looks like, and the
 * whole reason to show numbers is to be the second thing.
 *
 * The gap between a score and its target is drawn as hatching rather than left
 * as absence, because on a drawing hatching marks the region that is not
 * material — and an unmet target is exactly that.
 */

const HATCH =
  "repeating-linear-gradient(45deg, transparent 0 3px, var(--rule-strong) 3px 4px)";

function pct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function EvalMatrix() {
  const generated = new Date(evals.generatedAt).toISOString().slice(0, 10);

  return (
    <div className="sheet">
      {/* Headline block: the claim, then the conditions it holds under. */}
      <div className="border-rule flex flex-wrap items-baseline gap-x-6 gap-y-2 border-b px-5 py-4">
        <div>
          <div className="tnum text-ink text-3xl leading-none font-medium">
            {pct(evals.overall)}
          </div>
          <div className="letter mt-1.5">Overall</div>
        </div>
        <div>
          <div className="tnum text-ink text-lg leading-none">
            {evals.totals.passed}
            <span className="text-ink-faint">/{evals.totals.total}</span>
          </div>
          <div className="letter mt-1.5">Cases passed</div>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <span className="callout">{evals.model}</span>
          <span className="callout">floor {evals.groundingFloor}</span>
          <span className="callout">{evals.tier} tier</span>
          <span className="callout">{generated}</span>
        </div>
      </div>

      <div className="divide-rule/60 divide-y">
        {evals.metrics.map((metric) => {
          const perfect = metric.score >= 0.999;
          return (
            /* Narrow: label and score on one line, bar beneath. Wide: one row.
               The bar is the element that must not be squeezed, so it is the one
               that gets its own line when there is not enough of it to go round. */
            <div
              key={metric.name}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-2.5"
            >
              <div className="text-ink order-1 min-w-0 flex-1 text-sm leading-tight sm:w-52 sm:flex-none">
                {metric.label}
              </div>

              <div className="bg-inset border-rule relative order-3 h-3 w-full min-w-0 border sm:order-2 sm:w-auto sm:flex-1">
                {/* Achieved. */}
                <div
                  className={`h-full ${perfect ? "bg-verdigris" : "bg-ink-mid"}`}
                  style={{ width: `${metric.score * 100}%` }}
                />
                {/* The shortfall, hatched. */}
                {!perfect && (
                  <div
                    className="absolute inset-y-0 right-0"
                    style={{ width: `${(1 - metric.score) * 100}%`, backgroundImage: HATCH }}
                  />
                )}
              </div>

              <div className="tnum text-ink order-2 w-14 shrink-0 text-right text-sm sm:order-3">
                {pct(metric.score)}
              </div>
              <div className="tnum text-ink-faint order-4 hidden w-14 shrink-0 text-right text-xs sm:block">
                {metric.passed}/{metric.total}
              </div>
            </div>
          );
        })}
      </div>

      {evals.notes.map((note) => (
        <p key={note} className="text-ink-mid border-rule border-t px-5 py-3 text-xs leading-relaxed">
          {note}
        </p>
      ))}
    </div>
  );
}
