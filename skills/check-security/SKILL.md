---
name: check-security
description: Check a project for security problems (vulnerable dependencies, runtimes and images, leaked secrets, unsafe config and access) in any stack, rank what actually matters, and recommend the smallest safe fix or version to move to. Use when the user asks "is this safe", "is this version safe", "scan for vulns", "check CVEs", "check secrets", "security audit", "which version is safe/bug free", "cek CVE", "cek vuln", "cek keamanan", "versi mana yang aman", "aman gak versi ini", before update-deps pins a target, or for the security part of a baseline-project audit. Not for writing new code (code-standard) or doing the upgrade itself (update-deps).
---
# Check security

Goal: for each component, the newest version on a supported line with **no known fixable
High/Critical and nothing actively exploited**, no secrets where they can leak, and access
that is enforced, not hidden. No version is "bug free" or "zero vuln"; say "none known as
of <date> in <sources>".

> **Gate:** check and recommend first; change nothing until the user approves. Here: the
> checks are read-only; installing scanners, pulling large images, editing pins or config,
> building or deploying wait for OK.

| Reference | Load when |
|---|---|
| `references/docker.md` | a `Dockerfile` or compose file exists |
| `references/linux.md` | shell scripts, or Linux hosts with LUKS, systemd or mount points |
| `references/web.md` | the project serves HTML or an HTTP API, or sits behind a proxy |

Which lessons earn a reference (new or existing): `save-session` decides.

## 1. Inventory

- **Components**: runtimes (Python, Node, .NET), frameworks, libraries (lockfiles:
  `package-lock.json`, `poetry.lock`, `requirements*.txt`, `*.csproj`), base images,
  platform services. Note what **runs now**, not only what the files say.
- **Secrets surface**: config files, scripts, notebooks, `.env*`, CI config, git history.
- **Access**: who can reach what (auth, roles, permissions, exposed ports, public URLs).

## 2. Check

**Dependencies.** Scan the current and the candidate versions, so the recommendation
shows what a move fixes and what it doesn't. Pin the scanner's own version; run it as a
container when not installed (installing on the host needs OK).

| Ecosystem | Tool |
|---|---|
| any lockfile | `osv-scanner scan source -r .` |
| Python | `pip-audit` |
| Node | `npm audit --omit=dev` (runtime deps first) |
| images | `references/docker.md` |
| one package, exact version | OSV: `POST https://api.osv.dev/v1/query` with `{"package":{"name":"jinja2","ecosystem":"PyPI"},"version":"3.1.2"}`; fixed version = `affected[].ranges[].events[].fixed` (range is `[introduced, fixed)`) |

Fixed-only first (`--ignore-unfixed`, `--only-fixed`): an unfixed CVE can't be solved by
a version bump. List unfixed ones separately, never drop them silently.

**Secrets.**
- Working tree: keys, tokens, passwords, connection strings.
- Git history: `gitleaks detect` if installed; if not, say so.
- `.gitignore` covers `.env`, local settings, credential files, build output.
- **A secret found: stop and tell the user at once.** It must be rotated; deleting it
  from the repo or history does not un-leak it.

**Config and access.**
- Versions pinned: lockfile committed, image tags exact, nothing on `latest`.
- Access enforced by the platform (roles, permissions, server-side checks), not only
  hidden in UI code; no client-controlled filter that widens what a user sees.
- Inputs validated server side.
- Least privilege: tokens and service accounts scoped to what they use; nothing that
  matters owned by a personal account.
- Debug and verbose error output off in production config.
- Default branch protected, changes reviewed (check on the Forgejo side; report unknown
  if not reachable).

## 3. Rank: exploited first, CVSS last

1. **EOL line**: no security fixes at all any more (`https://endoflife.date/api/<product>.json`).
   Top priority whatever the scan says.
2. **Known exploited**: CISA KEV,
   `https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json`.
3. **Likely exploited**: EPSS, `https://api.first.org/data/v1/epss?cve=<CVE>` (probability
   in the next 30 days; there is no official cut-off, so state the one you use, e.g. 0.1).
4. **Severity**: the vendor's or distro's rating over NVD's (distro specifics in
   `references/docker.md`).

- CVSS measures severity, not risk (FIRST). Since April 2026 NVD only enriches KEV,
  federal and critical-software CVEs; **a missing score is not a low score**.
- Ask if it's reachable here: the vulnerable package is used at runtime, the feature is
  enabled, the port is exposed. A CVE in a build-only tool ranks lower; say why instead
  of hiding it.

Leaked secrets and access that is open now rank with 1–2: they are exposure today.

## 4. Pick the fix

- Smallest move that clears ranks 1–3 and fixable High/Critical: newest **patch** on the
  current line first, then the next supported minor, a major only if nothing less fixes
  it (then `update-deps` validates and rolls it out).
- **Bugs**: read the changelog from the running version to the target, and the upstream
  tracker for open regressions in the target (`label:regression`, "since x.y.z"). Prefer
  a patch that has been out a few days, unless it fixes a rank 1–2 issue.
- **Unfixed**: a bump won't help. Options: an alternative package or variant that has
  the fix, removing the component, or accepting it with a one-line reason.

## 5. Report

| Component | Now | Fixable C/H | KEV / high EPSS | Target | Left after (unfixed) | Regressions |
|---|---|---|---|---|---|---|

Non-version findings (secrets, config, access) in a second table: finding, evidence,
severity (**high**: exposure now; **medium**: will cause an incident; **low**: hardening),
proposed fix.

Then: the sources used, which facts were checked today vs remembered, scanner and DB
versions, and what was ranked down as unreachable and why. Version moves go through
`update-deps`; commits through `commit-git` (`build:` or `fix:` naming the CVE or KEV).
