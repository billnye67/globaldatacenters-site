#!/bin/sh
# Coordinator: merge one rewrite batch's files (place reports, record fixes, moratorium fixes, stories).
#   sh tools/merge-batch.sh q7
b="$1"; n="${b#q}"; d=data/projects-run
for f in $d/final/place-fix-rw$b.json $d/final/place-fix-rw$n.json $d/final/place-fix-rw-$b.json; do [ -f "$f" ] && echo "$b place: $(node tools/apply-place-fix.js $f | tail -1)"; done
for g in $d/fix-rw$b.json $d/final/fix-rw$b.json $d/fix-rw$n.json $d/final/fix-rw$n.json $d/fix-rw-$b.json $d/final/fix-rw-$b.json; do [ -f "$g" ] && echo "$b fix: $(node tools/apply-fixes.js $g | tail -1)"; done
for m in $d/final/mor-rw$b.json $d/final/mor-rw$n.json $d/final/mor-rw-$b.json; do [ -f "$m" ] && echo "$b mor: $(node tools/apply-mor.js $m)"; done
[ -f "$d/story-rw$b.json" ] && echo "$b story: $(python tools/merge-finished.py "rw$b!" 2>&1 | grep -E 'finished|published' | tr '\n' ' ')"
exit 0
