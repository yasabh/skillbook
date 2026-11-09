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
- Authorization (ACL) is checked in the app on every request, not only at the edge.
- Every state change: POST + `Content-Type: application/json` + matching `Origin` → a
  cross-site form cannot send that.

## Proxies

- nginx redirects must not carry an internal port (`https://host:3000/...`) →
  `absolute_redirect off;` (relative `Location`).
- `proxy_pass` to a variable + `resolver 127.0.0.11` so a restarted backend's new IP is
  picked up; the app port is not published on the host.

## Verify

Each guard has a refusal test: direct caller with the header, user outside the ACL,
wrong `Origin`, out-of-range number, unlisted file, a `<b>` username on the error page.
