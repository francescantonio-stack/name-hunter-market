// Pannello inquilino: usa un nome NEAR preso in affitto su Name Hunter.
// La chiave dell'inquilino resta solo in questo browser (localStorage).
const NEAR_JS = "https://cdn.jsdelivr.net/npm/near-api-js@7.3.1/+esm";
const RPC = { testnet: "https://rpc.testnet.fastnear.com", mainnet: "https://free.rpc.fastnear.com" };
const EXPL = { testnet: "https://testnet.nearblocks.io/txns/", mainnet: "https://nearblocks.io/txns/" };
const BOT = "NameHunterMarketBot";
const TGAS = 10n ** 12n, Y = 10n ** 24n;
const K_KEY = "nh-inq-key", K_NOME = "nh-inq-nome";

let lang = "it";
try { lang = localStorage.getItem("nh-lang") || (navigator.language || "it").slice(0, 2); if (lang !== "it") lang = "en"; } catch {}
const T = {
  it: {
    title: "Pannello <span>inquilino</span>", lead: "Usa il nome che hai in affitto: ricevi e invia NEAR, usa contratti e app. Tutto viene firmato qui, con la tua chiave.",
    back: "← Torna al market", k1: "1 · La tua chiave", kNone: "Crea una chiave: la manderai al bot quando affitti. Resta solo in questo browser, nessuno la vede.",
    create: "Crea chiave", import: "Importa chiave", importPh: "ed25519:… (chiave segreta salvata prima)", doImport: "Usa questa chiave",
    pub: "Chiave pubblica (da dare al bot)", copy: "Copia", copied: "Copiata", export: "Mostra chiave segreta (backup)",
    exportWarn: "Chi ha questa chiave può usare il tuo nome. Salvala in un posto sicuro e non darla a nessuno, nemmeno a noi.",
    del: "Elimina chiave da questo browser", delSure: "Sicuro? Tocca di nuovo", n2: "2 · Il tuo nome", nPh: "es. vpn.testnet o mario.dominio.near",
    open: "Apri", notOurs: "Questo account non ha un affitto Name Hunter.", noLease: "Questo nome al momento non è affittato (o l'affitto è finito).",
    wrongKey: "La chiave di questo browser non è quella dell'affitto. Hai importato la chiave giusta? Se l'hai persa scrivi al bot: può sostituirla.",
    fase: { attivo: "Attivo", tolleranza: "In tolleranza", scaduto: "Scaduto" }, until: "Scade il", left: "giorni rimasti", spend: "Spendibili", tot: "Saldo sul nome",
    graceInfo: "L'affitto è scaduto: hai ancora pochi giorni per rinnovare o ritirare i tuoi NEAR.",
    recv: "Per ricevere NEAR usa l'indirizzo", renew: "Per rinnovare scrivi al bot", send: "Invia NEAR", to: "Destinatario", amt: "Importo (NEAR)",
    doSend: "Invia", call: "Usa un contratto (avanzato)", ctr: "Contratto", meth: "Metodo", args: "Argomenti (JSON)", dep: "Deposito (NEAR)", gas: "Gas (Tgas, max 250)", doCall: "Esegui",
    wrap: "Esempio: converti NEAR in wNEAR", apps: "App autorizzate (avanzato)", appsNone: "Nessuna app autorizzata.", appKey: "Chiave pubblica dell'app", appCtr: "Contratto dell'app",
    appMeth: "Metodi (separati da virgola, vuoto = tutti)", appLim: "Limite gas (NEAR)", doApp: "Autorizza", revoke: "Revoca",
    working: "Firmo e invio…", done: "Fatto.", seeTx: "vedi transazione", err: "Errore", badNum: "Importo non valido", badJson: "Argomenti non sono JSON valido",
    terms: "Il nome resta di Name Hunter; tu lo usi per il periodo pagato. I NEAR che versi sul nome restano tuoi: a fine affitto ti tornano in automatico. Token e NFT lasciati sul nome dopo la fine non vengono restituiti.",
  },
  en: {
    title: "Tenant <span>panel</span>", lead: "Use the name you rent: receive and send NEAR, use contracts and apps. Everything is signed here, with your key.",
    back: "← Back to market", k1: "1 · Your key", kNone: "Create a key: you'll send it to the bot when you rent. It stays only in this browser, nobody sees it.",
    create: "Create key", import: "Import key", importPh: "ed25519:… (secret key saved earlier)", doImport: "Use this key",
    pub: "Public key (give it to the bot)", copy: "Copy", copied: "Copied", export: "Show secret key (backup)",
    exportWarn: "Whoever has this key can use your name. Keep it safe and never share it, not even with us.",
    del: "Delete key from this browser", delSure: "Sure? Tap again", n2: "2 · Your name", nPh: "e.g. vpn.testnet or mario.domain.near",
    open: "Open", notOurs: "This account has no Name Hunter rental.", noLease: "This name is not rented right now (or the rental ended).",
    wrongKey: "This browser's key is not the rental key. Did you import the right one? If you lost it, message the bot: it can replace it.",
    fase: { attivo: "Active", tolleranza: "Grace period", scaduto: "Expired" }, until: "Expires", left: "days left", spend: "Spendable", tot: "Balance on name",
    graceInfo: "The rental has expired: you still have a few days to renew or withdraw your NEAR.",
    recv: "To receive NEAR use the address", renew: "To renew open the bot and type", send: "Send NEAR", to: "Recipient", amt: "Amount (NEAR)",
    doSend: "Send", call: "Use a contract (advanced)", ctr: "Contract", meth: "Method", args: "Arguments (JSON)", dep: "Deposit (NEAR)", gas: "Gas (Tgas, max 250)", doCall: "Run",
    wrap: "Example: wrap NEAR into wNEAR", apps: "Authorized apps (advanced)", appsNone: "No authorized apps.", appKey: "App public key", appCtr: "App contract",
    appMeth: "Methods (comma separated, empty = all)", appLim: "Gas limit (NEAR)", doApp: "Authorize", revoke: "Revoke",
    working: "Signing and sending…", done: "Done.", seeTx: "view transaction", err: "Error", badNum: "Invalid amount", badJson: "Arguments are not valid JSON",
    terms: "The name stays with Name Hunter; you use it for the paid period. NEAR you deposit on the name stay yours: they come back automatically when the rental ends. Tokens and NFTs left on the name after the end are not returned.",
  },
};
const t = (k) => T[lang][k];
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const store = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} } };
const netOf = (id) => (/\.testnet$/.test(id) ? "testnet" : "mainnet");
const fmt = (y, d = 4) => { const v = BigInt(y); const i = v / Y; const f = (v % Y).toString().padStart(24, "0").slice(0, d).replace(/0+$/, ""); return (lang === "it" ? i.toLocaleString("it-IT") : i.toLocaleString("en-GB")) + (f ? (lang === "it" ? "," : ".") + f : ""); };
const toY = (s) => { s = String(s).trim().replace(",", "."); if (!/^\d+(\.\d{1,24})?$/.test(s)) throw new Error(t("badNum")); const [i, d = ""] = s.split("."); return BigInt(i) * Y + BigInt((d + "0".repeat(24)).slice(0, 24)); };

