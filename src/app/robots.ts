import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Staff area, internal endpoints, and the payment outcome page.
        disallow: ["/admin", "/admin/", "/api/", "/en/give/thank-you", "/fr/give/thank-you"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
