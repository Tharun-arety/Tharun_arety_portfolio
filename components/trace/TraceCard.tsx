import { StageBar } from "@/components/trace/StageBar";
import {
  formatMs,
  formatUsd,
  notableVerdicts,
  traceOf,
  GUARDRAIL_LABELS,
  type CapturedTurn,
} from "@/lib/traces";

/**
 * One recorded turn, stated plainly.
 *
 * The provenance line is not a disclaimer, it is the argument. A site claiming
 * that AI systems should be measurable cannot itself present a simulation as a
 * live system, so every card says when it was captured and against which model,
 * and the replay never pretends to be re-running.
 */
export function TraceCard({ turn }: { turn: CapturedTurn }) {
  const trace = traceOf(turn);
  if (!trace) return null;

  const captured = turn.capturedAt.slice(0, 10);

  /**
   * Only verdicts that did something: a guardrail that blocked, or a redaction
   * that actually removed a credential. A secrets check that ran and found
   * nothing is not news, and listing it as "fired" would be a small lie on a
   * page whose entire claim is that these numbers are not decorated.
   */
  const redactedOf = (verdict: (typeof trace.guardrails)[number]): string[] =>
    Array.isArray(verdict.detail?.redacted) ? (verdict.detail.redacted as string[]) : [];

  const verdicts = notableVerdicts(trace).filter(
    (verdict) => !verdict.passed || redactedOf(verdict).length > 0,
  );

  return (
    <article className="sheet">
      <div className="border-rule border-b px-5 py-4">
        <p className="text-ink font-mono text-sm leading-relaxed">
          <span className="text-ink-faint select-none">&gt; </span>
          {turn.prompt}
        </p>
      </div>

      <div className="px-5 py-5">
        <StageBar trace={trace} />

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="callout">
            <span className="text-ink-faint">total</span> {formatMs(trace.totals.durationMs)}
          </span>
          <span className="callout">
            <span className="text-ink-faint">model calls</span> {trace.totals.modelCalls}
          </span>
          <span className="callout">
            <span className="text-ink-faint">cost</span> {formatUsd(trace.totals.costUsd)}
          </span>
          {trace.refusedBy ? (
            <span className="callout callout-gate">refused · {trace.refusedBy}</span>
          ) : (
            <span className="callout callout-pass">answered</span>
          )}
        </div>

        {verdicts.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {verdicts.map((verdict, i) => (
              <li key={`${verdict.id}-${i}`} className="flex gap-2.5 text-xs leading-relaxed">
                <span className={verdict.passed ? "text-verdigris" : "text-signal"}>
                  {verdict.passed ? "◐" : "✕"}
                </span>
                <span className="text-ink-mid">
                  <span className="text-ink">{GUARDRAIL_LABELS[verdict.id] ?? verdict.id}</span>
                  {" — "}
                  {verdict.reason ??
                    `redacted ${redactedOf(verdict).join(", ")} before the model saw it`}
                </span>
              </li>
            ))}
          </ul>
        )}

        <p className="text-ink-mid mt-4 text-sm leading-relaxed">{turn.claim}</p>
      </div>

      <div className="border-rule text-ink-faint border-t px-5 py-2.5 text-xs">
        Recorded turn — captured {captured} from {turn.source}. Replayed, not re-run.
      </div>
    </article>
  );
}
