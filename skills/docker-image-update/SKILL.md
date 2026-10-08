---
name: docker-image-update
description: Upgrade and pin Docker base images in a compose project (Dockerfile FROM, compose image:, pip/apk installs) to the newest LTS or latest stable, validate configs against major-version breaking changes, and roll out safely. Use when the user asks to "update/upgrade/bump images", "check latest versions", "pin versions", "pakai LTS", or to choose an image variant (alpine vs slim).
---
# Image upgrade

Goal: every image on a supported line, pinned exactly, and nothing silently broken
after the bump. Ask before building, deploying or committing.

## 1. Inventory

- Find every pin: `FROM` in each Dockerfile, `image:` and `build.args` in compose, and
  unpinned installs (`pip install foo`, `apk add foo=`, `npm i foo`) that float on rebuild.
- Note what runs now (`docker exec <c> <tool> --version`, `pip show`), not only what the
  files say.

## 2. Pick versions

Rule: **LTS if the project has one, else latest stable.** No `latest`, no RC/beta.

- Lifecycle and LTS: `https://endoflife.date/api/<product>.json` (`lts`, `eol`, `latest`).
- Tags: `https://hub.docker.com/v2/repositories/<ns>/<repo>/tags?page_size=100&ordering=last_updated`
  (official images: `library/<name>`).
- **Verify each chosen tag exists** (`.../tags/<tag>` returns 200) before writing it.
- Pin to the patch, plus the distro for language images: `python:3.14.8-alpine3.24`,
  not `python:3.14-alpine`. Pin floating package installs to the version running now.
- Report sources and say which facts you checked today and which come from memory.

Present a table (service, now, target, LTS/stable, minor/**major**) and flag every major
jump before editing anything.

## 3. Variant (alpine / slim / distroless)

Keep the current variant unless there is a measured reason to change.

- Official `python:*-alpine` builds CPython itself; the "Alpine Python is 40% slower"
  reports are about Alpine's distro package built with `-Os`, not the official image.
  musl can still lose on malloc-heavy or multi-threaded work.
- Size differences are tens of MB; data volumes dwarf them.
- If it matters, **measure** one candidate (image size, CPU of the real workload) instead
  of a variant matrix or forum consensus. CVE counts across distros are not comparable.
- Bigger security wins than the base: non-root `USER`, multi-stage builds, no pip cache.

## 4. Where pins live

- Simple and tool-friendly: `FROM image:tag@sha256:...` in the Dockerfile; Renovate and
  Dependabot read it.
- One place for all versions: `ARG BASE_IMAGE` + `FROM ${BASE_IMAGE}`, set in compose
  `build.args` (YAML anchor for shared ones). Bots do not read build args; say so.
- A digest makes the pin immutable but also freezes out re-pushed security patches.

## 5. Validate majors before deploy

Read the upgrade guide for each major jump, then test with the new image locally:

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

## 6. Roll out

- Back up data volumes first (SQLite: `sqlite3` backup API inside the container, not a
  file copy, because of WAL). Majors may write data the old version can't read.
- Recommend one service at a time, lowest risk first: language images, then metrics,
  logs, then UI (`docker compose up -d --build <svc>`). If the user builds all at once,
  check all.
- After deploy: versions (`buildinfo`, `/api/health`, `python -V`), readiness, scrape
  targets, old data still queryable, error logs after warm-up, CPU/RAM vs before.
- Errors in the first seconds (e.g. Loki "empty ring", connection refused to a peer
  still starting) are start-up races; recheck before reporting. A target that was also
  down before the upgrade is not caused by it; check history (`up[2h]`).

## 7. Commit

Use the `commit` skill: `build:` with `from -> to` and the reason (EOL, LTS), config
changes the major required in the same commit, and fixes for things the bump broke
(e.g. branding) as a separate `fix:`.
