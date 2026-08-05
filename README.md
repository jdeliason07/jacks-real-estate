# Jack's Realty

Real estate investing, run by the numbers. A mobile-first tool for wholesaling:
underwrite a deal, keep a cash-buyer list, and get from a buy box to a Zillow
search in one tap.

Everything runs in the browser — no backend, no accounts, and no deal or buyer
data ever leaves the device.

## Pages / routes

| Route         | Page                                                          |
| ------------- | ------------------------------------------------------------- |
| `/`           | Landing page — wordmark only; swipe up for the menu            |
| `/calculator` | Deal Calculator — ARV → rehab → 70% rule → target price        |
| `/buyers`     | Buyers CRM — intake form, contact, buy boxes, deal history     |

Navigation is a swipe-up sheet on every page. It only opens when the swipe
*starts* at the bottom of the page, so it never interferes with scrolling.

## Features

**Deal Calculator**
- Comps → ARV (or manual override), rehab by tier or $/sqft, configurable rule %
- Clamps impossible deals to an explicit "No deal" state
- "Buyers This Fits" — matches the computed deal against saved buy boxes
- Copy a plain-text deal summary; inputs persist across refreshes

**Buyers**
- Intake form mirroring the *Real Estate Cash Buyer Intake Form* spec sheet
  (investor & entity, target market, property criteria, financial &
  underwriting, condition & scope, transaction & closing)
- One-tap **Email / Call / Text**; the email is pre-written with their buy box
- **Search Zillow for this buy box** — builds a filtered Zillow URL from the
  location, beds, baths and max price
- Expandable cards: brief buy-box summary, deal history with fees earned
- Contact tracking — tapping a contact button stamps the record, and cards show
  how long it's been ("today", "12d ago", "never"), with a **Follow up** sort
- Search across name, company, city, zip and strategy
- **Back up / Restore** to a JSON file

## Data & backup

Records live in the browser's `localStorage` on one device. That keeps
everything private and offline, but it means:

- Clearing browser data erases the records.
- Nothing syncs between your phone and laptop.

Use **Back up** on the Buyers page regularly. **Restore** merges a backup file
back in (matching ids are replaced, new ones appended). Stored records are
normalized on read, so a partial or hand-edited file can't break the app.

## Install on a phone

Open the deployed site in Safari (iOS) or Chrome (Android) → Share → **Add to
Home Screen**. It launches full-screen with its own icon, and a service worker
caches the app so it opens without a connection.

## Project layout

```
src/
  App.jsx                     routes, wrapped in an ErrorBoundary
  main.jsx                    entry point, fonts, service-worker registration
  index.css                   Tailwind + neon wordmark and background-wave animations
  lib/
    deal.js / deal.test.js    pure deal math (computeDeal) — unit tested
    buyers.js                 buyer records, buy box, Zillow, matching, backup
    buyers.test.js            contact links + buy-box summary
    buyers.normalize.test.js  normalization, sorting, matching, backup round-trip
    fonts.js, ui.js           shared style objects
    useDocumentTitle.js       per-route titles
  components/
    Background.jsx            gradient, rings, drifting wave
    SwipeUpMenu.jsx           swipe-up navigation sheet
    ErrorBoundary.jsx         crash screen with a data-backup escape hatch
    Field.jsx                 labelled input (mobile keypad, wheel guard)
    calculator/               Comps, Rehab, Terms, Ledger, MatchingBuyers
    buyers/                   BuyerForm, BuyerCard
  pages/                      Landing, CalculatorPage, BuyersPage
```

## Tech stack

- React 18 + react-router-dom 6
- Vite 5 (dev server + build)
- Tailwind CSS 3
- lucide-react icons
- Fonts self-hosted via @fontsource (Latin subset) — no external requests
- Vitest (43 tests)

## Develop

```bash
npm install
npm run dev        # Vite dev server (default http://localhost:5173)
npm test           # unit tests
npm run build      # static site into dist/
npm run preview    # serve the build locally
```

## Deploy

`dist/` is a static SPA — host it anywhere.

- **Netlify** — `netlify.toml` sets the build command, publish dir and SPA fallback.
- **Vercel** — `vercel.json` sets the framework, build command, output dir and rewrites.
- **Any static host** — run `npm run build`, upload `dist/`, and make sure unknown
  paths fall back to `index.html` (required for client-side routing).
