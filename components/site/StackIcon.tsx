/**
 * Marks for the things a system was built out of.
 *
 * Drawn inline rather than pulled from an icon CDN: the site ships no external
 * requests, and a stack list that silently fails to load its logos is worse
 * than one that never had them.
 *
 * Everything is monochrome `currentColor` on a 24-unit grid, so the marks sit
 * in the page's palette instead of dragging nine brand colours into a document
 * whose whole argument is that two accents mean two specific things.
 *
 * Not every tool has a mark worth drawing badly. Anything unrecognised falls
 * back to a lettered tile, which is a deliberate-looking answer rather than a
 * gap — see `Monogram`.
 */

type IconProps = { className?: string };

const S = "http://www.w3.org/2000/svg";

function React_({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" xmlns={S}>
      <circle cx="12" cy="12" r="2.1" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" strokeWidth="1.3" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" strokeWidth="1.3" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" strokeWidth="1.3" transform="rotate(120 12 12)" />
    </svg>
  );
}

function NextJs({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" xmlns={S}>
      <circle cx="12" cy="12" r="10" strokeWidth="1.3" />
      <path d="M8.6 16V8.2l7.2 9.1" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15.5 8v6.4" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Vercel({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns={S}>
      <path d="M12 3.5 22 20.5H2z" />
    </svg>
  );
}

function Python({ className }: IconProps) {
  // The two interlocking bodies, reduced to their silhouette. Enough to read as
  // Python at 16px, and no attempt at the two-tone original.
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns={S}>
      <path d="M11.9 2c-2.2 0-4 .7-4 3v2.1h4.2v.7H6.3C4.2 7.8 2.9 9.3 2.9 11.6c0 2.2 1.1 3.8 3.1 3.8h1.5v-2.3c0-2 1.6-3.6 3.6-3.6h3.4c1.7 0 3-1.4 3-3.1V5c0-1.7-1.4-2.6-3.1-2.8-.9-.1-1.7-.2-2.5-.2Zm-2.2 1.8c.5 0 .9.4.9.9s-.4.9-.9.9-.9-.4-.9-.9.4-.9.9-.9Z" />
      <path d="M12.1 22c2.2 0 4-.7 4-3v-2.1h-4.2v-.7h5.8c2.1 0 3.4-1.5 3.4-3.8 0-2.2-1.1-3.8-3.1-3.8h-1.5v2.3c0 2-1.6 3.6-3.6 3.6H9.5c-1.7 0-3 1.4-3 3.1V19c0 1.7 1.4 2.6 3.1 2.8.9.1 1.7.2 2.5.2Zm2.2-1.8a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8Z" />
    </svg>
  );
}

function TypeScript({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns={S}>
      <rect x="1.5" y="1.5" width="21" height="21" rx="2.5" fill="currentColor" />
      <text
        x="12"
        y="16.6"
        textAnchor="middle"
        fontSize="10.5"
        fontWeight="700"
        fontFamily="var(--font-mono)"
        fill="var(--sheet)"
      >
        TS
      </text>
    </svg>
  );
}

function Tailwind({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns={S}>
      <path d="M7 9.6c.7-2.8 2.4-4.1 5.2-4.1 4.2 0 4.7 3.1 6.8 3.6 1.4.4 2.6-.1 3.6-1.5-.7 2.8-2.4 4.1-5.2 4.1-4.2 0-4.7-3.1-6.8-3.6-1.4-.4-2.6.1-3.6 1.5Zm-5.2 6.3c.7-2.8 2.4-4.1 5.2-4.1 4.2 0 4.7 3.1 6.8 3.6 1.4.4 2.6-.1 3.6-1.5-.7 2.8-2.4 4.1-5.2 4.1-4.2 0-4.7-3.1-6.8-3.6-1.4-.4-2.6.1-3.6 1.5Z" />
    </svg>
  );
}

function Docker({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns={S}>
      <path d="M4 10.5h2.6v2.6H4zM7.4 10.5H10v2.6H7.4zM10.8 10.5h2.6v2.6h-2.6zM7.4 7.2H10v2.6H7.4zM10.8 7.2h2.6v2.6h-2.6zM14.2 10.5h2.6v2.6h-2.6zM10.8 4h2.6v2.6h-2.6z" />
      <path
        d="M2 14.2c0 3.4 2.4 5.8 6.6 5.8 5.2 0 9.2-2.6 10.8-7.2 1.4.5 2.6.1 3.2-1-1-.7-2.2-.8-3.3-.3-.2-1-.8-1.8-1.7-2.4-.7.9-.9 2.2-.4 3.4H2Z"
        fillRule="evenodd"
      />
    </svg>
  );
}

function Postgres({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" xmlns={S}>
      <ellipse cx="12" cy="5.8" rx="7.5" ry="3.1" strokeWidth="1.4" />
      <path d="M4.5 5.8v12.4c0 1.7 3.4 3.1 7.5 3.1s7.5-1.4 7.5-3.1V5.8" strokeWidth="1.4" />
      <path d="M4.5 12c0 1.7 3.4 3.1 7.5 3.1s7.5-1.4 7.5-3.1" strokeWidth="1.4" />
    </svg>
  );
}

