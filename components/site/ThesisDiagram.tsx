import { ArrowRight, RotateCcw } from "lucide-react";

/**
 * From information to action.
 *
 * The whole argument of the site in one figure: where most enterprise AI work
 * stops, and where these systems stop instead. Two chains, drawn the same way,
 * so the difference reads as length rather than as styling.
 *
 * Built from wrapping chips rather than from a drawing. The first version was
 * an SVG 880 units wide inside a horizontal scroller — fine as a mid-page
 * figure, useless as the first thing on the site, because on a phone the reader
 * saw the left third and both punchlines (`nothing happens`, and the action a
 * person releases) sat off-screen behind a sideways drag. Chips wrap in reading
 * order at every width, so nothing is ever hidden and no breakpoint has to
 * decide between horizontal and vertical.
 *
 * The gate on the last step is the part that matters. A loop that ends in an
 * action is only trustworthy if something can refuse the action, so the release
 * is a real element rather than an implication.
 */

type Step = { name: string; sub?: string; gate?: boolean };

function Chip({ step }: { step: Step }) {
  return (
    <span
      className={`relative inline-flex flex-col px-3 py-2 text-center ${
        step.gate ? "border-signal bg-signal-soft border" : "bg-sheet border-rule-strong border"
      }`}
    >
      {step.gate && <span className="bg-signal absolute inset-y-0 left-0 w-[3px]" />}
      <span className={`text-sm leading-tight ${step.gate ? "text-signal" : "text-ink"}`}>
        {step.name}
      </span>
      {step.sub && (
        <span className="text-ink-faint mt-0.5 text-[11px] leading-tight">{step.sub}</span>
      )}
    </span>
  );
}

function Chain({ steps }: { steps: Step[] }) {
  return (
    <div className="flex flex-wrap items-stretch gap-x-2 gap-y-2">
      {steps.map((step, i) => (
        // The arrow leads the chip it points at rather than trailing the one
        // before it, so a wrap puts "→ Action" at the head of the next line
        // instead of stranding a dangling arrow at the end of the last one.
        <span key={step.name} className="inline-flex items-center gap-2">
          {i > 0 && <ArrowRight className="text-ink-faint size-3.5 shrink-0" aria-hidden />}
          <Chip step={step} />
        </span>
      ))}
    </div>
  );
}

const STOPS: Step[] = [
  { name: "Documents" },
  { name: "Retrieval" },
  { name: "Answer" },
];

const SYSTEMS: Step[] = [
  { name: "Documents", sub: "& business data" },
  { name: "Structured knowledge" },
  { name: "Agent" },
  { name: "Tools & systems" },
  { name: "Action", sub: "released by a person", gate: true },
];

export function ThesisDiagram() {
  return (
    <figure
      className="w-full"
      aria-label={
        "Two pipelines drawn at the same scale. The first: documents, retrieval, answer — and it " +
        "ends there, nothing happens. The second: documents and business data, structured " +
        "knowledge, an agent, tools and systems, then an action a person releases, with what " +
        "happened feeding back in."
      }
    >
      <div className="legend mb-3">
        <span className="letter">Where most enterprise AI stops</span>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Chain steps={STOPS} />
        {/* The terminator. On a drawing this is how the end of a run is marked;
            here it is the point of the whole row. */}
        <span className="text-ink-faint inline-flex items-center gap-2 text-sm">
          <span aria-hidden className="font-mono">
            ⊣
          </span>
          nothing happens
        </span>
      </div>

      <div className="legend mt-9 mb-3">
        <span className="letter text-verdigris">What these systems do</span>
      </div>
      <Chain steps={SYSTEMS} />

      <div className="text-verdigris mt-4 inline-flex items-center gap-2 text-sm">
        <RotateCcw className="size-3.5 shrink-0" aria-hidden />
        what happened feeds back in
      </div>
    </figure>
  );
}
