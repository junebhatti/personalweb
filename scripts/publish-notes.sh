#!/bin/bash
# Syncs notes out of the Obsidian vault and publishes them, if anything changed.
#
# Meant to be run unattended by the launchd agent in this folder, so it is
# deliberately conservative: it only ever stages src/content/notes, never the
# rest of the working tree. When GitHub has newer commits (the Morning Brief
# pushes every morning), it rebases its own note syncs on top, but only when
# every unpushed commit touches nothing outside src/content/notes. Anything
# else, or a rebase conflict, it leaves alone, logs, and raises a Mac
# notification so a stuck sync never goes unnoticed.

set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VAULT="${OBSIDIAN_NOTES_DIR:-/Users/junaid/Obsidian/junaidb/Writing/Brain Dump}"
export PATH="/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"

cd "$REPO" || exit 1

notify() {
  osascript -e "display notification \"$1\" with title \"Notes sync\"" >/dev/null 2>&1 \
    || echo "couldn't show notification: $1"
}

# Push main. If GitHub rejects it because it has newer commits, put our note
# syncs on top of them and push again, but only when the unpushed commits are
# notes-only, so this can never rewrite hand-made work.
push_main() {
  git push -q origin main && return 0
  echo "push rejected — fetching to see what's new on GitHub"
  if ! git fetch -q origin main; then
    echo "fetch failed"
    return 1
  fi
  if [ -n "$(git diff --name-only origin/main...main -- . ':(exclude)src/content/notes')" ]; then
    echo "unpushed commits touch more than src/content/notes; not rebasing"
    return 1
  fi
  # --autostash sets aside uncommitted edits elsewhere in the repo (work in
  # progress) and puts them back afterwards; without it the rebase refuses.
  if ! git rebase -q --autostash origin/main; then
    [ -d .git/rebase-merge ] || [ -d .git/rebase-apply ] && git rebase --abort
    echo "rebase onto origin/main failed; aborted, repo left as it was"
    return 1
  fi
  echo "rebased note syncs onto GitHub's newer commits"
  git push -q origin main
}

echo "--- $(date '+%Y-%m-%d %H:%M:%S') ---"

# launchd fires WatchPaths the moment a file is touched, which can land while
# Obsidian is still writing. A beat avoids syncing a half-written note.
sleep 3

# macOS reclaims the contents of files it can fetch again, leaving the name in
# place and the bytes gone — the flag is "dataless". Reading one normally faults
# it back in, but a background process that touches a dataless file can get
# EDEADLK instead ("Resource deadlock avoided"), because materialising it wants
# the user session. That is exactly how this agent has failed: notes reported
# unreadable, then `git commit` dying inside mmap on its own object store.
#
# So read what this run depends on, up front, before anything is half-done. It
# is best-effort: a file that refuses to come back is left to the steps below,
# which already know to skip a note and keep its published copy.
warm() {
  find "$@" -type f -print0 2>/dev/null | xargs -0 cat >/dev/null 2>&1
  return 0
}

warm "$REPO/.git" "$VAULT"

# Snapshot the whole vault first, so a run that finds the source folder
# missing has already preserved whatever state the vault is in.
"$REPO/scripts/backup-vault.sh" || echo "vault backup failed (continuing)"

# Bring down anything written on the phone before syncing, so a note drafted
# away from the Mac joins this run rather than waiting for the next one.
#
# Invoked through npm rather than as `node scripts/...`. Under launchd the
# direct call fails with EPERM reading its own entry script, while the npm
# route — the same node, the same folder — is allowed. Both work by hand, so
# this is macOS deciding what the agent may open, not anything in the script.
[ -f "$REPO/.env" ] && set -a && . "$REPO/.env" && set +a
npm run drafts --silent || echo "phone draft pull failed (continuing)"

if ! npm run notes --silent; then
  echo "sync failed"
  notify "Couldn't read your Obsidian notes. See ~/Library/Logs/personal-site-notes.log"
  exit 1
fi

# Stage before testing for changes: a brand new note is untracked, and
# `git diff` does not see untracked files, so checking first would miss it.
git add -- src/content/notes
if git diff --cached --quiet -- src/content/notes; then
  # Nothing new to commit — but an earlier run may have committed and then
  # failed to push (network down, credentials unavailable, iCloud-evicted
  # git files). Sweep any stranded commit out before calling it a day.
  if [ -n "$(git log origin/main..main --oneline 2>/dev/null)" ]; then
    if push_main; then
      echo "pushed a stranded earlier commit — Vercel will redeploy"
    else
      echo "push failed (stranded commit remains; push by hand once resolved)"
      notify "Notes are stuck on this Mac and didn't reach the site. See ~/Library/Logs/personal-site-notes.log"
      exit 1
    fi
  else
    echo "no note changes"
  fi
  exit 0
fi

summary=$(git diff --cached --name-status -- src/content/notes | awk '{print $1}' | sort | uniq -c | tr '\n' ' ')
echo "staging: $summary"

if ! git commit -q -m "Sync notes from the vault"; then
  # Almost always an object that went dataless again between the warm above and
  # here. Fault the store back in and give it one more go before giving up —
  # the alternative is a staged note sitting uncommitted until someone notices.
  echo "commit failed — warming the object store and retrying"
  warm "$REPO/.git"
  if ! git commit -q -m "Sync notes from the vault"; then
    echo "commit failed twice"
    notify "Couldn't commit your notes. See ~/Library/Logs/personal-site-notes.log"
    exit 1
  fi
fi

if push_main; then
  echo "pushed — Vercel will redeploy"
else
  echo "push failed (committed locally; push by hand once resolved)"
  notify "Notes are stuck on this Mac and didn't reach the site. See ~/Library/Logs/personal-site-notes.log"
  exit 1
fi
