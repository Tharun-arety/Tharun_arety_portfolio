/**
 * What the agent is allowed to say about how this site was built.
 *
 * The method page at `/method` is written prose and stays that way — deriving a
 * designed page from a list of facts would make it worse. This module is the
 * agent's summary of the same material, so the two have to be edited together.
 * Everything here is checkable against a file in the repository; nothing that
 * is only an intention belongs in it.
 */

export const methodNotes: string[] = [
  "The whole site was built by one engineer working with coding agents. The claim the site makes is not about speed — it is that the repository refuses to let unverified work through, via build gates, eval suites and capture assertions.",

  "NDA build gate: scripts/build-corpus.ts assembles the agent's corpus, sweeps its own output for two client-identifying patterns, and calls process.exit(1) on a hit. It runs as the prebuild step, so it is on the path of every deploy. It was verified by planting a client name, watching the build fail, and reverting. The patterns are written as regular expressions rather than as the names, so the enforcing file does not become the leak.",

  "The site agent's guardrails are measured on both halves: evals/ask.cases.json holds 25 adversarial cases (NDA probes, injections, off-scope requests) and 18 benign cases that must not be refused. npm run eval:ask currently reports 100% trigger rate, 100% correct attribution and a 0.0% false-positive rate, and exits non-zero on either an adversarial miss or a wrongly refused benign question. Attribution is reported but not enforced.",

  "The eval suite found six real defects in hand-written guardrail code: 'python' in the scope vocabulary turned the agent into a free coding assistant; scope terms matched as substrings so 'the ' contained 'he ' and admitted 'weather in Berlin'; \\bclient\\b failed to match 'clients'; 'which company published ISO 10007?' was wrongly refused as an NDA probe; the phrase 'it's fine' tripped the social-engineering check on its own; and entity nouns missing from the scope list caused a legitimate question about a client engagement to be refused as off-topic.",

  "Screenshots are taken by scripts that assert before the shutter. The first Sheet 03 run produced three byte-identical pictures of a login form, because page.goto dropped an in-memory access token and every navigation bounced to sign-in; it was noticed only because two files had the same size. The three capture scripts now carry twelve assertions between them. Sheet 04 requires a guardrail verdict in the panel before it will shoot a refusal. Sheet 05 refuses to photograph any page showing an email address outside the reserved demo domains, so it cannot capture real candidate data.",

  "Conventions are written into the repositories rather than explained per session: three of these repositories carry an AGENTS.md and a CLAUDE.md, including a standing note that the installed Next.js differs from model training data and the local docs are the authority. The Sheet 03 toolchain began as a 308-line Plan.md settling the ISO 10007 reasoning and the propose-approve model before anything was built.",

  "Three failures from building this site are published on the method page. The hero's 'Explore the systems' link was diagnosed wrong twice — blamed on the router, rewritten as a native anchor, still broken — before the cause turned out to be scroll-behavior: smooth, which is now recorded in the README as the one thing not to reintroduce. The agent streamed every character twice because a React state updater mutated the last turn instead of replacing it, which React's development double-invoke surfaced. And the silent capture failure above. None of the three were found by re-reading the code; all were found by running it and checking the output against what it claimed to be.",

  "The method page is at /method. It is linked from the header on every page.",
];
