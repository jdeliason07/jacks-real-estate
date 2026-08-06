# Deep Sea Field Kit

The visual system behind Jack's Realty. It was built by hand across the first few
screens before it was ever written down; this document and `src/lib/tokens.js`
record what was already there, so new screens match rather than re-derive.

**Rule of thumb:** if you're reaching for a value that isn't here, you probably
want an existing one.

---

## Typography

Two faces, both self-hosted via `@fontsource` and imported once in
`src/main.jsx`. Latin subset only — there is no runtime request to Google Fonts,
which is what lets the PWA render correctly offline.

| Role | Face | Token |
| --- | --- | --- |
| Display — headings, buttons, eyebrows, labels-as-signage | Permanent Marker 400 | `displayFont` |
| Body — values, numbers, inputs | Kalam 700 | `bodyFont` |
| Body light — prose, hints, captions | Kalam 400 | `bodyFontLight` |

Permanent Marker ships **weight 400 only**; never ask for a bolder one.

Page headings carry a hand-drawn depth shadow:

```js
style={headingStyle}  // displayFont + "4px 4px 0 rgba(124,58,237,0.55)"
```

Type runs deliberately large — this is a phone-in-one-hand tool used standing in
a driveway. Body copy is `text-lg`, values `text-xl`/`text-2xl`, page titles
`text-4xl sm:text-5xl`. Don't shrink below `text-base`.

## Colour

### Surfaces — the blue ramp

| Use | Class |
| --- | --- |
| Page floor | `#020617` (also `<meta name="theme-color">`) |
| Card | `bg-blue-900` |
| Recessed panel / input | `bg-blue-950` |
| Hairline / divider | `border-blue-800` |
| Muted text | `text-blue-400`, `text-blue-500` |
| Body text | `text-blue-300`, `text-blue-100` |

The background gradient (`deepSeaGradient`):

```
linear-gradient(160deg, #020617 0%, #042f2e 50%, #1e1b4b 100%)
```

abyss → teal-black → indigo. Applied by `<Background>`, which every page wraps.

> `ErrorBoundary.jsx` inlines this gradient instead of importing it, **on
> purpose**: the crash screen has to render even when a module fails to load.
> That one duplication is load-bearing. Leave it.

### Accents — two, plus an alarm

- **Teal** `#14b8a6` / `#2dd4bf` — primary. Actions, healthy states, "this works".
- **Violet** `#7c3aed` — secondary. Depth shadows, card edges, emphasis, "pay attention".
- **Amber** `#f59e0b` — *alarm only*. Never decorative. If amber is on screen,
  something needs a decision.

Hero numbers use the teal→violet gradient fill (`gradientTextStyle`).

### State palette

Three tones, exposed as `TONES` and `alertClass(tone, { heavy })`:

| Tone | Colour | Means |
| --- | --- | --- |
| `good` | teal | Comfortable. On track. |
| `info` | violet | Tightening. Worth a look. |
| `warn` | amber | Act now. |

Alerts are **border-only** — no fill at normal weight, matching `BuyerForm` and
`LedgerSection`. Escalate urgency with `heavy` (thicker border + a dark fill),
**not** with a new hue. Adding a fourth colour is the one thing this system asks
you not to do.

Applied to the DD-deadline countdown, that gives: teal with 8+ days of runway,
violet from 7 days in (heavier at 3), amber at "Due today" and past deadline.

## Shape & spacing

| Element | Radius |
| --- | --- |
| Cards, primary buttons, page sections | `rounded-xl` (12px) |
| Inputs, chips, alerts, secondary buttons | `rounded-lg` (8px) |
| Avatars, the target-price hero | `rounded-full` |

Borders are `border-2` almost everywhere — the kit reads as *drawn*, so edges
stay visible. `border-4` is reserved for escalation. Cards sit in a
`max-w-2xl mx-auto px-4 py-10` column and stack with `mb-6`.

## Motifs

**Sonar rings** — four static concentric circles anchored off the bottom-right
corner, alternating teal/violet at decreasing opacity (0.25 → 0.1). Lives in
`Background.jsx`. Used *sparingly*: one set per page, never inside a card.

**Wave sweep** — `.wave-sweep` in `index.css`. A blurred teal→violet band
drifting up the page over 12s.

**Neon wordmark** — `.electric` in `index.css`. Landing page only.

All three respect `prefers-reduced-motion: reduce`.

## Controls

From `tokens.js`: `primaryButtonClass` (full-width, teal fill, display font),
`secondaryButtonClass` (outlined, body font), `dangerButtonClass` (amber
outline), `chipClass(active)` for tabs/filters/toggles, `emptyStateClass` for
"nothing here yet", `flashClass` for transient confirmations.

Inputs come from `ui.js` (`inputClass`, `numericProps`) and, better, from the
`<Field>` component — it wires up label association, the mobile decimal keypad,
and the wheel-guard that stops a stray scroll silently rewriting a dollar
amount. Prefer `<Field>` over a raw `<input>`.

## Print

`/deals/:id/termination` is the one screen that leaves the deep sea: the print
rules in `index.css` flip it to black-on-white and hide the navigation, rings,
wave, and buttons. A legal notice handed to an agent shouldn't look like an app.

## Where the tokens live

| File | Holds |
| --- | --- |
| `src/lib/tokens.js` | Colours, gradients, surface/control class strings, tone helpers |
| `src/lib/fonts.js` | The three font style objects |
| `src/lib/ui.js` | `inputClass`, `numericProps` |
| `src/index.css` | Tailwind directives, `.electric`, `.wave-sweep`, keyframes, print rules |

`tailwind.config.js` extends nothing on purpose. Colours are stock Tailwind
palette names so any Tailwind reference applies; the kit is the *selection* from
that palette, recorded here.
