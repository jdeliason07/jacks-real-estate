# Jack's Realty

Real estate investing, run by the numbers. A mobile-first tool for wholesaling:
track a pipeline from first lead to close, underwrite a deal, keep a cash-buyer
list, and get from a buy box to a Zillow search in one tap.

Everything runs in the browser — no backend, no accounts, and no deal or buyer
data ever leaves the device.

## Pages / routes

| Route                     | Page                                                       |
| ------------------------- | ---------------------------------------------------------- |
| `/`                       | Landing page — wordmark only; swipe up for the menu         |
| `/deals`                  | Deal dashboard — Prospective and Live tabs                  |
| `/deals/:id`              | One deal — underwriting, contract terms, buyers             |
| `/deals/:id/termination`  | Notice of Termination, print-ready                          |
| `/calculator`             | Deal Calculator — ARV → rehab → 70% rule → target price      |
| `/buyers`                 | Buyers CRM — intake form, contact, buy boxes, deal history   |

Navigation is a swipe-up sheet on every page. It only opens when the swipe
*starts* at the bottom of the page, so it never interferes with scrolling.

## Features

**Deals**
- Two tabs: **Prospective** (being sourced and underwritten) and **Live** (signed
  purchase agreement). A deal moves between them without losing its numbers.
- Each prospective deal opens the full Deal Calculator, pre-filled with its own
  comps, rehab and rule %. Edits save back to the deal a moment after you stop
  typing — the `/calculator` scratchpad stays separate and untouched.
- **DD countdown** on every live deal, computed from the stored inspection-period
  end date each time you look at it. Teal while there's runway, violet as it
  tightens, amber for **Due today** and **Past deadline — N days overdue**.
- Live tab sorts by deadline, soonest first.
- **Buyers on a deal** — many-to-many: a buyer can sit on several live deals at
  once, and a deal can carry a shortlist, each marked interested / assigned / passed.
- **Notice of Termination** — one tap, filled from the deal (address, seller,
  entity, buyers, PA date, DD date), then Print / Save as PDF.

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

Records live in the browser's `localStorage` on one device, under four keys:
`jacks-realty-buyers-v1`, `jacks-realty-deals-v1`,
`jacks-realty-deal-buyers-v1` (which buyer is on which deal), and
`jacks-realty-deal-v1` (the `/calculator` scratchpad). That keeps everything
private and offline, but it means:

- Clearing browser data erases the records.
- Nothing syncs between your phone and laptop.

Use **Back up** on the Buyers page regularly — it covers buyers, deals and
their buyer attachments in one file. **Restore** merges a backup back in
(matching ids are replaced, new ones appended) and still accepts older
buyers-only backups. Stored records are normalized on read, so a partial or
hand-edited file can't break the app.

Every read and write goes through `src/lib/repo.js`, whose functions are all
async even though `localStorage` isn't. That's the seam: moving to a real
backend later means rewriting that one file, not every screen.

## Install on a phone

Open the deployed site in Safari (iOS) or Chrome (Android) → Share → **Add to
Home Screen**. It launches full-screen with its own icon, and a service worker
caches the app so it opens without a connection.

## Project layout

```
DESIGN.md                     the Deep Sea Field Kit — colours, type, motifs
src/
  App.jsx                     routes, wrapped in an ErrorBoundary
  main.jsx                    entry point, fonts, service-worker registration
  index.css                   Tailwind + neon wordmark, wave animation, print rules
  lib/
    deal.js / deal.test.js    pure deal math (computeDeal) — unit tested
    dealsSchema.js            deal records, calculator bridge, stage helpers
    repo.js                   all deal reads/writes (async — the backend seam)
    countdown.js              DD-deadline day math and labels
    useCountdown.js           live countdown (interval + tab-visibility)
    useDebouncedSave.js       save after typing stops; flush on unmount/pagehide
    backup.js                 back up / restore buyers, deals and their links
    settings.js               your entity name, for the termination notice
    buyers.js                 buyer records, buy box, Zillow, matching
    buyers.test.js            contact links + buy-box summary
    buyers.normalize.test.js  normalization, sorting, matching
    deals.test.js             deal schema, storage, the deal↔buyer junction
    countdown.test.js         today / overdue / month + DST boundaries
    backup.test.js            round-trips, merges, and v1 files
    tokens.js                 design tokens (see DESIGN.md)
    fonts.js, ui.js           shared style objects
    useDocumentTitle.js       per-route titles
  components/
    Background.jsx            gradient, rings, drifting wave
    SwipeUpMenu.jsx           swipe-up navigation sheet
    ErrorBoundary.jsx         crash screen with a data-backup escape hatch
    Field.jsx                 labelled input (mobile keypad, wheel guard)
    calculator/               Comps, Rehab, Terms, Ledger, MatchingBuyers
    buyers/                   BuyerForm, BuyerCard
    deals/                    DealCard, LiveDealCard, CountdownBanner,
                              BuyerAttachList, PromoteToLiveForm, StatusChip
  pages/                      Landing, CalculatorPage, BuyersPage,
                              DealsPage, DealDetailPage, TerminationNoticePage
```

Styling follows `DESIGN.md` — two accents (teal, violet) plus amber reserved for
states that need a decision now.

## Tech stack

- React 18 + react-router-dom 6
- Vite 5 (dev server + build)
- Tailwind CSS 3
- lucide-react icons
- Fonts self-hosted via @fontsource (Latin subset) — no external requests
- Vitest (89 tests)

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
