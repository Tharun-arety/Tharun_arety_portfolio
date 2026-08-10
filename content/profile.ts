/**
 * The person, as data.
 *
 * Everything the site says about Tharun lives here rather than inline in JSX,
 * so a claim can be checked in one place and a stale one cannot hide in a
 * component. Two rules hold throughout:
 *
 *   1. No client names. Two of the systems on this site were built under NDA.
 *      They are described by problem shape and architecture only.
 *   2. No number without a source. Anything quantified here is traceable to a
 *      committed eval report, a recorded trace, or a measured before/after.
 */

export const profile = {
  name: "Tharun Arety",
  role: "AI-Leveraged Systems Architect",
  location: "Augsburg, Germany",
  relocation: "Open to relocation",

  /** The one sentence. Everything else on the page is evidence for it. */
  thesis:
    "I turn fragmented business data, documents, knowledge and workflows into " +
    "systems that AI agents can understand, operate and continuously improve.",

  /** The principle the systems are built on, and the one they are judged by. */
  principle: "AI should enter the workflow, not create another workflow.",

  /**
   * Phone is deliberately absent. It belongs in the PDF that goes to a named
   * recipient, not on a page that anyone can scrape.
   */
  contact: {
    email: "tharun.nstn@gmail.com",
    github: "https://github.com/Tharun-arety",
    githubHandle: "Tharun-arety",
    linkedin: "https://www.linkedin.com/in/tharun-arety",
    linkedinHandle: "tharun-arety",
  },
} as const;

export type Experience = {
  title: string;
  org: string;
  period: string;
  /** Present tense for current roles — the resume reads as a record, not a claim. */
  points: string[];
};

export const experience: Experience[] = [
  {
    title: "AI Systems Architect / AI Engineer",
    org: "Vexos",
    period: "2025 — Present",
    points: [
      "Built agentic ERP, CRM and PDM systems connecting enterprise data, documents and workflows through AI agents.",
      "Designed AI document-intelligence workflows converting unstructured PDF certificates into structured compliance data.",
      "Automated certification mapping, expiry monitoring, supplier outreach and dashboard-based compliance tracking.",
      "Reduced certificate processing from ~60 minutes to under 2 minutes per batch through AI-powered extraction and automation.",
      "Applied RAG, MCP, tool calling and coding agents to connect organizational knowledge and business systems to executable AI workflows.",
    ],
  },
  {
    title: "Research Associate — Data-driven Product Engineering & Design",
    org: "University of Augsburg",
    period: "2023 — 2026",
    points: [
      "Developed Python and PyTorch workflows for FEM, composite optimization and simulation automation.",
      "Automated data generation, simulation, analysis and post-processing across large engineering design spaces.",
      "Built differentiable optimization frameworks and neural-network surrogate models for computational engineering.",
      "Used LLMs and coding agents throughout research, data processing, software development and technical automation.",
    ],
  },
  {
    title: "Research & Open-Source Developer",
    org: "Autonomy-IFP-Optimizer",
    period: "2026 — Present",
    points: [
      "Built automated robotic fiber-placement path planning with manufacturing constraints in the design loop.",
      "Developed robot-ready path export with cycle-time and material-usage estimation.",
      "Trained neural-network surrogates in Flax to accelerate simulation-based design screening.",
    ],
  },
  {
    title: "Composites Research Intern",
    org: "Indian Institute of Space Science & Technology",
    period: "2019",
    points: [
      "Designed and tested composite samples relating fiber architecture to mechanical performance.",
      "Built parametric FEM protocols and automated the simulation workflow in Python to widen the evaluated design space.",
    ],
  },
  {
    title: "Composites Manufacturing Intern",
    org: "Defence Research and Development Organisation",
    period: "2018",
    points: [
      "Manufactured carbon-fiber components by filament winding, resin infusion and autoclave curing.",
      "Designed and evaluated carbon-fiber aircraft structural components in SolidWorks and Abaqus.",
    ],
  },
];

