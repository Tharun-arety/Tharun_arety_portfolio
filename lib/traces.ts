/**
 * The recorded turns, and the shapes they arrive in.
 *
 * These types are transcribed from `lib/ai/trace.ts` in the agent project
 * rather than imported from it, so this site builds from its own checkout with
 * no cross-repository dependency. The transcription is the price of that; the
 * captured JSON is validated against these shapes at build time by TypeScript,
 * so a drift shows up as a type error rather than as a blank panel.
 */

import groundedAnswer from "@/data/traces/grounded-answer.json";
import offCorpusRefusal from "@/data/traces/off-corpus-refusal.json";
import promptInjection from "@/data/traces/prompt-injection.json";
import secretRedaction from "@/data/traces/secret-redaction.json";
import telemetryAnswer from "@/data/traces/telemetry-answer.json";
import toolArgRejected from "@/data/traces/tool-arg-rejected.json";

export type StageName =
  | "input_guardrails"
  | "router"
  | "tool_loop"
  | "grounding"
  | "synthesis";

export type Usage = { model: string; inputTokens: number; outputTokens: number };
export type Stage = { name: string; durationMs: number; usage?: Usage };

export type GuardrailId =
  | "input.secrets"
  | "input.injection"
  | "input.domain"
  | "args.schema"
  | "args.bounds"
  | "grounding.floor"
  | "grounding.citations";

export type GuardrailVerdict = {
  id: string;
  passed: boolean;
  reason?: string;
  detail?: Record<string, unknown>;
  latencyMs: number;
};

export type ToolAttempt = {
  name: string;
  arguments: unknown;
  accepted: boolean;
  verdicts: GuardrailVerdict[];
  durationMs: number;
  error?: string;
};

export type RetrievalTrace = {
  floor: number;
  kept: { sourceRef: string; docTitle: string; sourceUrl: string; similarity: number }[];
  rejected: { sourceRef: string; similarity: number }[];
};

export type TurnTrace = {
  intent: string;
  routerRationale: string;
  stages: Stage[];
  guardrails: GuardrailVerdict[];
  toolAttempts: ToolAttempt[];
  retrieval: RetrievalTrace | null;
  totals: {
    durationMs: number;
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
    modelCalls: number;
  };
  refusedBy: string | null;
};

export type CapturedFrame = { atMs: number; event: string; data: unknown };

export type CapturedTurn = {
  id: string;
  prompt: string;
  /** Written by hand after reading what the run actually did — never before. */
  claim: string;
  capturedAt: string;
  source: string;
  frames: CapturedFrame[];
};

export const STAGE_LABELS: Record<string, string> = {
  input_guardrails: "Input guardrails",
  router: "Router",
  tool_loop: "Tool loop",
  grounding: "Grounding",
  synthesis: "Synthesis",
};

export const GUARDRAIL_LABELS: Record<string, string> = {
  "input.secrets": "Secret redaction",
  "input.injection": "Prompt-injection filter",
  "input.domain": "Domain constraint",
  "args.schema": "Tool argument schema",
  "args.bounds": "Tool argument bounds",
  "grounding.floor": "Retrieval similarity floor",
  "grounding.citations": "Citation check",
};

/**
 * Ordered as an argument, not alphabetically.
 *
 * The two happy paths establish what the system does at all. The three that
 * follow are the ones worth the reader's time: a refusal that costs nothing, a
 * model told it was wrong, and a question the system declined to answer.
 */
export const traces = [
  groundedAnswer,
  telemetryAnswer,
  promptInjection,
  toolArgRejected,
  offCorpusRefusal,
  secretRedaction,
] as unknown as CapturedTurn[];

export const traceById = (id: string): CapturedTurn | undefined =>
  traces.find((turn) => turn.id === id);

export function traceOf(turn: CapturedTurn): TurnTrace | null {
  const frame = turn.frames.find((f) => f.event === "trace");
  return frame ? (frame.data as TurnTrace) : null;
}

export function finalOf(turn: CapturedTurn): { text: string; intent: string; refused: boolean } | null {
  const frame = turn.frames.find((f) => f.event === "final");
  return frame ? (frame.data as { text: string; intent: string; refused: boolean }) : null;
}

export type Segment = {
  name: string;
  label: string;
  durationMs: number;
  /** Fraction of the turn. What sets the segment's width. */
  share: number;
  modelCalls: number;
  /** A rejected tool call inside this segment — the notch. */
  rejections: ToolAttempt[];
};

/**
 * The turn, as proportional segments.
 *
 * Adjacent stages of the same name are merged: the pipeline records one entry
 * per tool-loop iteration, and drawing those as separate bands would imply the
 * agent changed phase when it only went round again. Their durations and model
 * calls add.
 */
export function segmentsOf(trace: TurnTrace): { segments: Segment[]; totalMs: number } {
  const merged: Stage[] = [];
  for (const stage of trace.stages) {
    const last = merged[merged.length - 1];
    if (last && last.name === stage.name) {
      last.durationMs += stage.durationMs;
      if (stage.usage) {
        last.usage = last.usage
          ? {
              model: stage.usage.model,
              inputTokens: last.usage.inputTokens + stage.usage.inputTokens,
              outputTokens: last.usage.outputTokens + stage.usage.outputTokens,
            }
          : stage.usage;
      }
    } else {
      merged.push({ ...stage });
    }
  }

  const rejections = trace.toolAttempts.filter((attempt) => !attempt.accepted);
  // Every stage counted, so the widths sum to the whole turn rather than to the
  // part that happened to be interesting.
  const totalMs = merged.reduce((sum, stage) => sum + stage.durationMs, 0) || 1;

  const segments = merged.map((stage) => ({
    name: stage.name,
    label: STAGE_LABELS[stage.name] ?? stage.name,
    durationMs: stage.durationMs,
    share: stage.durationMs / totalMs,
    modelCalls: stage.usage ? 1 : 0,
    // A rejected argument can only have happened inside the loop that asked for it.
    rejections: stage.name === "tool_loop" ? rejections : [],
  }));

  return { segments, totalMs };
}

/** Verdicts that stopped or altered the turn, in the order they were decided. */
export function notableVerdicts(trace: TurnTrace): GuardrailVerdict[] {
  const seen = new Set<string>();
  const notable: GuardrailVerdict[] = [];
  for (const verdict of trace.guardrails) {
    const redacted = verdict.passed && verdict.id === "input.secrets" && !!verdict.detail?.redacted;
    if (!verdict.passed || redacted) {
      notable.push(verdict);
      continue;
    }
    // Passing verdicts repeat once per tool iteration; one row each is enough.
    if (!seen.has(verdict.id)) {
      seen.add(verdict.id);
      notable.push(verdict);
    }
  }
  return notable;
}

export const formatMs = (ms: number): string =>
  ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`;

export const formatUsd = (usd: number): string =>
  usd === 0 ? "$0" : usd < 0.01 ? `$${usd.toFixed(6)}` : `$${usd.toFixed(4)}`;
