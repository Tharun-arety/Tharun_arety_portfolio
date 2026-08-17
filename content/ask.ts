/**
 * What is worth asking, from wherever you happen to be standing.
 *
 * The agent is reachable from every page, and a fixed set of four starter
 * questions would be wrong on most of them — "do you use retrieval?" is a good
 * opener under the thesis and a strange one halfway down the TalentFlow sheet.
 * So the suggestions are keyed by route.
 *
 * Kept as its own module rather than derived from `content/systems.ts` because
 * the dock is a client component: importing the systems would ship the entire
 * case-study corpus to the browser on every page to render four short strings.
 */

export const DEFAULT_ASKS = [
  "What guardrails does the magnetocaloric agent run, and what did it score?",
  "How did a materials engineer end up building agent systems?",
  "What is the difference between sheet 03 and sheet 04?",
  "Do you use retrieval?",
];

/** Keyed by pathname. `/systems/[slug]` entries are looked up by full path. */
const BY_ROUTE: Record<string, string[]> = {
  "/resume": [
    "Paste a job description and I will map it against these systems.",
    "Which of these systems is closest to a platform engineering role?",
    "What is he actually accountable for having built end to end?",
    "Where is the materials engineering still doing work?",
  ],

  "/method": [
    "What does the NDA build gate actually do when it fires?",
    "Why measure a guardrail's false positives rather than its block rate?",
    "What broke while building this site?",
    "How much of this site did an agent write?",
  ],

  "/systems/agentic-enterprise-os": [
    "Why put an agent layer over three systems instead of building a fourth?",
    "What can you say about this client engagement, and what can you not?",
    "How does this differ from the compliance system on sheet 02?",
    "What does MCP do here that a plain API call would not?",
  ],

  "/systems/autonomous-compliance-system": [
    "Where does the 60 minutes to under 2 minutes figure come from?",
    "What is the human still deciding in this system?",
    "What can you say about this client, and what can you not?",
    "What happens when a document arrives that the system cannot parse?",
  ],

  "/systems/agentic-pdm-ecm-qms": [
    "What is the ECR to CCB to ECO to ECN gate, and why build it that way?",
    "Why write back to Excel instead of migrating the data?",
    "What does ISO 10007 require that this system implements?",
    "What is in the approval inbox screenshot and why does it matter?",
  ],

  "/systems/magnetocaloric-engineering-agent": [
    "Walk me through the rig_999 screenshot — what actually happened there?",
    "Why is the grounding floor 0.35 and not something higher?",
    "Which two eval metrics scored worst, and why show them?",
    "What does the argument guardrail do that a schema check does not?",
  ],

  "/systems/talentflow": [
    "Why is this invite-only when it makes the demo harder to show?",
    "What runs locally without provisioning anything, and how?",
    "What does the scorecard screenshot demonstrate about the design?",
    "Is this a CRUD demo or is something harder going on?",
  ],
};

export function asksFor(pathname: string): string[] {
  return BY_ROUTE[pathname] ?? DEFAULT_ASKS;
}
