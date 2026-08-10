/**
 * From information to action.
 *
 * The whole argument of the site in one drawing: where most enterprise AI work
 * stops, and where these systems stop instead. Two rows, deliberately drawn at
 * the same scale so the difference is length rather than styling.
 *
 * The gate on the last box is the part that matters. A loop that ends in an
 * action is only trustworthy if something can refuse the action, so the release
 * is drawn as a real element rather than implied.
 *
 * Inline SVG using the theme's custom properties, so it inverts with the page
 * and prints correctly. Wide by nature — it scrolls inside its own container
 * rather than shrinking its lettering past legibility.
 */

const BOX_H = 46;

function Box({
  x,
  y,
  w,
  lines,
  accent = false,
}: {
  x: number;
  y: number;
  w: number;
  lines: string[];
  accent?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={BOX_H}
        fill="var(--sheet)"
        stroke={accent ? "var(--signal)" : "var(--rule-strong)"}
        strokeWidth={1}
      />
      {accent && <rect x={x} y={y} width={3} height={BOX_H} fill="var(--signal)" />}
      {lines.map((line, i) => (
        <text
          key={line}
          x={x + w / 2}
          y={y + BOX_H / 2 + (lines.length === 1 ? 4 : i === 0 ? -3 : 11)}
          textAnchor="middle"
          fill="var(--ink)"
          fontSize={11.5}
          fontFamily="var(--font-display)"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function Arrow({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return (
    <line
      x1={x1}
      y1={y}
      x2={x2}
      y2={y}
      stroke="var(--ink-faint)"
      strokeWidth={1}
      markerEnd="url(#head)"
    />
  );
}

export function ThesisDiagram() {
  // Row B: five boxes of 140 with four 45px gaps fills exactly 880.
  const b = [0, 185, 370, 555, 740];
  const W = 140;
  const rowA = 62;
  const rowB = 196;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox="0 0 880 310"
        className="block h-auto w-full min-w-[720px]"
        role="img"
        aria-label={
          "Two pipelines drawn at the same scale. The first: documents, retrieval, answer — and it " +
          "ends there. The second: documents and data, structured knowledge, agent, tools and " +
          "systems, then an action that a person releases, with feedback returning to the knowledge " +
          "layer."
        }
      >
        <defs>
          <marker id="head" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="none" stroke="var(--ink-faint)" strokeWidth={1} />
          </marker>
          <marker id="head-up" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="none" stroke="var(--verdigris)" strokeWidth={1} />
          </marker>
        </defs>

        {/* --- Row A: the common stopping point --------------------------- */}
        <text
          x={0}
          y={28}
          fill="var(--ink-faint)"
          fontSize={10}
          fontWeight={600}
          letterSpacing="1.4"
          fontFamily="var(--font-display)"
        >
          WHERE MOST ENTERPRISE AI STOPS
        </text>

        <Box x={0} y={rowA} w={W} lines={["Documents"]} />
        <Arrow x1={W} x2={b[1] - 4} y={rowA + BOX_H / 2} />
        <Box x={b[1]} y={rowA} w={W} lines={["Retrieval"]} />
        <Arrow x1={b[1] + W} x2={b[2] - 4} y={rowA + BOX_H / 2} />
        <Box x={b[2]} y={rowA} w={W} lines={["Answer"]} />

        {/* A terminator, the way a drawing marks the end of a run. */}
        <line
          x1={b[2] + W + 14}
          y1={rowA + 10}
          x2={b[2] + W + 14}
          y2={rowA + BOX_H - 10}
          stroke="var(--ink-faint)"
          strokeWidth={1}
        />
        <line
          x1={b[2] + W}
          y1={rowA + BOX_H / 2}
          x2={b[2] + W + 14}
          y2={rowA + BOX_H / 2}
          stroke="var(--ink-faint)"
          strokeWidth={1}
        />
        <text
          x={b[2] + W + 24}
          y={rowA + BOX_H / 2 + 4}
          fill="var(--ink-faint)"
          fontSize={11}
          fontFamily="var(--font-display)"
        >
          nothing happens
        </text>

        {/* --- Row B: the full loop --------------------------------------- */}
        <text
          x={0}
          y={rowB - 34}
          fill="var(--verdigris)"
          fontSize={10}
          fontWeight={600}
          letterSpacing="1.4"
          fontFamily="var(--font-display)"
        >
          WHAT THESE SYSTEMS DO
        </text>

        <Box x={b[0]} y={rowB} w={W} lines={["Documents", "& business data"]} />
        <Arrow x1={b[0] + W} x2={b[1] - 4} y={rowB + BOX_H / 2} />
        <Box x={b[1]} y={rowB} w={W} lines={["Structured", "knowledge"]} />
        <Arrow x1={b[1] + W} x2={b[2] - 4} y={rowB + BOX_H / 2} />
        <Box x={b[2]} y={rowB} w={W} lines={["Agent"]} />
        <Arrow x1={b[2] + W} x2={b[3] - 4} y={rowB + BOX_H / 2} />
        <Box x={b[3]} y={rowB} w={W} lines={["Tools &", "systems"]} />
        <Arrow x1={b[3] + W} x2={b[4] - 4} y={rowB + BOX_H / 2} />
        <Box x={b[4]} y={rowB} w={W} lines={["Action"]} accent />

        <text
          x={b[4] + W / 2}
          y={rowB + BOX_H + 15}
          textAnchor="middle"
          fill="var(--signal)"
          fontSize={10}
          fontWeight={600}
          letterSpacing="0.8"
          fontFamily="var(--font-display)"
        >
          RELEASED BY A PERSON
        </text>

        {/* Feedback: the action's result returns to the knowledge layer, which
            is what makes it a loop rather than a longer straight line. */}
        <path
          d={`M ${b[4] + W / 2} ${rowB + BOX_H + 24}
              L ${b[4] + W / 2} ${rowB + BOX_H + 46}
              L ${b[1] + W / 2} ${rowB + BOX_H + 46}
              L ${b[1] + W / 2} ${rowB + BOX_H + 8}`}
          fill="none"
          stroke="var(--verdigris)"
          strokeWidth={1}
          markerEnd="url(#head-up)"
        />
        <text
          x={(b[4] + b[1]) / 2 + W / 2}
          y={rowB + BOX_H + 41}
          textAnchor="middle"
          fill="var(--verdigris)"
          fontSize={10.5}
          fontFamily="var(--font-display)"
        >
          what happened feeds back
        </text>
      </svg>
    </div>
  );
}
