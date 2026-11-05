/*!
 * nh-scan.js — scaffold sola lettura per Scan token + Strategie a carta
 * Branch: grok/scan-token-carte-readonly
 *
 * PUNTI DI INNESTO (Hunter):
 * 1) NHScan.fetchProfiles()     → DexScreener token-profiles / token-boosts (pubblico, no key)
 * 2) NHScan.fetchTokenPairs(mints) → /latest/dex/tokens/<mints> (max 30)
 * 3) NHScan.normalizePair(p)    → shape UI {mint,sym,name,mc,vol,h1,dex,url,...}
 * 4) NHScan.loadPaperBot()      → bot_data.public.json / v1_data.json (Hunter fornisce path/URL)
 * 5) NHScan.renderStrategies(d) → carte copy/reentry/arb/v1 + badge PnL non affidabile
 *
 * VIETATO: keystore, seed, wallet, firma tx, live_mode=true, API key private.
 * live_mode resta sempre false in UI e nei dati mostrati.
 */
(function () {
  "use strict";

  // URL pubblici DexScreener documentati (nessuna API key). Possono fallire (CORS/rate); graceful.
  var DS = {
    profiles: "https://api.dexscreener.com/token-profiles/latest/v1",
    boosts: "https://api.dexscreener.com/token-boosts/latest/v1",
    tokens: "https://api.dexscreener.com/latest/dex/tokens/"
  };

  // Path relativi previsti dopo handoff Hunter (placeholder — non inventare host privati)
  var PAPER = {
    bot: "bot_data.public.json",
    v1: "v1_data.json",
    scanner: "scanner.json"
  };

  var state = {
    tokens: [],
    q: "",
    dex: "",
    sort: "mc",
    dir: -1,
    paper: null,
    tab: "scan"
  };

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c];
    });
  }
  function nf(x, d) {
    if (x == null || x !== x) return "—";
    return (+x).toLocaleString("it-IT", { maximumFractionDigits: d == null ? 2 : d });
  }

  /** @returns {Promise<any[]>} lista grezza profiles/boosts */
  async function fetchProfiles() {
    // INNESTO HUNTER: sostituire o arricchire con logica bonding-curve dedicata
    var out = [];
    try {
      var r = await fetch(DS.profiles, { credentials: "omit" });
      if (r.ok) out = out.concat(await r.json());
    } catch (e) { /* graceful */ }
    try {
      var r2 = await fetch(DS.boosts, { credentials: "omit" });
      if (r2.ok) out = out.concat(await r2.json());
    } catch (e) { /* graceful */ }
    return Array.isArray(out) ? out : [];
  }

  /** @param {string[]} mints max 30 */
  async function fetchTokenPairs(mints) {
    // INNESTO HUNTER: batch mint → pair DexScreener
    var list = (mints || []).filter(Boolean).slice(0, 30);
    if (!list.length) return [];
    try {
      var r = await fetch(DS.tokens + list.join(","), { credentials: "omit" });
      if (!r.ok) return [];
      var j = await r.json();
      return (j && j.pairs) || [];
    } catch (e) {
      return [];
    }
  }

  function normalizePair(p) {
    // Shape allineata a scanner.json (Hunter 2026-11-05)
    if (!p) return null;
    var base = p.baseToken || {};
    var img = (p.info && p.info.imageUrl) || "";
    var buys = p.txns && p.txns.h1 && p.txns.h1.buys;
    var sells = p.txns && p.txns.h1 && p.txns.h1.sells;
    var ok = p.dexId === "pumpfun" || p.dexId === "pumpswap";
    return {
      mint: base.address || p.tokenAddress || "",
      sym: base.symbol || p.symbol || "?",
      name: base.name || p.name || "",
      img: img,
      price: p.priceUsd,
      h1: p.priceChange && p.priceChange.h1,
      h24: p.priceChange && p.priceChange.h24,
      mc: p.marketCap != null ? p.marketCap : p.fdv,
      liq: p.liquidity && p.liquidity.usd,
      vol: p.volume && p.volume.h1,
      dex: p.dexId || "",
      chain: p.chainId || "",
      score: null,
      risks: [],
      ok: !!ok,
      bonding: p.dexId === "pumpfun",
      buys: buys,
      sells: sells,
      url: p.url || (base.address ? "https://dexscreener.com/solana/" + base.address : ""),
      pairCreatedAt: p.pairCreatedAt || null
    };
  }

  function fromProfileStub(p) {
    if (!p || (p.chainId && p.chainId !== "solana")) return null;
    return {
      mint: p.tokenAddress || "",
      sym: p.symbol || "?",
      name: p.description || p.symbol || "",
      mc: null,
      vol: null,
      h1: null,
      price: null,
      dex: "",
      chain: p.chainId || "solana",
      url: p.url || (p.tokenAddress ? "https://dexscreener.com/solana/" + p.tokenAddress : ""),
      pairCreatedAt: null,
      _stub: true
    };
  }

  async function loadPaperBot() {
    var data = null;
    try {
      var r = await fetch(PAPER.bot + "?t=" + Date.now(), { credentials: "omit", cache: "no-store" });
      if (r.ok) data = await r.json();
    } catch (e) { /* graceful */ }
    if (data) {
      data = Object.assign({}, data, { live_mode: false });
      if (data.live_mode === true) data._forced_ro = true;
      data.live_mode = false;
    }
    return data;
  }

  function filterSort(list) {
    var q = (state.q || "").toLowerCase().trim();
    var out = list.filter(function (t) {
      if (state.dex && t.dex !== state.dex) return false;
      if (!q) return true;
      return (t.sym || "").toLowerCase().indexOf(q) >= 0 ||
        (t.name || "").toLowerCase().indexOf(q) >= 0 ||
        (t.mint || "").toLowerCase().indexOf(q) >= 0;
    });
    var key = state.sort;
    var dir = state.dir;
    out.sort(function (a, b) {
      var x, y;
      if (key === "sym") { x = (a.sym || "").toLowerCase(); y = (b.sym || "").toLowerCase(); return x < y ? -dir : x > y ? dir : 0; }
      x = a[key]; y = b[key];
      if (x == null || x !== x) x = -Infinity;
      if (y == null || y !== y) y = -Infinity;
      return (x - y) * dir;
    });
    return out;
  }

  function renderScan() {
    var list = filterSort(state.tokens);
    var ul = $("scan-list");
    var ph = $("scan-ph");
    var cnt = $("scan-count");
    if (cnt) cnt.textContent = list.length + " token" + (state.tokens.length ? "" : " · premi Aggiorna per caricare DexScreener");
    if (!state.tokens.length) {
      if (ul) ul.innerHTML = "";
      if (ph) ph.hidden = false;
      return;
    }
    if (ph) ph.hidden = true;
    ul.innerHTML = list.slice(0, 80).map(function (t) {
      var dex = t.dex ? '<span class="badge">' + esc(t.dex) + "</span>" : (t._stub ? '<span class="badge ro">profile</span>' : "");
      return '<li><div><div class="sym">' + esc(t.sym) + " " + dex + '</div><div class="nm">' +
        esc(t.name) + (t.mint ? " · " + esc(t.mint.slice(0, 6)) + "…" + esc(t.mint.slice(-4)) : "") +
        '</div></div><div class="px">' +
        (t.mc != null ? "MC " + nf(t.mc, 0) : "—") +
        (function(){var links=[]; if(t.url) links.push('<a href="'+esc(t.url)+'" target="_blank" rel="noopener">DexScreener</a>'); if(t.mint) links.push('<a href="https://solscan.io/token/'+esc(t.mint)+'" target="_blank" rel="noopener">Solscan</a>'); return links.length?'<div class="nm">'+links.join(" · ")+"</div>":"";})() +
        "</div></li>";
    }).join("");
  }

  function renderStrategies(d) {
    var meta = $("carte-meta");
    var ph = $("carte-ph");
    var ul = $("carte-list");
    var warn = (d && d.pnl_warning) || {};
    document.querySelectorAll("#carte-stats .stat").forEach(function (el) {
      var k = el.getAttribute("data-strat");
      var b = el.querySelector("b");
      if (!d || !b) { if (b) b.textContent = "—"; return; }
      var s = (d.strategies && d.strategies[k]) || (k === "v1" ? d.v1 : null);
      var pnl = null;
      if (s) {
        if (typeof s.pnl === "number") pnl = s.pnl;
        else if (typeof s.pnl_totale === "number") pnl = s.pnl_totale;
        else if (typeof s.total_pnl === "number") pnl = s.total_pnl;
      }
      var label;
      if (pnl != null) label = nf(pnl, 2) + " $";
      else if (k === "v1" && s && s.cycles != null) label = nf(s.cycles, 0) + " cicli";
      else label = "—";
      b.textContent = label;
      var sub = el.querySelector(":scope > .stat-sub");
      if (!sub) {
        sub = document.createElement("span");
        sub.className = "stat-sub";
        sub.style.cssText = "display:block;font-size:11px;color:var(--muted);margin-top:2px";
        // inserisci prima di eventuali badge
        el.appendChild(sub);
      }
      if (k === "v1" && s && typeof s.trades === "number") {
        sub.textContent = s.trades + " trade paper";
      } else if (s && (s.n != null || s.wins != null)) {
        var nTr = s.n != null ? s.n : 0;
        var nWin = s.wins != null ? s.wins : 0;
        sub.textContent = nTr + " trade · " + nWin + " vincenti";
      } else {
        sub.textContent = "";
      }
      el.querySelectorAll(":scope > .badge").forEach(function (x) { x.remove(); });
      if (warn[k]) el.insertAdjacentHTML("beforeend", ' <span class="badge">PnL non affidabile</span>');
    });
    if (!d) {
      if (meta) meta.textContent = "live_mode = false · bot_data.public.json non caricato";
      if (ph) ph.hidden = false;
      if (ul) ul.innerHTML = "";
      return;
    }
    if (ph) ph.hidden = true;
    var unreliable = !!(warn.copy || warn.reentry || d._pnl_unreliable || d._warn_pump_pnl);
    if (meta) {
      meta.innerHTML = "live_mode = <b>false</b> · aggiornato " + esc(d.updated || "—") +
        (unreliable ? ' · <span class="badge">PnL non affidabile</span>' : "") +
        (d._forced_ro ? " · forzato read-only" : "");
      if (warn.note) meta.innerHTML += '<div class="nm">' + esc(warn.note) + "</div>";
    }
    var opensObj = d.open_positions || {};
    var opens = Array.isArray(opensObj) ? opensObj : Object.keys(opensObj).map(function (k) {
      var p = opensObj[k] || {};
      return Object.assign({ id: k }, p);
    });
    if (ul) {
      if (!opens.length) {
        ul.innerHTML = '<li><div class="nm">Nessuna posizione paper aperta nello snapshot.</div></li>';
      } else {
        ul.innerHTML = opens.slice(0, 40).map(function (p) {
          return '<li><div><div class="sym">' + esc(p.sym || "?") +
            (p.strategy ? ' <span class="badge">' + esc(p.strategy) + "</span>" : "") +
            '</div><div class="nm">' + esc((p.mint || "").slice(0, 10)) + "…</div></div>" +
            '<div class="px">' + nf(p.pnl != null ? p.pnl : p.pnl_mtm, 2) + " $</div></li>";
        }).join("");
      }
    }
  }

  function setStatus(msg) {
    var el = $("scan-status");
    if (el) el.textContent = msg || "";
  }

  async function loadScannerFallback() {
    // Fallback locale se DexScreener non raggiungibile (CORS/rete). Nessuna chiave.
    try {
      var r = await fetch(PAPER.scanner + "?t=" + Date.now(), { credentials: "omit", cache: "no-store" });
      if (!r.ok) return [];
      var j = await r.json();
      var toks = (j && j.tokens) || {};
      return Object.keys(toks).map(function (m) {
        var t = toks[m] || {};
        return {
          mint: t.mint || m,
          sym: t.sym || "?",
          name: t.name || "",
          mc: t.mc,
          vol: t.vol,
          h1: t.h1,
          price: t.price,
          dex: t.dex || "",
          chain: "solana",
          bonding: t.dex === "pumpfun",
          url: t.url || ("https://dexscreener.com/solana/" + (t.mint || m)),
          score: t.score,
          risks: t.risks || [],
          ok: t.ok,
          _fallback: true
        };
      });
    } catch (e) { return []; }
  }

  async function refreshScan() {
    setStatus("Carico DexScreener (bonding curve)…");
    $("scan-refresh").disabled = true;
    try {
      var profiles = await fetchProfiles();
      var mapped = profiles.map(fromProfileStub).filter(Boolean);
      var mints = [];
      var seen = {};
      mapped.forEach(function (t) {
        if (t.mint && !seen[t.mint]) { seen[t.mint] = 1; mints.push(t.mint); }
      });
      var byMint = {};
      for (var i = 0; i < Math.min(mints.length, 60); i += 30) {
        var pairs = await fetchTokenPairs(mints.slice(i, i + 30));
        pairs.forEach(function (p) {
          var n = normalizePair(p);
          if (!n || !n.mint || n.chain !== "solana") return;
          // Preferisci pumpfun (ancora in bonding) su altri dex dello stesso mint
          var prev = byMint[n.mint];
          if (!prev || (n.dex === "pumpfun" && prev.dex !== "pumpfun")) byMint[n.mint] = n;
        });
      }
      state.tokens = mints.map(function (m) { return byMint[m]; }).filter(Boolean);
      // Default: mostra prima chi è ancora in bonding curve
      state.tokens.sort(function (a, b) {
        var ba = a.bonding ? 1 : 0, bb = b.bonding ? 1 : 0;
        if (ba !== bb) return bb - ba;
        return (b.vol || 0) - (a.vol || 0);
      });
      var nBond = state.tokens.filter(function (t) { return t.bonding; }).length;
      if (!state.tokens.length) {
        var fb = await loadScannerFallback();
        if (fb.length) {
          state.tokens = fb;
          nBond = state.tokens.filter(function (t) { return t.bonding || t.dex === "pumpfun"; }).length;
          setStatus("CORS/rete: fallback snapshot scanner.json · " + state.tokens.length + " token · " + nBond + " bonding");
        } else {
          setStatus("Nessun dato (rete/CORS?) e snapshot scanner.json vuoto.");
        }
      } else {
        setStatus(state.tokens.length + " Solana · " + nBond + " ancora in bonding (pumpfun)");
      }
      renderScan();
    } catch (e) {
      var fb2 = await loadScannerFallback();
      if (fb2.length) {
        state.tokens = fb2;
        setStatus("Scan fallito · fallback scanner.json (" + state.tokens.length + " token)");
      } else {
        setStatus("Scan fallito in modo controllato. Placeholder attivo.");
        state.tokens = [];
      }
      renderScan();
    }
    $("scan-refresh").disabled = false;
    $("scan-clear").disabled = !state.tokens.length;
  }

  async function refreshPaper() {
    var d = await loadPaperBot();
    state.paper = d;
    renderStrategies(d);
  }

  function showTab(name) {
    state.tab = name;
    var scan = name === "scan";
    $("tab-scan").setAttribute("aria-selected", scan ? "true" : "false");
    $("tab-carte").setAttribute("aria-selected", scan ? "false" : "true");
    $("panel-scan").classList.toggle("on", scan);
    $("panel-carte").classList.toggle("on", !scan);
    $("panel-scan").hidden = !scan;
    $("panel-carte").hidden = scan;
  }

  function bind() {
    $("tab-scan").addEventListener("click", function () { showTab("scan"); });
    $("tab-carte").addEventListener("click", function () { showTab("carte"); });
    $("scan-q").addEventListener("input", function (e) { state.q = e.target.value; renderScan(); });
    $("scan-dex").addEventListener("change", function (e) { state.dex = e.target.value; renderScan(); });
    $("scan-sort").addEventListener("change", function (e) { state.sort = e.target.value; renderScan(); });
    $("scan-dir").addEventListener("click", function () {
      state.dir = -state.dir;
      $("scan-dir").textContent = state.dir < 0 ? "↓" : "↑";
      $("scan-dir").dataset.dir = String(state.dir);
      renderScan();
    });
    $("scan-refresh").addEventListener("click", refreshScan);
    $("scan-clear").addEventListener("click", function () {
      state.tokens = [];
      renderScan();
      setStatus("");
      $("scan-clear").disabled = true;
    });
  }

  var NHScan = {
    DS: DS,
    PAPER: PAPER,
    fetchProfiles: fetchProfiles,
    fetchTokenPairs: fetchTokenPairs,
    normalizePair: normalizePair,
    loadPaperBot: loadPaperBot,
    renderStrategies: renderStrategies,
    renderScan: renderScan,
    loadScannerFallback: loadScannerFallback,
    getState: function () { return state; }
  };
  window.NHScan = NHScan;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { bind(); renderScan(); renderStrategies(null); refreshPaper(); });
  } else {
    bind(); renderScan(); renderStrategies(null); refreshPaper();
  }
})();
