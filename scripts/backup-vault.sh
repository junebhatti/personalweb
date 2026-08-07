#!/bin/bash
# Snapshots the Obsidian vault into a local git repo, so an accidental delete
# is recoverable. iCloud is a mirror, not a backup — when Brain Dump was
# removed on 2026-08-06 it vanished everywhere at once, and only the published
# notes survived because they happened to live in the site repo.
#
# The repo deliberately sits OUTSIDE iCloud: a .git directory inside a synced
# folder gets its internals rewritten mid-operation and corrupts.

set -uo pipefail

VAULT="${OBSIDIAN_VAULT:-/Users/junaid/Documents/Obsidian/Junaid/junaidb}"
BACKUP="${OBSIDIAN_BACKUP:-$HOME/Library/Application Support/obsidian-vault-backup}"
export PATH="/opt/homebrew/bin:/usr/bin:/bin"

[ -d "$VAULT" ] || { echo "vault not found: $VAULT"; exit 1; }

mkdir -p "$BACKUP"
if [ ! -d "$BACKUP/.git" ]; then
  git -C "$BACKUP" init -q -b main
  git -C "$BACKUP" config user.name "vault backup"
  git -C "$BACKUP" config user.email "noreply@localhost"
  echo "initialised backup repo at $BACKUP"
fi

# Mirror the vault. Excludes the things that churn without meaning anything:
# Obsidian's workspace state, macOS metadata, and its own trash.
rsync -a --delete \
  --exclude '.git/' \
  --exclude '.DS_Store' \
  --exclude '.trash/' \
  --exclude '.obsidian/workspace.json' \
  --exclude '.obsidian/workspaces.json' \
  --exclude '.obsidian/cache' \
  "$VAULT/" "$BACKUP/"

cd "$BACKUP" || exit 1
git add -A
if ! git diff --cached --quiet; then
  summary=$(git diff --cached --name-status | awk '{print $1}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')
  git commit -q -m "Vault snapshot: $summary"
  echo "vault snapshot: $summary"
fi

# Snapshots are local and frequent; the push to GitHub is throttled to every
# few days so ordinary note-writing doesn't spend a network round trip. The
# private remote is what survives the machine.
PUSH_EVERY_DAYS=3
STAMP="$BACKUP/.git/last-push"

git remote get-url origin >/dev/null 2>&1 || exit 0

if [ -f "$STAMP" ]; then
  age=$(( ($(date +%s) - $(stat -f %m "$STAMP")) / 86400 ))
else
  age=999
fi

# Nothing to send if the remote already has this commit.
if git diff --quiet HEAD origin/main 2>/dev/null && [ "$age" -lt "$PUSH_EVERY_DAYS" ]; then
  exit 0
fi

if [ "$age" -ge "$PUSH_EVERY_DAYS" ]; then
  if git push -q origin main 2>/dev/null; then
    touch "$STAMP"
    echo "vault pushed to GitHub (last push was ${age}d ago)"
  else
    echo "vault push failed — snapshots are still committed locally"
  fi
fi
