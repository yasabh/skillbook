---
name: write-tests
description: Write or extend automated tests the team's way, with tests named as sentences, fakes that act like the real system, no real network or secrets, and the silent failures covered, and weigh performance, maintenance and security while doing it. Use when the user asks to "write/add tests", "bikin test", "tambah test", "test this fix", or when a fix or feature needs a test to prove it.
---
# Write tests

Goal: a test suite that reads like a spec, runs fast without any external system, and
fails when behaviour that matters breaks. Most importantly, it catches the failures
that otherwise make no noise.

## 1. Read before writing

- Read the existing `conftest.py`/helpers, two or three test files and the runner
  (`tests/run.sh`, `pytest.ini`, `package.json`). Match their layout, naming and fixtures.
  Don't bring in a second style.
- Find how the suite avoids external systems (env pointing at nowhere, a disabled
  poller, monkeypatched clients), and reuse that.
- Run the suite once **before** changing anything. A failure that is already there
  isn't yours. Confirm with `git stash` → run → `git stash pop`, and report it apart from
  your own results.

## 2. What to test

Test from the outside in. Pure functions get called directly (`build(rows, leases, ...)`),
and boundaries go through the public entry point (`client.post("/login", ...)`).

Choose cases in this order:
1. **The bug or behaviour you're changing.** For a fix, write the test first and watch
   it fail.
2. **Silent failures**, where the result looks like success but is wrong: an empty
   answer that refreshes a "last good" timestamp, a script that swallows its own errors,
   a `sed` that matches nothing. These are what tests are for, because nothing else
   reports them.
3. **Refusals and edges**: the stranger, the expired, the blank field, the outage, the
   case-and-whitespace variant, the value that changed hands.
4. The happy path. It usually gets exercised anyway.

## 3. How a test reads

- **Name = the behaviour, as a sentence**: `test_a_locked_account_does_not_lock_the_next_person`,
  `test_unreachable_radius_is_503_not_a_bad_password`. Not `test_throttle_2`.
- A docstring or comment only when the **why** isn't obvious, written as the failure it
  prevents: `"""Or a botnet just spreads the same guesses across many addresses."""`
- One behaviour per test. Several asserts are fine if they describe that one behaviour.
- Group with `# --- section ---` comments in a file named after the module.
- Small builders for test data (`session_row(mac, user)`), and constants imported from
  config (`LOGIN_MAX`), never copied in as magic numbers.
- `conftest.py` holds fixtures and `helpers.py` holds plain actions (`sign_in(client)`),
  so a reader looking for a function finds one.
- A fixture's name says the outcome it pins (`accept`, `reject`, `unreachable`), so
  the test signature tells the scenario.

## 4. Fakes

- Fake at the **outermost boundary** (router API, RADIUS, HTTP fetch), not inside your
  own code.
- **A fake must act like the real system in every way the code depends on.** If the
  code starts asking the real system to filter (`get(active="true")`), the fake has to
  filter too. Otherwise the test passes for the wrong reason, or breaks for no reason.
  Update the fake in the same commit as the code.
- Prefer a real engine over a mock where it's cheap: Flask's `test_client`, JSDOM for
  injected scripts, SQLite in memory.
- Reset module state with an `autouse` fixture, so the order tests run in never matters.

## 5. Performance

- **No real time and no real network.** Use a fixed clock (`NOW = 1000.0`), and pass
  `now` into the function instead of calling `sleep`. Unit tests should finish in
  seconds.
- **A performance fix needs its own test.** It often keeps the output the same (that's
  the point), so a test that only checks the output passes even if the fix is reverted.
  Check the cheap path is taken instead: the filter sent to the API, the number of
  queries or calls, the rows fetched. The fake can record calls for this.
- Bound the size of work in the code under test (pagination, `LIMIT`, timeouts), and
  test that the bound holds, at the edge of the limit.
- No benchmarks in the unit suite. If one is needed, give it its own marker or script.

## 6. Maintenance

- Test the behaviour, not the implementation: refactoring shouldn't break tests unless
  behaviour changed.
- Deterministic: no wall clock, no randomness without a seed, no dependence on test
  order or on the machine's timezone (set `TZ` in conftest).
- Leave nothing behind in the repo. Redirect caches (`cache_dir` in `pytest.ini`, and
  `PYTHONPYCACHEPREFIX` exported by `run.sh` before Python starts). Tools the project
  doesn't otherwise use run in a throwaway container (use `docker cp` rather than a bind
  mount, because the docker context may be a remote host).
- Pin test dependencies (`requirements-dev.txt`: `pytest==8.4.2`), the same as runtime
  ones.
- Delete or rewrite a test together with the behaviour it covers. A skipped test is a
  todo, so leave the reason in it.

## 7. Security

- **No real secrets, hosts or personal data in tests.** Use documentation ranges for
  addresses (`192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`) and `example.com`, and
  obviously fake credentials (`"test"`, `"x"`).
- **The real auth backend is never reached.** Set env to unroutable values in conftest
  before importing the app, and pin backend answers with fixtures.
- Every guard gets a test that it refuses: missing or wrong CSRF token, untrusted
  forwarding header ignored, lockout per account **and** per address, expired/unknown
  cookie, no caching of identity responses, cookie flags (`__Host-`, `Secure`,
  `HttpOnly`, `SameSite`).
- Test that rejected input **never reaches** the expensive or dangerous call (e.g. a
  blank password or a bad CSRF token never calls RADIUS), not only that the status code
  is right.
- Keep outage and denial distinct (`503` vs `401`, outage not counted toward the
  lockout). Users and attackers must not be able to confuse one with the other.
- Hostile input where the code parses: odd separators and case, overlong values,
  open-redirect `next=` targets, injection strings.

## 8. Report

Run the whole suite, not just the new file. Report in a few lines: tests added (by
name), pass/fail counts, and any failure that was already there, with proof that it
was (the stash run). Commit only when asked, with the `commit` skill. The test goes
in the same commit as the code it covers.
