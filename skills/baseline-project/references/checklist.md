# Baseline checklist

Audit, then report. Each item: **pass / fail / n.a. / unknown**, with the
evidence (file, command output). Do not fix during the audit.

Severity for failures:

- **high**: exposes data or access now, or can lose data
- **medium**: will cause an incident or a lost day eventually
- **low**: friction, inconsistency

Hand off where a team skill owns the check: security → `check-security`;
dependency versions → `update-deps`; tests → `write-tests`; commits → `commit-git`.

## Security

Run the `check-security` skill (dependencies, secrets, config, access) and fold
its findings into this report with the same severity scale. Don't repeat its
checks here.

## Maintenance

- [ ]  README has the required sections (`write-docs` →
  `references/readme.md`) and its commands work.
- [ ]  Owner named. Someone is responsible.
- [ ]  One command each to set up, run, test, deploy. Documented.
- [ ]  Tests exist for the critical path; they run.
- [ ]  Lint/format configured (`.editorconfig` at least).
- [ ]  Runtime and tool versions pinned (`.nvmrc`, `.python-version`,
  `requires-python`, base image tag).
- [ ]  Dependency update routine exists (Renovate, a scheduled check, or a
  written cadence).
- [ ]  Significant decisions recorded (ADRs, or the README Purpose section
  with reasons).
- [ ]  No dead code, stale branches or abandoned config that misleads.
  Report, don't delete.
- [ ]  Deploy is repeatable from the repo (script, not memory).
- [ ]  Backup and restore path known for any data the project owns.

## Performance

Record what is **measured or documented by the platform**. Do not guess numbers.

- [ ]  Known platform limits and caches written down (rate limits, cache
  TTLs, payload sizes, timeouts).
- [ ]  Hot paths named: the page, query or job that most users hit.
- [ ]  Queries select only needed columns, are filtered server side, paged.
- [ ]  No N+1 patterns in loops over remote calls.
- [ ]  Static assets cacheable; large assets not shipped to every page.
- [ ]  Containers: resource limits set; image size reasonable for the base.
- [ ]  Any performance number in docs has a date and how it was measured.

## Report format

```markdown
# Baseline audit: <project>, YYYY-MM-DD

| # | Area | Item | Result | Severity | Evidence | Proposed fix |
|---|---|---|---|---|---|---|

Summary: N high, N medium, N low. Unknown: <list, with what is needed to check>.
```

Order the report by severity. Propose fixes in small batches, one concern per
commit, high first.
