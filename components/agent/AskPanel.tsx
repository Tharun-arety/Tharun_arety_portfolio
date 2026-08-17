"use client";

import * as React from "react";
import { ArrowUp, Loader2 } from "lucide-react";

/**
 * The live agent.
 *
 * Deliberately not a floating chat bubble. This site is set as a controlled
 * document, and a rounded pill hovering over the corner of a drawing sheet
 * would be the one element that admitted the whole thing was a landing page.
 * It is a section you scroll to, with an entry in the header.
 *
 * It renders its own turn in the same notation as the recorded turns further
 * down — latency, tokens, cost, guardrail verdicts — badged LIVE rather than
 * "replayed, not re-run". A live agent that could not show its own working
 * would sit badly next to six that can.
 *
 * The caps are printed under the input rather than hidden. A visitor who hits
 * one should recognise a designed state, not a broken page.
 */

type Verdict = {
  id: string;
  passed: boolean;
  reason?: string;
  detail?: Record<string, unknown>;
  latencyMs: number;
};

type Trace = {
  durationMs: number;
  guardrails: Verdict[];
  refusedBy: string | null;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  costKnown: boolean;
  modelCalls: number;
};

type Turn = { role: "user" | "assistant"; content: string; trace?: Trace; refused?: boolean };

type Status = { configured: boolean; model: string; perMinute: number; servedToday: number; dailyCeiling: number; available: boolean };

const GUARDRAIL_LABELS: Record<string, string> = {
  "input.secrets": "Secret redaction",
  "input.injection": "Prompt-injection filter",
  "input.nda": "NDA probe filter",
  "input.scope": "Scope constraint",
};

const SUGGESTIONS = [
  "What guardrails does the magnetocaloric agent run, and what did it score?",
  "How did a materials engineer end up building agent systems?",
  "What is the difference between sheet 03 and sheet 04?",
  "Do you use retrieval?",
];

