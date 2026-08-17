/**
 * POST /api/ask — one turn with the site's own agent, streamed as SSE.
 *
 * Frames:
 *   guardrail  {id, passed, reason?, detail?, latencyMs}   one verdict, as decided
 *   token      {text}                                       one delta of the answer
 *   trace      {...}                                        the turn, measured
 *   final      {text, refused}                              authoritative answer
 *   error      {message}
 *
 * The trace frame is why this route streams rather than returning JSON: the
 * panel renders latency, tokens, cost and every guardrail verdict in the same
 * notation as the recorded turns elsewhere on the site. A live agent that
 * cannot show its own working would sit badly next to six that can.
 *
 * Node runtime: the OpenAI SDK and the streaming generator want it. This is the
 * site's only dynamic route; everything else prerenders.
 */

import { config, hasOpenAIKey, isPriced, priceUsd } from "@/lib/agent/config";
import { runInputGuardrails, type GuardrailVerdict } from "@/lib/agent/guardrails";
import {
  budgetStatus,
  checkRateLimit,
  clientKey,
  consumeDailyBudget,
  sweep,
} from "@/lib/agent/limits";
import { streamAnswer, type ChatMessage } from "@/lib/agent/openai";
import {
  NDA_LEAK_REPLACEMENT,
  SYSTEM_PROMPT,
  answerLeaksNda,
  invalidSheetCitations,
} from "@/lib/agent/prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Frame = { event: string; data: unknown };

const sse = (frame: Frame): string =>
  `event: ${frame.event}\ndata: ${JSON.stringify(frame.data)}\n\n`;

type Turn = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  if (!hasOpenAIKey()) {
    return Response.json(
      {
        error:
          "The agent is not configured on this deployment. The recorded turns further down " +
          "the page are real captures and need no key.",
      },
      { status: 503 },
    );
  }

  sweep();
  const rate = checkRateLimit(clientKey(request), config.rateLimitPerMinute);
  if (!rate.allowed) {
    return Response.json(
      {
        error:
          `That is ${config.rateLimitPerMinute} questions in a minute, which is the cap. ` +
          "This endpoint spends a real API key, so the limit is deliberate — try again shortly.",
      },
      { status: 429, headers: { "retry-after": String(rate.retryAfterSeconds) } },
    );
  }

  let body: { message?: unknown; history?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body must be JSON." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return Response.json({ error: "`message` is required." }, { status: 400 });
  if (message.length > config.maxInputChars) {
    return Response.json(
      { error: `Questions are limited to ${config.maxInputChars} characters.` },
      { status: 400 },
    );
  }

  // Guardrails run before the budget is consumed: a refused question should
  // never eat into the day's allowance, because it never reaches the model.
  const guard = runInputGuardrails(message);

  const history: Turn[] = Array.isArray(body.history)
    ? body.history
        .filter(
          (turn): turn is Turn =>
            !!turn &&
            typeof turn === "object" &&
            ["user", "assistant"].includes((turn as Turn).role) &&
            typeof (turn as Turn).content === "string",
        )
        .slice(-config.maxHistoryTurns)
    : [];

  const started = performance.now();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const emit = (frame: Frame) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(sse(frame)));
        } catch {
          closed = true; // client went away mid-stream
        }
      };

      const finish = (
        text: string,
        refused: boolean,
        refusedBy: string | null,
        verdicts: GuardrailVerdict[],
        usage: { inputTokens: number; outputTokens: number; model: string } | null,
      ) => {
        emit({
          event: "trace",
          data: {
            durationMs: Math.round(performance.now() - started),
            guardrails: verdicts,
            refusedBy,
            model: usage?.model ?? config.model,
            inputTokens: usage?.inputTokens ?? 0,
            outputTokens: usage?.outputTokens ?? 0,
            costUsd: usage
              ? Math.round(priceUsd(usage.model, usage.inputTokens, usage.outputTokens) * 1_000_000) /
                1_000_000
              : 0,
            costKnown: usage ? isPriced(usage.model) : true,
            modelCalls: usage ? 1 : 0,
          },
        });
        emit({ event: "final", data: { text, refused } });
        closed = true;
        try {
          controller.close();
        } catch {
          /* already closed by a disconnect */
        }
      };

      try {
        for (const verdict of guard.verdicts) emit({ event: "guardrail", data: verdict });

        // A deterministic refusal: no model call, no tokens, no cost.
        if (guard.blocked) {
          for (const char of guard.blocked.reason) emit({ event: "token", data: { text: char } });
          finish(guard.blocked.reason, true, guard.blocked.by.id, guard.verdicts, null);
          return;
        }

        // Only now does the turn cost anything, so only now does it count.
        const budget = consumeDailyBudget(config.dailyCeiling);
        if (!budget.allowed) {
          const text =
            `This agent has answered its ${budget.ceiling} questions for today — a deliberate ` +
            "ceiling, since the endpoint spends a real API key. The six recorded turns further " +
            "down the page are real captures and are always available. It resets at 00:00 UTC.";
          for (const char of text) emit({ event: "token", data: { text: char } });
          finish(text, true, "budget.daily", guard.verdicts, null);
          return;
        }

        const messages: ChatMessage[] = [
          { role: "system", content: SYSTEM_PROMPT },
          ...history.map((turn) => ({ role: turn.role, content: turn.content }) as ChatMessage),
          { role: "user", content: guard.text },
        ];

        let usage: { inputTokens: number; outputTokens: number; model: string } | null = null;
        let answer = "";

        for await (const delta of streamAnswer(messages, (result) => {
          usage = result.usage;
          answer = result.text;
        })) {
          emit({ event: "token", data: { text: delta } });
        }

        // Output checks. The NDA tripwire is the third layer over the same
        // constraint — the filter caught the question, this catches the answer.
        const outputVerdicts = [...guard.verdicts];

        if (answerLeaksNda(answer)) {
          outputVerdicts.push({
            id: "input.nda",
            passed: false,
            reason: "The generated answer contained a client-identifying term and was replaced.",
            latencyMs: 0,
          });
          finish(NDA_LEAK_REPLACEMENT, true, "output.nda", outputVerdicts, usage);
          return;
        }

        const badSheets = invalidSheetCitations(answer);
        if (badSheets.length > 0) {
          // Not fatal — the prose is still useful — but recorded, because a
          // citation to a sheet that does not exist is the failure this site
          // spends a whole section arguing against.
          outputVerdicts.push({
            id: "input.scope",
            passed: false,
            reason: `Cited ${badSheets.length === 1 ? "a sheet" : "sheets"} that do not exist: ${badSheets.join(", ")}.`,
            detail: { citedButMissing: badSheets },
            latencyMs: 0,
          });
        }

        finish(answer, false, null, outputVerdicts, usage);
      } catch (cause) {
        const detail = cause instanceof Error ? cause.message : String(cause);
        console.error("Ask turn failed:", cause);
        emit({ event: "error", data: { message: detail } });
        closed = true;
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      // Vercel's proxy and nginx both buffer by default, which turns a stream
      // into one delivery at the end. This is the header that stops it.
      "x-accel-buffering": "no",
    },
  });
}

/** Cheap status for the interface's own disclosure — no key spent. */
export async function GET() {
  const budget = budgetStatus(config.dailyCeiling);
  return Response.json({
    configured: hasOpenAIKey(),
    model: config.model,
    perMinute: config.rateLimitPerMinute,
    servedToday: budget.served,
    dailyCeiling: budget.ceiling,
    available: budget.allowed,
  });
}
