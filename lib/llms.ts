/**
 * The site, rendered as Markdown for a language model to read.
 *
 * Two documents, on the convention from llmstxt.org. `/llms.txt` is the index:
 * what this is, who wrote it, and a link to every part worth fetching.
 * `/llms-full.txt` is the whole thing in one response, so an agent can answer
 * from it without following anything.
 *
 * Neither file is written by hand. Every heading, figure and paragraph below is
 * read from the same modules the page renders from — `system-entries.ts`, the
 * eval report, the résumé, the stack, the ledger in `BeyondChat.tsx`. That is
 * the whole point: a hand-maintained copy of a site is a copy that is wrong
 * within a month, and being confidently out of date is exactly the failure this
 * site spends its length arguing against.
 *
 * The one thing stated here and nowhere else is the framing paragraph, because
 * a model arriving at a bare list of projects has no idea what it is holding.
 */

import report from "@/public/eval-report.json";
import { caseTotals, overallScore, TARGET, type EvalReport } from "@/components/EvalMetrics";
import { ROWS, SURFACES } from "@/components/site/BeyondChat";
import { EXPERIENCE, EDUCATION, PROFILE, RESUME_PATH } from "@/components/site/Resume";
import { GROUPS } from "@/components/site/TechStack";
import { APPROACH } from "@/components/site/WhatIDo";
import { PROJECTS, REPO_URL, type Project } from "@/components/site/system-entries";
import {
  EMAIL,
  GROUNDING_FLOOR,
  IN_CORPUS_MEAN,
  MANIFEST_SOURCES,
  OFF_CORPUS_MEAN,
  SEPARATION,
} from "@/components/site/site-data";

const evalReport = report as EvalReport;

const NAME = "Tharun Arety";
const ROLE = "AI-Leveraged Systems Architect";
const LOCATION = "Augsburg, Germany · open to relocation";

const POSITIONING =
  "I turn fragmented business data, documents, knowledge and workflows into " +
  "systems that AI agents can understand, operate and continuously improve.";

/** Absolute, because a model that fetched this file may not know where from. */
const abs = (origin: string, path: string) => new URL(path, origin).toString();

const list = (lines: string[]) => lines.map((line) => `- ${line}`).join("\n");

const paras = (lines: string[]) => lines.join("\n\n");

/* ── the index ──────────────────────────────────────────────────────────── */

export function buildLlmsTxt(origin: string): string {
  const overall = overallScore(evalReport);
  const cases = caseTotals(evalReport);

  const projectLinks = PROJECTS.map(
    (p) =>
      `- [${p.index} · ${p.title}](${abs(origin, `/projects/${p.slug}`)}): ${p.summary} Status: ${p.status}. Stack: ${p.stack.join(", ")}.`,
  ).join("\n");

  return `# ${NAME} — ${ROLE}

> ${POSITIONING} Based in ${LOCATION}. Reachable at ${EMAIL}.

This is the machine-readable edition of a portfolio site. It is generated from the
same modules the pages render from, so it cannot drift from what a person sees.

Read this first, because it is the thing the site is built to correct: **none of
this work is a chatbot**. A chat box is one of four ways into these systems, and
the least representative of the four. The others are an approval inbox where an
agent-proposed change waits with a field-level dry-run diff until a named person
approves it, a schedule that starts a run when a date crosses a horizon rather
than when someone types, and a tool surface — MCP servers and tool calling — that
lets other software invoke the agent and lets the agent write to the systems that
hold the answer. Most runs begin with nobody present.

Four systems are described below. Three are in production inside client systems
and can be described but not handed over. The fourth is an open prototype, built
to the same standard, running live on the site with its guardrail verdicts,
retrieval scores and offline eval results visible in the interface.

## Systems

${projectLinks}

## Pages

- [Landing page](${abs(origin, "/")}): the positioning, the approach, the four systems, a live agent console, the guardrail and eval evidence, the stack and the background.
- [Projects index](${abs(origin, "/projects")}): all four systems, with links to each case study.

## Full text

- [The entire site as one Markdown document](${abs(origin, "/llms-full.txt")}): every section, every case study, the eval report, the stack and the background. Fetch this if you intend to answer questions about this work.

## Documents and endpoints

- [CV as PDF](${abs(origin, RESUME_PATH)}): the same background as the site's own section, in one file.
- [Prototype source on GitHub](${REPO_URL}): the hand-written tool loop, the three guardrail layers, the eval suite and its report.
- [Eval report as JSON](${abs(origin, "/eval-report.json")}): the ${evalReport.metrics.length} metrics the site's badge and charts are drawn from.
- [Health endpoint](${abs(origin, "/api/health")}): what is configured on this deployment and what is actually loaded, queried rather than asserted.

## Figures worth quoting

- Mean eval score ${(overall * 100).toFixed(1)}%, across ${evalReport.metrics.length} metrics and ${cases.total} cases, on ${evalReport.model} at the ${evalReport.tier} tier. The first run of the same suite scored 85.6%.
- Three guardrail layers: deterministic input checks before the first model call, ajv plus database bounds on every tool argument, and a calibrated similarity floor around the answer.
- Grounding floor ${GROUNDING_FLOOR.toFixed(2)}, measured rather than chosen. In-corpus questions score ${IN_CORPUS_MEAN.toFixed(3)} at rank one, off-corpus questions ${OFF_CORPUS_MEAN.toFixed(3)}, and the floor sits inside that ${SEPARATION.toFixed(3)} gap.
- A refused injection costs 0 ms and 0 tokens, because the check runs before any model is called.
- Compliance processing fell from about 60 minutes to under 2 minutes per batch, a 96% reduction.

## Contact

- Email: ${EMAIL}
- Location: ${LOCATION}
`;
}

