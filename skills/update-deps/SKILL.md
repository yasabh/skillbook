---
name: update-deps
description: Upgrade and pin a project's dependencies in any stack (libraries, runtimes, tools, base images) to the newest LTS or latest stable, check candidates with check-security, validate major-version breaking changes, and roll out safely. Use when the user asks to "update/upgrade/bump dependencies, packages, images or versions", "check latest versions", "pin versions", "pakai LTS", "update versi", "upgrade library", or to choose an image variant (alpine vs slim).
---
# Update dependencies

Goal: every dependency on a supported line, pinned exactly, and nothing silently broken
after the bump.

> **Gate:** check and recommend first; change nothing until the user approves. Here: the
> target table (§2) before editing any pin; then again before building, deploying or
> committing.

| Reference | Load when |
|---|---|
| `references/docker.md` | a `Dockerfile` or compose file exists |

Which lessons earn a reference (new or existing): `save-session` decides.

## 1. Inventory

- Every pin: lockfiles and manifests (`package.json`, `pyproject.toml`,
  `requirements*.txt`, `*.csproj`), runtime versions (`.nvmrc`, `.python-version`,
  `requires-python`, `global.json`), CI tool versions, base images.
- Floating installs that change on every rebuild (`pip install foo`, `npm i foo`,
  `apt-get install foo`), and `latest` anywhere.
- What **runs now** (`python -V`, `node -v`, `pip show`, `npm ls`), not only what the
  files say.

## 2. Pick versions

Rule: **LTS if the project has one, else latest stable.** No `latest`, no RC/beta.

- Lifecycle and LTS: `https://endoflife.date/api/<product>.json` (`lts`, `eol`, `latest`).
- Package versions: the registry (PyPI `https://pypi.org/pypi/<pkg>/json`, npm
  `https://registry.npmjs.org/<pkg>`, NuGet). **Verify each chosen version exists**
  before writing it.
- Pin exactly: patch version, lockfile committed. Pin floating installs to the version
  running now.
- **Never downgrade by rule.** If the "stable" target is older than what runs now, keep
  the line that runs and pin it.
- Respect peer constraints: a library bump that forces a runtime or framework major is a
  major for the whole project.
- Report sources and say which facts you checked today and which come from memory.

Before presenting targets, run the `check-security` skill on the current and candidate
versions. Newest is not always safest: a candidate that adds a KEV or a worse regression
than it fixes is not the target. Follow its ranking; don't repeat its scoring here.

Present a table (component, now, target, LTS/stable, minor/**major**, vulns now → target)
and flag every major jump. Wait for the user's OK before editing anything.

## 3. Validate majors before deploy

- Read the upgrade guide or changelog for each major jump; list the breaking changes
  that touch this project's code or config.
- Install and build once; run the tests (`write-tests` if the critical path has none).
- Config and data formats: validate with the tool's own checker where one exists.
- **Patches on vendor files** (rebranding, asset swaps): make the build fail when the
  target is missing, so the next release cannot break them silently.

## 4. Roll out

- Back up data first; a major may write data the old version can't read.
- One component at a time, lowest risk first.
- After deploy: versions, health checks, old data still readable, error logs after
  warm-up, CPU/RAM vs before.
- Errors in the first seconds after a restart are often start-up races; recheck before
  reporting. Something that was already broken before the upgrade is not caused by it.

## 5. Commit

Use the `commit-git` skill: `build:` with `from -> to` and the reason (EOL, LTS, CVE),
config changes the major required in the same commit, and fixes for things the bump
broke as a separate `fix:`.
