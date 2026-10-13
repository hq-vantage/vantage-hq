#!/usr/bin/env python3
"""Paper-track (NOT traded) Trend Rider + Closer for a date using Yahoo MES=F 5-min bars.
Usage: python3 shadow_eval.py 2026-10-13   -> upserts rows in shadow.csv
Rules (1 MES, $5/pt, tick 0.25, $1.50 RT cost assumed; same-bar stop+target => STOP first):
 OR = 8:30-8:45 CT (bars 8:30, 8:35, 8:40). Entries only 8:45-10:00 CT.
 Trend Rider: first OR break after 8:45 sets direction; enter at close of first 5m bar (from the break bar on)
   that closes above session VWAP (up break) / below VWAP (down break). VWAP = cumulative from 8:30 CT bar
   using Yahoo volume. Stop = opposite OR side, target = entry +/- 1.5x OR width, flat at 10:00 (9:55 bar close).
 Closer: Opener entry (stop order 1 tick beyond OR), stop = opposite OR side; once price reaches +1x OR,
   stop -> breakeven (from next bar); target = 2x OR; flat at 11:30 (11:25 bar close)."""
import csv, json, os, sys, datetime, urllib.request, zoneinfo
HERE = os.path.dirname(os.path.abspath(__file__)); CT = zoneinfo.ZoneInfo("America/Chicago")
PT, TICK, RT = 5.0, 0.25, 1.50
FIELDS = ["date", "crew", "or_high", "or_low", "width", "side", "entry_time", "entry", "stop", "target",
          "exit_time", "exit", "exit_reason", "pnl_net", "note"]

def bars_for(day, sym="MES=F"):
    d = datetime.datetime.strptime(day, "%Y-%m-%d").replace(tzinfo=CT)
    p1, p2 = int(d.timestamp()), int((d + datetime.timedelta(days=1)).timestamp())
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{sym}?interval=5m&period1={p1}&period2={p2}"
    r = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=20))
    r = r["chart"]["result"][0]; q = r["indicators"]["quote"][0]; out = []
    for i, ts in enumerate(r.get("timestamp") or []):
        t = datetime.datetime.fromtimestamp(ts, CT)
        if t.strftime("%Y-%m-%d") != day: continue
        v = [q[k][i] for k in ("open", "high", "low", "close", "volume")]
        if None in v[:4]: continue
        out.append(dict(t=t.strftime("%H:%M"), o=v[0], h=v[1], l=v[2], c=v[3], v=v[4] or 0))
    return out

def pnl(side, e, x): return round(((x - e) if side == "Long" else (e - x)) * PT - RT, 2)

def manage(rec, bars, i0, side, e, stop, tgt, flat, be_at=None):
    """walk bars after index i0; returns rec with exit."""
    tgt = round(tgt / TICK) * TICK
    rec.update(side=side, entry=e, stop=stop, target=tgt)
    s = stop; last = None
    for b in bars[i0 + 1:]:
        if b["t"] >= flat: break
        last = b
        hit_s = b["l"] <= s if side == "Long" else b["h"] >= s
        hit_t = b["h"] >= tgt if side == "Long" else b["l"] <= tgt
        if hit_s: rec.update(exit_time=b["t"], exit=s, exit_reason="breakeven" if s == e else "stop"); break
        if hit_t: rec.update(exit_time=b["t"], exit=tgt, exit_reason="target"); break
        if be_at is not None and ((b["h"] >= be_at) if side == "Long" else (b["l"] <= be_at)): s = e
    else: last = None
    if not rec.get("exit_reason"):
        if last is None: last = bars[-1]
        rec.update(exit_time=last["t"], exit=last["c"], exit_reason="time")
    rec["pnl_net"] = pnl(side, e, rec["exit"]); return rec

