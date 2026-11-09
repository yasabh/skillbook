---
name: baseline-project
description: Bring a project, new, existing or drifted, up to the team baseline so later sessions and teammates understand it and it is safe to maintain. Reads the repo, interviews the user about purpose, people and constraints, audits security, maintenance and performance, then writes a standard README.md and short CLAUDE.md and proposes fixes. Use when starting a project, onboarding an existing repo, or when the user says "init project", "setup project", "baseline", "audit this project/repo", "re-baseline", "rapikan project", "luruskan project", "project sudah melenceng", "bikin project baru", "pahami project ini", "standarkan project". Not for building or fixing one feature or file (code-standard).
---
# Baseline project

Goal: any project, new or old, ends up with the same shape: a README a teammate can act
on, a CLAUDE.md an agent can act on, and a known list of SECURITY, MAINTENANCE and
PERFORMANCE gaps. Anything learned and not written down is lost.

> **Gate:** check and recommend first; change nothing until the user approves. Here: the
> audit report (§4) and the summary of what goes where (§5), each before writing.

| Reference                      | Load when                                                                    |
| ------------------------------ | ---------------------------------------------------------------------------- |
| `references/checklist.md`      | auditing (existing project), or before handing over a new one                |
| `references/power-pages.md`    | `.portalconfig/`, `web-templates/`, `web-pages/`, `pac pages`                |
| `references/dataverse.md`      | the project stores data in Dataverse (Power Pages, model-driven apps, flows) |
| `references/power-automate.md` | the project has or plans flows or classic workflows                          |

Each reference owns its topic and links to the others instead of repeating them.
No reference for the stack: use general knowledge and record only what is specific to
this project (commands, paths, versions, conventions). No tutorials.

**Other skills own these jobs**; name the skill in the report's proposed fix and run it
only when the user picks that fix: where facts go → `save-session`; README, CLAUDE.md,
ADRs, lessons → `write-docs`; commits → `commit-git`; missing tests → `write-tests`;
deps, secrets, config, access → `check-security`; upgrades and pins → `update-deps`.

## 1. Look before asking

MUST read before asking anything: `README.md`, `CLAUDE.md`, `docs/`, root `*.md`;
manifests (`package.json`, `pyproject.toml`, `requirements*.txt`, `Dockerfile`,
`compose*.yml`, `.portalconfig/`, `*.ps1`, `*.sh`, `Makefile`); `.gitignore`,
`.env.example`, CI config; `git log --oneline -30`, `git remote -v`, `git branch -a`.
NEVER ask what the repo already answers, except to resolve an inconsistency.

## 2. Pick the mode and size

|           | New project       | Existing project                           | Re-baseline (drifted)                                        |
| --------- | ----------------- | ------------------------------------------ | ------------------------------------------------------------ |
| Discovery | full (§3)         | only what the repo does not answer         | only what changed: goals, people, constraints still true?    |
| Audit     | light, at the end | full checklist **before** writing anything | full checklist + drift check                                 |
| Writing   | from templates    | merge into what exists; keep what is right | correct what is stale; remove duplicates; history to lessons/ADRs |

**Drift check** (any project that already has docs), reported with the checklist, same
severity scale:
- Every verifiable claim in README, CLAUDE.md and memory against the repo or the live
  system (remotes, URLs, IDs, commands, paths, versions). Run what can be run.
- One fact in two places with different values: report both, ask which is true, keep it
  in one place.
- Open questions answered meanwhile; decisions reversed without a note; "current as of"
  dates older than the last significant change.

**Size:** small (one script, config, one-off tool) → 2 questions (what it does, where it
runs), a few-line CLAUDE.md, README only if shared, checklist security section only.
An app, a site, several people → everything below. Unsure → ask.

## 3. Discovery: ASK, DON'T GUESS

At most 4 questions per batch (AskUserQuestion when options are clear):
1. **Purpose**: what problem, for whom. 2. **People**: requester, users, owners, who
decides. 3. **Hard constraints**, with the reason. 4. **Tried or rejected**, and why.
5. **Done**: what "working" looks like; next milestone. 6. **Environments**: dev/prod,
where it runs, how it deploys, where secrets live. 7. **Data**: what, how sensitive,
who may see it.

Unknown or unconfirmed → **Open questions**. NEVER fill a gap with an assumption that then
reads as fact.

## 4. Audit (existing projects; light pass for new ones)

Work through `references/checklist.md`:
- Evidence for every result; "unknown" is valid, a guess is not.
- **Report, don't fix**: ordered by severity, then fixes in small batches, high first.
  The user picks.
- A secret in the repo or its history: stop and tell the user at once. It MUST be
  rotated; deleting it does not help.
- NEVER install scanners or change remote settings (branch protection, tokens) without asking.

Keep the report as `docs/baseline-audit-YYYY-MM-DD.md` only if the user wants it;
otherwise its open items go to the README's Open questions.

## 5. Write

Formats and the writing gate are `write-docs`'s. Show a short summary of what goes where
first. This skill adds:
- **README.md**: every section discovery and audit filled; unconfirmed → Open questions.
- **ADRs**: one per significant decision found in discovery.
- **Other repo files**: only those `write-docs` → `references/readme.md` calls for at
  this size.
- **Lessons** (existing project): candidates from `fix:` commits, gotchas in CLAUDE.md or
  README, and what the user recalls. Write the ones the user confirms.
- **CLAUDE.md**: the `write-docs` template, only rules that apply to this project.

Facts and assumptions stay separate. NEVER a secret value in a file; name where it lives.
NEVER copy from other private repos: shared knowledge lives in this skill's `references/`.

## 6. Feeding lessons back

A checklist item that keeps failing across projects: sharpen it in
`references/checklist.md`. Whether a lesson belongs in `references/<stack>.md` or the
project's `docs/lessons.md`: `save-session` decides.
