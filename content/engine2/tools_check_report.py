#!/usr/bin/env python3
"""Prints a short summary of `hyperframes check --json` and exits 1 on errors. Structure warnings
(sub-composition advice) are counted but not listed: they are about editing in Studio, not the render."""
import json, sys
d = json.load(open(sys.argv[1], encoding='utf8'))
QUIET = {'nested_structure_needs_subcomposition', 'timeline_track_too_dense'}
errors = warnings = quiet = 0
def walk(x):
    global errors, warnings, quiet
    if isinstance(x, dict):
        sev = x.get('severity') or x.get('level'); code = x.get('code') or x.get('rule') or x.get('id')
        if sev in ('error', 'warning') and code:
            if code in QUIET: quiet += 1
            else:
                if sev == 'error': errors += 1
                else: warnings += 1
                print(f"  {sev}: {code}: {str(x.get('message', ''))[:160]}")
        for v in x.values(): walk(v)
    elif isinstance(x, list):
        for v in x: walk(v)
walk(d)
print(f"check: {errors} error(s), {warnings} warning(s), {quiet} structure note(s)")
sys.exit(1 if errors else 0)
