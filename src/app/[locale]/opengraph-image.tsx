import { ImageResponse } from "next/og";

import { getSettings } from "@/lib/content";
import { isLocale } from "@/lib/i18n";

/**
 * The card people see when the site is shared into WhatsApp — which, in
 * Cameroon, is how most links actually travel.
 */
export const alt = "Divine Vision Ministry International";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = isLocale(params.locale) ? params.locale : "en";
  const settings = await getSettings(locale);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #1b2a4a 0%, #2c4275 55%, #a9722a 100%)",
          color: "#ffffff",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.16)",
              fontSize: "26px",
              fontWeight: 700,
            }}
          >
            DV
          </div>
          <div
            style={{
              fontSize: "22px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              opacity: 0.85,
            }}
          >
            {settings.shortName}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{ fontSize: "64px", lineHeight: 1.1, fontWeight: 700, maxWidth: "900px" }}
          >
            {settings.tagline}
          </div>
          <div style={{ fontSize: "30px", opacity: 0.85 }}>
            {settings.address.city} · {settings.name}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
