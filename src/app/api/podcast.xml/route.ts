import { getSermons, getSettings } from "@/lib/content";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import { absoluteUrl, escapeXml, formatDurationClock, siteUrl } from "@/lib/utils";

/**
 * RSS 2.0 with the iTunes extensions, generated from the sermon library.
 *
 * This is what gets the church into Apple Podcasts and Spotify without anyone
 * maintaining a second system: publish a sermon in /admin, and it appears in
 * every subscriber's podcast app.
 *
 * The feed is English-only. Podcast directories key a show to one language, so
 * a bilingual feed would be rejected; if the church later wants a French feed,
 * it should be a second show at its own URL.
 *
 * Only sermons with an audio file are included — a podcast entry with no
 * enclosure is rejected by most directories.
 */
export const revalidate = 3600;

export async function GET() {
  const locale = DEFAULT_LOCALE;
  const [settings, sermons] = await Promise.all([getSettings(locale), getSermons(locale)]);

  const episodes = sermons.filter((sermon) => Boolean(sermon.audioUrl));
  const feedUrl = absoluteUrl("/api/podcast.xml");

  const items = episodes
    .map((sermon) => {
      const url = absoluteUrl(`/${locale}/sermons/${sermon.slug}`);
      const duration = formatDurationClock(sermon.durationSeconds);
      const description =
        sermon.summary ??
        `A message from ${settings.name}${sermon.speaker ? ` by ${sermon.speaker.name}` : ""}.`;

      return `    <item>
      <title>${escapeXml(sermon.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${new Date(sermon.date).toUTCString()}</pubDate>
      <description>${escapeXml(description)}</description>
      <itunes:summary>${escapeXml(description)}</itunes:summary>
      ${sermon.speaker ? `<itunes:author>${escapeXml(sermon.speaker.name)}</itunes:author>` : ""}
      ${duration ? `<itunes:duration>${duration}</itunes:duration>` : ""}
      ${sermon.image?.url ? `<itunes:image href="${escapeXml(absoluteUrl(sermon.image.url))}"/>` : ""}
      <itunes:explicit>false</itunes:explicit>
      <enclosure url="${escapeXml(sermon.audioUrl!)}" type="audio/mpeg" length="${
        sermon.audioByteLength ?? 0
      }"/>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${settings.name} — Sermons`)}</title>
    <link>${escapeXml(siteUrl())}</link>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>
    <language>en</language>
    <description>${escapeXml(settings.description)}</description>
    <copyright>© ${new Date().getFullYear()} ${escapeXml(settings.name)}</copyright>
    <itunes:author>${escapeXml(settings.name)}</itunes:author>
    <itunes:summary>${escapeXml(settings.description)}</itunes:summary>
    <itunes:type>episodic</itunes:type>
    <itunes:explicit>false</itunes:explicit>
    <itunes:category text="Religion &amp; Spirituality">
      <itunes:category text="Christianity"/>
    </itunes:category>
    ${settings.logo?.url ? `<itunes:image href="${escapeXml(absoluteUrl(settings.logo.url))}"/>` : ""}
    <itunes:owner>
      <itunes:name>${escapeXml(settings.name)}</itunes:name>
      ${settings.email ? `<itunes:email>${escapeXml(settings.email)}</itunes:email>` : ""}
    </itunes:owner>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