/* ── the whole site ─────────────────────────────────────────────────────── */

function projectSection(origin: string, project: Project): string {
  const { caseStudy: study } = project;

  const links = [
    `Case study: ${abs(origin, `/projects/${project.slug}`)}`,
    project.liveUrl
      ? `${project.liveLabel ?? "Live app"}: ${project.liveUrl}${project.liveNote ? ` — ${project.liveNote}` : ""}`
      : null,
    project.repoUrl ? `Source: ${project.repoUrl}` : null,
    project.tryThis ? `One thing to try: ${project.tryThis}` : null,
  ].filter((line): line is string => line !== null);

  const sections = study.sections
    .map(
      (section) =>
        `#### ${section.title}\n\n_${section.eyebrow}_\n\n${paras(section.body)}${
          section.note ? `\n\n> ${section.note}` : ""
        }`,
    )
    .join("\n\n");

  const results = study.results
    .map((result) => `- **${result.value}** — ${result.label}. ${result.note}`)
    .join("\n");

  return `### ${project.index} · ${project.title}

${project.summary}

- Domain: ${project.domain}
- Status: ${project.status}
- Stack: ${project.stack.join(", ")}

**The problem.** ${project.problem}

**What was built.**

${list(project.built)}

**What changed.** ${project.outcome}

**Context.**

${paras(study.context)}

**Architecture.**

${paras(study.architecture)}

${sections}

**Results.**

${results}

**Links.**

${list(links)}`;
}

