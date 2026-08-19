/**
 * The flowing-paths field, from the 21st.dev component of the same name.
 *
 * The curve geometry is the original's, unchanged: two mirrored fans of 36
 * beziers, each one offset from the last, drawn into a 696x316 viewBox.
 *
 * What is not the original is how it moves. That version animates framer
 * motion's `pathLength` and `pathOffset`, which is a React component holding
 * seventy-two springs and re-rendering them, and it costs framer-motion,
 * `@radix-ui/react-slot` and `class-variance-authority` in the bundle to get it.
 * Those two properties are `stroke-dasharray` and `stroke-dashoffset` with the
 * path normalised by `pathLength="1"`, which CSS animates on its own. So this
 * stays a server component: no client JavaScript, nothing to hydrate, and the
 * markup is in the first byte of HTML with the rest of the page.
 *
 * The durations and phases are functions of the index rather than
 * `Math.random()`. The original can afford randomness because it renders in the
 * browser; here the server and the client would disagree about it and React
 * would say so.
 */

const COUNT = 36;

type Stroke = {
  d: string;
  width: number;
  opacity: number;
  duration: number;
  delay: number;
};

/** `position` mirrors the fan: 1 leans one way, -1 the other. */
function fan(position: number): Stroke[] {
  return Array.from({ length: COUNT }, (_, i) => ({
    d:
      `M-${380 - i * 5 * position} -${189 + i * 6}` +
      `C-${380 - i * 5 * position} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}` +
      `C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
    opacity: 0.1 + i * 0.03,
    /* Coprime-ish spread, so no two neighbours travel together and the set
       never resolves into a single moving band. */
    duration: 22 + ((i * 7) % 11) * 1.7,
    delay: -((i * 1.31 + (position < 0 ? 5.5 : 0)) % 24),
  }));
}

const FANS = [fan(1), fan(-1)];

export function BackgroundPaths() {
  return (
    <div className="field-paths" aria-hidden="true">
      <svg viewBox="0 0 696 316" fill="none" preserveAspectRatio="xMidYMid slice">
        {FANS.map((strokes, side) =>
          strokes.map((stroke, i) => (
            <path
              key={`${side}-${i}`}
              d={stroke.d}
              stroke="currentColor"
              strokeWidth={stroke.width}
              strokeOpacity={stroke.opacity}
              /* Normalises the path to one unit, so the dash pattern below is
                 written as a fraction of it rather than in user units that
                 differ for every curve in the fan. */
              pathLength={1}
              className="field-path"
              style={{
                animationDuration: `${stroke.duration}s`,
                animationDelay: `${stroke.delay}s`,
              }}
            />
          )),
        )}
      </svg>
    </div>
  );
}
