/**
 * A section of the sheet.
 *
 * The legend is lettered and carries a rule to the edge, the way a zone divider
 * is marked on a drawing. It names a real division of the document — there are
 * five, and they are the five things a reader came to find out.
 */
export function Section({
  id,
  label,
  title,
  lede,
  children,
}: {
  id?: string;
  label: string;
  title: string;
  lede?: React.ReactNode;
  /** Optional: a section whose whole point is its title and lede should not be
   *  followed by an empty block reserving space for content it does not have. */
  children?: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="legend mb-6">
        <span className="letter">{label}</span>
      </div>
      <h2 className="text-ink max-w-2xl text-2xl sm:text-3xl">{title}</h2>
      {lede && <div className="prose-doc mt-4 max-w-2xl">{lede}</div>}
      {children && <div className="mt-8">{children}</div>}
    </section>
  );
}
