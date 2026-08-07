#!/bin/bash
# Syncs notes out of the Obsidian vault and publishes them, if anything changed.
#
# Meant to be run unattended by the launchd agent in this folder, so it is
# deliberately conservative: it only ever stages src/content/notes, never the
# rest of the working tree, and it never rebases or resolves anything. If the
# push fails it says so and stops, leaving the repo for you to sort out.

set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export PATH="/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"

cd "$REPO" || exit 1

echo "--- $(date '+%Y-%m-%d %H:%M:%S') ---"

# launchd fires WatchPaths the moment a file is touched, which can land while
# Obsidian is still writing. A beat avoids syncing a half-written note.
sleep 3

# Snapshot the whole vault first, so a run that finds the source folder
# missing has already preserved whatever state the vault is in.
"$REPO/scripts/backup-vault.sh" || echo "vault backup failed (continuing)"

if ! npm run notes --silent; then
  echo "sync failed"
  exit 1
fi

# Stage before testing for changes: a brand new note is untracked, and
# `git diff` does not see untracked files, so checking first would miss it.
git add -- src/content/notes
if git diff --cached --quiet -- src/content/notes; then
  echo "no note changes"
  exit 0
fi

summary=$(git diff --cached --name-status -- src/content/notes | awk '{print $1}' | sort | uniq -c | tr '\n' ' ')
echo "staging: $summary"

if ! git commit -q -m "Sync notes from the vault"; then
  echo "commit failed"
  exit 1
fi

if git push -q origin main; then
  echo "pushed — Vercel will redeploy"
else
  echo "push failed (committed locally; push by hand once resolved)"
  exit 1
fi
