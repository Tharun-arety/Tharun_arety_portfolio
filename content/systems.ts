/**
 * The five systems, as case studies.
 *
 * Ordered by what a hiring manager should read first: professional work that
 * shipped to a business, then the reference implementations that can be opened
 * and read. Every entry uses the same fields so two of them can be compared
 * rather than merely admired.
 *
 * Two were built under NDA. They are described by problem shape, architecture
 * and result — never by client name, product name or geography beyond a region.
 * That constraint is stated on the page rather than worked around silently: a
 * reader who cannot see the client should at least be told why.
 */

import type { Tier } from "@/components/site/ArchitectureStack";

export type Decision = { title: string; body: string };
export type Architecture = { tiers: Tier[]; caption: string };

/**
 * Stills of the system actually running.
 *
 * Captured by a script rather than by hand — `scripts/capture-sheet03.ts` signs
 * in as a seeded role and photographs the real application against the real
 * database, so these can be regenerated rather than curated.
 */
export type EvidenceShot = {
  src: string;
  alt: string;
  caption: string;
  provenance: string;
  width: number;
  height: number;
};
export type Outcome = { value: string; label: string; note?: string };
export type SystemLink = { label: string; href: string; kind: "live" | "repo" | "none" };

export type Evidence = "live" | "open-source" | "under-nda";

export const EVIDENCE_LABEL: Record<Evidence, string> = {
  live: "Live",
  "open-source": "Open source",
  "under-nda": "Under NDA",
};

export type System = {
  slug: string;
  /** Two-digit sheet number. These are read in order, so the order is real. */
  sheet: string;
  name: string;
  context: string;
  tagline: string;
  tags: string[];
  evidence: Evidence;
  /** The one figure worth putting on the card, when there is one. */
  headline: Outcome | null;
  problem: string;
  built: string;
  architecture: Architecture;
  evidenceShots?: EvidenceShot[];
  decisions: Decision[];
  outcomes: Outcome[];
  stack: string[];
  links: SystemLink[];
  nda?: string;
};

