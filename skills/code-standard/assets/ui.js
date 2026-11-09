// ui.js v1 — house UI helpers (code-standard skill). Framework-free ES module.
// Copied into each project; fix it in skillbook first, then copy again.

/**
 * Observer store: change state with set() (or mutate, then notify()); every subscriber
 * runs once after the current task, so several changes in one click render once.
 */
export function createStore(state) {
  const listeners = new Set();
  let queued = false;
  function notify() {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      for (const listener of listeners) listener(state);
    });
  }
  return {
    state,
    notify,
    set(patch) {
      Object.assign(state, patch);
      notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** Element by id. */
export const $ = (id) => document.getElementById(id);

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Text made safe to put inside HTML (content and attribute values). */
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ESCAPES[c]);

/** "5 min ago", "3 h ago", or a date for anything older than a day. ts in Unix seconds. */
export function ago(ts) {
  if (!ts) return "";
  const s = Date.now() / 1000 - ts;
  if (s < 3600) return Math.max(1, Math.round(s / 60)) + " min ago";
  if (s < 86400) return Math.round(s / 3600) + " h ago";
  const opts = { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" };
  return new Date(ts * 1000).toLocaleString([], opts);
}

/**
 * JSON request under api/, relative to the page. A body is sent as JSON, which the
 * server's CSRF check expects. A non-2xx answer throws an Error with its error text.
 */
export async function api(path, opts) {
  const headers = { Accept: "application/json" };
  if (opts?.body) headers["Content-Type"] = "application/json";
  const r = await fetch("api/" + path, { headers, ...opts });
  const body = await r.json().catch(() => ({ error: r.statusText }));
  if (!r.ok) throw new Error(body.error || r.statusText);
  return body;
}

/** Whole number from an input within [min, max], else null; shows/hides errEl. */
export function intInRange(input, min, max, errEl) {
  const n = Number(input.value);
  const ok = Number.isInteger(n) && n >= min && n <= max;
  if (errEl) errEl.hidden = ok;
  return ok ? n : null;
}

const SPINNER = '<span class="spinner" aria-hidden="true"></span>';

/**
 * Run `work` with the button disabled, showing a spinner and `text` ("Applying");
 * the button comes back as it was, success or error. Returns what `work` returns.
 */
export async function withBusy(button, text, work) {
  const label = button.textContent;
  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  button.innerHTML = `${SPINNER} ${esc(text)}`;
  try {
    return await work();
  } finally {
    button.disabled = false;
    button.removeAttribute("aria-busy");
    button.textContent = label;
  }
}

/** A full-width "loading" row with a spinner, for a table body that is being fetched. */
export const loadingRow = (text, cols) =>
  `<tr><td colspan="${cols}" class="empty" aria-busy="true">${SPINNER} ${esc(text)}</td></tr>`;

/** A full-width message row (loading, empty, error) for a table body. */
export const messageRow = (text, cols, cls = "empty") =>
  `<tr><td colspan="${cols}" class="${cls}">${esc(text)}</td></tr>`;

/** Rows into a table body (built off-screen, inserted once), or one message row when there are none. */
export function fillBody(tbody, items, makeRow, emptyText, cols) {
  if (!items.length) {
    tbody.innerHTML = messageRow(emptyText, cols);
    return;
  }
  const frag = document.createDocumentFragment();
  for (const item of items) frag.append(makeRow(item));
  tbody.replaceChildren(frag);
}

/**
 * Append a <td> holding trusted HTML (escape data first with esc).
 * opts.clip: one line with ellipsis; opts.title: tooltip.
 */
export function cell(tr, html, opts = {}) {
  const td = document.createElement("td");
  td.innerHTML = html;
  if (opts.clip) td.className = "clip";
  if (opts.title) td.title = opts.title;
  tr.appendChild(td);
  return td;
}

/**
 * A switch button (.toggle). It carries data-action; handle clicks once on the
 * container (event delegation) instead of one listener per switch.
 */
export function toggle(action, label, on, changed = false, disabled = false) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = changed ? "toggle changed" : "toggle";
  b.dataset.action = action;
  b.setAttribute("role", "switch");
  b.setAttribute("aria-checked", on);
  b.setAttribute("aria-label", label);
  b.disabled = disabled;
  return b;
}

/** Mark one button of a group pressed (segmented control), by a predicate. */
export function setPressed(selector, isOn) {
  for (const b of document.querySelectorAll(selector)) b.setAttribute("aria-pressed", isOn(b));
}

/** Show #banner (role=status) as an error. */
export function showError(e) {
  const banner = $("banner");
  banner.className = "banner err";
  banner.textContent = e?.message || String(e);
  banner.hidden = false;
}
