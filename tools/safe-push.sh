#!/usr/bin/env bash
# Push your lane's files to preview without touching HEAD, the shared index, or anyone else's work.
#
#   bash tools/safe-push.sh "commit message" data/place-reports-x.json [more files...]
#
# Why this exists. On 23 September 2026 an unguarded hand-rolled version of this loop DELETED the
# preview branch on GitHub. A lane's script built its commit id into $C, the commit step failed,
# $C was left empty, and `git push origin $C:refs/heads/preview` expanded to
# `git push origin :refs/heads/preview`, which is how git spells "delete that branch". It reported
# success. Two separate lanes had written the same unguarded pattern independently.
#
# A second incident the same night: resolving origin/preview TWICE, once for read-tree and once for
# commit-tree -p, let another session's fetch move the ref between the two reads. The tree came
# from the old tip, the parent was the new one, and the commit silently reverted everything in
# between. It cost a 980-word page, and then a second one before the cause was understood.
#
# So: the tip is resolved once, every step is checked, and nothing is pushed unless the commit id
# is a real 40-character sha.
set -euo pipefail

BRANCH=preview
[ $# -ge 2 ] || { echo "usage: bash tools/safe-push.sh \"message\" <file> [file...]" >&2; exit 2; }
MSG=$1; shift

for f in "$@"; do
  [ -f "$f" ] || { echo "safe-push: no such file: $f" >&2; exit 1; }
done

git fetch -q origin "$BRANCH" || { echo "safe-push: fetch failed. NOT pushing." >&2; exit 1; }

# Resolved ONCE and used for the tree, the diff and the parent.
TIP=$(git rev-parse --verify "origin/$BRANCH^{commit}" 2>/dev/null) || {
  echo "safe-push: origin/$BRANCH does not exist. NOT pushing, and NOT creating it." >&2; exit 1; }
[ ${#TIP} -eq 40 ] || { echo "safe-push: bad tip '$TIP'. NOT pushing." >&2; exit 1; }

# Remember what each named file looks like on the tip we are building against, so a retry can
# tell whether somebody else changed it while we were working. Reviewers now edit each other's
# lane files, so "the file moved on origin" means "someone else's edit is in there".
BASELINE=$(for f in "$@"; do printf '%s:%s\n' "$f" "$(git rev-parse "$TIP:$f" 2>/dev/null || echo none)"; done)

IDX=$(mktemp); trap 'rm -f "$IDX"' EXIT
GIT_INDEX_FILE="$IDX" git read-tree "$TIP"
GIT_INDEX_FILE="$IDX" git add -- "$@"

echo "--- changes against ${TIP:0:8} (must be your files only) ---"
GIT_INDEX_FILE="$IDX" git diff --cached --stat "$TIP"

# Refuse to touch a path the caller did not name. This is what would have caught both reverts.
STRAY=$(GIT_INDEX_FILE="$IDX" git diff --cached --name-only "$TIP" | grep -vxF -f <(printf '%s\n' "$@") || true)
[ -z "$STRAY" ] && echo "(no stray paths)" || {
  echo "safe-push: REFUSING. These paths change but were not named:" >&2
  echo "$STRAY" >&2
  echo "You are probably building on a stale tip. Re-run; do not force." >&2; exit 1; }

# Staging comes from the WORKING TREE, which is shared and is often behind origin. Pushing a
# shared file from a stale copy silently deletes whatever other lanes added to it in the meantime.
# Lane n spotted this on data/claims.md before it cost anyone their claims.
#
# The check has to tell a stale-copy WIPE apart from an honest REWRITE, or it fires on every
# rewrite and people learn to override it, which is worse than not having it.
#   - a lane report file is JSON keyed by page url, so the question is whether any url on origin
#     has gone missing. Rewriting the prose under a url is fine; losing the url is not.
#   - for anything else, fall back to counting deleted lines.
for f in "$@"; do
  case "$f" in
    *.json)
      MISSING=$(git show "$TIP:$f" 2>/dev/null | python -c "
import json,sys,io
try: old=json.load(sys.stdin)
except Exception: sys.exit(0)
try: new=json.load(io.open('$f',encoding='utf-8'))
except Exception: sys.exit(0)
gone=[k for k in old if k not in new]
print(chr(10).join(gone))
" || true)
      if [ -n "$MISSING" ] && [ "${ALLOW_DELETIONS:-0}" != "1" ]; then
        echo "safe-push: REFUSING. $f would drop entries that exist on origin:" >&2
        echo "$MISSING" | sed 's/^/    /' >&2
        echo "Your copy is behind. Refresh and re-apply:  git checkout $TIP -- $f" >&2
        echo "If you meant to remove them, re-run with ALLOW_DELETIONS=1." >&2
        exit 1
      fi
      ;;
    */progress-lane-*.md|progress-lane-*.md)
      # A lane's own progress file has exactly one writer, so rewriting a running total in it
      # cannot destroy anyone else's work. Lane l hit this: the guard refused an edit to its own
      # notes and its session could not set ALLOW_DELETIONS, so it had to append instead of
      # correcting a line. A guard that blocks safe edits teaches people to work around it.
      ;;
    *)
      DEL=$(GIT_INDEX_FILE="$IDX" git diff --cached "$TIP" -- "$f" | grep -c '^-[^-]' || true)
      if [ "${DEL:-0}" -gt 0 ] && [ "${ALLOW_DELETIONS:-0}" != "1" ]; then
        echo "safe-push: REFUSING. $f would delete $DEL line(s) that exist on origin." >&2
        echo "Your copy is probably behind. Refresh and re-apply:  git checkout $TIP -- $f" >&2
        echo "If the deletions are genuinely yours, re-run with ALLOW_DELETIONS=1." >&2
        exit 1
      fi
      ;;
  esac
done

if GIT_INDEX_FILE="$IDX" git diff --cached --quiet "$TIP"; then
  echo "safe-push: nothing to commit."; exit 0
fi

# Is any page in this push already written in another lane's file on origin? Six duplicates exist
# as of tonight, three of them collisions between lanes working at the same time. The build
# resolves them by depth so the site stays clean, but the losing lane spent searches on a page
# nobody will ever see. Warn at push time so it stops working that part of the queue now.
for f in "$@"; do
  case "$f" in
    *place-reports*.json)
      python - "$f" "$TIP" <<'PYDUP' || true
