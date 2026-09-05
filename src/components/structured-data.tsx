import { INTL_LOCALE, type Locale } from "@/lib/i18n";
import type { ChurchEvent, Sermon, SiteSettings, VisitFaq } from "@/lib/types";
import { absoluteUrl, formatOneLineAddress, siteUrl } from "@/lib/utils";

/**
 * Structured data is the difference between an assistant answering "what time
 * is service at Divine Vision in Yaoundé?" correctly and guessing. Every schema
 * the site emits lives here so the shapes stay consistent.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Built from our own database, not user input, and "<" is escaped so the
      // payload can never close the script tag early.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/** schema.org day URLs, indexed the same way as Date.prototype.getDay(). */
const SCHEMA_DAYS = [
  "https://schema.org/Sunday",
  "https://schema.org/Monday",
  "https://schema.org/Tuesday",
  "https://schema.org/Wednesday",
  "https://schema.org/Thursday",
  "https://schema.org/Friday",
  "https://schema.org/Saturday",
];

export function churchSchema(settings: SiteSettings, locale: Locale) {
  const address = {
    "@type": "PostalAddress",
    streetAddress: settings.address.line,
    addressLocality: settings.address.city,
    ...(settings.address.region ? { addressRegion: settings.address.region } : {}),
    addressCountry: settings.address.country,
  };

  const contactPoints = [
    settings.whatsapp
      ? {
          "@type": "ContactPoint",
          contactType: "customer support",
          telephone: `+${settings.whatsapp.replace(/\D/g, "")}`,
          // WhatsApp is the channel people in Cameroon actually use.
          name: "WhatsApp",
          availableLanguage: ["en", "fr"],
        }
      : null,
    settings.phone
      ? {
          "@type": "ContactPoint",
          contactType: "customer support",
          telephone: settings.phone,
          availableLanguage: ["en", "fr"],
        }
      : null,
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Church",
    "@id": `${siteUrl()}/#church`,
    name: settings.name,
    alternateName: settings.shortName,
    description: settings.description,
    url: `${siteUrl()}/${locale}`,
    inLanguage: INTL_LOCALE[locale],
    ...(settings.logo?.url ? { logo: absoluteUrl(settings.logo.url) } : {}),
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.phone ? { telephone: settings.phone } : {}),
    address,
    ...(settings.address.latitude != null && settings.address.longitude != null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: settings.address.latitude,
            longitude: settings.address.longitude,
          },
        }
      : {}),
    ...(contactPoints.length ? { contactPoint: contactPoints } : {}),
    ...(settings.socials.length ? { sameAs: settings.socials.map((s) => s.url) } : {}),
    // What answer engines read for "what time is the service".
    ...(settings.serviceTimes.length
      ? {
          openingHoursSpecification: settings.serviceTimes.map((service) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: SCHEMA_DAYS[service.dayOfWeek],
            opens: service.startTime,
            closes: service.endTime ?? service.startTime,
            name: service.label,
          })),
          event: settings.serviceTimes.map((service) => ({
            "@type": "Event",
            name: service.label,
            eventSchedule: {
              "@type": "Schedule",
              byDay: SCHEMA_DAYS[service.dayOfWeek],
              startTime: service.startTime,
              ...(service.endTime ? { endTime: service.endTime } : {}),
              repeatFrequency: "P1W",
              scheduleTimezone: settings.timezone,
            },
            location: {
              "@type": "Place",
              name: settings.name,
              address: formatOneLineAddress(settings.address),
            },
          })),
        }
      : {}),
  };
}

export function eventSchema(event: ChurchEvent, settings: SiteSettings, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.start,
    ...(event.end ? { endDate: event.end } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    description: event.summary ?? event.description ?? settings.description,
    url: absoluteUrl(`/${locale}/events/${event.slug}`),
    inLanguage: INTL_LOCALE[locale],
    ...(event.image?.url ? { image: [absoluteUrl(event.image.url)] } : {}),
    location: {
      "@type": "Place",
      name: event.location ?? settings.name,
      address: event.address ?? formatOneLineAddress(settings.address),
    },
    organizer: { "@type": "Organization", name: settings.name, url: siteUrl() },
    // Church events are free unless a registration provider says otherwise.
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: settings.giving.currency,
      availability: "https://schema.org/InStock",
      url: absoluteUrl(`/${locale}/events/${event.slug}`),
    },
  };
}

export function sermonSchema(sermon: Sermon, settings: SiteSettings, locale: Locale) {
  const base = {
    "@context": "https://schema.org",
    name: sermon.title,
    headline: sermon.title,
    description: sermon.summary ?? `A message from ${settings.name}.`,
    url: absoluteUrl(`/${locale}/sermons/${sermon.slug}`),
    datePublished: sermon.date,
    inLanguage: INTL_LOCALE[locale],
    ...(sermon.image?.url ? { thumbnailUrl: [absoluteUrl(sermon.image.url)] } : {}),
    ...(sermon.speaker ? { author: { "@type": "Person", name: sermon.speaker.name } } : {}),
    publisher: { "@type": "Organization", name: settings.name, url: siteUrl() },
  };

  if (sermon.videoUrl) {
    return {
      ...base,
      "@type": "VideoObject",
      uploadDate: sermon.date,
      embedUrl: sermon.videoUrl,
      ...(sermon.durationSeconds
        ? { duration: `PT${Math.round(sermon.durationSeconds / 60)}M` }
        : {}),
    };
  }

  if (sermon.audioUrl) {
    return {
      ...base,
      "@type": "AudioObject",
      contentUrl: sermon.audioUrl,
      encodingFormat: "audio/mpeg",
    };
  }

  return { ...base, "@type": "Article" };
}

export function faqSchema(faqs: VisitFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[], locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(`/${locale}${item.path === "/" ? "" : item.path}`),
    })),
  };
}
