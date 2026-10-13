window.VDATA={
 "built": "2026-10-12 23:23 CT",
 "account": "SIM",
 "start_balance": 50000.0,
 "balance": 50007.45,
 "tally": {
  "wins": 1,
  "losses": 0,
  "missed": 1
 },
 "xp_rules": {
  "rules_followed": 10,
  "win": 10,
  "rules_miss": -5,
  "per_level": 100
 },
 "crew": [
  {
   "name": "The Opener",
   "strategy": "Opening Range",
   "status": "ACTIVE",
   "wins": 1,
   "losses": 0,
   "win_rate": 100,
   "xp": 0,
   "level": 1,
   "xp_in_level": 0,
   "active": true
  },
  {
   "name": "The Trend Rider",
   "strategy": "VWAP trend",
   "status": "NOT STARTED",
   "wins": null,
   "losses": null,
   "win_rate": null,
   "xp": 0,
   "level": 1,
   "xp_in_level": 0,
   "active": false
  },
  {
   "name": "The Closer",
   "strategy": "Runner / let winners run",
   "status": "NOT STARTED",
   "wins": null,
   "losses": null,
   "win_rate": null,
   "xp": 0,
   "level": 1,
   "xp_in_level": 0,
   "active": false
  },
  {
   "name": "The Analyst",
   "strategy": "News scout",
   "status": "SCOUTING",
   "wins": null,
   "losses": null,
   "win_rate": null,
   "xp": 0,
   "level": 1,
   "xp_in_level": 0,
   "active": false
  },
  {
   "name": "The Risk Officer",
   "strategy": "Risk rules",
   "status": "ON WATCH",
   "wins": null,
   "losses": null,
   "win_rate": null,
   "xp": 0,
   "level": 1,
   "xp_in_level": 0,
   "active": false
  }
 ],
 "pnl": {
  "net": 7.45,
  "net_pct": 0.015,
  "gross": null,
  "fees": null,
  "best": 7.45,
  "max_drawdown": 0.0,
  "curve": [
   {
    "date": "start",
    "equity": 50000.0
   },
   {
    "date": "2026-10-09",
    "equity": 50007.45
   }
  ]
 },
 "trades": [
  {
   "date": "2026-10-09",
   "news": "UMich consumer sentiment (prelim) 10:00 ET = 9:00 CT (per Scotiabank Oct-2026 release calendar); no tier-1 8:30 ET data",
   "range_high": 7844.25,
   "range_low": 7826.5,
   "width": 17.75,
   "side": "Long",
   "entry": 7846.5,
   "stop": 7826.5,
   "target": 7864.25,
   "entry_time": "09:53 CT",
   "exit_time": "09:57 CT",
   "exit": 7848.0,
   "exit_reason": "time",
   "pnl": 7.45,
   "rules_ok": false,
   "note": "N - stop/target not attached (process miss). Buy-stop trigger 7844.50 hit in 9:50 CT bar; filled 2 pts late at 7846.50 (~$10 slippage vs resting stop order). Time exit 9:57 vs 10:00 rule = OK. P&L as reported from NT sim; with $1.50 RT assumption it would be $6.00.",
   "status": "WIN"
  },
  {
   "date": "2026-10-12",
   "news": "MES DEC26",
   "range_high": 7870.0,
   "range_low": 7862.25,
   "width": 7.75,
   "side": "Short",
   "entry": 7862.0,
   "stop": 7870.0,
   "target": 7854.25,
   "entry_time": null,
   "exit_time": null,
   "exit": null,
   "exit_reason": null,
   "pnl": null,
   "rules_ok": false,
   "note": "short would trigger 7862.00 stop 7870.00 target 7854.25 - target hit by 9:15 (low 7851.75); hypothetical +~$39; not placed: routine did not fire + logged out + stale chart   0 N       ",
   "status": "MISSED",
   "hypothetical": true
  }
 ],
 "latest": {
  "date": "2026-10-12",
  "news": "MES DEC26",
  "range_high": 7870.0,
  "range_low": 7862.25,
  "width": 7.75,
  "side": "Short",
  "entry": 7862.0,
  "stop": 7870.0,
  "target": 7854.25,
  "entry_time": null,
  "exit_time": null,
  "exit": null,
  "exit_reason": null,
  "pnl": null,
  "rules_ok": false,
  "note": "short would trigger 7862.00 stop 7870.00 target 7854.25 - target hit by 9:15 (low 7851.75); hypothetical +~$39; not placed: routine did not fire + logged out + stale chart   0 N       ",
  "status": "MISSED",
  "hypothetical": true
 },
 "checklist": {
  "date": "2026-10-12",
  "items": [
   {
    "label": "Login",
    "done": true,
    "time": "7:31"
   },
   {
    "label": "Chart live",
    "done": true,
    "time": "8:14"
   },
   {
    "label": "News read",
    "done": false,
    "time": null
   },
   {
    "label": "Range measured",
    "done": false,
    "time": null
   },
   {
    "label": "Orders placed",
    "done": false,
    "time": null
   },
   {
    "label": "Journal logged",
    "done": false,
    "time": null
   }
  ]
 }
};
