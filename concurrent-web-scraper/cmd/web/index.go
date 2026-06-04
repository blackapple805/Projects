package main

// indexHTML is the single-page UI. Self-contained: no external dependencies,
// no web fonts, no build step -- it runs offline from the embedded string.
//
// NOTE: this whole file is a Go raw string literal, so it must never contain a
// backtick. The JS below uses string concatenation instead of template
// literals for exactly that reason.
const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>RECON // concurrent scraper</title>
<style>
  :root{
    --bg:#070809; --bg2:#0a0c0f; --panel:#0c1013; --panel2:#10161b;
    --line:#1a2127; --line2:#27333c;
    --ink:#d8e4e8; --dim:#627884; --faint:#37444d;
    --amber:#ffb53b; --amber2:#ffd58a;
    --cyan:#54d6e4; --cyan2:#9bf0f7;
    --ok:#4ed27e; --warn:#ffb53b; --err:#ff5f6b;
    --mono:"JetBrains Mono","IBM Plex Mono","SFMono-Regular",ui-monospace,"Cascadia Code","Roboto Mono",Menlo,Consolas,monospace;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html{scrollbar-color:var(--line2) transparent}
  body{
    background:
      radial-gradient(1100px 600px at 88% -12%, #11302722, transparent 60%),
      radial-gradient(900px 500px at -10% 0%, #0f283322, transparent 55%),
      var(--bg);
    color:var(--ink);
    font-family:var(--mono);
    min-height:100vh;
    padding:42px 22px 80px;
    line-height:1.55;
    font-size:13px;
    -webkit-font-smoothing:antialiased;
  }
  /* faint grid + scanline atmosphere */
  body::before{
    content:"";position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.4;
    background-image:
      linear-gradient(var(--line) 1px, transparent 1px),
      linear-gradient(90deg, var(--line) 1px, transparent 1px);
    background-size:46px 46px;
    -webkit-mask-image:radial-gradient(circle at 50% 20%, #000 0%, transparent 78%);
            mask-image:radial-gradient(circle at 50% 20%, #000 0%, transparent 78%);
  }
  body::after{
    content:"";position:fixed;inset:0;pointer-events:none;z-index:1;opacity:.035;
    background:repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 3px);
  }
  .wrap{position:relative;z-index:2;max-width:980px;margin:0 auto}

  /* ---- header ---- */
  header{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;
    border-bottom:1px solid var(--line);padding-bottom:18px;margin-bottom:24px}
  .brand .kicker{color:var(--amber);font-size:10px;letter-spacing:5px;text-transform:uppercase}
  .brand h1{font-size:25px;font-weight:800;letter-spacing:1px;margin-top:7px;color:#eef6f8}
  .brand h1 .slash{color:var(--cyan);font-weight:400}
  .brand h1 .cur{color:var(--amber);animation:blink 1.05s steps(2) infinite}
  @keyframes blink{50%{opacity:0}}
  .brand .sub{color:var(--dim);font-size:11px;margin-top:6px;letter-spacing:.4px}
  .sys{text-align:right;color:var(--faint);font-size:10px;line-height:1.9;letter-spacing:1px;white-space:nowrap}
  .sys .live{color:var(--ok)}
  .sys .dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--ok);
    box-shadow:0 0 8px var(--ok);margin-right:6px;vertical-align:middle;animation:pulse 1.8s ease-in-out infinite}
  @keyframes pulse{50%{opacity:.35}}

  /* ---- console panel ---- */
  .panel{position:relative;background:linear-gradient(180deg,var(--panel2),var(--panel));
    border:1px solid var(--line);border-radius:11px;padding:18px;margin-bottom:20px}
  .panel::before{content:"";position:absolute;left:0;top:14px;bottom:14px;width:2px;
    background:linear-gradient(var(--amber),transparent);border-radius:2px}
  .lbl{display:flex;align-items:center;gap:8px;color:var(--dim);font-size:10px;
    text-transform:uppercase;letter-spacing:2.5px;margin-bottom:11px}
  .lbl .ct{margin-left:auto;color:var(--faint);letter-spacing:1px}
  textarea{width:100%;min-height:138px;resize:vertical;background:#06080a;color:var(--ink);
    border:1px solid var(--line);border-radius:8px;padding:14px 14px 14px 16px;
    font-family:inherit;font-size:13px;line-height:1.8;caret-color:var(--amber)}
  textarea::placeholder{color:var(--faint)}
  textarea:focus{outline:none;border-color:var(--amber);box-shadow:0 0 0 3px #ffb53b1f}
  .row{display:flex;gap:12px;align-items:center;margin-top:14px;flex-wrap:wrap}
  .btn{display:inline-flex;align-items:center;gap:9px;background:var(--amber);color:#1a1102;
    border:0;border-radius:8px;padding:11px 20px;font-family:inherit;font-size:12px;font-weight:800;
    letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;transition:transform .08s,background .15s,box-shadow .15s}
  .btn:hover{background:var(--amber2);box-shadow:0 0 22px #ffb53b33}
  .btn:active{transform:translateY(1px)}
  .btn:disabled{background:var(--line2);color:var(--dim);cursor:not-allowed;box-shadow:none}
  .ghost{background:transparent;color:var(--dim);border:1px solid var(--line2);
    padding:9px 14px;border-radius:7px;font-family:inherit;font-size:11px;letter-spacing:1px;
    text-transform:uppercase;cursor:pointer;transition:.15s}
  .ghost:hover{color:var(--cyan);border-color:var(--cyan)}
  .ghost:disabled{opacity:.4;cursor:not-allowed}
  .stat{margin-left:auto;color:var(--dim);font-size:11px;letter-spacing:.5px;
    display:inline-flex;align-items:center;gap:8px}

  /* ---- HUD ---- */
  .hud{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-bottom:18px}
  .hud.hidden{display:none}
  .kpi{background:var(--panel);border:1px solid var(--line);border-radius:9px;padding:12px 13px}
  .kpi .n{font-size:21px;font-weight:800;line-height:1}
  .kpi .k{color:var(--dim);font-size:9px;letter-spacing:1.8px;text-transform:uppercase;margin-top:8px}
  .kpi.k-tot .n{color:var(--cyan)} .kpi.k-ok .n{color:var(--ok)}
  .kpi.k-blk .n{color:var(--warn)} .kpi.k-err .n{color:var(--err)}
  .kpi.k-lat .n,.kpi.k-time .n{color:var(--ink)}

  /* ---- toolbar / filters ---- */
  .bar{display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap}
  .bar.hidden{display:none}
  .tabs{display:inline-flex;gap:4px;background:var(--panel);border:1px solid var(--line);
    border-radius:8px;padding:4px}
  .tab{background:transparent;border:0;color:var(--dim);font-family:inherit;font-size:11px;
    letter-spacing:1px;text-transform:uppercase;padding:6px 12px;border-radius:6px;cursor:pointer;transition:.12s}
  .tab:hover{color:var(--ink)}
  .tab.on{background:var(--line2);color:var(--amber)}
  .tab .c{color:var(--faint);margin-left:6px}
  .tab.on .c{color:var(--amber2)}
  .spacer{flex:1}

  /* ---- findings ---- */
  .results{display:flex;flex-direction:column;gap:11px}
  .card{position:relative;background:var(--panel);border:1px solid var(--line);
    border-left:3px solid var(--cyan);border-radius:9px;padding:15px 17px;
    animation:rise .34s cubic-bezier(.2,.7,.2,1) both}
  .card.k-blocked{border-left-color:var(--warn)}
  .card.k-failed{border-left-color:var(--err)}
  @keyframes rise{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:none}}
  .chead{display:flex;align-items:baseline;gap:10px}
  .idx{color:var(--faint);font-size:11px;font-weight:700;letter-spacing:1px}
  .host{color:var(--cyan2);font-size:15px;font-weight:700;letter-spacing:.3px;word-break:break-all}
  .host:hover{text-decoration:underline}
  .path{color:var(--dim)}
  .scheme{margin-left:auto;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;
    color:var(--faint);border:1px solid var(--line2);border-radius:5px;padding:2px 7px;white-space:nowrap}

  .chips{display:flex;flex-wrap:wrap;gap:7px;margin:11px 0 12px}
  .chip{font-size:10px;letter-spacing:.6px;border:1px solid var(--line2);border-radius:5px;
    padding:3px 8px;color:var(--dim);display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
  .chip b{font-weight:700}
  .chip.ok{color:var(--ok);border-color:#22432f} .chip.warn{color:var(--warn);border-color:#4a3b1a}
  .chip.err{color:var(--err);border-color:#4a2226}

  .field{margin-top:9px}
  .ftag{color:var(--faint);font-size:9px;letter-spacing:2px;text-transform:uppercase}
  .title{font-size:14px;font-weight:700;color:#e9f3f5;margin-top:3px}
  .summary{color:var(--ink);opacity:.82;font-size:12.5px;margin-top:3px;white-space:pre-wrap;word-break:break-word}
  .summary.clamp{display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
  .more{background:none;border:0;color:var(--cyan);font-family:inherit;font-size:11px;
    cursor:pointer;padding:4px 0 0;letter-spacing:.5px}
  .more:hover{color:var(--cyan2)}
  .card.k-failed .summary,.card.k-blocked .summary{opacity:1}
  .card.k-failed .summary{color:var(--err)}
  .card.k-blocked .summary{color:var(--warn)}

  .empty{color:var(--dim);text-align:center;padding:46px 20px;font-size:12px;
    border:1px dashed var(--line2);border-radius:10px;letter-spacing:.5px}
  .empty b{color:var(--faint)}
  .spinner{display:inline-block;width:12px;height:12px;border:2px solid var(--line2);
    border-top-color:var(--amber);border-radius:50%;animation:spin .65s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%) translateY(20px);
    background:var(--panel2);border:1px solid var(--line2);color:var(--cyan);
    padding:9px 16px;border-radius:8px;font-size:11px;letter-spacing:1px;text-transform:uppercase;
    opacity:0;transition:.25s;pointer-events:none;z-index:50}
  .toast.show{opacity:1;transform:translateX(-50%) translateY(0)}

  @media(max-width:720px){
    .hud{grid-template-columns:repeat(3,1fr)}
    header{flex-direction:column;align-items:flex-start}
    .sys{text-align:left}
  }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div class="brand">
      <div class="kicker">open-source recon</div>
      <h1>RECON<span class="slash">//</span>scraper<span class="cur">_</span></h1>
      <div class="sub">parallel target acquisition &middot; ordered findings &middot; go routines + net/html</div>
    </div>
    <div class="sys">
      <div><span class="dot"></span><span class="live">ENGINE ONLINE</span></div>
      <div>workers: 08 &middot; tls: on</div>
      <div id="clock">--:--:--</div>
    </div>
  </header>

  <div class="panel">
    <div class="lbl">target queue <span class="ct" id="qct">0 targets</span></div>
    <textarea id="urls" spellcheck="false" placeholder="one URL per line ( # comments ignored )"></textarea>
    <div class="row">
      <button class="btn" id="run"><span id="runtxt">&#9654; run scan</span></button>
      <button class="ghost" id="sample">load sample</button>
      <button class="ghost" id="clear">clear</button>
      <span class="stat" id="status">idle</span>
    </div>
  </div>

  <div class="hud hidden" id="hud"></div>

  <div class="bar hidden" id="bar">
    <div class="tabs" id="tabs">
      <button class="tab on" data-f="all">all<span class="c" id="c-all">0</span></button>
      <button class="tab" data-f="resolved">resolved<span class="c" id="c-resolved">0</span></button>
      <button class="tab" data-f="blocked">blocked<span class="c" id="c-blocked">0</span></button>
      <button class="tab" data-f="failed">failed<span class="c" id="c-failed">0</span></button>
    </div>
    <div class="spacer"></div>
    <button class="ghost" id="copy">copy json</button>
    <button class="ghost" id="csv">export csv</button>
  </div>

  <div class="results" id="results">
    <div class="empty"><b>no findings yet.</b><br>queue targets above and run a scan.</div>
  </div>
</div>
<div class="toast" id="toast"></div>

<script>
var SAMPLE = [
  "# content extraction (clean prose)",
  "https://example.com",
  "https://quotes.toscrape.com",
  "https://books.toscrape.com",
  "https://www.scrapethissite.com/pages/",
  "https://en.wikipedia.org/wiki/Open-source_intelligence",
  "# realistic e-commerce sandbox (meta + structured data)",
  "https://web-scraping.dev/product/1",
  "# http behaviours: redirect, refusal, server error",
  "https://httpbin.org/redirect-to?url=https://example.com&status_code=302",
  "https://httpbin.org/status/403",
  "https://httpbin.org/status/500"
].join("\n");

var $ = function(s){ return document.querySelector(s); };
var urlsEl = $("#urls"), runBtn = $("#run"), runTxt = $("#runtxt");
var statusEl = $("#status"), out = $("#results"), hud = $("#hud"), bar = $("#bar");
var qct = $("#qct"), toast = $("#toast");
var DATA = [], FILTER = "all", timer = null;

function esc(s){ var d = document.createElement("div"); d.textContent = (s == null ? "" : s); return d.innerHTML; }

function parseURLs(){
  return urlsEl.value.split("\n").map(function(s){ return s.trim(); })
    .filter(function(s){ return s && s.charAt(0) !== "#"; });
}
function refreshCount(){
  var n = parseURLs().length;
  qct.textContent = n + (n === 1 ? " target" : " targets");
}
function kindOf(r){
  if(r.error) return "failed";
  if(r.source === "blocked") return "blocked";
  if(r.status >= 200 && r.status < 300) return "resolved";
  return "blocked"; // non-2xx without a transport error: treat as a soft block
}
function parseMs(s){
  if(!s) return 0;
  var m, t = 0;
  if((m = s.match(/([\d.]+)ms/))) t += parseFloat(m[1]);
  else if((m = s.match(/([\d.]+)s/))) t += parseFloat(m[1]) * 1000;
  if((m = s.match(/(\d+)m(?!s)/))) t += parseInt(m[1], 10) * 60000;
  return t;
}
function host(u){ try{ return new URL(u).host; }catch(e){ return u.replace(/^https?:\/\//, "").split("/")[0]; } }
function path(u){ try{ var p = new URL(u); return (p.pathname || "") + (p.search || ""); }catch(e){ return ""; } }
function scheme(u){ try{ return new URL(u).protocol.replace(":", ""); }catch(e){ return u.split(":")[0]; } }

function statusChip(r){
  if(r.error) return '<span class="chip err">HTTP <b>ERR</b></span>';
  var cls = (r.status >= 200 && r.status < 300) ? "ok" : (r.status >= 300 && r.status < 400 ? "warn" : "err");
  return '<span class="chip ' + cls + '">HTTP <b>' + esc(r.status || "?") + '</b></span>';
}
function chips(r){
  var c = statusChip(r);
  c += '<span class="chip">&#9201; <b>' + esc(r.elapsed || "-") + '</b></span>';
  if(r.source === "blocked") c += '<span class="chip warn">REFUSED</span>';
  else if(r.source && r.source !== "none") c += '<span class="chip">src <b>' + esc(r.source) + '</b></span>';
  else if(!r.error) c += '<span class="chip">src <b>none</b></span>';
  return c;
}
function card(r, i){
  var k = kindOf(r);
  var head = '<div class="chead"><span class="idx">' + (i < 9 ? "0" : "") + (i + 1) + '</span>' +
    '<a class="host" href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(host(r.url)) +
    '<span class="path">' + esc(path(r.url)) + '</span></a>' +
    '<span class="scheme">' + esc(scheme(r.url)) + '</span></div>';

  var body;
  if(r.error){
    body = '<div class="field"><div class="ftag">error</div><div class="summary">' + esc(r.error) + '</div></div>';
  } else {
    var title = '<div class="field"><div class="ftag">title</div><div class="title">' + esc(r.title) + '</div></div>';
    var desc = r.description || "N/A";
    var longish = desc.length > 280;
    var sum = '<div class="field"><div class="ftag">summary</div>' +
      '<div class="summary' + (longish ? ' clamp' : '') + '">' + esc(desc) + '</div>' +
      (longish ? '<button class="more">show full intel &#9662;</button>' : '') + '</div>';
    body = title + sum;
  }
  return '<div class="card k-' + k + '" data-k="' + k + '">' + head +
    '<div class="chips">' + chips(r) + '</div>' + body + '</div>';
}

function render(){
  var rows = DATA.filter(function(r){ return FILTER === "all" || kindOf(r) === FILTER; });
  if(!rows.length){
    out.innerHTML = '<div class="empty"><b>no ' + FILTER + ' findings.</b></div>';
    return;
  }
  out.innerHTML = rows.map(function(r){ return card(r, DATA.indexOf(r)); }).join("");
  var btns = out.querySelectorAll(".more");
  for(var i = 0; i < btns.length; i++){
    btns[i].addEventListener("click", function(){
      var s = this.parentNode.querySelector(".summary");
      var open = s.classList.toggle("clamp") === false;
      this.innerHTML = open ? "collapse &#9652;" : "show full intel &#9662;";
    });
  }
}
function renderHUD(wallSec){
  var n = DATA.length, ok = 0, blk = 0, err = 0, lat = 0;
  DATA.forEach(function(r){
    var k = kindOf(r);
    if(k === "resolved") ok++; else if(k === "blocked") blk++; else err++;
    lat += parseMs(r.elapsed);
  });
  var avg = n ? Math.round(lat / n) : 0;
  function kpi(cls, val, key){ return '<div class="kpi ' + cls + '"><div class="n">' + val + '</div><div class="k">' + key + '</div></div>'; }
  hud.innerHTML =
    kpi("k-tot", n, "targets") +
    kpi("k-ok", ok, "resolved") +
    kpi("k-blk", blk, "blocked") +
    kpi("k-err", err, "failed") +
    kpi("k-lat", avg + "ms", "avg latency") +
    kpi("k-time", wallSec.toFixed(2) + "s", "wall time");
  hud.classList.remove("hidden");
  bar.classList.remove("hidden");
  ["all", "resolved", "blocked", "failed"].forEach(function(f){
    $("#c-" + f).textContent = f === "all" ? n : DATA.filter(function(r){ return kindOf(r) === f; }).length;
  });
}

function showToast(msg){
  toast.textContent = msg; toast.classList.add("show");
  setTimeout(function(){ toast.classList.remove("show"); }, 1500);
}
function csvCell(s){ s = (s == null ? "" : String(s)); return '"' + s.replace(/"/g, '""') + '"'; }
function exportCSV(){
  if(!DATA.length) return;
  var head = ["url", "status", "source", "elapsed", "title", "description", "error"];
  var lines = [head.join(",")];
  DATA.forEach(function(r){
    lines.push([r.url, r.status, r.source, r.elapsed, r.title, r.description, r.error].map(csvCell).join(","));
  });
  var blob = new Blob([lines.join("\n")], { type: "text/csv" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "recon-" + Date.now() + ".csv";
  a.click(); URL.revokeObjectURL(a.href);
  showToast("csv exported");
}

async function run(){
  var urls = parseURLs();
  if(!urls.length){ statusEl.textContent = "queue is empty"; return; }
  runBtn.disabled = true;
  runTxt.innerHTML = "scanning";
  statusEl.innerHTML = '<span class="spinner"></span> acquiring ' + urls.length + ' targets...';
  out.innerHTML = '<div class="empty"><span class="spinner"></span><br>scan in progress &mdash; ' + urls.length + ' targets dispatched in parallel.</div>';
  var t0 = performance.now();
  try{
    var res = await fetch("/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls: urls })
    });
    DATA = await res.json();
    var wall = (performance.now() - t0) / 1000;
    FILTER = "all";
    var tabs = document.querySelectorAll(".tab");
    for(var i = 0; i < tabs.length; i++) tabs[i].classList.toggle("on", tabs[i].dataset.f === "all");
    renderHUD(wall);
    render();
    var ok = DATA.filter(function(r){ return kindOf(r) === "resolved"; }).length;
    statusEl.textContent = "scan complete \u00b7 " + ok + "/" + DATA.length + " resolved in " + wall.toFixed(2) + "s";
  }catch(e){
    statusEl.textContent = "scan failed: " + e.message;
    out.innerHTML = '<div class="empty"><b>request failed.</b><br>' + esc(e.message) + '</div>';
  }finally{
    runBtn.disabled = false;
    runTxt.innerHTML = "&#9654; run scan";
  }
}

runBtn.addEventListener("click", run);
$("#sample").addEventListener("click", function(){ urlsEl.value = SAMPLE; refreshCount(); urlsEl.focus(); });
$("#clear").addEventListener("click", function(){ urlsEl.value = ""; refreshCount(); urlsEl.focus(); });
urlsEl.addEventListener("input", refreshCount);
$("#tabs").addEventListener("click", function(e){
  var b = e.target.closest(".tab"); if(!b) return;
  FILTER = b.dataset.f;
  var tabs = document.querySelectorAll(".tab");
  for(var i = 0; i < tabs.length; i++) tabs[i].classList.toggle("on", tabs[i] === b);
  render();
});
$("#copy").addEventListener("click", function(){
  navigator.clipboard.writeText(JSON.stringify(DATA, null, 2)).then(function(){ showToast("json copied"); });
});
$("#csv").addEventListener("click", exportCSV);
urlsEl.addEventListener("keydown", function(e){
  if((e.ctrlKey || e.metaKey) && e.key === "Enter"){ e.preventDefault(); run(); }
});

(function clock(){
  function tick(){
    var d = new Date();
    function p(n){ return (n < 10 ? "0" : "") + n; }
    $("#clock").textContent = p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds()) + " local";
  }
  tick(); setInterval(tick, 1000);
})();

urlsEl.value = SAMPLE;
refreshCount();
</script>
</body>
</html>`
