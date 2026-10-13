#!/usr/bin/env python3
"""Build data.json/data.js for Vantage HQ from ../trading/journal.csv. Re-run after each trade."""
import csv, json, os, re, datetime
HERE = os.path.dirname(os.path.abspath(__file__))
JOURNAL = os.environ.get("JOURNAL", os.path.join(HERE, "..", "trading", "journal.csv"))
START = 50000.00
RULES = {"rules_followed": 10, "win": 10, "rules_miss": -5, "per_level": 100}

def num(s):
    try: return float(str(s).replace("$", "").replace(",", "").strip())
    except Exception: return None

rows = list(csv.reader(open(JOURNAL, newline="")))
hdr, body = rows[0], rows[1:]
trades = []
for r in body:
    r = r + [""] * (len(hdr) - len(r))
    d = dict(zip(hdr, r))
    skip = d["skip?"].strip().upper()
    t = {"date": d["date"], "news": d["key news"], "range_high": num(d["range high"]), "range_low": num(d["range low"]),
         "width": num(d["width"]), "side": None, "entry": None, "stop": None, "target": None,
         "entry_time": None, "exit_time": None, "exit": None, "exit_reason": None, "pnl": None, "rules_ok": None, "note": ""}
    if skip == "MISSED":
        t["status"] = "MISSED"
        txt = " ".join(r[6:])  # missed rows carry a free-text setup description
        m = re.search(r"(long|short).*?trigger\s*([\d.]+).*?stop\s*([\d.]+).*?target\s*([\d.]+)", txt, re.I)
        if m:
            t.update(side=m.group(1).capitalize(), entry=float(m.group(2)), stop=float(m.group(3)), target=float(m.group(4)))
        t["note"] = txt; t["rules_ok"] = False; t["hypothetical"] = True
    elif skip in ("Y", "YES", "SKIP"):
        t["status"] = "SKIP"; t["rules_ok"] = True
    else:
        t.update(side=d["side"] or None, entry=num(d["entry"]), stop=num(d["stop"]), target=num(d["target"]),
                 entry_time=d["entry time"] or None, exit_time=d["exit time"] or None, exit=num(d["exit"]),
                 exit_reason=d["exit reason (target/stop/time/skip)"] or None, pnl=num(d["P&L $ net"]))
        ro = d["rules followed (Y/N + note)"].strip()
        t["rules_ok"] = ro.upper().startswith("Y"); t["note"] = ro
        t["status"] = "WIN" if (t["pnl"] or 0) > 0 else ("LOSS" if (t["pnl"] or 0) < 0 else "SCRATCH")
    trades.append(t)

taken = [t for t in trades if t["status"] in ("WIN", "LOSS", "SCRATCH")]
wins = sum(t["status"] == "WIN" for t in taken); losses = sum(t["status"] == "LOSS" for t in taken)
missed = sum(t["status"] == "MISSED" for t in trades)
xp = 0
for t in trades:
    if t["status"] in ("WIN", "LOSS", "SCRATCH", "MISSED"):
        xp += RULES["rules_followed"] if t["rules_ok"] else RULES["rules_miss"]
    if t["status"] == "WIN": xp += RULES["win"]
xp = max(xp, 0)
eq, curve, peak, mdd = START, [{"date": "start", "equity": START}], START, 0.0
for t in taken:
    eq += t["pnl"] or 0; curve.append({"date": t["date"], "equity": round(eq, 2)})
    peak = max(peak, eq); mdd = max(mdd, peak - eq)
net = round(eq - START, 2)

def crew(name, strat, status, w=None, l=None, x=0, active=False):
    wr = (round(100 * w / (w + l)) if (w is not None and (w + l) > 0) else None)
    return {"name": name, "strategy": strat, "status": status, "wins": w, "losses": l, "win_rate": wr,
            "xp": x, "level": 1 + x // RULES["per_level"], "xp_in_level": x % RULES["per_level"], "active": active}

data = {
    "built": datetime.datetime.now().strftime("%Y-%m-%d %H:%M CT"),
    "account": "SIM", "start_balance": START, "balance": round(eq, 2),
    "tally": {"wins": wins, "losses": losses, "missed": missed},
    "xp_rules": RULES,
    "crew": [crew("The Opener", "Opening Range", "ACTIVE", wins, losses, xp, True),
             crew("The Trend Rider", "VWAP trend", "NOT STARTED"),
             crew("The Closer", "Runner / let winners run", "NOT STARTED"),
             crew("The Analyst", "News scout", "SCOUTING"),
             crew("The Risk Officer", "Risk rules", "ON WATCH")],
    "pnl": {"net": net, "net_pct": round(100 * net / START, 3), "gross": None, "fees": None,
            "best": max([t["pnl"] for t in taken], default=None), "max_drawdown": round(mdd, 2), "curve": curve},
    "trades": trades, "latest": trades[-1] if trades else None,
}
ck = os.path.join(HERE, "checklist.json")
data["checklist"] = json.load(open(ck)) if os.path.exists(ck) else []
js = json.dumps(data, indent=1)
open(os.path.join(HERE, "data.json"), "w").write(js)
open(os.path.join(HERE, "data.js"), "w").write("window.VDATA=" + js + ";\n")
print(f"built: {wins}W/{losses}L/{missed} missed, net ${net:+.2f}, balance ${eq:,.2f}, Opener XP {xp}")
