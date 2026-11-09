---
name: write-docs
description: Write or update a repo's documentation the team's way - README.md, CLAUDE.md, ADRs in docs/adr/ and the lessons log in docs/lessons.md - with fixed section titles, verified commands, no secrets and one fact in one place. Use when the user asks to "write/update the README", "bikin readme", "rapikan readme", "update CLAUDE.md", "bikin CLAUDE.md", "rapikan dokumentasi", "tulis ADR", "catat lesson", or when save-session or baseline-project hands over a fact for one of these files.
---
# Write docs

Goal: a README a teammate can act on, a CLAUDE.md an agent can act on, and the
decisions and lessons behind them findable later. Every team repo has the same
shape, so readers and agents know where to look.

> **Gate:** check and recommend first; change nothing until the user approves. Here: the
> plan of what goes where (step 2), then the diff before committing.

| Reference | Load when |
|---|---|
| `references/readme.md` | writing or reviewing README.md, ADRs, `docs/lessons.md`, other repo files |

## Related skills

| Job | Skill |
|---|---|
| Deciding which place a fact belongs in (memory, CLAUDE.md, README, lessons, ADR) | `save-session` |
| Auditing a whole project and interviewing for purpose, people, constraints | `baseline-project` |
| Committing what this skill writes | `commit-git` |

## Which file

What each file holds and its size budget: `save-session` → "Where things live".
When unsure where a fact goes, that skill decides; this one writes it.

## README.md

Header, section set, order and principles: `references/readme.md`. In short:
reader first (what it is, try it, how it works, run it for real), same titles
in every repo, every command verified or marked `UNVERIFIED`, no broken links,
no secret values.

## CLAUDE.md

Short and scannable (~100 lines); a long one gets skimmed and its important
rules lost. A rule for one directory only goes in that directory's CLAUDE.md.

- Commands in code blocks, one fact per line.
- Only rules specific to this project or stack; general knowledge stays out.
- Facts about the repo, not about one person or one session.
- Detail lives in README, lessons or ADRs; CLAUDE.md points to it.
- Edit in place; never paste a session summary on top.

```markdown
# CLAUDE.md

<One line on what the repo is.> `README.md` is the real documentation; if they
disagree, README wins on domain facts, this file on tooling.

## Commands
<setup / run / test / deploy, with full paths for tools not on PATH>

## Rules
<only rules specific to this project or stack>

## Learned the hard way
<empty at first>
One line per lesson: the rule, then its entry, e.g.
"- Always send `$select`; without it the Web API returns 403. (L-002)"
Full story (symptom, cause, fix, numbers) goes in `docs/lessons.md`.

## Ask before
<actions that are hard to undo or affect other people>
```

## ADRs and lessons

Formats in `references/readme.md`. A lesson gets its full story in
`docs/lessons.md` and, if a fresh session would repeat the mistake, a one-line
rule in CLAUDE.md citing its ID.

## Steps

1. Read what exists: README, CLAUDE.md, `docs/`, the manifests and scripts the
   docs describe. Do not ask what the repo already answers.
2. Show the plan: per file, which sections are added, changed or removed, and
   any fact found in two places (keep one, the other becomes a pointer).
   Facts that are unknown or unconfirmed go to the README's Open questions,
   never written as fact.
3. Write with the Edit/Write tools (so the diff is visible); merge into
   existing files, never overwrite wholesale.
4. Verify: run every command you wrote or mark it `UNVERIFIED`; check relative
   links and anchors.
5. Show the diff; commit only when the user asks (`commit-git`).