def evaluate(day):
    bars = bars_for(day)
    orb = [b for b in bars if "08:30" <= b["t"] < "08:45"]
    base = dict(date=day)
    if len(orb) < 3:
        return [dict(base, crew=c, exit_reason="no data", note=f"only {len(orb)} OR bars from Yahoo") for c in ("Trend Rider", "Closer")]
    hi, lo = max(b["h"] for b in orb), min(b["l"] for b in orb); w = hi - lo
    base.update(or_high=hi, or_low=lo, width=w)
    pv = vv = 0; vwap = {}
    for b in bars:
        if b["t"] >= "08:30":
            pv += (b["h"] + b["l"] + b["c"]) / 3 * b["v"]; vv += b["v"]; vwap[b["t"]] = pv / vv if vv else None
    idx = [i for i, b in enumerate(bars) if "08:45" <= b["t"] < "10:00"]
    # Trend Rider
    tr = dict(base, crew="Trend Rider"); direction = None
    for i in idx:
        b = bars[i]
        if direction is None:
            if b["h"] > hi and b["l"] < lo: tr["note"] = "both OR sides broken in one bar; no direction"; break
            if b["h"] > hi: direction = "Long"
            elif b["l"] < lo: direction = "Short"
        if direction and vwap.get(b["t"]):
            if (direction == "Long" and b["c"] > vwap[b["t"]]) or (direction == "Short" and b["c"] < vwap[b["t"]]):
                e = b["c"]; d = 1 if direction == "Long" else -1
                tr["entry_time"] = b["t"]; tr["note"] = f"VWAP {vwap[b['t']]:.2f} at entry"
                manage(tr, bars, i, direction, e, lo if d > 0 else hi, e + d * 1.5 * w, "10:00"); break
    if not tr.get("exit_reason"): tr.update(exit_reason="no trade", pnl_net=0, note=tr.get("note") or "no OR break + VWAP confirm before 10:00")
    # Closer
    cl = dict(base, crew="Closer"); buy, sell = hi + TICK, lo - TICK
    for i in idx:
        b = bars[i]; side = None
        if b["h"] >= buy and b["l"] <= sell: side, e, cl["note"] = "Long", max(buy, b["o"]), "both triggers in one bar: worst case long"
        elif b["h"] >= buy: side, e = "Long", max(buy, b["o"])
        elif b["l"] <= sell: side, e = "Short", min(sell, b["o"])
        if side:
            d = 1 if side == "Long" else -1; cl["entry_time"] = b["t"]
            stop = lo if d > 0 else hi
            if (d > 0 and b["l"] <= stop) or (d < 0 and b["h"] >= stop):  # stopped in entry bar
                cl.update(side=side, entry=e, stop=stop, target=round((e + d * 2 * w) / TICK) * TICK, exit_time=b["t"], exit=stop, exit_reason="stop", pnl_net=pnl(side, e, stop))
            else:
                manage(cl, bars, i, side, e, stop, e + d * 2 * w, "11:30", be_at=e + d * w)
            break
    if not cl.get("exit_reason"): cl.update(exit_reason="no trade", pnl_net=0, note="no OR trigger 8:45-10:00")
    return [tr, cl]

if __name__ == "__main__":
    days = sys.argv[1:] or [datetime.datetime.now(CT).strftime("%Y-%m-%d")]
    path = os.path.join(HERE, "shadow.csv")
    rows = list(csv.DictReader(open(path))) if os.path.exists(path) else []
    for day in days:
        res = evaluate(day)
        rows = [r for r in rows if r["date"] != day] + res
        for r in res: print(day, r["crew"], r.get("side", ""), r.get("entry_time", ""), r.get("entry", ""), "->", r.get("exit_time", ""), r.get("exit", ""), r["exit_reason"], r.get("pnl_net", ""), r.get("note", ""))
    rows.sort(key=lambda r: (r["date"], r["crew"]))
    with open(path, "w", newline="") as f:
        wr = csv.DictWriter(f, FIELDS); wr.writeheader()
        for r in rows: wr.writerow({k: (round(r[k], 2) if isinstance(r.get(k), float) else r.get(k, "")) for k in FIELDS})
