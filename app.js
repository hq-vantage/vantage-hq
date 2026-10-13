const D=window.VDATA||{},M=window.VMARKET||{},$=id=>document.getElementById(id);
const dash=v=>v==null?'—':v, money=v=>v==null?'—':(v<0?'-':'+')+'$'+Math.abs(v).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
// --- pixel avatars: 32x24 grids built in code ---
const AV=[{skin:'#e8b48a',hair:'#3a2414',shirt:'#f2f2f2',tie:'#222',acc:null,bg:'#12303a'},
 {skin:'#c98d62',hair:'#111',shirt:'#222',tie:null,acc:'long',bg:'#10331f'},
 {skin:'#7a4a2e',hair:'#1a1a1a',shirt:'#1c1c1c',tie:null,acc:'beard',bg:'#2a2410'},
 {skin:'#f0c39a',hair:'#2b1a10',shirt:'#20262c',tie:null,acc:'glasses',bg:'#15233a'},
 {skin:'#d9a37c',hair:'#5a3a1e',shirt:'#2a3340',tie:'#7a1f1f',acc:'glasses',bg:'#2a1616'}];
function avatar(i){const a=AV[i],W=32,H=24,px=[];const R=(x,y,w,h,c)=>px.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`);
 R(0,0,W,H,a.bg);for(let k=0;k<6;k++)R(2+k*5,2,4,3,'#1d4d5e');
 R(21,6,9,7,'#0a0f12');R(22,7,7,5,'#0f2a1a');[[22,11],[23,10],[24,10],[25,9],[26,8],[27,8],[28,7]].forEach(([x,y])=>R(x,y,1,1,'#3ddc6a'));R(25,13,1,2,'#333');
 if(a.acc==='long')R(8,7,10,10,a.hair);
 R(8,16,12,8,a.shirt);if(a.tie)R(13,16,2,6,a.tie);else R(12,16,4,2,a.skin);
 R(10,7,8,9,a.skin);R(9,6,10,3,a.hair);R(9,7,1,4,a.hair);R(18,7,1,3,a.hair);
 R(12,11,1,1,'#111');R(15,11,1,1,'#111');R(13,14,2,1,'#8a4a3a');
 if(a.acc==='glasses'){R(11,10,3,3,'none');px.push('<rect x="11" y="10" width="3" height="3" fill="none" stroke="#111" stroke-width=".6"/><rect x="14.5" y="10" width="3" height="3" fill="none" stroke="#111" stroke-width=".6"/>')}
 if(a.acc==='beard')R(10,14,8,2,'#1a1a1a'),R(13,14,2,1,'#8a4a3a');
 R(0,20,W,4,'#3a2a1c');R(0,20,W,1,'#5a4330');R(4,18,6,2,'#555');
 return `<svg viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges" role="img" aria-label="pixel trader at desk">${px.join('')}</svg>`}
const R=D.xp_rules||{};
$('xptip').dataset.t=`XP rule (Opener's journal):\n+${R.rules_followed} trade/setup with rules followed\n+${R.win} winning trade\n${R.rules_miss} rules miss (incl. missed setup)\nLevel up every ${R.per_level} XP. XP floors at 0.`;
$('crew').innerHTML=(D.crew||[]).map((c,i)=>`<div class="panel card"><h3><span class="lvl">${c.level}</span>${c.name.toUpperCase()}</h3><div class="role">${c.strategy}</div>${avatar(i)}
<div class="row"><span>XP <b>${c.xp}</b> / ${(c.level)*R.per_level}</span><span class="m">Lvl ${c.level}</span></div><div class="bar"><i style="width:${c.xp_in_level}%"></i></div>
<div class="row"><span>WINS <b class="g">${dash(c.wins)}</b></span><span>LOSSES <b class="r">${dash(c.losses)}</b></span></div>
<div class="row"><span>WIN RATE</span><b class="g">${c.win_rate==null?'—':c.win_rate+'%'}</b></div>${c.paper?`<div class="paper"><div class="pl">PAPER-TRACKED (not traded)</div>${c.paper.trades} trades: ${c.paper.wins}W/${c.paper.losses}L • net <b class="${c.paper.net>=0?'g':'r'}">${money(c.paper.net)}</b><br>${c.paper.rows.map(r=>`<span class="m">${r.date.slice(5)}</span> ${r.side||''} ${r.exit_reason} ${money(r.pnl_net)}`).join('<br>')}</div>`:''}<div class="pill ${c.active?'':'off'}">${c.status}</div></div>`).join('');
$('dxp').textContent=(D.crew||[]).reduce((s,c)=>s+c.xp,0);
$('bal').textContent=D.balance!=null?'$'+D.balance.toLocaleString(undefined,{minimumFractionDigits:2}):'—';
const P=D.pnl||{};$('net').textContent=money(P.net);$('net').className='big '+(P.net>0?'g':P.net<0?'r':'');
$('netp').textContent=P.net_pct==null?'—':(P.net_pct>=0?'+':'')+P.net_pct.toFixed(3)+'% on $'+D.start_balance.toLocaleString();
$('kv').innerHTML=[['Gross P&L',money(P.gross)],['Fees',P.fees==null?'—':money(-P.fees)],['Best trade',money(P.best)],['Max drawdown',P.max_drawdown==null?'—':'$'+P.max_drawdown.toFixed(2)]].map(([k,v])=>`<span class="m">${k}</span><b>${v}</b>`).join('');
const t=D.tally||{};$('tally').textContent=`Official: ${t.wins}W / ${t.losses}L  •  Missed setups (not counted): ${t.missed}  •  Fees not itemized in journal`;
(()=>{const c=P.curve||[];if(c.length<2)return;const v=c.map(p=>p.equity),lo=Math.min(...v)-2,hi=Math.max(...v)+2,X=i=>10+i*280/(c.length-1),Y=e=>70-(e-lo)/(hi-lo)*60;
 $('eq').innerHTML=`<polyline fill="none" stroke="#3ddc6a" stroke-width="2" points="${c.map((p,i)=>X(i)+','+Y(p.equity)).join(' ')}"/>`+c.map((p,i)=>`<circle cx="${X(i)}" cy="${Y(p.equity)}" r="3" fill="#f2b632"/><text x="${X(i)}" y="79" fill="#9aa3ab" font-size="8" text-anchor="${i?'end':'start'}">${p.date}</text>`).join('')+`<text x="10" y="9" fill="#9aa3ab" font-size="8">$${hi.toFixed(0)}</text>`})();
const CK=D.checklist||{};const items=CK.items||[];$('ck').innerHTML=items.map(x=>`<div class="ck ${x.done?'done':''}"><span>${x.label}</span><span class="${x.done?'g':'m'}">${x.done?(x.time||'Done'):'—'}</span></div>`).join('');
$('ckc').textContent=items.filter(x=>x.done).length+' / '+items.length+' DONE';$('ckd').textContent='Checklist for '+(CK.date||'—')+' (edit checklist.json)';
// chart
(()=>{const C=M.chart,L=D.latest||{};$('lt').textContent=C?`${C.symbol.replace('=F','')} 5m • ${C.date}`:'—';
 if(!C){$('chart').innerHTML='<text x="260" y="120" fill="#9aa3ab" text-anchor="middle">No bars — run fetch_market.py</text>';return}
 const b=C.bars,lv=[L.range_high,L.range_low,L.entry,L.stop,L.target].filter(x=>x!=null),lo=Math.min(...b.map(x=>x.l),...lv)-1,hi=Math.max(...b.map(x=>x.h),...lv)+1;
 const W=400,x0=8,Y=p=>8+(hi-p)/(hi-lo)*210,bw=W/b.length,X=i=>x0+i*bw;let s='';
 const o1=b.findIndex(x=>x.t==='08:30'),o2=b.findIndex(x=>x.t==='08:45');
 if(o1>=0&&L.range_high!=null)s+=`<rect x="${X(o1)}" y="${Y(L.range_high)}" width="${((o2>=0?o2:o1+3)-o1)*bw}" height="${Y(L.range_low)-Y(L.range_high)}" fill="#f2b632" opacity=".25" stroke="#f2b632"/><text x="${X(o1)+2}" y="${Y(L.range_low)+11}" fill="#f2b632" font-size="10">OR 8:30-8:45</text>`;
 b.forEach((k,i)=>{const c=k.c>=k.o?'#3ddc6a':'#ff5a5a',cx=X(i)+bw/2;s+=`<line x1="${cx}" x2="${cx}" y1="${Y(k.h)}" y2="${Y(k.l)}" stroke="${c}"/><rect x="${X(i)+1}" width="${Math.max(bw-2,1)}" y="${Y(Math.max(k.o,k.c))}" height="${Math.max(Math.abs(Y(k.o)-Y(k.c)),1)}" fill="${c}"/>`;if(i%6===0)s+=`<text x="${cx}" y="236" fill="#9aa3ab" font-size="9" text-anchor="middle">${k.t}</text>`});
 [[L.entry,'ENTRY','#e9ecef'],[L.stop,'STOP','#ff5a5a'],[L.target,'TARGET','#3ddc6a']].forEach(([p,n,c])=>{if(p==null)return;s+=`<line x1="${x0}" x2="${x0+W}" y1="${Y(p)}" y2="${Y(p)}" stroke="${c}" stroke-dasharray="5 3"/><text x="${x0+W+4}" y="${Y(p)+4}" fill="${c}" font-size="10">${n} ${p.toFixed(2)}</text>`});
 $('chart').innerHTML=s;
 $('cnote').textContent=(L.status==='MISSED'?`${L.date}: MISSED — hypothetical ${L.side.toLowerCase()} setup shown (not taken, not counted). `:`${L.date}: ${L.status||''} ${L.side||''}. `)+(C.note||'')})();
$('mk').innerHTML=(M.quotes||[]).map(q=>`<div>${q.label}<b>${q.price==null?'—':q.price.toLocaleString(undefined,{minimumFractionDigits:2})}</b><span class="${q.pct>=0?'g':'r'}">${q.pct==null?'—':(q.pct>=0?'+':'')+q.pct.toFixed(2)+'%'}</span></div>`).join('');
$('msrc').textContent=`${M.source||'—'} • fetched ${M.fetched||'—'}`;$('mtime').textContent='Quotes '+(M.fetched||'—');
$('foot').textContent=`Built ${D.built||'—'} from journal.csv • Account: SIM • Paper trading only, not advice.`;

// floor
(()=>{const m=matchMedia('(max-width:800px)').matches;
 const P=m?[[3,37],[36,40],[69,37],[3,66],[69,66]]:[[14,50],[1,10],[71,50],[85,10],[57,52]];
 const fl=$('floor');(D.crew||[]).forEach((c,i)=>{const d=document.createElement('div');d.className='seat'+(c.active?' on':'');
  d.style.left=P[i][0]+'%';d.style.top=P[i][1]+'%';d.innerHTML=`<div class="tag">${c.tag||'—'}</div>${avatar(i)}<div class="nm">${c.name.replace('The ','')}</div>`;fl.appendChild(d)});
 const L=M.live;if(!L||!L.bars.length){$('wall').innerHTML='<text x="200" y="80" fill="#9aa3ab" text-anchor="middle" font-size="14">no market data</text>';return}
 const b=L.bars,lo=Math.min(...b.map(x=>x.l)),hi=Math.max(...b.map(x=>x.h)),bw=400/b.length,Y=p=>14+(hi-p)/(hi-lo||1)*130;
 $('wall').innerHTML=b.map((k,i)=>{const c=k.c>=k.o?'#3ddc6a':'#ff5a5a',x=i*bw;return `<line x1="${x+bw/2}" x2="${x+bw/2}" y1="${Y(k.h)}" y2="${Y(k.l)}" stroke="${c}"/><rect x="${x+1}" width="${Math.max(bw-2,1)}" y="${Y(Math.max(k.o,k.c))}" height="${Math.max(Math.abs(Y(k.o)-Y(k.c)),1)}" fill="${c}"/>`}).join('');
 const last=b[b.length-1];$('scap').textContent=`${L.symbol.replace('=F','')} 5m ${last.c.toFixed(2)} @ ${last.t} CT (delayed)`})();
$('log').innerHTML=(D.activity||[]).slice().reverse().map(e=>`<div><span class="tm">${e.time}</span> <span class="cr">${e.crew}:</span> ${e.text}</div>`).join('')||'—';
$('dots').innerHTML=(D.dots||[]).map(d=>`<span class="dt ${d.status}" tabindex="0" data-t="${d.date} • ${d.status} • ${d.pnl==null?'—':money(d.pnl)}"></span>`).join('')||'—';
