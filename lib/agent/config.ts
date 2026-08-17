/**
 * Everything the agent's behaviour depends on, in one place, from the
 * environment.
 *
 * No model id is hard-coded in the source. The default matches
 * Agent_Architecture_model, so both projects run on the same key, the same
 * model family and the same bill unless someone deliberately changes one.
 */

export const config = {
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  model: process.env.OPENAI_MODEL || "gpt-4o-mini",

  /** Per-IP, per-minute. A spend brake, not a security control — see rate-limit.ts. */
  rateLimitPerMinute: Number(process.env.ASK_RATE_LIMIT_PER_MINUTE ?? 6),

  /** Whole-deployment ceiling per UTC day. Past it the agent goes read-only. */
  dailyCeiling: Number(process.env.ASK_DAILY_CEILING ?? 300),

  /** Answers are short by design; the corpus is small and the questions are direct. */
  maxOutputTokens: Number(process.env.ASK_MAX_OUTPUT_TOKENS ?? 600),

  /** Turns of history carried into the next request. Keeps the prefix bounded. */
  maxHistoryTurns: Number(process.env.ASK_MAX_HISTORY_TURNS ?? 6),

  /** Longest question accepted. A JD paste needs room; a novel does not. */
  maxInputChars: Number(process.env.ASK_MAX_INPUT_CHARS ?? 6000),
} as const;

export const hasOpenAIKey = (): boolean => config.openaiApiKey.length > 0;

/**
 * USD per million tokens. Only what this project might actually be pointed at.
 * An unknown model prices at zero rather than guessing — a made-up cost on a
 * page that argues for measurement would be worse than no cost at all.
 */
const PRICING: Record<string, { input: number; output: number }> = {
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-4o": { input: 2.5, output: 10 },
  "gpt-4.1-mini": { input: 0.4, output: 1.6 },
  "gpt-4.1": { input: 2, output: 8 },
};

export function priceUsd(model: string, inputTokens: number, outputTokens: number): number {
  const rate = PRICING[model];
  if (!rate) return 0;
  return (inputTokens * rate.input + outputTokens * rate.output) / 1_000_000;
}

export const isPriced = (model: string): boolean => model in PRICING;
