# CSS

Read with `SKILL.md` §2. MUST/NEVER = hard rule; SHOULD = default.

## Maintenance

- **Tokens first**: every color, radius and shadow is a custom property on `:root`.
  Components use tokens only, never raw hex.
- **Theme**: follows the OS until the user picks one. A toggle (top right) sets
  `data-theme="light|dark"` on `<html>` and stores it in `localStorage["theme"]`, the
  same key in every app on the origin, so one choice carries across them. Light tokens
  on `:root`; dark ones under `@media (prefers-color-scheme: dark) { :root:not([data-
  theme="light"]) }` and again under `:root[data-theme="dark"]`, each with
  `color-scheme`. Apply the saved choice from a script in `<head>`, so the page never
  flashes the wrong theme. Check both themes before calling it done.
- Few, reusable component classes (`.btn`, `.btn.primary`, `.seg`, `.toggle`, `.pill`,
  `.banner`, `.box`); a variant is a second class, not a copy.
- Style by class, state by attribute: `[aria-pressed="true"]`, `[aria-checked="true"]`,
  `[aria-sort]`, `tr.pending`. The markup already carries the state, so no extra classes.
- `[hidden] { display: none !important; }` once, so `hidden` always wins over `display:
  flex`.
- Layout with flex and grid plus `gap`; no margins for spacing between siblings, no
  floats.
- NEVER use `100vh` or leave body height unset under CSS `zoom`; use `html { height:
  100% }` + `body { min-height: 100% }`, or the background tiles.
- Flat selectors (one or two levels). No `!important` except the `[hidden]` rule.
- Order in the file: tokens, base, layout, components, states, media queries.

## Performance

- System font stack (`system-ui, sans-serif`; `ui-monospace, monospace`), or a
  self-hosted `.woff2` (`assets/fonts/`: Bricolage Grotesque, JetBrains Mono, OFL) with
  `font-src 'self'` in the CSP. Never a font CDN; a strict CSP blocks it silently.
- Animate only `transform` and `opacity`, and only in answer to a user action.
- `position: sticky` for table headers instead of JS scroll handlers.
- Long values: `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` plus a
  `title`, not JS truncation.
- One `<style>` block or one shared file; no CSS-in-JS.

## Security

- No `@import` or `url()` to third-party hosts (it leaks visits and can break offline).
- Never build CSS from user input (`style` attributes from data); use fixed classes.

## Dense tool layout (default for internal tools)

- Body 13px, rows ~28px, controls 30px high, table header sticky, one line per row.
- Wrap toolbars with `flex-wrap`; at phone width only the table box scrolls sideways.

## Based on (copied, not linked; don't fetch these while using the skill)

- MDN: CSS custom properties, `prefers-color-scheme`; web.dev Core Web Vitals