function Lightning({ className }: IconProps) {
  // FastAPI's mark is a bolt; also the right glyph for anything event-driven.
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" xmlns={S}>
      <circle cx="12" cy="12" r="10" strokeWidth="1.3" />
      <path d="M13 5.5 8 12.8h3.4L10.8 18.5 16 11.2h-3.4z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Flame({ className }: IconProps) {
  // PyTorch.
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" xmlns={S}>
      <path
        d="M16.6 7.4a6.5 6.5 0 1 1-9.2 0L12 2.8Z"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="14.6" cy="8.2" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Git({ className }: IconProps) {
  // A branch and a merge — Git's own diagram, and distinct from the generic
  // node graph so the two do not read as the same tool.
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" xmlns={S}>
      <circle cx="7" cy="4.5" r="2.2" strokeWidth="1.4" />
      <circle cx="7" cy="19.5" r="2.2" strokeWidth="1.4" />
      <circle cx="17" cy="9.5" r="2.2" strokeWidth="1.4" />
      <path d="M7 6.7v10.6" strokeWidth="1.4" />
      <path d="M17 11.7c0 3.6-3.4 4.4-6.6 5.1" strokeWidth="1.4" />
    </svg>
  );
}

function Graph({ className }: IconProps) {
  // LangGraph, MCP, registries — anything that is nodes and edges.
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" xmlns={S}>
      <circle cx="6" cy="6" r="2.4" strokeWidth="1.4" />
      <circle cx="6" cy="18" r="2.4" strokeWidth="1.4" />
      <circle cx="18" cy="12" r="2.4" strokeWidth="1.4" />
      <path d="M6 8.4v7.2M8.2 6.9c4 .8 5.6 2.4 7.5 4.2M8.2 17.1c4-.8 5.6-2.4 7.5-4.2" strokeWidth="1.4" />
    </svg>
  );
}

function Spark({ className }: IconProps) {
  // Model providers and anything else whose mark is not worth faking.
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" xmlns={S}>
      <path
        d="M12 2.5c.7 4.6 2.4 6.3 7 7-4.6.7-6.3 2.4-7 7-.7-4.6-2.4-6.3-7-7 4.6-.7 6.3-2.4 7-7Z"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Shield({ className }: IconProps) {
  // Schema validation, auth, guardrails.
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" xmlns={S}>
      <path d="M12 2.5 20 5.5v6c0 4.6-3.2 8.3-8 10-4.8-1.7-8-5.4-8-10v-6Z" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

/** The honest fallback: initials in a ruled tile, which looks chosen. */
function Monogram({ label, className }: { label: string; className?: string }) {
  const initials = label
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <svg viewBox="0 0 24 24" className={className} xmlns={S}>
      <rect x="1.5" y="1.5" width="21" height="21" rx="2" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <text
        x="12"
        y="16.2"
        textAnchor="middle"
        fontSize={initials.length > 1 ? 9 : 11}
        fontWeight="600"
        fontFamily="var(--font-mono)"
        fill="currentColor"
      >
        {initials}
      </text>
    </svg>
  );
}

/**
 * Name → mark. Matched on a normalised substring so "Next.js 16",
 * "PostgreSQL + pgvector (Neon)" and "Postgres" all land in the right place
 * without the content files having to know this table exists.
 */
const MARKS: [RegExp, (p: IconProps) => React.JSX.Element][] = [
  [/next\.?js/, NextJs],
  [/\breact\b/, React_],
  [/vercel/, Vercel],
  [/python/, Python],
  [/typescript|javascript/, TypeScript],
  [/tailwind/, Tailwind],
  [/docker/, Docker],
  [/postgre|postgres|pgvector|sql|neon|drizzle|sqlalchemy|alembic/, Postgres],
  [/fastapi|sse|streaming/, Lightning],
  [/pytorch|jax|flax|surrogate|neural/, Flame],
  [/\bgit\b/, Git],
  [/langgraph|mcp|graph|registry/, Graph],
  [/openai|llm|agent|rag|embedding|vision|prompt/, Spark],
  [/zod|ajv|auth|argon|jwt|guardrail|schema|validation/, Shield],
];

export function StackIcon({ name, className = "size-4" }: { name: string; className?: string }) {
  const key = name.toLowerCase();
  for (const [pattern, Mark] of MARKS) {
    if (pattern.test(key)) return <Mark className={className} />;
  }
  return <Monogram label={name} className={className} />;
}

/** A stack item as a chip: mark, then the name it was written as. */
export function StackChip({ name }: { name: string }) {
  return (
    <span className="border-rule bg-sheet text-ink-mid inline-flex items-center gap-1.5 border px-2 py-1 text-xs">
      <StackIcon name={name} className="text-ink-faint size-3.5 shrink-0" />
      {name}
    </span>
  );
}
