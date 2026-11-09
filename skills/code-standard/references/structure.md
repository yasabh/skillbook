# Structure: default stack, files, house library

Read for a new page or project, new files, or a helper more than one place needs.

## Default stack (when the repo has none)

| Layer   | Default                                                                   |
| ------- | ------------------------------------------------------------------------- |
| Page    | `index.html` (markup only) + `app.css` + `app.js`; house library in `lib/` |
| JS      | Vanilla ES modules, `fetch` with relative paths (`api/...`)               |
| Backend | The service's language and its stdlib server (Python `http.server`)       |
| Data    | What the service already uses (SQLite, an API); no new store for a page    |
| Tests   | The service's runner, through the HTTP entry point (`write-tests`)        |

NEVER a framework, bundler, npm or CDN unless the repo already has one or the need is
real and stated. Internal networks often cannot reach CDNs.

## Files and folders

```
static/
  index.html  app.css  app.js  (state.js  table.js  data.js when split, see js.md)
  lib/  ui.js  ui.css          ← copied from skillbook, NEVER edited here
```

- `lib/` holds only copied code, so nobody fixes it in the wrong place.
- The page's own files stay flat next to `index.html`. SHOULD NOT add folders by type
  (`js/`, `css/`); group by feature only once there are many pages.
- The server MUST serve static files from a fixed allow-list, never a path from the request.

## House library (`assets/` of this skill)

- `assets/ui.js`: `createStore` (Observer: set/notify/subscribe), `withBusy` and
  `loadingRow` (spinner), `$`, `esc`, `ago`, `api`, `intInRange`, `messageRow`,
  `fillBody`, `cell`, `toggle`, `setPressed`, `showError`.
- `assets/ui.css`: tokens (light/dark), buttons, segmented control, switch, spinner,
  banner, dense table, dialog.
- New page: MUST copy both into `static/lib/` and import them; NEVER rewrite them.
- The first line carries the version (`v1`). A fix goes into skillbook first, then is
  copied into every project that uses it. Changing a helper: grep every caller first.

## Growing reuse

1. First use: keep it in the file that needs it.
2. Second use: move it into `lib/ui.js` / `lib/ui.css` (or a small Python module): one
   job, no hidden global state, a one-line contract comment.
3. Third project: it is part of the house library in skillbook, copied in (Docker builds
   cannot follow links out of the project).

```js
// ❌ two tables, same "empty → message, else rows" code copied twice
// ✅ one helper in lib/ui.js, one line per table
fillBody($("ovRows"), state.ovs, overrideRow, "No overrides yet.", COLS);
```
