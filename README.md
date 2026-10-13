# Vantage HQ - Trading Desk Crew
Static dashboard for an MES paper-trading (SIM) journal. Real data only; unknowns show "—".
Live: https://hq-vantage.github.io/vantage-hq/

## Daily update
```bash
cd /workspace/vantage-hq
python3 log_event.py "Opener" "long 7846.50 filled"   # any time, appends CT-stamped entry to activity.json
# edit checklist.json (date + done/time) as the routine progresses
python3 shadow_eval.py 2026-10-13                     # after 11:30 CT: paper-track Trend Rider + Closer -> shadow.csv
python3 build.py                                      # journal.csv + shadow.csv + activity.json + checklist.json -> data.js/json
python3 fetch_market.py                               # delayed Yahoo quotes + 5m bars -> market.js/json
git add -A && git commit -m "update $(date +%F)" && git push
```
Optional: status.json `{"The Opener": "In trade"}` overrides a floor status tag.

## Rules
- XP: +10 rules followed on a trade/setup, +10 win, -5 rules miss; level every 100 XP; floor 0.
- Paper-tracked strategies (NOT traded) are documented at the top of shadow_eval.py.
