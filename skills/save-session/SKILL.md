---
name: save-session
description: Save what a session learned to the right place so later sessions and teammates can use it. Decides per fact where it goes (Claude's memory, CLAUDE.md, README, docs/lessons.md, ADR, skillbook reference), keeps one fact in one place, writes memory and communication preferences itself and hands repo files to write-docs. Use when the user says "simpan memori", "save memory", "remember this", "catat", "simpan pelajaran", "simpan session", or at the end of a long working session when asked to wrap up.
---
# Save session

This skill owns the routing (`baseline-project` and `write-docs` defer to it). It writes
memory and communication preferences itself; repo files go through `write-docs`.

> **Gate:** check and recommend first; change nothing until the user approves. Here:
> memory writes are free; show the lines for `~/.claude/CLAUDE.md` (step 4) first.

## Where things live

The more often a place loads, the shorter it MUST be: always-loaded places hold rules and
pointers, detail lives where it is opened on demand.

| Place | Loaded | Reader | Holds | Budget |
|---|---|---|---|---|
| `~/.claude/CLAUDE.md` | always, every project | this user | preferences true in every project | ~20 lines |
| `<repo>/CLAUDE.md` | always, in this repo | every teammate's Claude | commands, rules, never-do's, pointers | ~100 lines |
| `<repo>/<dir>/CLAUDE.md` | when working in that dir | every teammate's Claude | rules for that area only | short |
| Memory (`MEMORY.md` + files) | index always; files when relevant | Claude, this user only | in-progress state, pending decisions, corrections for this project, personal context | one index line each |
| `README.md` | on demand | people and Claude | domain, environments, how it works, open questions | standard sections |
| `docs/lessons.md` | searched, or via an ID from CLAUDE.md | people and Claude | incident stories: symptom, cause, fix, numbers | free |
| `docs/adr/NNNN-*.md` | via link | people and Claude | a decision with its alternatives | one per decision |
| skillbook `references/<stack>.md` | when a skill loads it | every project | lessons likely to recur on a stack | free |

Formats for CLAUDE.md, README, lessons and ADRs: `write-docs`.

## Deciding, in order

First ask of each fact: **"would a fresh session or teammate get this wrong or waste time
without it?"** No → drop it.

1. **A secret?** NEVER saved. Write where it lives (vault, uncommitted `.env`), never the value.
2. **Beyond this project?** A preference true for every project → `~/.claude/CLAUDE.md`.
   A technical lesson likely to recur on the same stack → propose for skillbook
   `references/<stack>.md`, made generic (no client names, hosts, IDs).
3. **Only for this user, point in time, or unfinished?** → memory.
4. **Needed on most tasks in this repo, and a fresh session gets it wrong without it?**
   → `CLAUDE.md`, one line, pointing to the detail.
5. **Only one directory?** → that directory's `CLAUDE.md`.
6. **Domain fact, environment, how the system works?** → README.
7. **The story of something that went wrong?** → `docs/lessons.md` entry, plus the
   one-line rule in CLAUDE.md citing its ID (`(L-004)`).
8. **A decision with alternatives, costly to reverse?** → ADR.

## Keep it lean

- **One fact, one place** within a repo; elsewhere link to it. A copy found: keep the
  right home, replace the other with a pointer, tell the user. (Across skillbook skills a
  short fact may repeat: skills load one at a time.)
- **Promote** when a fact stabilises: memory → CLAUDE.md once true for the team;
  CLAUDE.md → skillbook reference once likely to recur in other projects on the stack.
- **Prune**: delete memories proven wrong; finished work: move what stays true to the
  repo, then delete the entry; update an entry instead of adding a near-duplicate; no
  status logs in CLAUDE.md.
- **Prefer a guardrail to a sentence**: if a check, script step or test can prevent the
  repeat, propose it with the note.

**Save:** decisions and their reason (rejected options too); state of unfinished work
(deployed, pending, what to check next); gotchas found the hard way (a silent no-op
`sed`, a bind-mount quirk, a start-up race that looks like an error); user corrections
and preferences, with why; claims that turned out wrong.

**NEVER save:** what code, git log or README already says; conversation-only detail, raw
output, long explanations; secrets of any kind; guesses (mark unverified facts
**UNVERIFIED**).

## Communication preferences

Every run, learn how this user wants answers, from: style corrections ("too long",
"pakai bahasa biasa aja", "langsung aja"); the language and register they write in and
terms they had to ask about; formats they asked for or took well (tables, one-line
answers, recommendation first).

They go in the `## Communication` section of `~/.claude/CLAUDE.md` (loaded every
session), NOT a memory file (loaded only when judged relevant). A correction is a rule; a
single hint is not yet. Edit the existing line instead of adding a contradicting one.

## Memory

Format, frontmatter and the `MEMORY.md` index follow Claude Code's built-in memory
instructions. Team additions: absolute dates (`2026-10-05`, not "today"), commit hashes
for what is done; nothing already in `~/.claude/CLAUDE.md`, CLAUDE.md or README.

## Steps

1. List candidate facts, each tagged with its place (table above) or dropped. Include
   communication preferences.
2. Read the existing targets (memory index, CLAUDE.md, README, lessons); plan updates vs
   new entries; note duplicates.
3. Memory: write with the Edit/Write tools (visible diff), NEVER shell redirects.
4. Communication preferences: show the changed `~/.claude/CLAUDE.md` lines; write them
   once the user agrees.
5. Repo files: hand the tagged facts to `write-docs` (it plans and asks first). Skillbook
   rules: propose unasked, write only after the user confirms. A proposal names the
   target (skill + `SKILL.md` or `references/<x>.md`), the exact line(s) in MUST/NEVER/
   SHOULD wording, why it recurs, and the token cost per load. `SKILL.md` only for what
   every use needs, else a reference; one rule = one or two lines.
6. Report in a few lines: what was saved where, one-line gist each, what waits on
   `write-docs`. Don't repeat the content.
