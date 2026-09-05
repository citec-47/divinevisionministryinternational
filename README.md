# Divine Vision Ministry International

The church website for Divine Vision Ministry International, Yaoundé — led by
Prophet Emmanuel Ayuh.

Next.js 16 (App Router) + TypeScript + Tailwind v4, content in Neon Postgres via
Prisma, images on Cloudinary, giving through Flutterwave, deployed to Vercel.
English and French throughout.

It is built around two audiences: **people who have never visited** and are
deciding whether to come on Sunday, and **regulars doing one specific task** —
give, check a time, sign up for something.

---

## Running it

```bash
npm install
cp .env.example .env.local     # fill in DATABASE_URL and AUTH_SECRET at minimum
cp .env.local .env             # Prisma's CLI reads .env
npm run db:push                # create the tables
npm run db:seed                # church details, ministries, beliefs, admin user
npm run dev
```

Open http://localhost:3000 — it redirects to `/en` or `/fr` depending on the
browser's language. The staff area is at `/admin`.

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | `prisma generate` then a production build |
| `npm run db:push` | Apply the schema to the database |
| `npm run db:seed` | Seed content and the admin user (safe to re-run) |
| `npm run db:studio` | Prisma Studio, for looking at raw rows |

---

## Architecture

```
prisma/
  schema.prisma      Content and admin tables, bilingual columns
  seed.ts            Church details, ministries, beliefs, FAQs, admin user
src/
  app/
    [locale]/        The public site — its own root layout, header and footer
    admin/           Staff area — its own root layout, English only
      (protected)/   Everything behind the auth gate
      actions.ts     Sign-in plus every content mutation
    api/             podcast.xml, giving checkout + webhook, upload signature
    actions.ts       The three public form actions
  components/        Site UI, plus components/admin for the editing UI
  lib/
    content.ts       THE content layer — every page reads through this
    i18n.ts          Locales, fallback rules, path helpers
    dictionaries.ts  UI strings for both languages
    utils.ts         Dates, timezones, service schedule, WhatsApp, formatting
    auth.ts          Admin sessions (jose JWT in an httpOnly cookie)
  middleware.ts      Sends every visitor to a locale-prefixed path
```

### Two root layouts

`app/[locale]` and `app/admin` each own an `<html>` element, so the admin is a
full-screen tool rather than the public site with a different page inside it.
That is why there is no `app/layout.tsx`.

### The bilingual strategy

Every field a visitor reads exists twice in the database: `titleEn` and
`titleFr`. French is nullable and **falls back to English when empty**, so the
site is never half-blank while the office works through translating. The admin
labels every French box as optional and says what happens if you skip it.

UI chrome — buttons, headings, form labels — lives in
[`src/lib/dictionaries.ts`](src/lib/dictionaries.ts), where TypeScript enforces
that the French object matches the English one key for key. A missing
translation is a build error, not a blank space on a live page.

### The content layer

Pages never touch Prisma directly — they call
[`src/lib/content.ts`](src/lib/content.ts), which resolves the two languages
down to one and survives a database outage. Church details fall back to real
values (name, city, WhatsApp) so the header, footer, and contact links keep
working; lists fall back to empty, because showing nothing beats showing stale
service times.

### Rendering

Everything public is statically rendered and revalidated on a timer, and saving
in the admin revalidates the affected pages immediately. Anything
time-sensitive — the "we are live now" banner, the next-service line — is
computed **in the browser** through `useSyncExternalStore`, because a value
decided on the server would be frozen at build time. The server-rendered
fallback is always the schedule itself, which is correct with JavaScript off.

---

## Decisions worth knowing

**Flutterwave, not Stripe.** Stripe cannot pay out to a business in Cameroon, so
a Stripe integration would have been dead code. Flutterwave settles in XAF and
accepts MTN Mobile Money and Orange Money as well as cards.

**Mobile Money is the primary giving path, not a fallback.** For most givers in
Yaoundé a MoMo transfer is faster and cheaper than a card. The numbers are shown
with tap-to-copy and a WhatsApp button to confirm the gift, and that section
works whether or not Flutterwave is switched on.

**WhatsApp is treated as the main contact channel**, above email and phone,
because that is how people actually reach a church here. It is in the header
CTA path, the contact page, the prayer page, and the structured data.

**Payments are verified server-side, twice.** The redirect back from Flutterwave
is only a hint; the transaction is re-verified against their API and the amount
and currency are checked against the row written before the redirect. The
webhook does the same independently, so a closed tab still records the gift.

**No sermons or events were invented.** The seed contains only what the church
actually told us. Sermons and events start empty and the site's empty states
handle it honestly — a real church's website should not carry a fictional
sermon title.

---

## The admin

Sign in at `/admin`. It covers what staff change week to week:

- **Sermons** — title, date, speaker, series, passages, video/audio links,
  transcript. Paste a normal YouTube link and it becomes a player.
- **Series**, **Events** (with registration), **Ministries**
- **Service times** — the single most important content on the site; it drives
  the homepage, the live banner, and what search engines answer
- **Church details** — address, WhatsApp, livestream, Mobile Money, socials
- **Inbox** — prayer requests, messages, and event registrations, each with a
  "mark as done" tick
- **Giving** — completed and failed online gifts

The dashboard surfaces anything that would make the public site look unfinished
(no service times, a vague address, no sermons, no livestream link).

Images upload straight from the browser to Cloudinary — the server only signs
the request, so a photo never round-trips through a serverless function on a
mobile connection.

---

## Before launch

- [ ] **Rotate the credentials** that were shared during development: the Neon
      password and the Cloudinary API secret.
- [ ] **Confirm the service times.** They are seeded as Sunday 09:00–12:00 —
      correct them in the admin if that is wrong.
- [ ] **Add the real address.** It currently says only "Yaoundé", which is not
      enough for a first-time visitor. A street and a landmark makes the
      difference.
- [ ] Add the livestream channel link, and the Facebook/YouTube URLs.
- [ ] Confirm the Orange Money number — MTN and Orange are currently both set to
      the WhatsApp number.
- [ ] Set `NEXT_PUBLIC_SITE_URL` in production, and generate a fresh
      `AUTH_SECRET`.
- [ ] Have [`/privacy`](src/app/[locale]/privacy/page.tsx) reviewed against
      Cameroonian data protection law. It is a template, not legal advice.
- [ ] Add real photos of a Sunday gathering. The site currently has portraits
      and outreach photos, but nothing showing the congregation.
- [ ] Test giving end to end with Flutterwave test keys.
- [ ] Check the site on a mid-range Android phone on mobile data, not on wifi.

## What was deliberately left out

A members' portal, a forum, a mobile app, a chatbot, and an online membership
directory. They get requested constantly and used almost never. Giving records,
membership rolls, and check-in belong in a church management system — integrate
with one rather than rebuilding it here.
