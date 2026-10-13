#!/usr/bin/env python3
"""Append an activity entry with current CT time. Usage: python3 log_event.py "Opener" "long 7846.50 filled" """
import json, os, sys, datetime, zoneinfo
if len(sys.argv) < 3: sys.exit('usage: log_event.py "crew" "text"')
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "activity.json")
log = json.load(open(p)) if os.path.exists(p) else []
e = {"time": datetime.datetime.now(zoneinfo.ZoneInfo("America/Chicago")).strftime("%Y-%m-%d %H:%M"), "crew": sys.argv[1], "text": " ".join(sys.argv[2:])}
log.append(e); json.dump(log, open(p, "w"), indent=1); print("logged:", e, "- now run build.py")
