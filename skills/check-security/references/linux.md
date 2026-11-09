# Linux hosts and shell scripts

Load when the project has shell scripts, or manages Linux hosts with LUKS,
systemd or dedicated mount points.

## Secrets shown on a terminal

- Clearing the screen does not clear the scrollback. In many terminals,
  clear-screen (`ESC[2J`) even pushes the visible screen *into* the scrollback,
  so sending clear-scrollback (`ESC[3J`) first does nothing useful.
- A script that must show a secret once (generated passphrase, recovery key)
  shows it on the **alternate screen**, like `less`/`vim`: content there never
  enters the scrollback and is gone when the screen is left.

  ```bash
  printf '\033[?1049h\033[H\033[2J' >/dev/tty      # enter alternate screen
  printf '%s\n' "$SECRET" >/dev/tty
  read -r -s -p "Last 4 characters to confirm: " answer </dev/tty
  printf '\033[H\033[2J\033[?1049l' >/dev/tty      # wipe and leave it
  ```
- Read confirmations with `read -s`: a user who pastes the secret at a prompt
  would otherwise print it again.
- Pass it to tools on stdin with the `printf` builtin (`printf '%s' "$S" | cryptsetup ... --key-file -`),
  never as an argument: arguments show up in `ps` and audit logs.
- Never write it to a file and "shred" it: `shred` cannot guarantee removal on
  SSDs, VMs, snapshots or journaling filesystems.
- Check: grep scripts for `echo`/`printf` of secret variables to stdout, `read`
  without `-s` for secrets, secrets in command arguments.

## Mount points of encrypted disks

- While an encrypted disk is locked, its mount point is a plain directory on the
  unencrypted system disk; anything written there is stored unencrypted. Make
  it immutable: `chattr +i <dir>`. Mounting on an immutable directory still works.
- Set `+i` **only while nothing is mounted**. On a mounted path `chattr` hits the
  root directory of the mounted filesystem and locks the encrypted disk itself.
- To create a subdirectory under an immutable mount point, lift `+i` on the
  parent briefly and set it again.
- Check: `lsattr -d <mount point>` after unmounting shows `i`.
