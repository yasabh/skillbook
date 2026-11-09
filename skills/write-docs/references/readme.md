# Writing the README

Sources: standard-readme (no broken links), makeareadme.com (section set),
GitHub community health files, GitHub awesome-copilot `create-readme` and the
READMEs it cites (header, show it working first, admonitions), Diátaxis (keep
doc types apart), Nygard ADRs (decisions in their own records).

## Principles

- **Reader first: what is it, can I try it, how does it work, how do I run it
  for real.** Sections follow that order. Who asked for it and what is still
  open come after the reader can see the thing.
- **Entry point, not encyclopedia.** Long reference material, how-to guides
  and design explanations go in `docs/` and are linked. (Diátaxis: mixing
  tutorial, how-to, reference and explanation in one page makes all four
  worse.)
- **Same titles in every repo.** Readers and agents find things faster when
  every team repo looks the same. Use the titles below, unnumbered (other docs
  link to them by title). Omit a section that does not apply; add a new
  top-level one only with a reason.
- **Concise.** Short sentences, address the reader as "you", lists over
  paragraphs, tables for anything with columns. Emojis sparingly, if at all.
- **Every command copy-pasteable and verified.** Run it, or mark it
  `UNVERIFIED`. A README command that fails is worse than none.
- **GitHub Flavored Markdown.** Code blocks with a language. Admonitions for
  what a reader must not miss, one or two per section at most:
  `> [!NOTE]` context, `> [!TIP]` a shortcut, `> [!IMPORTANT]` required to
  succeed, `> [!WARNING]` risk of breaking something, `> [!CAUTION]` risk of
  losing data or access. Forgejo renders them as plain quotes; still readable.
- **No broken links.** Check relative links and anchors after writing.
- **Facts only, dated where they drift.** "Current as of 2026-10-09" on
  sections about environments or status. Plans are marked as plans.
- **No secrets.** Name where a secret lives (vault, Key Vault, `.env` not
  committed), never its value.
- **No LICENSE, CONTRIBUTING or CHANGELOG sections.** They are their own files
  (table below); link them from the header if they exist.

## Section set, in order

Required for every shared project: the header, Purpose, Getting started,
Configuration, Deployment and operations, Open questions. The rest when they
apply. A small project may fold Quick start into Getting started.

```markdown
<div align="center">

<img src="docs/images/logo.png" alt="" height="64" />   <!-- only if the repo has one -->

# <Project name>

<Tagline: one line, what it does.>

<Badges, only ones that carry information: CI status, runtime version.>

[Quick start](#quick-start) • [Getting started](#getting-started) • [Deployment](#deployment-and-operations) • [Troubleshooting](#troubleshooting)

</div>

<One or two sentences: what it is, who it is for, where it runs.>
<Status line: active / maintenance / deprecated. Current as of YYYY-MM-DD.>

<Screenshot or short GIF of it working, if it has a UI: docs/images/.>

## Quick start
The shortest path to seeing it work: three or so copy-pasteable steps and
what you should see. Full setup is in Getting started.

## Purpose
Problem, people (requester, users, owners), hard constraints with reasons.
Rejected options: one line each with a link to its ADR.

## Features
What it does, as a list: `- **Label**: one sentence.` Five to eight items;
no marketing words. Omit for a single-purpose script.

## Getting started
Prerequisites with versions. Setup and run steps, copy-pasteable.
Tools not on PATH with full paths. More than one way in (local,
devcontainer, remote)? One subsection each, fastest first.

## Configuration
Every setting/env var: name, purpose, default, where the value lives.
Point to `.env.example` if there is one. Never values of secrets.

## Architecture
Components and data flow, short. Diagram if it helps (image in
`docs/images/` or Mermaid). Each component names its folder: "The API
(`src/api/`) …". Link deeper docs.

## Deployment and operations
Environments table (name, URL, IDs). How to deploy, how to roll back,
how to restart, where logs are. Health check.

## Security
Who can access what and how it is enforced. Where secrets live. Data
sensitivity. Debug flags that must be off in prod. How to report an issue
(or link SECURITY.md).

## Troubleshooting
Known problems a user or operator hits: **symptom** (the error message
verbatim) → fix, one or two lines each. The full story stays in
`docs/lessons.md`; link the entry ID.

## Maintenance
Owners. How dependencies are updated and pinned. How to run tests and lint.
Known tech debt. Decisions: link `docs/adr/`.

## Performance
Only what is known or measured: limits, caches, budgets, hot paths. No
guesses. Omit the section if nothing is known yet.

## Open questions
Unconfirmed assumptions and decisions waiting on someone. Name who.
```

Not for internal repos: "star this repo" lines, social or community badges,
Contributing and Trademarks sections.

## Decisions: ADRs, not README prose

A decision that would be expensive or confusing to reverse without knowing why
it was made (stack choice, rejected option, data model) gets one file:
`docs/adr/NNNN-short-title.md`.

```markdown
# NNNN. <Title>

Status: proposed | accepted | superseded by NNNN
Date: YYYY-MM-DD

## Context
<What forced the decision.>

## Decision
<What we do.>

## Consequences
<What becomes easier, what becomes harder.>
```

The README Purpose section keeps one line per rejected option with a link to
its ADR. Not every choice needs one; implementation details do not.

## Other repo files

| File | When | Note |
|---|---|---|
| `CLAUDE.md` | always | tooling for the agent; template in SKILL.md |
| `.gitignore` | always | must cover `.env`, local settings, build output |
| `.env.example` | app has env config | names and safe defaults only |
| `SECURITY.md` | service reachable by others | internal: who to contact, how fast |
| `CODEOWNERS` | more than one maintainer | Forgejo supports it; check version |
| `LICENSE` | code leaves the team | internal: state "proprietary, internal use" |
| `CHANGELOG.md` | something is released or versioned | Keep a Changelog format |
| `docs/adr/` | first significant decision | see above |
| `docs/runbook.md` | ops steps outgrow README Deployment and operations | incident and restore steps |
| `docs/lessons.md` | first lesson worth keeping | see below |

## Lessons log: `docs/lessons.md`

The full record of what went wrong and how it was fixed, so the next person
who hits the same error finds the answer by searching. CLAUDE.md keeps only the
one-line rule and points here. (Same idea as a blameless postmortem, cut down to
what a repo needs.)

Worth an entry: a bug or error that took more than ~30 minutes, anything that
locked people out or lost data, a performance problem, a platform behaviour
that contradicted the docs or our assumption. Not worth one: typos, one-off
mistakes with an obvious cause.

Newest first. IDs never reused.

```markdown
# Lessons

## L-003 · 2026-10-09 · performance · <short title>

**Symptom:** what was seen. Paste the error message **verbatim**, so a search
for it lands here.
**Cause:** the real cause, confirmed. If not confirmed, say so.
**Fix:** what changed, with the commit hash.
**Numbers:** before → after, and how measured. Performance entries only.
**Prevention:** the rule, check or test that stops a repeat. Prefer a guardrail
(a check in the deploy script, a test) over a sentence.
**Rule in CLAUDE.md:** yes / no
```

Areas: `security`, `performance`, `maintenance`, `bug`, `platform`.

Blameless: describe what happened and why the system allowed it, not who did
it.
