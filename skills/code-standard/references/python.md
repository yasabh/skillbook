# Python (backend)

Read with `SKILL.md` §2. MUST/NEVER = hard rule; SHOULD = default.

## Maintenance

- PEP 8 and the repo's formatter. Checks when the repo has them (or propose them):
  `ruff check` (families `ANN`, `UP`, `E722`, `S`, `SIM115`, `ERA001`, `F401`, `A002`)
  and `mypy`.
- MUST type every function (parameters and return, `-> None` too) in modern syntax:
  `X | None`, `list[str]`. `Any` only with a reason; `# type: ignore[code]  # reason`,
  NEVER bare.
- Constants at the top with a one-line comment, `Final`; `StrEnum` for a closed set of
  strings; `@dataclass(frozen=True)` for a fixed record. NEVER a magic number below.
- One module per concern. HTTP handlers only parse, call one function, send; the logic
  is testable without HTTP.
- **A file past ~500 lines doing several jobs → a package**, one module per job, kept
  apart from the service's Dockerfile, config and tests:
  `service/<pkg>/{__init__,config,…,main}.py`, run as `python -m <pkg>.main`. `config.py`
  reads env and files once; imports flow one way (config ← parts ← main), NEVER a cycle.
- Splitting: commit 1 moves code **verbatim** (`refactor:`), the tests MUST pass with
  only their imports changed, and a line check shows nothing was lost; clean-ups go in a
  later commit. Anything a test stubs is called through its module (`loki.push_loki()`,
  not `from .loki import push_loki`), or the stub misses it.
- **Pass outside effects in** (DB path, HTTP fetch, subprocess, clock) as parameters or
  one `@dataclass` of callables, so tests hand in a local version instead of patching.
- MUST use `with` for files, locks and connections. `sqlite3`'s own `with` commits but
  does NOT close: wrap it.
- Bad input: raise `ValueError` with a readable message, map it to 400 in one place.
  Real bugs: log once with `log.exception`.
- `logging` with a module logger, NEVER `print`. Imports absolute or same-directory;
  NEVER edit `sys.path` in production code.
- Stdlib first (`http.server`, `sqlite3`, `json`, `heapq`); a new dependency needs a
  reason and a pinned version.

```python
# ❌ the same open/try/finally/close copied in every reader
conn = sqlite3.connect(f"file:{path}?mode=ro", uri=True, timeout=10)
try:
    return conn.execute("SELECT ...").fetchall()
finally:
    conn.close()

# ✅ one context manager, one line per reader
with read_db(api) as conn:
    return conn.execute("SELECT ...").fetchall()
```

## Performance

- SQLite reads: read-only (`file:...?mode=ro`, `uri=True`), short-lived, with a
  `timeout`. Writers: `BEGIN IMMEDIATE`, short transactions.
- Let SQL do set work (temp tables, `JOIN`, `GROUP BY`); NEVER load a big table into a
  dict. Check the plan uses a key or index (`EXPLAIN QUERY PLAN`).
- Keyset paging: `WHERE key > ? ORDER BY key LIMIT n+1` (the extra row means "there is a
  next page"); merge sorted sources with `heapq.merge`.
- Cache slow upstream calls in-process with a TTL and a lock, shared by all requests.
- `ThreadingHTTPServer` for a small internal API; no async framework unless needed.
- SQLite `busy_timeout` MUST follow the connection's `timeout`; a fixed PRAGMA overrides
  it, and a writer then gives up while a long commit holds the lock.

## Redeploy without losing input

- A service fed a live stream (UDP syslog, webhooks) MUST NOT lose input while it
  redeploys: a tiny, rarely changed relay in front numbers each item and keeps it until
  the consumer acknowledges it (`<seq> <item>` out, `<seq>` back, TCP with
  `TCP_NODELAY`). The consumer acknowledges only after processing.
- Redeploy the consumer blue-green: start the new one, wait for its "ready" log, then
  stop the old one. The relay serves one consumer at a time, so the switch is milliseconds.
- On `SIGTERM` the consumer MUST flush what it holds in memory (pending alerts, batches)
  before exiting: input it already acknowledged is not sent again.
- Prove it: kill the consumer mid-stream and count; nothing missing, at most the one
  item in hand repeated.
- In-memory state a restart would lose (learned names, open incidents) SHOULD be saved to
  its own file on the data volume (not the busy database), written atomically (tmp +
  rename) on `SIGTERM` and every few minutes, and loaded at start.

## Security

- **SQL: placeholders only.** NEVER format a value into SQL. A table or column that must
  vary comes from a fixed dict in the code, NEVER from the request.
- `LIKE` from input: escape `\`, `%`, `_`, add `ESCAPE '\'`, a minimum length and a `LIMIT`.
- MUST validate every parameter (type, range, length, allowed values) and reject with
  400; NEVER "fix up" silently. Numbers: `str.isdecimal()` before `int()`.
- Bodies: MUST cap `Content-Length` before reading; `json.loads` in a `try`.
- Trust `X-Auth-User`-style headers only from the proxy's address, re-resolved
  periodically. Read the ACL per request so a removal applies at once.
- State changes: POST + `application/json` + matching `Origin`.
- Static files: a fixed allow-list of URL → file; NEVER a path from the request.
- HTML built in Python: `html.escape()` every value (a username is input too).
- Catch specific exceptions; NEVER bare `except:` or `except Exception: pass`.
- NEVER `eval`/`exec`, `pickle.loads` on outside data, `shell=True` with input,
  `verify=False`, or secrets in code or logs.

```python
# ❌ value formatted into SQL: injection
conn.execute(f"SELECT 1 FROM feed_rows WHERE value = '{value}'")
# ✅ bound; only fixed placeholders are formatted in
marks = ",".join("?" * len(feeds))
conn.execute(f"SELECT 1 FROM feed_rows WHERE value = ? AND feed IN ({marks})", (value, *feeds))
```

## Based on (copied, not linked; don't fetch these while using the skill)

PEP 8; Python docs (`sqlite3`, `http.server`: not for public exposure without a proxy);
OWASP cheat sheets (Query Parameterization, Logging); `python-code-standards` by
outcomeeng (MIT), read 2026-11-05, taken in part.
