import {
  formatMs,
  segmentsOf,
  type Segment,
  type TurnTrace,
} from "@/lib/traces";

/**
 * A turn, drawn at true scale.
 *
 * Widths are the recorded durations and nothing else. Nothing is padded to be
 * legible, which is the whole point: on a grounded answer the input guardrails
 * are 2ms of twelve seconds and render as a hairline, and on a prompt injection
 * the same guardrails ARE the turn — one band, filling the bar, one millisecond
 * long. Those two pictures next to each other say the thing this site is for.
 *
 * Because sub-percent segments cannot carry a label, the bar states the shape
 * and the table beneath it states the values. Neither is asked to do both.
 *
 * Presentational on purpose: `progress` is the only moving part, so the replay
 * can drive this from a spring without the drawing logic knowing about pointers.
 */

/**
 * Which stage a refusal belongs to.
 *
 * `refusedBy` names a guardrail, not a stage, so colouring every stage of a
 * refused turn would blame the router for a decision the grounding check made.
 * The prefix is the only honest mapping available.
 */
function stageOwning(refusedBy: string | null): string | null {
  if (!refusedBy) return null;
  if (refusedBy.startsWith("input.")) return "input_guardrails";
  if (refusedBy.startsWith("args.")) return "tool_loop";
  if (refusedBy.startsWith("grounding.")) return "tool_loop";
  return null;
}

/**
 * Deterministic work is verdigris; anything that spent a model call is graphite.
 *
 * Signal is reserved for the stage that actually stopped the turn. A rejected
 * tool call inside a stage is marked by hatching rather than by recolouring the
 * whole band, because the rest of that band was real work that stood.
 */
function fillFor(segment: Segment, refusedStage: string | null): string {
  if (segment.name === refusedStage) return "bg-signal";
  if (segment.name === "input_guardrails" || segment.name === "grounding") return "bg-verdigris";
  return "bg-ink-mid";
}

export function StageBar({
  trace,
  progress = 1,
  compact = false,
}: {
  trace: TurnTrace;
  /** 0–1. Fraction of the turn elapsed; 1 renders the finished turn. */
  progress?: number;
  compact?: boolean;
}) {
  const { segments, totalMs } = segmentsOf(trace);
  const refusedStage = stageOwning(trace.refusedBy);

  // A label needs room, and how much room a share buys depends on the viewport.
  // Below the first threshold the segment is a sliver at any width; between the
  // two it fits on a wide screen and truncates to "SYNT…" on a phone, which
  // looks like a bug rather than like a scale. So the middle band is shown only
  // from `sm` up, and the table speaks for the rest.
  const LABEL_MIN = 0.14;
  const LABEL_MIN_NARROW = 0.3;

  const summary =
    `Recorded turn, ${formatMs(totalMs)} total: ` +
    segments.map((s) => `${s.label} ${formatMs(s.durationMs)}`).join(", ") +
    (trace.refusedBy ? `. Refused by ${trace.refusedBy}.` : ".");

  return (
    <figure className="w-full" role="img" aria-label={summary}>
      {/* Lettering above the bar, aligned to the segment it names. */}
      {!compact && (
        <div className="mb-1.5 flex w-full" aria-hidden>
          {segments.map((segment, i) => (
            <div
              key={`${segment.name}-${i}`}
              style={{ flexGrow: segment.share, flexBasis: 0, minWidth: 2 }}
              className="overflow-hidden pr-2"
            >
              {segment.share >= LABEL_MIN && (
                <span
                  className={`letter block truncate ${
                    segment.share < LABEL_MIN_NARROW ? "hidden sm:block" : ""
                  }`}
                >
                  {segment.label}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* The bar. Square, ruled, sitting in a recessed field like a strip chart. */}
      <div
        className={`inset relative flex w-full overflow-hidden ${compact ? "h-4" : "h-10"}`}
        aria-hidden
      >
        {segments.map((segment, i) => (
          <div
            key={`${segment.name}-${i}`}
            style={{ flexGrow: segment.share, flexBasis: 0, minWidth: 2 }}
            className="border-ground relative border-r last:border-r-0"
            title={`${segment.label} — ${formatMs(segment.durationMs)}`}
          >
            <div className={`h-full w-full ${fillFor(segment, refusedStage)}`} />

            {/* A rejected tool call. Hatched, because on a drawing hatching marks
                the region that is not material — here, work that did not stand. */}
            {segment.rejections.length > 0 && (
              <div
                className="absolute inset-y-0 right-0 w-1/3"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, transparent 0 3px, var(--ground) 3px 4px)",
                }}
              />
            )}
          </div>
        ))}

        {/* Everything not yet reached is masked rather than removed, so the bar
            never reflows while it plays.

            Position comes from a custom property rather than a React prop so
            that the replay can drive it at 60fps by writing one value to one
            element, instead of re-rendering every segment on every frame. At
            the default of 1 the mask has zero width and the playhead sits on
            the right edge, which is what a finished turn should look like. */}
        <div
          className="bg-inset/88 absolute inset-y-0 right-0"
          style={{ left: `calc(var(--trace-progress, ${progress}) * 100%)` }}
        />
        <div
          className="bg-ink absolute inset-y-0 w-px"
          style={{ left: `calc(var(--trace-progress, ${progress}) * 100%)` }}
        />
      </div>

      {/* The scale. Two numbers, at the two ends, the way an axis is annotated. */}
      {!compact && (
        <div className="mt-1.5 flex w-full items-baseline">
          <span className="tnum text-ink-faint text-[11px]">0</span>
          <span className="tnum text-ink-faint ml-auto text-[11px]">{formatMs(totalMs)}</span>
        </div>
      )}
    </figure>
  );
}

/**
 * The values the bar deliberately does not try to letter.
 */
export function StageTable({ trace }: { trace: TurnTrace }) {
  const { segments, totalMs } = segmentsOf(trace);

  return (
    <table className="w-full text-left">
      <caption className="sr-only">Stage durations for the recorded turn</caption>
      <thead>
        <tr className="border-rule border-b">
          <th scope="col" className="letter py-1.5 pr-3 font-semibold">
            Stage
          </th>
          <th scope="col" className="letter py-1.5 pr-3 text-right font-semibold">
            Duration
          </th>
          <th scope="col" className="letter py-1.5 text-right font-semibold">
            Share
          </th>
        </tr>
      </thead>
      <tbody>
        {segments.map((segment, i) => (
          <tr key={`${segment.name}-${i}`} className="border-rule/60 border-b last:border-b-0">
            <td className="text-ink py-1.5 pr-3 text-sm">
              {segment.label}
              {segment.rejections.length > 0 && (
                <span className="text-signal ml-2 text-xs">
                  {segment.rejections.length} call rejected
                </span>
              )}
            </td>
            <td className="tnum text-ink-mid py-1.5 pr-3 text-right text-sm">
              {formatMs(segment.durationMs)}
            </td>
            <td className="tnum text-ink-faint py-1.5 text-right text-sm">
              {(segment.share * 100).toFixed(1)}%
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-rule border-t">
          <td className="letter py-1.5 pr-3">Total</td>
          <td className="tnum text-ink py-1.5 pr-3 text-right text-sm font-medium">
            {formatMs(totalMs)}
          </td>
          <td />
        </tr>
      </tfoot>
    </table>
  );
}