/**
 * `chips` marks a group whose entries are named tools rather than concepts.
 * Tools get a mark; ideas do not — "RAG" has no logo, and inventing one would
 * make the whole row read as decoration.
 */
export type SkillGroup = { label: string; items: string[]; chips?: boolean };

/**
 * Ordered by what the target role hires for, not by what took longest to learn.
 * Engineering sits last — it is the credential, not the pitch.
 */
export const skills: SkillGroup[] = [
  {
    label: "AI & agentic systems",
    items: [
      "AI agents", "Agentic workflows", "RAG", "Vector search", "Embeddings",
      "Tool calling", "MCP", "LLM APIs", "Prompt engineering", "Coding agents",
    ],
  },
  {
    label: "AI reliability",
    items: [
      "Evals", "LLM-as-a-judge", "Grounding", "Guardrails", "Schema validation",
      "Tool-argument validation", "Observability", "Human-in-the-loop",
    ],
  },
  {
    label: "Enterprise systems",
    items: [
      "ERP", "CRM", "PDM", "ECM", "QMS", "Knowledge management",
      "Compliance automation", "Workflow automation", "Document intelligence",
    ],
  },
  {
    label: "Data & integration",
    items: [
      "Data pipelines", "Web scraping", "PDF & vision extraction", "APIs",
      "Postgres", "pgvector", "SQL", "Excel integration",
    ],
  },
  {
    label: "Software",
    chips: true,
    items: [
      "Python", "TypeScript", "React", "Next.js", "Tailwind", "FastAPI", "LangGraph",
      "PostgreSQL", "pgvector", "PyTorch", "JAX", "Docker", "Git", "Vercel",
    ],
  },
  {
    label: "Engineering",
    items: [
      "FEM", "Differentiable simulation", "Optimization", "Composite materials",
      "Manufacturing automation", "SolidWorks", "Abaqus", "MATLAB",
    ],
  },
];

export const education = [
  {
    degree: "M.Sc. Materials Engineering",
    org: "University of Augsburg, Germany",
    period: "2022 — 2026",
    note: "Thesis: Optimization of Fiber Patch Placement in Composite Structures",
  },
  {
    degree: "B.Tech. Mechanical Engineering",
    org: "National Institute of Technology Agartala, India",
    period: "2016 — 2020",
    note: null,
  },
];

export const achievements = [
  {
    title: "DAAD Scholarship",
    note: "Competitive funding recognizing research potential in composite materials engineering.",
  },
  {
    title: "Albert Leimer Stiftung Scholarship",
    note: "Awarded for academic excellence during the M.Sc. at the University of Augsburg.",
  },
];

export const certifications = [
  "Google Project Management",
  "Google Data Analytics",
  "Intercultural Key Qualifications",
];

export const languages = [
  { name: "English", level: "C1" },
  { name: "German", level: "B1" },
];

/**
 * The computational-engineering repositories. These are not pitched as AI work
 * — they are the reason the AI work lands in a hardware company, because they
 * prove the domain is native rather than researched.
 */
export const engineeringRepos = [
  {
    name: "Autonomy-IFP-Optimizer",
    url: "https://github.com/Tharun-arety/Autonomy-IFP-Optimizer",
    note: "Differentiable fiber-placement path optimizer with FEM and manufacturing constraints.",
  },
  {
    name: "COPV-JAXwinder",
    url: "https://github.com/Tharun-arety/COPV-JAXwinder",
    note: "JAX design engine co-optimizing filament winding and AFP layouts.",
  },
  {
    name: "Fiber_Patch_Placement",
    url: "https://github.com/Tharun-arety/Fiber_Patch_Placement",
    note: "Gradient-based patch optimization on a differentiable FEM solver in PyTorch.",
  },
  {
    name: "Coil-shape-optimizer",
    url: "https://github.com/Tharun-arety/Coil-shape-optimizer",
    note: "Differentiable Fourier cross-section optimizer for stellarator coil winding packs.",
  },
];
