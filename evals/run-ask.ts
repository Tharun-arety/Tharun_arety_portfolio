/**
 * Guardrail evals for the site agent.
 *
 * No model call, so this is free and fast enough to run on every commit. It
 * reports two numbers, and the second is the one that matters:
 *
 *   trigger rate       — adversarial inputs blocked by the *named* guardrail
 *   false-positive rate — benign inputs wrongly blocked
 *
 * Reporting only the first would be the exact failure this site spends a
 * section arguing against: a filter that refuses everything scores 100% and is
 * useless. A regression in the benign half is a visitor discovering the agent
 * cannot answer the question they came with.
 *
 *   npm run eval:ask
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { runInputGuardrails } from "../lib/agent/guardrails";

type Adversarial = { id: string; query: string; expect: string };
type Benign = { id: string; query: string; because: string };

const cases = JSON.parse(
  readFileSync(join(process.cwd(), "evals", "ask.cases.json"), "utf8"),
) as { adversarial: Adversarial[]; benign: Benign[] };

let triggered = 0;
let wrongGuardrail = 0;
const missed: string[] = [];
const misattributed: string[] = [];

for (const testCase of cases.adversarial) {
  const result = runInputGuardrails(testCase.query);
  if (!result.blocked) {
    missed.push(`${testCase.id} — expected ${testCase.expect}, was allowed through`);
    continue;
  }
  triggered += 1;
  if (result.blocked.by.id !== testCase.expect) {
    wrongGuardrail += 1;
    misattributed.push(
      `${testCase.id} — blocked by ${result.blocked.by.id}, expected ${testCase.expect}`,
    );
  }
}

let falsePositives = 0;
const wronglyBlocked: string[] = [];

for (const testCase of cases.benign) {
  const result = runInputGuardrails(testCase.query);
  if (result.blocked) {
    falsePositives += 1;
    wronglyBlocked.push(
      `${testCase.id} — blocked by ${result.blocked.by.id}\n      ${testCase.because}`,
    );
  }
}

const adversarialTotal = cases.adversarial.length;
const benignTotal = cases.benign.length;
const triggerRate = triggered / adversarialTotal;
const fpRate = falsePositives / benignTotal;

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

console.log("\nSite agent — input guardrails\n");
console.log(`  Trigger rate         ${pct(triggerRate)}  (${triggered}/${adversarialTotal} adversarial blocked)`);
console.log(`  Correct attribution  ${pct((triggered - wrongGuardrail) / adversarialTotal)}  (blocked by the expected guardrail)`);
console.log(`  False-positive rate  ${pct(fpRate)}  (${falsePositives}/${benignTotal} benign wrongly blocked)`);

if (missed.length) {
  console.log("\n  Adversarial inputs that got through:");
  for (const line of missed) console.log(`    ✕ ${line}`);
}
if (misattributed.length) {
  console.log("\n  Blocked, but by the wrong guardrail:");
  for (const line of misattributed) console.log(`    ~ ${line}`);
}
if (wronglyBlocked.length) {
  console.log("\n  Benign questions wrongly refused:");
  for (const line of wronglyBlocked) console.log(`    ✕ ${line}`);
}

// Attribution is reported but not enforced: being blocked by the wrong gate is
// a labelling problem, not a safety one. Getting through, or refusing a real
// question, are both failures.
const ok = missed.length === 0 && wronglyBlocked.length === 0;
console.log(ok ? "\n  All cases behaved as specified.\n" : "\n  FAILED — see above.\n");
process.exit(ok ? 0 : 1);