import io, json, re, subprocess, sys, os
mine_path, tip = sys.argv[1], sys.argv[2]
try:
    mine = json.load(io.open(mine_path, encoding='utf-8'))
except Exception:
    sys.exit(0)
mine_urls = {u for u, r in mine.items() if (r.get('paragraphs') or [])}
listing = subprocess.run(['git', 'ls-tree', '--name-only', tip, 'data/'],
                         capture_output=True, text=True).stdout.split()
clash = {}
for other in listing:
    if not re.match(r'data/place-reports(?:-[a-z])?\.json$', other):
        continue
    if os.path.basename(other) == os.path.basename(mine_path):
        continue
    raw = subprocess.run(['git', 'show', tip + ':' + other], capture_output=True).stdout
    try:
        d = json.loads(raw.decode('utf-8'))
    except Exception:
        continue
    for u, r in d.items():
        if u in mine_urls and (r.get('paragraphs') or []):
            clash.setdefault(u, []).append(os.path.basename(other))
if clash:
    print('safe-push: WARNING, these pages are already written in another lane file on origin:')
    for u, where in sorted(clash.items()):
        print('    %s  also in %s' % (u, ', '.join(where)))
    print('    The build publishes whichever version has more sources, then more words, so the')
    print('    site stays clean. But one of you spent searches for nothing. Stop working this')
    print('    part of the queue and tell the coordinator.')
PYDUP
      ;;
  esac
done

TREE=$(GIT_INDEX_FILE="$IDX" git write-tree)
[ ${#TREE} -eq 40 ] || { echo "safe-push: bad tree. NOT pushing." >&2; exit 1; }

COMMIT=$(git commit-tree "$TREE" -p "$TIP" -m "$MSG")
[ ${#COMMIT} -eq 40 ] || { echo "safe-push: bad commit id '$COMMIT'. NOT pushing." >&2; exit 1; }

# An empty left-hand side here is a branch delete, so the length check above is the safety rail.
# Origin moves constantly with a dozen lanes pushing, so a rejection here is routine and is NOT
# a reason to force. Rebuild the commit against the new tip and try again; every guard above runs
# afresh each time, so a retry can never be looser than the first attempt.
if git push -q origin "$COMMIT:refs/heads/$BRANCH" 2>/dev/null; then
  echo "pushed ${COMMIT:0:8} to $BRANCH"
else
  echo "push rejected, origin moved." >&2
  git fetch -q origin "$BRANCH" 2>/dev/null
  NEWTIP=$(git rev-parse --verify "origin/$BRANCH^{commit}" 2>/dev/null || echo "")
  CHANGED=""
  for f in "$@"; do
    was=$(printf '%s' "$BASELINE" | grep "^$f:" | head -1 | cut -d: -f2-)
    now=$(git rev-parse "$NEWTIP:$f" 2>/dev/null || echo none)
    [ "$was" != "$now" ] && CHANGED="$CHANGED $f"
  done
  if [ -n "$CHANGED" ]; then
    echo "safe-push: REFUSING TO RETRY. These files changed on origin while you worked:" >&2
    for f in $CHANGED; do echo "    $f" >&2; done
    echo "Retrying would re-stage your working-tree copy over somebody else's edit. Since" >&2
    echo "reviewers now edit each other's lane files, that copy is stale by definition." >&2
    echo "Re-read the file from origin/$BRANCH, re-apply your change, and run this again." >&2
    exit 1
  fi
  echo "(none of your files changed on origin; rebuilding against the new tip)" >&2
  exec bash "$0" "$MSG" "$@"
fi
