# Jack's Real Estate — Deal Calculator

A field underwriting worksheet for real estate wholesalers. Enter comps, estimate
rehab, apply the 70% rule, and get a target contract price. Runs entirely in the
browser — no backend, no data leaves the device.

**Flow:** ARV → Rehab → 70% Rule → Target Price

## Tech stack

- [React 18](https://react.dev/)
- [Vite 5](https://vitejs.dev/) (dev server + build)
- [Tailwind CSS 3](https://tailwindcss.com/)
- [lucide-react](https://lucide.dev/) icons

## Run locally

```bash
npm install
npm run dev
```

Vite prints a local URL (default http://localhost:5173).

## Build for production

```bash
npm run build      # outputs static files to dist/
npm run preview    # serve the built dist/ locally to verify
```

The `dist/` folder is a fully static site — host it on any static host.

## Deploy

This is a static single-page app, so any static host works.

- **Netlify** — connect the repo; `netlify.toml` already sets build command
  (`npm run build`) and publish dir (`dist`). Or drag-and-drop the `dist/` folder.
- **Vercel** — import the repo; `vercel.json` sets the framework, build command,
  and output dir. Vercel auto-detects Vite as well.
- **GitHub Pages / Cloudflare Pages / S3 / any static host** — run
  `npm run build` and upload the contents of `dist/`.

> Note: the display fonts (Permanent Marker, Kalam) load from Google Fonts at
> runtime, so the deployed site needs outbound network access to fonts.googleapis.com.
> If a font can't load, the browser falls back to a system cursive/sans font.
