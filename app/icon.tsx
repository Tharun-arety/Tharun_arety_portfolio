import { ImageResponse } from "next/og";

/**
 * The same monogram the header wears: initials ruled into a box, the way a
 * drawing is stamped. Generated rather than committed as a binary so it stays
 * in step with the palette.
 */

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e8e6e1",
          color: "#1f2328",
          border: "2px solid #1f2328",
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: -0.5,
        }}
      >
        TA
      </div>
    ),
    size,
  );
}