export const systems: System[] = [
  {
    slug: "agentic-enterprise-os",
    sheet: "01",
    name: "Agentic Enterprise OS",
    context: "Client engagement · Vexos",
    tagline:
      "ERP, CRM and PDM behind a single agent layer, so the business can be asked questions instead of queried.",
    tags: ["ERP", "CRM", "PDM", "Agents", "RAG", "MCP"],
    evidence: "under-nda",
    headline: null,
    problem:
      "Operational reality was spread across three systems that did not know about each other, plus " +
      "the documents and institutional knowledge that never made it into any of them. Answering an " +
      "ordinary question — what does this customer actually own, and which revision is it on — meant " +
      "a person visiting each system in turn and reconciling the results by hand.",
    built:
      "An agentic layer over the three systems rather than a fourth system beside them. Structured " +
      "business records, unstructured documents and organizational knowledge are exposed to agents " +
      "through tools and retrieval, so a question in plain language resolves against whichever " +
      "systems actually hold the answer, and routine workflows execute without a person relaying " +
      "data between applications.",
    architecture: {
      tiers: [
        { nodes: [{ name: "People", sub: "plain language" }] },
        { nodes: [{ name: "Agent layer", sub: "routing · tools · retrieval" }] },
        {
          nodes: [
            { name: "ERP" },
            { name: "CRM" },
            { name: "PDM" },
            { name: "Documents", sub: "knowledge" },
          ],
        },
      ],
      caption:
        "The systems of record keep their data. The agent layer is the only new thing, and it is " +
        "the layer that can be removed without anything being lost.",
    },
    decisions: [
      {
        title: "An agent layer, not a migration",
        body:
          "The systems that already held the data kept holding it. Replacing them would have bought " +
          "a year of migration before the first useful answer; putting an agent in front of them " +
          "bought the answer first. The cost of that choice is that the layer has to be tolerant of " +
          "three different data models instead of imposing one.",
      },
      {
        title: "Knowledge treated as a system, not a folder",
        body:
          "Documents and decisions were structured for retrieval rather than dumped into a vector " +
          "store — because knowledge that outlives the person who wrote it is the actual deliverable, " +
          "and an unstructured corpus degrades into a search box nobody trusts.",
      },
    ],
    outcomes: [
      {
        value: "3 → 1",
        label: "Systems a user has to visit",
        // Structural, not measured — and said so, because every other figure on
        // this site is a measurement and the difference has to stay visible.
        note: "ERP, CRM and PDM answered through one interface. A property of the design rather than a measured result.",
      },
    ],
    stack: ["Agents", "RAG", "MCP", "Tool calling", "ERP / CRM / PDM integration"],
    links: [],
    nda:
      "Built for a client under NDA. The architecture and the reasoning are described here; the " +
      "client, the products and the data are not.",
  },

  {
    slug: "autonomous-compliance-system",
    sheet: "02",
    name: "Autonomous Compliance System",
    context: "Client engagement · Vexos",
    tagline:
      "Supplier certificates in, structured compliance out — and the renewal chase handled without anyone remembering to start it.",
    tags: ["Document AI", "Vision extraction", "Compliance", "Agentic workflow"],
    evidence: "under-nda",
    headline: {
      value: "~60 min → <2 min",
      label: "Certificate processing, per batch",
      note: "Measured against the manual process it replaced.",
    },
    problem:
      "Supplier certifications arrived as heterogeneous PDFs — different suppliers, different " +
      "issuing bodies, different jurisdictions, many of them scans. A person read each one, typed " +
      "what mattered into a spreadsheet, and was expected to notice when something was about to " +
      "expire. The failure mode was silent: nobody discovers an expired certificate until an audit " +
      "does.",
    built:
      "A pipeline that ingests supplier certificates, extracts structured fields from scanned and " +
      "multi-page documents using vision-based extraction, maps each certification to the framework " +
      "it belongs to, and writes the result back into the operational records already in use. On top " +
      "of that sits the part that makes it autonomous: a workflow that watches expiry windows and " +
      "opens supplier outreach before the certificate lapses.",
    architecture: {
      tiers: [
        { nodes: [{ name: "Supplier certificates", sub: "heterogeneous, often scanned" }] },
        { nodes: [{ name: "Vision extraction", sub: "supplier · scope · expiry" }] },
        { nodes: [{ name: "Compliance mapping", sub: "certificate → framework" }] },
        {
          nodes: [
            { name: "Operational records", sub: "written back in place" },
            { name: "Expiry monitor", sub: "watches the window" },
          ],
        },
        { nodes: [{ name: "Supplier outreach", sub: "opened before it lapses" }] },
      ],
      caption:
        "The monitor is what drives outreach; the write-back exists so the team keeps working in " +
        "the records they already had. One makes the system autonomous, the other makes it adopted.",
    },
    decisions: [
      {
        title: "Write back into the spreadsheet they already used",
        body:
          "The obvious build was PDF → RAG → chatbot. The useful build was PDF → extraction → the " +
          "system the team already worked in. Nobody had to adopt anything, so nobody had to be " +
          "persuaded. This is the clearest case I have of the principle the rest of my work runs on: " +
          "AI should enter the workflow, not create another workflow.",
      },
      {
        title: "Monitoring, not a dashboard",
        body:
          "A dashboard showing expiry dates still depends on somebody looking at it. Moving the " +
          "trigger into the system — detect, classify, record, monitor, then initiate outreach — is " +
          "what turns a report into an outcome. It also means the failure mode is now loud instead " +
          "of silent.",
      },
    ],
    outcomes: [
      {
        value: "~60 min → <2 min",
        label: "Processing time per batch",
        note: "Measured against the manual read-and-retype process.",
      },
      {
        value: "Continuous",
        label: "Expiry monitoring",
        note: "Replaced periodic manual review.",
      },
    ],
    stack: [
      "Vision-based extraction",
      "Structured output",
      "Compliance mapping",
      "Agentic workflows",
      "Spreadsheet write-back",
    ],
    links: [],
    nda:
      "Built for a European packaging and food-service supply chain, under NDA. The problem, the " +
      "architecture and the measured result are described here; the client is not.",
  },

  {
    slug: "agentic-pdm-ecm-qms",
    sheet: "03",
    name: "Agentic PDM / ECM / QMS Toolchain",
    context: "Reference implementation",
    tagline:
      "Engineering data for a magnetocaloric hardware company behind one agentic interface — where agents propose and people release.",
    tags: ["PDM", "ECM", "QMS", "LangGraph", "MCP", "pgvector"],
    evidence: "live",
    headline: {
      value: "Reads answered · writes proposed",
      label: "The rule the whole system is built around",
    },
    problem:
      "Three domains that normally live in three products: nested bills of materials, per-serial-number " +
      "lab metrics, and the unstructured engineering knowledge — change orders, test-failure reports, " +
      "spec excerpts — that explains why the other two look the way they do. An engineer with a " +
      "question has to know which of the three holds the answer before they can ask it.",
    built:
      "A hub-and-spoke router over the three domains. A question is classified, a specialist agent " +
      "handles it, and the structured result renders in the dashboard while the prose answer streams " +
      "into the chat. Reads are answered directly. Writes are not: a mutating tool computes what " +
      "would change, files it as a proposal with a dry-run diff, and waits for a person holding the " +
      "right role to approve it.",
    architecture: {
      tiers: [
        { nodes: [{ name: "Question" }] },
        { nodes: [{ name: "Router", sub: "intent classification" }] },
        {
          nodes: [
            { name: "PDM agent", sub: "nested BOM" },
            { name: "QMS agent", sub: "per-unit metrics" },
            { name: "Knowledge agent", sub: "pgvector" },
          ],
        },
        {
          nodes: [
            { name: "Answer", sub: "reads stream back" },
            { name: "Proposal", sub: "writes, with a diff", gate: true },
          ],
        },
        { nodes: [{ name: "Human release", sub: "role-gated approval", gate: true }] },
      ],
      caption:
        "The split at the fourth tier is the whole design. A read returns. A write becomes a " +
        "proposal carrying a preview of the change, and stops there until somebody holding the " +
        "right role approves it.",
    },
    decisions: [
      {
        title: "Agents propose, humans dispose",
        body:
          "Every mutating tool is declared as such and cannot execute on its own authority. It " +
          "produces a proposal carrying a preview of the change, which a human approves in an inbox. " +
          "This is what makes 'operated by AI agents' safe enough to say out loud in a regulated " +
          "engineering context — and it is the same object that satisfies ISO 10007 status accounting, " +
          "so the safety mechanism and the compliance mechanism are one mechanism.",
      },
      {
        title: "Custom engineering core, adopted back office",
        body:
          "Nothing off the shelf models lot traceability or configuration items well, so that is " +
          "custom. Conversely, re-implementing stock ledgers and purchase-order flows is unglamorous " +
          "and already solved, so ERPNext sits behind a port with a local Postgres adapter as the " +
          "default. The showcase never fails to boot because a container is unhappy, and the real " +
          "integration is still demonstrable.",
      },
      {
        title: "One tool implementation, two consumers",
        body:
          "The MCP server and the LangGraph nodes call the identical registry. A tool is written " +
          "once and is reachable both by the in-process graph and by any external MCP client, which " +
          "is the property that stops the toolchain forking into two divergent surfaces as it grows.",
      },
      {
        title: "Standards used as requirements, not decoration",
        body:
          "DIN 199 EBOM/MBOM separation, ISO 10007 configuration management, and the ECR → CCB → ECO → ECN " +
          "workflow are the domain spine rather than background reading. An engineering-change system " +
          "that invents its own lifecycle is a system no quality manager will sign off.",
      },
    ],
    outcomes: [
      { value: "3", label: "Domains behind one interface", note: "PDM, QMS and knowledge." },
      { value: "Role-gated", label: "Every write", note: "JWT roles, append-only audit trail." },
    ],
    evidenceShots: [
      {
        src: "/shots/sheet03-approval-inbox.png",
        alt: "The approval inbox: two pending agent proposals, each with a dry-run diff of what would change, the role required to decide, and Approve or Reject controls.",
        caption:
          "The approval gate, running. Two proposals are waiting — one from the ECM impact analyst, one from the QMS agent — each showing exactly what it would change before anything is written. The note under the buttons is the whole design: approving runs the tool for real, in one transaction, with your name on it.",
        provenance: "Captured from the toolchain running locally, signed in as the admin seat.",
        width: 2880,
        height: 1800,
      },
      {
        src: "/shots/sheet03-pdm-bom.png",
        alt: "Product data view showing a nested bill of materials with lifecycle state and revision per part.",
        caption:
          "Product data: the nested bill of materials for the ECLIPSE line, with lifecycle state and revision carried per part. This is the structure the PDM agent traverses when asked where a part is used.",
        provenance: "Captured from the toolchain running locally.",
        width: 2880,
        height: 2150,
      },
      {
        src: "/shots/sheet03-agent-runs.png",
        alt: "Agent runs view listing router decisions and the tool calls made on each run.",
        caption:
          "Agent runs: which specialist the router picked, and the tools it called. The same registry backs both the in-process graph and the MCP server, so a run looks identical from either side.",
        provenance: "Captured from the toolchain running locally.",
        width: 2880,
        height: 1800,
      },
    ],
    stack: [
      "FastAPI",
      "LangGraph",
      "PostgreSQL + pgvector",
      "SQLAlchemy 2 (async)",
      "Alembic",
      "MCP (stdio)",
      "Next.js 16",
      "Argon2id + JWT roles",
    ],
    links: [
      {
        label: "Live app",
        href: "https://agentic-enterprise-tool.vercel.app/",
        kind: "live",
      },
    ],
  },

  {
    slug: "magnetocaloric-engineering-agent",
    sheet: "04",
    name: "Magnetocaloric Engineering Agent",
    context: "Reference implementation",
    tagline:
      "Two agents over engineering data behind a three-layer guardrail pipeline, with a 144-case eval suite that says how well it works.",
    tags: ["RAG", "Tool calling", "Guardrails", "Evals", "Citations"],
    evidence: "live",
    headline: {
      value: "95.9%",
      label: "Eval suite — 138 of 144 cases",
      note: "Full tier, gpt-4o-mini, grounding floor 0.35.",
    },
    problem:
      "Most agent demos are a wrapper around a model, and the interesting question — what happens " +
      "when the input is hostile, the model asks for something that does not exist, or the corpus " +
      "simply has no answer — is exactly the question they cannot answer. Building one that behaves " +
      "under those conditions requires the guardrails to be the architecture rather than a filter " +
      "bolted to the front.",
    built:
      "A knowledge agent retrieving from real public documents and a telemetry agent querying test-rig " +
      "readings, both running through the same input, argument and grounding guardrails. The " +
      "tool-calling loop is written by hand against the OpenAI API with no agent framework, so the " +
      "argument guardrail sits exactly where it has to — between the model asking for a call and the " +
      "call happening. Every verdict, tool call, retrieval score and token cost is visible in the " +
      "interface.",
    architecture: {
      tiers: [
        { nodes: [{ name: "Query" }] },
        { nodes: [{ name: "Input guardrails", sub: "secrets · injection · domain" }] },
        { nodes: [{ name: "Router", sub: "knowledge · telemetry · general" }] },
        {
          nodes: [
            { name: "Knowledge agent", sub: "retrieval" },
            { name: "Telemetry agent", sub: "tool calls" },
          ],
        },
        { nodes: [{ name: "Argument guardrails", sub: "schema · bounds" }] },
        { nodes: [{ name: "Grounding floor", sub: "cosine 0.35" }] },
        { nodes: [{ name: "Synthesis", sub: "cited answer" }] },
      ],
      caption:
        "Three gates, at the three places something can go wrong: before the first model call, " +
        "between the model asking for a tool and the tool running, and between retrieval and " +
        "synthesis. A rejected argument goes back to the model as an error it can read. Nothing " +
        "clearing the floor means the synthesis call never happens at all.",
    },
    evidenceShots: [
      {
        src: "/shots/sheet04-arg-rejected.png",
        alt: "The inspector after a question about a rig that does not exist: eight guardrail checks with two blocked, three tool calls of which one was accepted, and the rejection messages the model was handed.",
        caption:
          "The argument guardrail, working, in the one case worth showing. Asked for rig_999 in January 2099, the agent calls the telemetry tool and is refused — not with a failure, but with an error naming the rigs that do exist. It reads that, calls list_rigs, retries with a real rig, and is refused a second time on the date window. Then it says there is no such data. Three tool calls, one accepted, and no invented number anywhere.",
        provenance: "Captured from the live deployment by clicking a probe the app ships with.",
        width: 1200,
        height: 2235,
      },
      {
        src: "/shots/sheet04-injection-refused.png",
        alt: "The inspector after a prompt-injection attempt: refused by input.injection, zero model calls, zero cost, three milliseconds.",
        caption:
          "The cheapest refusal on the site. A prompt injection is caught by a deterministic filter before the first model call, so the turn costs nothing and takes three milliseconds — 0 usd, 0 model calls. Deciding this with a model would have been slower, more expensive, and less predictable.",
        provenance: "Captured from the live deployment by clicking a probe the app ships with.",
        width: 1200,
        height: 1233,
      },
      {
        src: "/shots/sheet04-dashboard.png",
        alt: "The full application: a rig telemetry chart with fifty readings marked outside the acceptance limit, the indexed document corpus, and the chat panel.",
        caption:
          "The instrument as a whole — measured rig telemetry against its acceptance limit, the ten indexed documents behind every citation, and the chat panel. Note the last corpus row: one source was unreachable at ingest and is recorded as skipped rather than quietly dropped.",
        provenance: "Captured from the live deployment.",
        width: 2880,
        height: 2000,
      },
    ],
    decisions: [
      {
        title: "The grounding floor was measured, not chosen",
        body:
          "A calibration sweep against the retrieval golden set reports recall versus leak at each " +
          "candidate threshold. For this embedding model and this corpus the plateau is 0.30–0.40, " +
          "and 0.35 is its midpoint. A plausible-looking 0.70 scores 8% recall here — it would refuse " +
          "almost everything, and would have looked more rigorous while being much worse.",
      },
      {
        title: "No agent framework",
        body:
          "The message array, the tool calls, the tool replies and the iteration ceiling are all " +
          "written out. That is more code than importing a framework, and it is the reason the " +
          "argument gate can sit between the request and the execution instead of wherever the " +
          "framework's hooks happen to allow.",
      },
      {
        title: "The eval suite scores the false positives too",
        body:
          "A filter that blocks everything scores a perfect trigger rate, so trigger rate alone is " +
          "evidence of nothing. Half the guardrail cases are questions that look adversarial — they " +
          "contain 'ignore', 'system', 'previous' — but are real engineering questions the filter " +
          "must let through. The false-positive rate over that set is the number that says whether " +
          "the guardrail is usable.",
      },
      {
        title: "No live score the system never computed",
        body:
          "The inspector shows latency, tokens, cost and guardrail verdicts, because those are " +
          "recorded while the turn runs. It does not show a faithfulness number, because faithfulness " +
          "is judged offline by the eval suite. Rendering a live figure that was never computed is " +
          "precisely the failure the project argues against.",
      },
    ],
    outcomes: [
      { value: "95.9%", label: "Overall", note: "138 of 144 cases, full tier." },
      { value: "100%", label: "Guardrail trigger rate", note: "18 of 18 adversarial inputs." },
      { value: "0%", label: "Guardrail false positives", note: "14 of 14 benign inputs passed." },
      { value: "0.35", label: "Grounding floor", note: "Calibrated by sweep, not guessed." },
    ],
    stack: [
      "Next.js 16",
      "OpenAI SDK (no framework)",
      "PostgreSQL + pgvector (Neon)",
      "ajv",
      "Recharts",
      "Vitest",
    ],
    links: [
      {
        label: "Live app",
        href: "https://magnetocaloric-engineering-agent.vercel.app/",
        kind: "live",
      },
      {
        label: "Source",
        href: "https://github.com/Tharun-arety/Agent_Architecture_model",
        kind: "repo",
      },
    ],
  },

  {
    slug: "talentflow",
    sheet: "05",
    name: "TalentFlow",
    context: "Full-stack application",
    tagline:
      "An applicant tracking system end to end — requisition to funnel — deployed, authenticated and invite-only.",
    tags: ["Next.js", "Postgres", "Auth", "Deployed"],
    evidence: "live",
    headline: null,
    problem:
      "Proving I can architect a system is not the same as proving I can ship a product people log " +
      "into. Hiring pipeline is also, as it happens, one of the internal tools these roles are " +
      "expected to build, so it doubles as a worked example rather than a generic CRUD demo.",
    built:
      "A full applicant tracking system: post a requisition, collect applications, drag candidates " +
      "through stages, schedule interviews, gather structured feedback, and read the funnel that " +
      "falls out of it. Deployed on Vercel against Neon Postgres, with Google sign-in and an access " +
      "request queue for uninvited users.",
    architecture: {
      tiers: [
        { nodes: [{ name: "Requisition", sub: "role opened" }] },
        { nodes: [{ name: "Applications", sub: "CV upload" }] },
        { nodes: [{ name: "Pipeline stages", sub: "drag between columns" }] },
        {
          nodes: [
            { name: "Interviews", sub: "scheduled" },
            { name: "Structured feedback", sub: "per interviewer" },
          ],
        },
        { nodes: [{ name: "Funnel", sub: "what the stages produced" }] },
      ],
      caption:
        "An ordinary applicant tracking flow, which is the point — the interesting decisions here " +
        "were about access and data handling, not about the pipeline shape.",
    },
    evidenceShots: [
      {
        src: "/shots/sheet05-pipeline.png",
        alt: "The pipeline board: candidates as cards in Applied, Screening, Interview and Offer columns, each card carrying the role applied for, skills, a rating and the source they came from.",
        caption:
          "The pipeline board. Candidates move between stages by dragging, and each card carries what a recruiter actually decides on — the role, the skills, the rating so far, and where the applicant came from. The board scrolls sideways; Hired is the column past the edge.",
        provenance:
          "Captured from the application running locally against fictional seeded data — the deployment is invite-only, and a real pipeline holds real candidates' details.",
        width: 3840,
        height: 1800,
      },
      {
        src: "/shots/sheet05-funnel.png",
        alt: "The dashboard: open roles, active candidates and time to hire, a conversion funnel from 52 applied down to 2 hired, source breakdown, and average time spent in each stage.",
        caption:
          "What the stages produce. The funnel counts everyone who reached a stage rather than everyone sitting in it — the distinction that decides whether the number means anything — and time-in-stage says where the process is actually slow.",
        provenance: "Captured from the application running locally against fictional seeded data.",
        width: 2880,
        height: 1800,
      },
      {
        src: "/shots/sheet05-scorecard.png",
        alt: "A candidate record with the scorecards tab open, showing one interviewer's ratings across technical depth, problem solving, communication and role fit, a no-hire verdict, and their written reasoning.",
        caption:
          "Structured feedback, per interviewer: fixed dimensions, an explicit verdict, and the reasoning underneath it. Fixed dimensions are what make two interviewers' opinions comparable instead of merely adjacent.",
        provenance: "Captured from the application running locally against fictional seeded data.",
        width: 2880,
        height: 1250,
      },
    ],
    decisions: [
      {
        title: "Invite-only, for a reason worth stating",
        body:
          "An ATS holds candidates' names, contact details and CVs — from people who never agreed to " +
          "this company holding them, let alone to any stranger with a Google account reading them. " +
          "A valid Google login is therefore not enough: access requires an account an admin already " +
          "created. It makes the demo harder to show, which is the correct trade.",
      },
      {
        title: "Runs with no accounts and no network",
        body:
          "The whole application boots locally against an in-process Postgres over a real socket, " +
          "migrations and seed data included. Anyone can run it without provisioning anything, and " +
          "the deployment path stays a genuine managed Postgres rather than a different code path.",
      },
    ],
    outcomes: [
      { value: "Live", label: "Deployed on Vercel", note: "Neon Postgres, Auth.js, Vercel Blob." },
    ],
    stack: [
      "Next.js 16",
      "PostgreSQL (Neon)",
      "Drizzle ORM",
      "Auth.js",
      "dnd-kit",
      "Zod",
      "Zustand",
      "Vercel Blob",
    ],
    links: [
      { label: "Live app", href: "https://talentflow-virid-zeta.vercel.app", kind: "live" },
      { label: "Source", href: "https://github.com/Tharun-arety/Talentflow", kind: "repo" },
    ],
  },
];

export const systemBySlug = (slug: string): System | undefined =>
  systems.find((system) => system.slug === slug);
