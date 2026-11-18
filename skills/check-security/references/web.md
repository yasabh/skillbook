# Web apps and HTTP endpoints

Load when the project serves HTML or an HTTP API. Each line: what to check → the fix.
Code rules for building these live in `code-standard`; this is the audit list.

## Output and files

- Every HTML the **server** builds (error pages included) escapes each value; a
  username or header is input too → `html.escape()` / the template's autoescape.
  Seen: a 403 page put the username into `<p>` raw.
- Static files come from a fixed URL → file allow-list → never `open(STATIC + path)`.
  Test `/../app.py` and an unlisted file: both 404.
- Pages send `Content-Security-Policy` (`script-src 'self'; style-src 'self'`,
  `frame-ancestors 'none'`) → only possible with no inline script/style; move them out.
- `X-Content-Type-Options: nosniff`; `Cache-Control: no-store` on anything per user.

## Who is calling

- An identity header (`X-Auth-User`, `X-Real-IP`) is believed only from the proxy's
  address, re-resolved periodically (container IPs change) → else anyone who reaches the
  port directly claims to be an admin.
- A proxy chain (gateway → ingress → app) must pass the client address hop by hop, and
  the auth service must trust every hop that forwards it → else auto-login fails and
  `/login` ↔ page loops (`ERR_TOO_MANY_REDIRECTS`).
- A trusted hop that passes the header on as received (nginx `$http_x_real_ip`) must be
  reachable only by the hop that sets it → its own docker network with just that hop and
  the auth service, never the shared one; else any app there forges it through the hop.
  Not nginx `set_real_ip_from <name>`: resolved once at start, breaks on recreate.
- Authorization (ACL) is checked in the app on every request, not only at the edge.
- Every state change: POST + `Content-Type: application/json` + matching `Origin` → a
  cross-site form cannot send that.

## Proxies

- nginx redirects must not carry an internal port (`https://host:3000/...`) →
  `absolute_redirect off;` (relative `Location`).
- `proxy_pass` to a variable + `resolver 127.0.0.11` so a restarted backend's new IP is
  picked up; the app port is not published on the host.
- An nginx `add_header` inside a location drops every server-level one, HSTS included →
  `add_header_inherit merge;` at server level (nginx 1.29.3+).

## Verify

Each guard has a refusal test: direct caller with the header, another app on the shared
network reaching a pass-through hop, user outside the ACL,
wrong `Origin`, out-of-range number, unlisted file, a `<b>` username on the error page.
