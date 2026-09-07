import { ImageResponse } from "next/og";

/**
 * Home-screen icon for iOS, and the icon Android uses when someone adds the
 * site to their home screen. Worth getting right here: a lot of the
 * congregation will reach the site from a phone shortcut rather than a bookmark.
 *
 * iOS applies its own rounded mask, so this draws a full-bleed square and lets
 * the system round it.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#1B2A4A",
          fontFamily: "sans-serif",
          color: "#FFFFFF",
        }}
      >
        <div style={{ display: "flex", fontSize: 84, fontWeight: 700, letterSpacing: -3 }}>
          DV
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 6,
            fontSize: 15,
            letterSpacing: 3,
            color: "#D9A85C",
          }}
        >
          CHURCH
        </div>
      </div>
    ),
    size,
  );
}