let N = null;
const nearjs = async () => (N ||= await import(NEAR_JS));
let S = { key: store.get(K_KEY), nome: store.get(K_NOME) || "", st: null, stErr: null, pub: null, showSecret: false, delArm: false, busy: false, out: null, outOk: true, importing: false };

async function pubKey() {
  if (!S.key) return null;
  const n = await nearjs();
  return n.KeyPair.fromString(S.key).getPublicKey().toString();
}

async function rpcStato(id) {
  const r = await fetch(RPC[netOf(id)], {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "query", params: { request_type: "call_function", finality: "optimistic", account_id: id, method_name: "stato", args_base64: btoa("{}") } }),
  }).then((x) => x.json());
  if (r.error || r.result?.error) return null;
  try { const j = JSON.parse(new TextDecoder().decode(new Uint8Array(r.result.result))); return j.versione ? j : null; } catch { return null; }
}

async function carica() {
  S.st = null; S.stErr = null;
  if (!S.nome) return render();
  S.stErr = "…"; render();
  try {
    const st = await rpcStato(S.nome);
    S.st = st; S.stErr = st ? null : t("notOurs");
  } catch (e) { S.stErr = String(e.message || e); }
  render();
}

function errore(e) {
  const m = String(e?.message || e);
  const p = m.match(/PANIC: ([^"\n]+)|panicked: ([^"\n]+)|Smart contract panicked: ([^"\n]+)/);
  return p ? (p[1] || p[2] || p[3]) : m.slice(0, 240);
}

async function firma(metodo, args) {
  S.busy = true; S.out = t("working"); S.outOk = true; render();
  try {
    const n = await nearjs();
    const net = netOf(S.nome);
    const acct = new n.Account(S.nome, new n.JsonRpcProvider({ url: RPC[net] }), S.key);
    const gas = metodo === "inq_chiama" ? BigInt(Math.min(300, Number(args.gas || 50) + 50)) * TGAS : 50n * TGAS;
    const r = await acct.signAndSendTransaction({ receiverId: S.nome, actions: [n.actions.functionCall(metodo, args, gas, 0n)] });
    const h = r?.transaction?.hash || r?.transaction_outcome?.id;
    S.out = t("done") + (h ? ` <a href="${EXPL[net]}${esc(h)}" target="_blank" rel="noopener">${t("seeTx")}</a>` : "");
    S.outOk = true;
    await new Promise((s) => setTimeout(s, 1200));
    S.st = await rpcStato(S.nome);
  } catch (e) {
    S.out = t("err") + ": " + esc(errore(e)); S.outOk = false;
  }
  S.busy = false; render();
}

function kpi(b, s) { return `<div class="kpi"><b>${b}</b><span>${s}</span></div>`; }

function viewKey() {
  if (!S.key) return `<section class="card"><h2>${t("k1")}</h2><p class="hint">${t("kNone")}</p>
    <div class="actions"><button class="btn" id="k-new">${t("create")}</button><button class="btn ghost" id="k-imp">${t("import")}</button></div>
    ${S.importing ? `<div class="field"><textarea id="k-imp-v" placeholder="${t("importPh")}" spellcheck="false" autocomplete="off"></textarea></div><div class="actions"><button class="btn" id="k-imp-go">${t("doImport")}</button></div>` : ""}
    <p class="out ${S.outOk ? "" : "err"}">${S.importing && !S.outOk ? S.out || "" : ""}</p></section>`;
  return `<section class="card"><h2>${t("k1")}</h2>
    <div class="field"><label>${t("pub")}</label><div class="mono" id="k-pub">${esc(S.pub || "…")}</div></div>
    <div class="actions"><button class="btn" id="k-copy">${t("copy")}</button><a class="btn ghost" href="https://t.me/${BOT}" target="_blank" rel="noopener">@${BOT}</a></div>
    <details ${S.showSecret ? "open" : ""} id="k-det"><summary>${t("export")}</summary><p class="hint">${t("exportWarn")}</p><div class="mono">${S.showSecret ? esc(S.key) : ""}</div></details>
    <div class="actions"><button class="btn bad" id="k-del">${S.delArm ? t("delSure") : t("del")}</button></div></section>`;
}

function viewNome() {
  let body = "";
  const st = S.st, a = st?.affitto;
  if (S.stErr) body = `<p class="hint">${esc(S.stErr)}</p>`;
  else if (st && !a) body = `<p class="hint">${t("noLease")}</p>`;
  else if (a && S.pub && a.inquilino !== S.pub) body = `<p class="notice">${t("wrongKey")}</p>`;
  else if (a) {
    const fine = Number(BigInt(a.scadenza) / 1000000n);
    const giorni = Math.max(0, Math.ceil((fine - Date.now()) / 864e5));
    const tag = a.fase === "attivo" ? "" : a.fase === "tolleranza" ? "warn" : "bad";
    const dis = !S.key || S.busy || a.fase === "scaduto" ? "disabled" : "";
    const disApp = dis || a.fase !== "attivo" ? "disabled" : "";
    body = `<div class="actions"><span class="tag ${tag}">${t("fase")[a.fase]}</span><span class="hint">${esc(S.nome)}</span></div>
      ${a.fase === "tolleranza" ? `<p class="notice">${t("graceInfo")}</p>` : ""}
      <div class="kpis">${kpi(new Date(fine).toLocaleDateString(lang === "it" ? "it-IT" : "en-GB"), t("until") + " · " + giorni + " " + t("left"))}${kpi(fmt(a.disponibile) + " Ⓝ", t("spend"))}${kpi(fmt(st.saldo) + " Ⓝ", t("tot"))}</div>
      <p class="hint">${t("recv")} <b class="mono" style="display:inline;padding:2px 6px">${esc(S.nome)}</b> · ${t("renew")} <b>/rinnova ${esc(S.nome)} 1m</b></p>
      <form class="card" id="f-send" style="padding:12px"><h2>${t("send")}</h2>
        <div class="grid2"><div class="field"><label for="s-a">${t("to")}</label><input id="s-a" required autocomplete="off" spellcheck="false" placeholder="amico.near"></div>
        <div class="field"><label for="s-i">${t("amt")}</label><input id="s-i" required inputmode="decimal" placeholder="0,5"></div></div>
        <div class="actions"><button class="btn" ${dis}>${t("doSend")}</button></div></form>
      <details class="card" style="padding:12px"><summary>${t("call")}</summary>
        <form id="f-call" style="display:grid;gap:10px;margin-top:10px">
        <div class="grid2"><div class="field"><label for="c-c">${t("ctr")}</label><input id="c-c" required autocomplete="off" spellcheck="false"></div>
        <div class="field"><label for="c-m">${t("meth")}</label><input id="c-m" required autocomplete="off" spellcheck="false"></div></div>
        <div class="field"><label for="c-a">${t("args")}</label><textarea id="c-a" spellcheck="false">{}</textarea></div>
        <div class="grid2"><div class="field"><label for="c-d">${t("dep")}</label><input id="c-d" inputmode="decimal" value="0"></div>
        <div class="field"><label for="c-g">${t("gas")}</label><input id="c-g" inputmode="numeric" value="50"></div></div>
        <div class="actions"><button class="btn" ${dis}>${t("doCall")}</button><button type="button" class="btn ghost" id="c-wrap">${t("wrap")}</button></div></form></details>
      <details class="card" style="padding:12px"><summary>${t("apps")}</summary>
        ${a.app.length ? `<ul class="apps" style="margin-top:10px">${a.app.map((k) => `<li><span class="mono">${esc(k)}</span><button class="btn ghost" data-revoke="${esc(k)}" ${dis}>${t("revoke")}</button></li>`).join("")}</ul>` : `<p class="hint">${t("appsNone")}</p>`}
        <form id="f-app" style="display:grid;gap:10px;margin-top:10px">
        <div class="field"><label for="p-k">${t("appKey")}</label><input id="p-k" required autocomplete="off" spellcheck="false" placeholder="ed25519:…"></div>
        <div class="grid2"><div class="field"><label for="p-c">${t("appCtr")}</label><input id="p-c" required autocomplete="off" spellcheck="false"></div>
        <div class="field"><label for="p-l">${t("appLim")}</label><input id="p-l" inputmode="decimal" value="0,25"></div></div>
        <div class="field"><label for="p-m">${t("appMeth")}</label><input id="p-m" autocomplete="off" spellcheck="false"></div>
        <div class="actions"><button class="btn" ${disApp}>${t("doApp")}</button></div></form></details>`;
  }
  return `<section class="card"><h2>${t("n2")}</h2>
    <form class="actions" id="f-nome" style="flex-wrap:nowrap"><input id="n-v" value="${esc(S.nome)}" placeholder="${t("nPh")}" autocomplete="off" spellcheck="false" aria-label="${t("n2")}"><button class="btn">${t("open")}</button></form>
    ${body}<p class="out ${S.outOk ? "ok" : "err"}">${S.out || ""}</p></section>`;
}

function render() {
  const f = document.activeElement?.id;
  $("#root").innerHTML = `<header class="top"><div><h1>${t("title")}</h1><p class="lead">${t("lead")}</p></div>
    <div class="lang" role="group" aria-label="Language"><button type="button" data-lang="it" aria-pressed="${lang === "it"}">IT</button><button type="button" data-lang="en" aria-pressed="${lang === "en"}">EN</button></div></header>
    <p class="hint"><a href="./">${t("back")}</a></p>${viewKey()}${viewNome()}<p class="hint">${t("terms")}</p>`;
  if (f && $("#" + f) && !["k-copy"].includes(f)) $("#" + f).focus();
}

document.addEventListener("click", async (e) => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.lang) { lang = b.dataset.lang; store.set("nh-lang", lang); return render(); }
  if (b.id === "k-new") { const n = await nearjs(); S.key = n.KeyPair.fromRandom("ed25519").toString(); store.set(K_KEY, S.key); S.pub = await pubKey(); S.showSecret = true; return render(); }
  if (b.id === "k-imp") { S.importing = !S.importing; return render(); }
  if (b.id === "k-imp-go") {
    const v = $("#k-imp-v").value.trim();
    try { const n = await nearjs(); n.KeyPair.fromString(v); S.key = v; store.set(K_KEY, v); S.pub = await pubKey(); S.importing = false; S.out = null; }
    catch { S.out = t("err") + ": ed25519:…"; S.outOk = false; }
    return render();
  }
  if (b.id === "k-copy") { try { await navigator.clipboard.writeText(S.pub); b.textContent = t("copied"); } catch {} return; }
  if (b.id === "k-del") { if (!S.delArm) { S.delArm = true; return render(); } store.set(K_KEY, null); S.key = null; S.pub = null; S.delArm = false; S.showSecret = false; return render(); }
  if (b.id === "c-wrap") { $("#c-c").value = netOf(S.nome) === "testnet" ? "wrap.testnet" : "wrap.near"; $("#c-m").value = "near_deposit"; $("#c-a").value = "{}"; $("#c-d").value = "0,1"; return; }
  if (b.dataset.revoke) return firma("inq_togli_chiave", { chiave: b.dataset.revoke });
});
document.addEventListener("toggle", (e) => { if (e.target.id === "k-det") S.showSecret = e.target.open; }, true);
document.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = e.target.id;
  if (id === "f-nome") { S.nome = $("#n-v").value.trim().toLowerCase(); store.set(K_NOME, S.nome); S.out = null; return carica(); }
  try {
    if (id === "f-send") return firma("inq_trasferisci", { a: $("#s-a").value.trim().toLowerCase(), importo: String(toY($("#s-i").value)) });
    if (id === "f-call") {
      let args; try { args = JSON.parse($("#c-a").value || "{}"); } catch { throw new Error(t("badJson")); }
      return firma("inq_chiama", { contratto: $("#c-c").value.trim().toLowerCase(), metodo: $("#c-m").value.trim(), args, deposito: String(toY($("#c-d").value || "0")), gas: String(Math.max(1, Math.min(250, parseInt($("#c-g").value, 10) || 50))) });
    }
    if (id === "f-app") return firma("inq_chiave_app", { chiave: $("#p-k").value.trim(), contratto: $("#p-c").value.trim().toLowerCase(), metodi: $("#p-m").value.replace(/\s+/g, ""), limite: String(toY($("#p-l").value || "0,25")) });
  } catch (err) { S.out = t("err") + ": " + esc(err.message); S.outOk = false; render(); }
});

(async () => {
  render();
  if (S.key) { try { S.pub = await pubKey(); } catch { S.key = null; } }
  const q = new URLSearchParams(location.search).get("nome");
  if (q) { S.nome = q.toLowerCase(); store.set(K_NOME, S.nome); }
  render();
  if (S.nome) carica();
})();
