/**
 * One notation for every system's architecture.
 *
 * Five bespoke drawings would be five dialects, and the reason to write these
 * case studies as a set is that a reader can hold them against each other. So
 * each architecture is declared as tiers of nodes and rendered by the same
 * component: a row of boxes per tier, a connector between tiers, flow going
 * down the page.
 *
 * Built from boxes rather than from SVG, and the difference matters. The first
 * version of this was a drawing 880 units wide with a proper bus connector, and
 * it was very pleasing on a laptop and unreadable on a phone — at 335px the
 * viewer saw the left third of each box and the labels fell off the edge.
 * Scaling it down instead put the lettering at four pixels. Boxes reflow; a
 * drawing does not, and a diagram nobody can read on the device they opened the
 * link on is not a diagram.
 *
 * `gate` marks a node that a person has to release. It is the only thing here
 * allowed to use the signal colour.
 */

export type StackNode = { name: string; sub?: string; gate?: boolean };
export type Tier = { label?: string; nodes: StackNode[] };

function Connector() {
  return (
    <div className="flex justify-center py-2" aria-hidden>
      <svg width="9" height="24" viewBox="0 0 9 24" className="block">
        <line x1="4.5" y1="0" x2="4.5" y2="18" stroke="var(--ink-faint)" strokeWidth="1" />
        <path d="M1 17 L4.5 22 L8 17" fill="none" stroke="var(--ink-faint)" strokeWidth="1" />
      </svg>
    </div>
  );
}

export function ArchitectureStack({ tiers, caption }: { tiers: Tier[]; caption?: string }) {
  const describe = tiers.map((tier) => tier.nodes.map((n) => n.name).join(" + ")).join(" → ");

  return (
    <figure>
      <div role="img" aria-label={`Architecture: ${describe}.`}>
        {tiers.map((tier, t) => (
          <div key={`${tier.nodes[0].name}-${t}`}>
            {tier.label && <div className="letter mb-2 text-center">{tier.label}</div>}

            {/* auto-fit is what makes this responsive without a breakpoint per
                tier width: four nodes sit in a row on a laptop and fold to two,
                then one, as the column narrows. */}
            <div
              className="grid gap-2.5"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(148px, 1fr))" }}
            >
              {tier.nodes.map((node) => (
                <div
                  key={node.name}
                  className={`relative px-3 py-2.5 text-center ${
                    node.gate
                      ? "border-signal bg-signal-soft border"
                      : "bg-sheet border-rule-strong border"
                  }`}
                >
                  {node.gate && <span className="bg-signal absolute inset-y-0 left-0 w-[3px]" />}
                  <div className={`text-sm leading-tight ${node.gate ? "text-signal" : "text-ink"}`}>
                    {node.name}
                  </div>
                  {node.sub && (
                    <div className="tnum text-ink-faint mt-1 text-[11px] leading-tight">
                      {node.sub}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {t < tiers.length - 1 && <Connector />}
          </div>
        ))}
      </div>

      {caption && (
        <figcaption className="text-ink-faint mt-4 text-xs leading-relaxed">{caption}</figcaption>
      )}
    </figure>
  );
}
