# HTML

Read with `SKILL.md` §2. MUST/NEVER = hard rule; SHOULD = default.

## Maintenance

- Semantic elements first: `<header>`, `<nav>`, `<main>`, `<section>`, `<table>`,
  `<button>`, `<dialog>`, `<form>`, `<label for>`. They bring keyboard, focus and
  screen-reader behaviour for free, so less code.
- `<button>` for actions, `<a href>` for navigation. Never a clickable `<div>`.
- `aria-*` only where HTML has no element for it: `role="switch"` + `aria-checked`,
  `aria-pressed` on segmented buttons, `aria-sort` on sortable headers, `role="tab"` +
  `aria-selected`.
- Ids for elements the script touches; classes for styling. Don't style by id.
- `hidden` attribute to show/hide, not inline `style="display:none"`.
- One page = one file until a second page needs the same parts (`structure.md`).

## Performance

- Plain document, no framework runtime; the page is usable as soon as it parses.
- No images for icons or decoration; inline SVG or text.
- `<script>` at the end of `<body>` (or `type="module"`/`defer`), so it never blocks
  rendering.
- Tables: render only the current page of rows; the server bounds the size.

## Security

- **No inline event handlers** (`onclick="..."`) and no `javascript:` URLs; handlers are
  attached in the script. This keeps a strict CSP possible.
- No third-party scripts, fonts or styles from CDNs.
- Forms that change state submit through `fetch` as JSON (CSRF rule in `SKILL.md`), not
  as a plain HTML form POST.
- Error pages from the server: plain text or escaped HTML, never the raw exception.

## Accessibility (cheap, always)

- Every input has a label, visible or `aria-label`. Placeholders are hints, not labels.
- `lang` on `<html>`, a meaningful `<title>`, a viewport meta.
- Focus stays visible; `<dialog>` with `showModal()` for confirmations (traps focus,
  Esc closes).
- Contrast readable in light and dark themes.

## Based on (copied, not linked; don't fetch these while using the skill)

- MDN HTML element reference, WAI-ARIA Authoring Practices, WCAG 2.2