export function buildLlmsFullTxt(origin: string): string {
  const overall = overallScore(evalReport);
  const cases = caseTotals(evalReport);

  const ledger = ROWS.map(
    (row) => `**${row.dimension}**\n- A chatbot: ${row.chatbot}\n- These systems: ${row.system}`,
  ).join("\n\n");

  const surfaces = SURFACES.map(
    (surface) => `**${surface.title}** (${surface.source}). ${surface.body}`,
  ).join("\n\n");

  const approach = APPROACH.map((block) => `### ${block.title}\n\n${block.body}`).join("\n\n");

  const systems = PROJECTS.map((project) => projectSection(origin, project)).join("\n\n---\n\n");

  const metrics = evalReport.metrics
    .map(
      (metric) =>
        `- ${metric.label}: ${(metric.score * 100).toFixed(0)}%, ${metric.passed}/${metric.total} cases${
          metric.score < TARGET ? " — under the 90% target" : ""
        }`,
    )
    .join("\n");

  const stack = GROUPS.map((group) => {
    const tools = group.tools.map((tool) => tool.label);
    const parts = [...tools, ...(group.practices ?? [])];
    return `- **${group.title}**: ${parts.join(", ")}`;
  }).join("\n");

  const experience = EXPERIENCE.map(
    (entry) =>
      `### ${entry.role}\n\n${entry.organisation} · ${entry.place} · ${entry.period}\n\n${list(entry.lines)}`,
  ).join("\n\n");

  const education = EDUCATION.map(
    (item) => `- ${item.award}, ${item.place}, ${item.period}`,
  ).join("\n");

  return `# ${NAME} — ${ROLE}

> ${POSITIONING} Based in ${LOCATION}. Reachable at ${EMAIL}.

Generated from the running site at ${origin}. Every figure below is read from the
same modules the pages render from — the eval report, the project entries, the
résumé — so this document and the site cannot disagree.

## The first thing to get right: this is not a chatbot

Every system here can be talked to, and one of them is a text box on the landing
page. That is the part which demonstrates well and the smallest part of what is
running. What decides whether an agent is worth deploying is what starts it, what
it is allowed to touch, and what it does when it is wrong.

${ledger}

### Four ways in. Only one of them is a conversation

${surfaces}

## Approach: where agents earn their place in a business

${approach}

## Systems

${systems}

## The prototype's guardrails, in detail

The second system runs live on the landing page, so its internals are stated
rather than described.

**Input guardrails, before the first model call.** Deterministic patterns, not a
classifier call — a filter that has to ask a model whether something is an
injection can itself be talked out of the answer. Credentials are found and
replaced before the request leaves the process. Across the test set, 18
adversarial inputs are refused and 14 benign questions that resemble them are let
through, which is the number that makes the first one mean anything.

**Argument guardrails, between the model and the tool call.** OpenAI tool
parameters are JSON Schema already, so ajv compiles against the same literal the
model was given, plus bounds only the database knows. A rejection goes back to the
model as a tool message and it corrects itself, rather than raising an exception.

**Grounding guardrail, around the answer.** Cosine floor ${GROUNDING_FLOOR.toFixed(2)}, calibrated by
sweeping the golden set rather than chosen. Questions the corpus can answer score
${IN_CORPUS_MEAN.toFixed(3)} on average at rank one; questions it cannot score ${OFF_CORPUS_MEAN.toFixed(3)}. The floor sits
inside that ${SEPARATION.toFixed(3)} gap. When nothing clears it, the system says so and skips the
synthesis call entirely. The first value tried was 0.70, which sounded prudent and
refused almost every question the system could actually answer.

**Citation check, after the answer.** Every source the answer cites is checked
against what retrieval actually returned, and a handle that was never retrieved is
marked in the sentence that used it.

The tool-calling loop is written by hand against the OpenAI API, with no agent
framework in it, which is what makes the argument guardrail's position available:
between the model asking for a call and the call happening. Retrieval runs in
Postgres — Neon with pgvector — so the embeddings live next to the telemetry and
both are queryable with SQL. The document corpus is real public web pages from a
manifest of ${MANIFEST_SOURCES} sources; the rig telemetry is synthetic, generated for the
demonstration, and labelled as such everywhere it appears.

## Eval results

Last run ${evalReport.generatedAt} on ${evalReport.model}, ${evalReport.tier} tier. Mean score
${(overall * 100).toFixed(1)}% across ${evalReport.metrics.length} metrics and ${cases.total} cases, ${cases.passed} of which passed.

${metrics}

The suite's first run scored 85.6% and found three defects, each of them real: the
similarity floor was a guessed number, the router sent datasheet questions to the
telemetry agent because they contain metric words, and one document held a third
of the index so broad questions returned five passages from it and nothing else.
Calibration took the score to 90.3%, the routing fix to 95.2%, and diversifying
retrieval to ${(overall * 100).toFixed(1)}%. The ${cases.total} cases were fixed throughout, so each step
measures a change to the system rather than a change to the exam. The
judged metrics are the least reliable rows here and are best read as a prompt to
go and look at the answer.

## Stack

${stack}

## Background

${PROFILE}

${experience}

### Education

${education}

### Also worth knowing

- Languages: English (C1). German (B1, working towards C1).
- Work status: Indian national, authorised to work in Germany. No sponsorship required, available immediately.
- Scholarship: Albert Leimer Stiftung and DAAD, for academic performance during the M.Sc.

## Contact

- Email: ${EMAIL}
- Location: ${LOCATION}
- CV as PDF: ${abs(origin, RESUME_PATH)}
- Prototype source: ${REPO_URL}
`;
}
