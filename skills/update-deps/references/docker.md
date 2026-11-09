# Docker images

Load when the project has a `Dockerfile` or compose file.

## Inventory

- Every pin: `FROM` in each Dockerfile, `image:` and `build.args` in compose, and
  unpinned installs inside them (`pip install foo`, `apk add foo=`, `npm i foo`) that
  float on rebuild.
- What runs now: `docker exec <c> <tool> --version`, `pip show`, `docker compose images`.

## Picking tags

- Tags: `https://hub.docker.com/v2/repositories/<ns>/<repo>/tags?page_size=100&ordering=last_updated`
  (official images: `library/<name>`). Verify the chosen tag: `.../tags/<tag>` returns 200.
- Pin to the patch, plus the distro for language images: `python:3.14.8-alpine3.24`,
  not `python:3.14-alpine`.
- nginx: odd minor = mainline (what `nginx:alpine` tracks, recommended upstream), even
  minor = stable, which is *older*. Pin mainline (`nginx:1.31.6-alpine3.24`), not
  stable 1.30.
- Leave `tzdata` (and CA bundles) unpinned: stale zone or CA data breaks things
  silently, and pinning it would only freeze it.

## Variant (alpine / slim / distroless)

Keep the current variant unless there is a measured reason to change.

- Official `python:*-alpine` builds CPython itself; the "Alpine Python is 40% slower"
  reports are about Alpine's distro package built with `-Os`, not the official image.
  musl can still lose on malloc-heavy or multi-threaded work.
- Size differences are tens of MB; data volumes dwarf them.
- If it matters, **measure** one candidate (image size, CPU of the real workload) instead
  of a variant matrix or forum consensus. CVE counts across distros are not comparable.
- Bigger security wins than the base: non-root `USER`, multi-stage builds, no pip cache.
- Alpine tools are busybox, not GNU: e.g. `df` has no `--output` (use `df -P` + `awk`).
  Test scripts in the image itself, or `apk add coreutils`.

## Where pins live

- Simple and tool-friendly: `FROM image:tag@sha256:...` in the Dockerfile; Renovate and
  Dependabot read it.
- One place for all versions: `ARG BASE_IMAGE` + `FROM ${BASE_IMAGE}`, set in compose
  `build.args` (YAML anchor for shared ones). Bots do not read build args; say so.
  BuildKit then warns `InvalidDefaultArgInFrom` once per Dockerfile: harmless (compose
  passes the value). Silence it with `# check=skip=InvalidDefaultArgInFrom` as the first
  line, not with a default that duplicates the pin.
- A digest makes the pin immutable but also freezes out re-pushed security patches.

## Validate majors

| Image | Check |
|---|---|
| Prometheus | `promtool check config` (via `--entrypoint sh`, config piped on stdin) |
| Loki 3 | distroless, no shell: `docker create ... -verify-config`, `docker cp` the config in, `docker start -a`; exit 0 = ok. Loki 3 removed `compactor.shared_store` (use `delete_request_store`) and needs schema v13/tsdb |
| Grafana | dashboards using Angular panels break in 12+; any `sed` on `public/build` may silently match nothing |
| Language images | build once; deps without wheels for the new version/arch fail here |

Bind mounts from WSL `/mnt/...` paths may arrive as empty directories; pipe files via
stdin or `docker cp` instead.

**Patches on vendor files** (sed rebranding, asset swaps): make the build fail when the
target is missing, so the next release cannot break them silently:

```dockerfile
RUN set -e; for f in /usr/share/grafana/public/build/static/img/grafana_icon.*.svg; do \
      [ -e "$f" ] || { echo "asset not found"; exit 1; }; cp /new.svg "$f"; done
```

## Roll out

- Back up data volumes first (SQLite: `sqlite3` backup API inside the container, not a
  file copy, because of WAL). Majors may write data the old version can't read.
- One service at a time, lowest risk first: language images, then metrics, logs, then UI
  (`docker compose up -d --build <svc>`). If the user builds all at once, check all.
- After deploy: versions (`buildinfo`, `/api/health`, `python -V`), readiness, scrape
  targets, old data still queryable, error logs after warm-up, CPU/RAM vs before.
- Errors in the first seconds (e.g. Loki "empty ring", connection refused to a peer
  still starting) are start-up races; recheck before reporting. A target that was also
  down before the upgrade is not caused by it; check history (`up[2h]`).
