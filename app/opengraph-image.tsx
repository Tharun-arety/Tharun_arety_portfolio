import { ImageResponse } from "next/og";

import { profile } from "@/content/profile";

/**
 * The share card, set as a sheet.
 *
 * Someone meets this before they meet the site, so it carries the same two
 * things the hero does: the claim, and the fact that there are measurements
 * behind it.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${profile.name} — ${profile.role}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#e8e6e1",
          color: "#1f2328",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 20,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#565d64",
          }}
        >
          {profile.role}
        </div>

        <div style={{ fontSize: 78, fontWeight: 700, marginTop: 28, letterSpacing: -2 }}>
          I build AI-leveraged systems.
        </div>

        <div style={{ fontSize: 27, color: "#565d64", marginTop: 26, lineHeight: 1.4 }}>
          {profile.thesis}
        </div>

        <div style={{ display: "flex", marginTop: "auto", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 34, fontWeight: 600 }}>{profile.name}</div>
            <div style={{ fontSize: 22, color: "#565d64", marginTop: 6 }}>{profile.location}</div>
          </div>
          <div
            style={{
              display: "flex",
              marginLeft: "auto",
              border: "2px solid #2e7d6b",
              color: "#2e7d6b",
              background: "#d5e4de",
              padding: "10px 18px",
              fontSize: 22,
            }}
          >
            95.9% over 144 eval cases
          </div>
        </div>
      </div>
    ),
    size,
  );
}
