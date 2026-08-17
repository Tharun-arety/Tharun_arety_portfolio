/**
 * Everything the agent is allowed to know, assembled from what the site says.
 *
 * The agent has no retrieval. The whole corpus is ~9,300 tokens and fits in a
 * context window several times over, so a vector store here would be
 * infrastructure and a failure mode bought for nothing. This script is what
 * replaces it: one deterministic pass over the same content modules the pages
 * render, written to a committed JSON file.
 *
 * Two properties matter, and both are enforced rather than intended:
 *
 *   STABLE ORDER — the corpus becomes the head of every system prompt, so a
 *   reordered key is a cache miss on every request. Nothing here iterates an
 *   object without sorting it first.
 *
 *   NO CLIENT NAMES — two of the five systems were built under NDA. The sweep
 *   at the bottom runs over this script's own output and throws, which makes
 *   the constraint a build failure instead of a thing someone has to remember.
 *
 *   npm run build:corpus
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";

import evals from "../data/evals.json";
import { methodNotes } from "../content/method";
import { systems } from "../content/systems";
import {
  achievements,
  certifications,
  education,
  engineeringRepos,
  experience,
  languages,
  profile,
  skills,
} from "../content/profile";

/**
 * Terms that must never reach the agent's context.
 *
 * Written as patterns rather than as bare names so the file itself does not
 * become the leak — a reviewer can see the shape of what is excluded without
 * the repository recording the clients.
 */
const FORBIDDEN: { label: string; pattern: RegExp }[] = [
  { label: "client-1 (sector phrase)", pattern: /catering[\s-]?disposab/i },
  { label: "client-2 (name)", pattern: /\btrio\b/i },
];

function section(title: string, body: string): string {
  return `## ${title}\n\n${body.trim()}\n`;
}

function buildSystems(): string {
  // Ordered by sheet number, which is the order the site presents them in and
  // the order a reader will have met them in.
  const ordered = [...systems].sort((a, b) => a.sheet.localeCompare(b.sheet));

  return ordered
    .map((system) => {
      const lines: string[] = [
        `### Sheet ${system.sheet} — ${system.name}`,
        ``,
        `Context: ${system.context}`,
        `Evidence: ${system.evidence}`,
        `Summary: ${system.tagline}`,
        ``,
        `Problem: ${system.problem}`,
        ``,
        `What was built: ${system.built}`,
        ``,
        `Architecture: ${system.architecture.tiers
          .map((tier) => tier.nodes.map((node) => node.name).join(" + "))
          .join(" -> ")}`,
        `Architecture note: ${system.architecture.caption}`,
        ``,
        `Decisions and trade-offs:`,
        ...system.decisions.map((d) => `- ${d.title}: ${d.body}`),
        ``,
        `Outcomes:`,
        ...system.outcomes.map(
          (o) => `- ${o.value} — ${o.label}${o.note ? ` (${o.note})` : ""}`,
        ),
        ``,
        `Stack: ${system.stack.join(", ")}`,
      ];

      if (system.links.length > 0) {
        lines.push(`Links: ${system.links.map((l) => `${l.label} ${l.href}`).join(", ")}`);
      } else {
        lines.push(`Links: none published.`);
      }

      // So the agent can say a system is shown running rather than only described.
      if (system.evidenceShots?.length) {
        lines.push(
          `Screenshots on the case study (${system.evidenceShots.length}): ` +
            system.evidenceShots.map((shot) => shot.caption).join(" "),
        );
      }

      if (system.nda) {
        lines.push(``, `NDA: ${system.nda}`);
      }

      return lines.join("\n");
    })
    .join("\n\n");
}

function buildProfile(): string {
  return [
    `Name: ${profile.name}`,
    `Role sought: ${profile.role}`,
    `Location: ${profile.location} (${profile.relocation})`,
    `Email: ${profile.contact.email}`,
    `GitHub: ${profile.contact.github}`,
    `LinkedIn: ${profile.contact.linkedin}`,
    ``,
    `Thesis: ${profile.thesis}`,
    `Principle: ${profile.principle}`,
    ``,
    `Experience:`,
    ...experience.flatMap((role) => [
      `- ${role.title}, ${role.org} (${role.period})`,
      ...role.points.map((point) => `  · ${point}`),
    ]),
    ``,
    `Skills:`,
    ...skills.map((group) => `- ${group.label}: ${group.items.join(", ")}`),
    ``,
    `Education:`,
    ...education.map(
      (entry) => `- ${entry.degree}, ${entry.org} (${entry.period})${entry.note ? `. ${entry.note}` : ""}`,
    ),
    ``,
    `Achievements: ${achievements.map((a) => `${a.title} — ${a.note}`).join(" ")}`,
    `Certifications: ${certifications.join(", ")}`,
    `Languages: ${languages.map((l) => `${l.name} ${l.level}`).join(", ")}`,
    ``,
    `Open-source computational engineering:`,
    ...engineeringRepos.map((repo) => `- ${repo.name} (${repo.url}): ${repo.note}`),
  ].join("\n");
}

function buildEvals(): string {
  const generated = new Date(evals.generatedAt).toISOString().slice(0, 10);
  return [
    `These figures belong to Sheet 04 (Magnetocaloric Engineering Agent) only.`,
    `They are not measurements of any other system, and not of this website's own agent.`,
    ``,
    `Overall: ${(evals.overall * 100).toFixed(1)}% — ${evals.totals.passed} of ${evals.totals.total} cases.`,
    `Conditions: ${evals.tier} tier, model ${evals.model}, grounding floor ${evals.groundingFloor}, generated ${generated}.`,
    ``,
    `Per metric:`,
    ...[...evals.metrics]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(
        (metric) =>
          `- ${metric.label}: ${(metric.score * 100).toFixed(1)}% (${metric.passed}/${metric.total})`,
      ),
    ``,
    ...evals.notes.map((note) => `Note: ${note}`),
  ].join("\n");
}

const corpusText = [
  section("Who this is about", buildProfile()),
  section("The five systems", buildSystems()),
  section("Eval results for Sheet 04", buildEvals()),
  section("How this site itself was built", methodNotes.join("\n\n")),
].join("\n");

// --- The gate ---------------------------------------------------------------
// Runs over the built output rather than over the source files, so a client
// name introduced anywhere upstream — a new decision, an outcome note, a
// stack entry — is caught by the same check.
const hits = FORBIDDEN.filter((term) => term.pattern.test(corpusText));
if (hits.length > 0) {
  console.error("\nNDA GATE FAILED — the corpus contains client-identifying terms:\n");
  for (const hit of hits) {
    const match = corpusText.match(hit.pattern);
    console.error(`  ${hit.label}: matched ${JSON.stringify(match?.[0])}`);
  }
  console.error(
    "\nTwo of the five systems are under NDA. Describe them by problem shape and\n" +
      "architecture only, then rebuild. Nothing ships until this passes.\n",
  );
  process.exit(1);
}

const out = join(process.cwd(), "data", "corpus.json");
const approxTokens = Math.round(corpusText.length / 4);

writeFileSync(
  out,
  JSON.stringify(
    {
      builtBy: "scripts/build-corpus.ts",
      sources: ["content/profile.ts", "content/systems.ts", "data/evals.json"],
      approxTokens,
      text: corpusText,
    },
    null,
    2,
  ) + "\n",
);

console.log(
  `Corpus built: ${corpusText.length} chars, ~${approxTokens} tokens. NDA gate passed.`,
);
console.log(`Written to ${out}`);
