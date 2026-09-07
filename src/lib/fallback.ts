import type { Locale } from "./i18n";
import type { SiteSettings } from "./types";

/**
 * Church details used when the database cannot be reached.
 *
 * The header, footer, and every page's metadata need settings to render at all,
 * so a database blip would otherwise take the whole site down. These values are
 * the real ones, so a visitor who hits the site during an outage still gets the
 * right name, the right city, and a working WhatsApp link.
 *
 * Everything else (sermons, events, ministries) degrades to an empty state
 * instead, which is honest: we would rather show nothing than show stale
 * service times.
 */
export function fallbackSettings(locale: Locale): SiteSettings {
  const fr = locale === "fr";

  return {
    name: "Divine Vision Ministry International",
    shortName: "Divine Vision",
    tagline: fr
      ? "Une famille en mission, portant l’espérance aux nations."
      : "A family on mission, carrying hope to the nations.",
    description: fr
      ? "Divine Vision Ministry International est une famille d’église centrée sur Christ à Yaoundé, conduite par le Prophète Emmanuel Ayuh."
      : "Divine Vision Ministry International is a Christ-centred church family in Yaoundé, led by Prophet Emmanuel Ayuh.",
    address: {
      line: "Yaoundé",
      city: "Yaoundé",
      country: "Cameroon",
    },
    whatsapp: "237672916120",
    timezone: "Africa/Douala",
    // Empty rather than invented: a wrong service time is worse than none.
    serviceTimes: [],
    socials: [],
    livestream: { forceLive: false },
    giving: { currency: "XAF" },
  };
}
