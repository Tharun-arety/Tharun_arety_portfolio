/**
 * The model client. One operation, which is all this agent needs: stream an
 * answer and report what it cost.
 *
 * No tool calling and no router, because there is nothing to route to and
 * nothing to call — the whole corpus is already in the prompt. That absence is
 * the design, not a missing feature.
 *
 * Deliberately absent: `temperature` and `top_p`. Newer models reject
 * non-default sampling parameters outright, and leaving them unset keeps this
 * portable across whatever model id ends up in the environment.
 *
 * Shape follows `Agent_Architecture_model/lib/ai/openai.ts`.
 */

import OpenAI from "openai";

import { config, hasOpenAIKey } from "@/lib/agent/config";

export type Usage = { inputTokens: number; outputTokens: number; model: string };

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

let cached: OpenAI | null = null;

function client(): OpenAI {
  if (!hasOpenAIKey()) {
    throw new Error(
      "OPENAI_API_KEY is not set. This agent has no stub mode: a canned answer " +
        "on a page that argues for measurable AI would misrepresent the whole site.",
    );
  }
  if (!cached) cached = new OpenAI({ apiKey: config.openaiApiKey });
  return cached;
}

export type StreamResult = { text: string; usage: Usage };

/**
 * Stream the answer, yielding deltas, and return the finished text with usage.
 *
 * Usage arrives on the final chunk only when `stream_options.include_usage` is
 * set — without it the caller has to estimate, and an estimated cost on this
 * particular site would be a small lie.
 */
export async function* streamAnswer(
  messages: ChatMessage[],
  onDone: (result: StreamResult) => void,
): AsyncGenerator<string> {
  const stream = await client().chat.completions.create({
    model: config.model,
    messages,
    max_tokens: config.maxOutputTokens,
    stream: true,
    stream_options: { include_usage: true },
  });

  let text = "";
  let usage: Usage = { inputTokens: 0, outputTokens: 0, model: config.model };

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      text += delta;
      yield delta;
    }
    if (chunk.usage) {
      usage = {
        inputTokens: chunk.usage.prompt_tokens ?? 0,
        outputTokens: chunk.usage.completion_tokens ?? 0,
        model: config.model,
      };
    }
  }

  onDone({ text, usage });
}