const formatMs = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`);
const formatUsd = (usd: number) => (usd === 0 ? "$0" : `$${usd.toFixed(6)}`);

function TraceStrip({ trace }: { trace: Trace }) {
  // Only verdicts that did something: a check that ran and found nothing is
  // not news, and listing it would pad the strip with noise.
  const notable = trace.guardrails.filter(
    (v) => !v.passed || (Array.isArray(v.detail?.redacted) && v.detail.redacted.length > 0),
  );

  return (
    <div className="border-rule mt-3 border-t pt-3">
      <div className="flex flex-wrap gap-2">
        <span className="callout">
          <span className="text-ink-faint">total</span> {formatMs(trace.durationMs)}
        </span>
        <span className="callout">
          <span className="text-ink-faint">model calls</span> {trace.modelCalls}
        </span>
        {trace.modelCalls > 0 && (
          <span className="callout">
            <span className="text-ink-faint">tokens</span> {trace.inputTokens}/{trace.outputTokens}
          </span>
        )}
        <span className="callout">
          <span className="text-ink-faint">cost</span>{" "}
          {trace.costKnown ? formatUsd(trace.costUsd) : "unpriced model"}
        </span>
        {trace.refusedBy ? (
          <span className="callout callout-gate">refused · {trace.refusedBy}</span>
        ) : (
          <span className="callout callout-pass">answered</span>
        )}
      </div>

      {notable.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {notable.map((verdict, i) => (
            <li key={`${verdict.id}-${i}`} className="flex gap-2.5 text-xs leading-relaxed">
              <span className={verdict.passed ? "text-verdigris" : "text-signal"}>
                {verdict.passed ? "◐" : "✕"}
              </span>
              <span className="text-ink-mid">
                <span className="text-ink">{GUARDRAIL_LABELS[verdict.id] ?? verdict.id}</span>
                {" — "}
                {verdict.reason ??
                  (Array.isArray(verdict.detail?.redacted)
                    ? `redacted ${(verdict.detail.redacted as string[]).join(", ")} before the model saw it`
                    : "fired")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AskPanel() {
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<Status | null>(null);
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    fetch("/api/ask")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  React.useEffect(() => {
    if (turns.length > 0) endRef.current?.scrollIntoView({ block: "nearest" });
  }, [turns]);

  async function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || busy) return;

    setError(null);
    setInput("");
    setBusy(true);

    // History is sent before the new turn is appended, so the model sees the
    // conversation as it stood when the question was asked.
    const history = turns.map((turn) => ({ role: turn.role, content: turn.content }));
    setTurns((prev) => [...prev, { role: "user", content: trimmed }, { role: "assistant", content: "" }]);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });

      if (!response.ok || !response.body) {
        let detail = `${response.status} ${response.statusText}`;
        try {
          const body = (await response.json()) as { error?: string };
          if (body.error) detail = body.error;
        } catch {
          /* the status line is all there is */
        }
        setTurns((prev) => prev.slice(0, -2));
        setError(detail);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      /**
       * The updater has to be pure — it replaces the last turn rather than
       * mutating it.
       *
       * The mutating version (`last.content += delta`) appended twice on every
       * token, because React double-invokes state updaters in development to
       * surface exactly this. It rendered as "TTwwoo ooff tthhee ffiivvee",
       * which only became obvious on a deterministic refusal, where the text is
       * emitted one character at a time.
       */
      const apply = (event: string, data: unknown) => {
        setTurns((prev) => {
          const index = prev.length - 1;
          const last = prev[index];
          if (!last || last.role !== "assistant") return prev;

          const next = [...prev];
          if (event === "token") {
            next[index] = { ...last, content: last.content + (data as { text: string }).text };
          } else if (event === "trace") {
            next[index] = { ...last, trace: data as Trace };
          } else if (event === "final") {
            next[index] = { ...last, refused: (data as { refused: boolean }).refused };
          } else {
            return prev;
          }
          return next;
        });
      };

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");

        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const block = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          const event = block.match(/^event: (.+)$/m)?.[1];
          const raw = block.match(/^data: (.+)$/m)?.[1];
          if (event && raw) {
            try {
              apply(event, JSON.parse(raw));
            } catch {
              /* unparseable frame — skip rather than break the stream */
            }
          }
          boundary = buffer.indexOf("\n\n");
        }
      }
    } catch (cause) {
      setTurns((prev) => prev.slice(0, -2));
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  if (status && !status.configured) {
    return (
      <div className="sheet px-5 py-4">
        <p className="text-ink-mid text-sm leading-relaxed">
          The live agent is not configured on this deployment. The six recorded turns below are real
          captures and need no key — they are the same argument, made in advance.
        </p>
      </div>
    );
  }

  return (
    <div className="sheet">
      <div className="border-rule flex flex-wrap items-center gap-x-3 gap-y-1 border-b px-5 py-3">
        <span className="letter border-verdigris text-verdigris bg-verdigris-soft border px-2 py-1">
          Live
        </span>
        <span className="text-ink-mid text-xs">
          Answers from this site&rsquo;s own content. No retrieval — it all fits in one context window.
        </span>
      </div>

      {turns.length === 0 ? (
        <div className="px-5 py-5">
          <div className="letter mb-3">Try one</div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => ask(suggestion)}
                disabled={busy}
                className="border-rule text-ink-mid hover:border-rule-strong hover:text-ink cursor-pointer border px-2.5 py-1.5 text-left text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="divide-rule/60 max-h-[32rem] divide-y overflow-y-auto">
          {turns.map((turn, i) =>
            turn.role === "user" ? (
              <div key={i} className="px-5 py-4">
                <p className="text-ink font-mono text-sm leading-relaxed">
                  <span className="text-ink-faint select-none">&gt; </span>
                  {turn.content}
                </p>
              </div>
            ) : (
              <div key={i} className="px-5 py-4">
                {turn.content ? (
                  <p
                    className={`text-sm leading-relaxed whitespace-pre-wrap ${
                      turn.refused ? "text-signal" : "text-ink-mid"
                    }`}
                  >
                    {turn.content}
                  </p>
                ) : (
                  <p className="text-ink-faint inline-flex items-center gap-2 text-sm">
                    <Loader2 className="size-3.5 animate-spin" />
                    thinking
                  </p>
                )}
                {turn.trace && <TraceStrip trace={turn.trace} />}
              </div>
            ),
          )}
          <div ref={endRef} />
        </div>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          ask(input);
        }}
        className="border-rule border-t px-5 py-4"
      >
        <div className="flex items-end gap-2">
          <label htmlFor="ask-input" className="sr-only">
            Ask about Tharun&rsquo;s work
          </label>
          <textarea
            id="ask-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              // Enter sends; Shift+Enter is a newline. A pasted job description
              // needs newlines, so the modifier has to work.
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                ask(input);
              }
            }}
            rows={2}
            placeholder="Ask about the systems, the decisions, or paste a job description…"
            disabled={busy}
            className="bg-inset border-rule text-ink placeholder:text-ink-faint focus:border-rule-strong min-h-[3.5rem] flex-1 resize-y border px-3 py-2 text-sm outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send question"
            className="border-ink bg-ink text-ground hover:bg-ink-mid hover:border-ink-mid flex size-9 shrink-0 cursor-pointer items-center justify-center border transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
          </button>
        </div>

        {error && <p className="text-signal mt-3 text-xs leading-relaxed">{error}</p>}

        {/* The caps, stated. A visitor who hits one should recognise a designed
            state rather than a broken page. */}
        {status && (
          <p className="text-ink-faint mt-3 text-xs leading-relaxed">
            {status.model} · {status.perMinute}/min per visitor · {status.servedToday} of{" "}
            {status.dailyCeiling} answered today. The counters live in one server instance, so they
            are a spend brake rather than a security control. Past the daily ceiling this falls back
            to the recorded turns below.
          </p>
        )}
      </form>
    </div>
  );
}
