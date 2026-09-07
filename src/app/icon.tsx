import { ImageResponse } from "next/og";

/**
 * Browser tab icon: the same DV monogram as the site header, so the tab and the
 * page read as one thing.
 *
 * Generated rather than shipped as a binary .ico so the brand colour lives in
 * one place and a designer can change it without opening an image editor. A
 * rounded square rather than the header's circle: at 16px it fills more pixels,
 * which is the difference between legible and a smudge.
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
          background: "#1B2A4A",
          fontFamily: "sans-serif",
          borderRadius: 7,
          color: "#FFFFFF",
          fontSize: 17,
          fontWeight: 700,
          letterSpacing: -0.5,
        }}
      >
        DV
      </div>
    ),
    size,
  );
}
