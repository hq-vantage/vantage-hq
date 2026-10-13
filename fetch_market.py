#!/usr/bin/env python3
"""Pull free delayed Yahoo Finance quotes + 5-min bars into market.json / market.js."""
import json, os, sys, urllib.request, datetime, zoneinfo
HERE = os.path.dirname(os.path.abspath(__file__))
CT = zoneinfo.ZoneInfo("America/Chicago")
SYMS = [("MES", "MES=F"), ("ES", "ES=F"), ("NQ", "NQ=F"), ("Crude", "CL=F")]
DATE = sys.argv[1] if len(sys.argv) > 1 else None  # chart session date YYYY-MM-DD (default: journal's latest)
if not DATE:
    try: DATE = json.load(open(os.path.join(HERE, "data.json")))["latest"]["date"]
    except Exception: DATE = datetime.datetime.now(CT).strftime("%Y-%m-%d")

def get(sym, interval="5m", rng="5d"):
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{sym}?interval={interval}&range={rng}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    return json.load(urllib.request.urlopen(req, timeout=20))["chart"]["result"][0]

out = {"fetched": datetime.datetime.now(CT).strftime("%Y-%m-%d %H:%M CT"), "source": "Yahoo Finance (delayed)",
       "quotes": [], "chart": None}
for label, sym in SYMS:
    try:
        m = get(sym, "1d", "5d")["meta"]
        p = m.get("regularMarketPrice"); prev = m.get("chartPreviousClose") or m.get("previousClose")
        pct = m.get("regularMarketChangePercent")
        if pct is None and p and prev: pct = 100 * (p - prev) / prev
        out["quotes"].append({"label": label, "symbol": sym, "price": p, "pct": pct})
    except Exception as e:
        out["quotes"].append({"label": label, "symbol": sym, "price": None, "pct": None, "error": str(e)})

for sym in ("MES=F", "ES=F"):
    try:
        r = get(sym); q = r["indicators"]["quote"][0]; bars = []
        for i, ts in enumerate(r["timestamp"]):
            t = datetime.datetime.fromtimestamp(ts, CT)
            if t.strftime("%Y-%m-%d") != DATE or not (8, 0) <= (t.hour, t.minute) <= (11, 0): continue
            o, h, l, c = (q[k][i] for k in ("open", "high", "low", "close"))
            if None in (o, h, l, c): continue
            bars.append({"t": t.strftime("%H:%M"), "o": o, "h": h, "l": l, "c": c})
        if bars:
            out["chart"] = {"symbol": sym, "date": DATE, "interval": "5m", "bars": bars,
                            "note": "" if sym == "MES=F" else "MES=F unavailable; showing ES=F"}
            break
    except Exception as e:
        print("chart fail", sym, e)
js = json.dumps(out, indent=1)
open(os.path.join(HERE, "market.json"), "w").write(js)
open(os.path.join(HERE, "market.js"), "w").write("window.VMARKET=" + js + ";\n")
c = out["chart"]
print("quotes:", [(x["label"], x["price"], x["pct"] and round(x["pct"], 2)) for x in out["quotes"]])
print("chart:", c and f'{c["symbol"]} {c["date"]} {len(c["bars"])} bars {c["bars"][0]["t"]}-{c["bars"][-1]["t"]}')
