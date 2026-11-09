# Docker images

Load when the project has a `Dockerfile` or compose file.

## Inventory

- Every image that runs: `FROM` (all stages, but only the final stage ships), compose
  `image:`, and what runs now (`docker compose images`, `docker inspect --format
  '{{.Image}}' <c>`), since a floating tag may hold an older digest than the registry.
- App dependencies inside the image (pip, npm, go binaries, jars) count too; scanners
  find them in the image, not only in the repo's lockfile.

## Scan

Pin the scanner's own version; run it as a container if it isn't installed.

```bash
# registry tag: no Docker socket needed
docker run --rm aquasec/trivy:<version> image --ignore-unfixed \
  --severity HIGH,CRITICAL --format json nginx:1.31.6-alpine3.24
# locally built image: export it instead of mounting the socket
docker save myapp:dev -o /tmp/myapp.tar
docker run --rm -v /tmp/myapp.tar:/img.tar:ro aquasec/trivy:<version> image --input /img.tar
```

- Second opinion when a result is decisive: `grype <image> --only-fixed`. `docker scout
  compare` / `recommendations` if Scout is available.

## Severity for OS packages

Use the distro's rating, not NVD's: Debian
`security-tracker.debian.org/tracker/<CVE>`, Alpine `security.alpinelinux.org/vuln/<CVE>`,
Ubuntu `ubuntu.com/security/<CVE>`. Distros backport fixes, so their fixed version
differs from upstream's; upstream ranges make false positives on distro packages.

## Picking the target

- **Same tag, newer digest** often fixes distro CVEs: official images rebuild at least
  monthly and on critical issues. `docker pull` + `build --pull` before bumping versions;
  a `@sha256` pin freezes this out.
- **Unfixed CVEs** (distro says `<no-dsa>`, "will not fix"): options are another
  variant/base that has the fix, removing the package, or accepting it with a one-line
  reason. Don't switch distro just because its CVE count is lower; counts across
  distros aren't comparable.

## Image hygiene

- Non-root `USER`.
- No secrets in layers or build args (`docker history --no-trunc <image>` shows them).
- Multi-stage builds so build tools don't ship; no package-manager caches.
- Exposed ports and mounted sockets (`/var/run/docker.sock`) are deliberate.

## Data at rest

- If only part of the host disk is encrypted, sensitive data (repos, tokens, DB files,
  build output) must be written only to bind mounts on the encrypted part. Image layers
  and container write layers live in Docker's data dir, often on an unencrypted root.
- Enforce it, don't just document it: read-only rootfs + tmpfs for scratch, and a start-up
  check that refuses to run when the data dir isn't on dm-crypt (`/sys/dev/block/<maj:min>/dm/uuid`
  starts with `CRYPT-`, also via `slaves/`). Matching a device name is not a check.
- Swap on an unencrypted disk leaks tmpfs and process memory: no swap, or encrypted swap.

Pin and roll out with `update-deps`; its Docker specifics are in its own
`references/docker.md`.
