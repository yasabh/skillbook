# JavaScript (browser)

Read with `SKILL.md` §2. MUST/NEVER = hard rule; SHOULD = default.

## Maintenance

- ES modules (`<script type="module">`, named exports): strict by default. `const`
  unless it changes, then `let`; NEVER `var`, NEVER `require` mixed with `import`.
- NEVER inline `<script>`, `<style>`, `style=""` or `onclick=""`: they block a strict CSP.
- **State → render via an Observer store** (`createStore` in `lib/ui.js`): change state
  with `store.set({...})`, or mutate and `store.notify()`; `start()` runs
  `store.subscribe(render)` once. Handlers NEVER call `render()` themselves, so none can
  forget it, and several changes in one click render once. The DOM is NEVER the source
  of truth.
- **Every wait the user sees uses the house spinner** from `lib/ui.js`: a button action
  through `withBusy(button, "Applying", work)`, a table fetch through `loadingRow()`.
  NEVER a text-only "Loading…" or a hand-made spinner.
- One `api()` wrapper for every request (from `lib/ui.js`). Every failure ends in a
  visible state (table message or banner), NEVER only in the console.
- SHOULD order a file in `// --- name ---` sections: constants, state, helpers, render,
  data loading, handlers, start. Handlers are named functions bound in one
  `bindHandlers()`; start-up is one `start()` at the bottom.
- **Past ~300 lines, split by job** into `state.js` (state + pure rules, no DOM) ←
  `table.js` (render) ← `data.js` (API, then render) ← `app.js` (handlers, `start()`, a
  4-line module map on top). Imports flow one way only, NEVER in a cycle. Below ~300
  lines one sectioned file is simpler.
- `?.` and `??` for "missing"; `||` only when `""`/`0` must also fall back. Always `===`.
- NEVER mutate a parameter; return a new value (`{ ...obj, ...next }`).
- Shared helpers get a one-line JSDoc stating their contract.

```js
// ❌ nested ternary: the reader decodes three branches at once
b.title = !active ? "Inactive" : blocked ? (kind === "domain" ? "NXDOMAIN" : "Drop") : "Detect";
// ✅ a named function, one branch per line
function blockedTitle(kind, active, blocked) {
  if (!active) return "Inactive";
  if (!blocked) return "Detect";
  return kind === "domain" ? "NXDOMAIN" : "Drop";
}
```

## Performance

- MUST fetch only what is shown (server paging); NEVER load everything and filter here.
- Build a table body off-screen, insert once (`fillBody` / `DocumentFragment`); NEVER a
  request per row.
- **Event delegation**: one listener on the `<tbody>` reading
  `e.target.closest("[data-action]")`, not one per row control.
- SHOULD run independent requests together (`Promise.all`); debounce typing-driven
  requests or prefer an explicit Search/Enter.
- Poll only while something is pending; MUST `clearInterval` when it is done.

## Security

- **NEVER put data into `innerHTML` unescaped.** Use `textContent`, or wrap every value
  in `esc()`, attributes included.
- MUST `encodeURIComponent` (or `URLSearchParams`) every query value; relative API paths only.
- NEVER `eval`, `new Function`, `setTimeout("string")`, `document.write`.
- State changes MUST be POST + JSON (the server checks `Origin`).
- The browser check is comfort only; the server MUST validate again.
- NEVER secrets or tokens in the script or in `localStorage`; the session is an
  `HttpOnly` cookie. Random ids: `crypto.randomUUID()`, NEVER `Math.random`.
- Data keyed by outside input goes in a `Map`, not `{}` (a `__proto__` key would alter
  other objects).
- One `unhandledrejection` listener shows the error in the banner.

```js
// ❌ a username like <img onerror=...> runs as code
td.innerHTML = `<b>${user}</b>`;
// ✅ escaped, or plain text
td.innerHTML = `<b>${esc(user)}</b>`;
td.textContent = user;
```

## Based on (copied, not linked; don't fetch these while using the skill)

MDN (modules, CSP); OWASP cheat sheets (XSS, CSRF, CSP); `javascript-pro` by jeffallan
(MIT) and `javascript-expert` by martinholovsky, read 2026-11-05, taken in part.
