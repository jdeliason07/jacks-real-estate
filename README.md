# Jack's Realty

Real estate investing, run by the numbers. This is the site for Jack's Realty —
currently a simple landing page plus the **Deal Calculator**, a field
underwriting worksheet. It's built as a multi-page single-page app so more
pages (deals, portfolio, contact) can be added later without re-architecting.

Everything runs in the browser — no backend, and no deal data leaves the device
(inputs are saved to `localStorage` so a deal survives a refresh).

## Pages / routes

| Route          | Page                                                        |
| -------------- | ----------------------------------------------------------- |
| `/`            | Landing page (brand + link into the tools)                  |
| `/calculator`  | Deal Calculator — ARV → Rehab → 70% rule → target price     |

Add new pages in `src/pages/` and register them in `src/App.jsx`.

## Project layout

```
src/
  App.jsx                     route table
  main.jsx                    entry point + self-hosted font imports
  index.css                   Tailwind directives
  lib/
    deal.js                   pure deal math (computeDeal) + formatting  ← unit-tested
    deal.test.js              vitest tests for the math
    fonts.js                  shared font style objects
    ui.js                     shared input styling
  components/
    Background.jsx            shared gradient + rings page shell
    Nav.jsx                   brand top bar
    calculator/
      DealCalculator.jsx      state, persistence, composes the sections
      CompsSection.jsx        comps → ARV
      RehabSection.jsx        rehab estimate
      TermsSection.jsx        rule %, fee, listing price
      LedgerSection.jsx       ledger, target price, copy-summary
  pages/
    Landing.jsx
    CalculatorPage.jsx
```

## Tech stack

- [React 18](https://react.dev/) + [react-router-dom 6](https://reactrouter.com/)
- [Vite 5](https://vitejs.dev/) (dev server + build)
- [Tailwind CSS 3](https://tailwindcss.com/)
- [lucide-react](https://lucide.dev/) icons
- Fonts (Permanent Marker, Kalam) self-hosted via [@fontsource](https://fontsource.org/)
  — bundled at build time, so the site works fully offline with no external requests.
- [Vitest](https://vitest.dev/) for the deal-math tests

## Develop

```bash
npm install
npm run dev        # Vite dev server (default http://localhost:5173)
npm test           # run the deal-math unit tests
```

## Build for production

```bash
npm run build      # outputs a static site to dist/
npm run preview    # serve the built dist/ locally to verify
```

## Deploy

`dist/` is a fully static SPA — host it anywhere.

- **Netlify** — connect the repo; `netlify.toml` sets the build command
  (`npm run build`), publish dir (`dist`), and the SPA fallback so deep links
  like `/calculator` resolve.
- **Vercel** — import the repo; `vercel.json` sets the framework, build command,
  output dir, and SPA rewrites.
- **GitHub Pages / Cloudflare Pages / S3 / any static host** — run
  `npm run build`, upload `dist/`, and make sure unknown paths fall back to
  `index.html` (required for client-side routing).
