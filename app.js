(function(){
"use strict";
let S=null;
const DAY=864e5,MIN_BID=0.01;
let lang="it";try{lang=localStorage.getItem("nh-lang")||(navigator.language||"it").slice(0,2);if(lang!=="it")lang="en"}catch(e){}
const T={
 it:{lead:"Account della testnet di NEAR con nomi già cercati sui marketplace reali. Pensati per sviluppatori che vogliono il nome giusto anche in fase di test.",
  notice:"<b>Sono account della TESTNET.</b> Non hanno valore economico: chiunque può creare account testnet gratis tramite faucet, e la testnet di NEAR può essere azzerata. Il pagamento avviene in NEAR veri (mainnet). Se non consegniamo entro 48 ore, rimborsiamo.",
  names:"nomi",fixed:"a prezzo fisso",auctions:"all'asta",sold:"venduti",search:"Cerca un nome, es. agent",
  all:"Tutti",fix:"Prezzo fisso",auc:"Aste",sld:"Venduti",sortP:"Prezzo più alto",sortA:"A–Z",
  buy:"Compra",bid:"Offri",soldBtn:"Venduto",more:"Mostra altri",none:"Nessun nome trovato.",
  refSale:"venduto su mainnet a",refOffer:"offerta su mainnet",base:"base",offers:"offerte",offer:"offerta",ends:"chiude tra",days:"g",hours:"h",closed:"asta chiusa",noBids:"nessuna offerta",
  rate:"Cambio usato",upd:"aggiornato il",close:"Chiudi",minBid:"Offerta minima",
  howBuy:["Apri il bot e premi Avvia.","Il bot ti chiede l'account NEAR da cui paghi e ti indica l'importo.","Paghi e mandi al bot l'hash della transazione: il bot verifica e ti consegna l'account in automatico."],
  howBid:["Apri il bot e premi Avvia.","Indichi il tuo account NEAR e l'offerta: compare subito qui.","Paghi solo se vinci: a fine asta il bot ti scrive con le istruzioni e poi consegna in automatico."],
  openBot:"Apri il bot su Telegram",help:"Problemi? Scrivi a",loadErr:"Non riesco a caricare il catalogo. Riprova tra poco.",
  footer:"Name Hunter · i prezzi dei nomi già venduti su mainnet partono da una percentuale del prezzo reale: 50% sotto 10 €, 40% fino a 50 €, 30% fino a 200 €, 20% fino a 1.000 €."},
 en:{lead:"NEAR testnet accounts with names already sought after on real marketplaces. Made for developers who want the right name while testing.",
  notice:"<b>These are TESTNET accounts.</b> They have no economic value: anyone can create testnet accounts for free with a faucet, and NEAR testnet may be reset. Payment is in real NEAR (mainnet). If we don't deliver within 48 hours, we refund.",
  names:"names",fixed:"fixed price",auctions:"in auction",sold:"sold",search:"Search a name, e.g. agent",
  all:"All",fix:"Fixed price",auc:"Auctions",sld:"Sold",sortP:"Highest price",sortA:"A–Z",
  buy:"Buy",bid:"Bid",soldBtn:"Sold",more:"Show more",none:"No names found.",
  refSale:"sold on mainnet for",refOffer:"bid on mainnet",base:"reserve",offers:"bids",offer:"bid",ends:"ends in",days:"d",hours:"h",closed:"auction closed",noBids:"no bids yet",
  rate:"Rate used",upd:"updated",close:"Close",minBid:"Minimum bid",
  howBuy:["Open the bot and tap Start.","The bot asks for the NEAR account you pay from and tells you the amount.","Pay and send the bot the transaction hash: it verifies and delivers the account automatically."],
  howBid:["Open the bot and tap Start.","Enter your NEAR account and your bid: it shows up here right away.","You pay only if you win: when the auction ends the bot messages you and then delivers automatically."],
  openBot:"Open the bot on Telegram",help:"Need help? Write to",loadErr:"Can't load the catalog. Try again shortly.",
  footer:"Name Hunter · names already sold on mainnet start from a share of the real price: 50% under €10, 40% up to €50, 30% up to €200, 20% up to €1,000."}};
const t=k=>T[lang][k];
const nf=(x,d)=>(+x).toLocaleString(lang==="it"?"it-IT":"en-GB",{maximumFractionDigits:d==null?3:d});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const $=s=>document.querySelector(s);
const round=x=>x>=10?Math.round(x):x>=1?Math.round(x*10)/10:Math.max(MIN_BID,Math.round(x*100)/100);
const tier=e=>e<10?.5:e<50?.4:e<200?.3:e<1000?.2:null;
function info(n,main,kind){
  const o=S.override[n]||{},sold=S.venduti[n];
  if(o.nascosto)return {k:"hidden"};
  if(sold)return {k:"sold",near:sold.p};
  if(o.near!=null)return {k:"fix",near:o.near,main,kind};
  if(o.eur!=null)return {k:"fix",near:round(o.eur/S.eur),main,kind};
  if(!o.asta&&main&&kind!=="o"){const p=tier(main*S.eur);if(p)return {k:"fix",near:round(main*p),main,pct:p,kind}}
  const a=S.aste[n]||{o:[]},top=a.o.reduce((m,x)=>Math.max(m,x[1]),0);
  return {k:"auc",near:top||MIN_BID,top,count:a.o.length,fine:a.fine||null,main,kind};
}
let filtro="all",ordine="price",q="",shown=60,sheetName=null;
const all=()=>S.nomi.map(([n,m,k])=>({n,...info(n,m,k)})).filter(x=>x.k!=="hidden");
function left(f){const ms=f-Date.now();if(ms<=0)return t("closed");const d=Math.floor(ms/DAY),h=Math.floor(ms%DAY/36e5);return t("ends")+" "+(d?d+" "+t("days")+" ":"")+h+" "+t("hours")}
function metaOf(x){
  const ref=x.main?t(x.kind==="o"?"refOffer":"refSale")+" "+nf(x.main)+" Ⓝ":"";
  if(x.k==="sold")return '<span class="tag sold">'+t("sld")+"</span>";
  if(x.k==="fix")return '<span class="tag fix">'+t("fix")+"</span>"+ref+(x.pct?" · "+Math.round(x.pct*100)+"%":"");
  return '<span class="tag auc">'+t("auc")+"</span>"+(x.count?x.count+" "+(x.count===1?t("offer"):t("offers"))+(x.fine?" · "+left(x.fine):""):t("noBids")+" · "+t("base")+" "+nf(MIN_BID)+" Ⓝ")+(ref?" · "+ref:"");
}
function render(){
  if(!S)return;
  const A=all(),nFix=A.filter(x=>x.k==="fix").length,nAuc=A.filter(x=>x.k==="auc").length,nSold=A.filter(x=>x.k==="sold").length;
  const list=A.filter(x=>(filtro==="all"&&x.k!=="sold")||x.k===filtro).filter(x=>!q||x.n.includes(q)).sort((a,b)=>ordine==="az"?a.n.localeCompare(b.n):(b.near-a.near)||a.n.localeCompare(b.n));
  const vis=list.slice(0,shown);
  $("#root").innerHTML='<div class="wrap"><header class="top"><div><h1>Name Hunter <span class="tn">.testnet</span></h1><p class="lead">'+t("lead")+'</p></div>'+
   '<div class="lang" role="group" aria-label="Language"><button type="button" data-lang="it" aria-pressed="'+(lang==="it")+'">IT</button><button type="button" data-lang="en" aria-pressed="'+(lang==="en")+'">EN</button></div></header>'+
   '<div class="notice" role="note">'+t("notice")+'</div>'+
   '<div class="stats"><span><strong>'+nf(A.length-nSold,0)+"</strong>"+t("names")+'</span><span><strong>'+nFix+"</strong>"+t("fixed")+'</span><span><strong>'+nAuc+"</strong>"+t("auctions")+'</span><span><strong>'+nSold+"</strong>"+t("sold")+'</span><span>'+t("rate")+": 1 Ⓝ = € "+nf(S.eur,2)+" · "+t("upd")+" "+esc(S.aggiornato)+"</span></div>"+
   '<div class="bar"><input id="q" class="search" type="search" autocomplete="off" spellcheck="false" placeholder="'+t("search")+'" value="'+esc(q)+'">'+
   '<div class="chips">'+[["all","all"],["fix","fix"],["auc","auc"],["sold","sld"]].map(([k,l])=>'<button type="button" class="chip" data-f="'+k+'" aria-pressed="'+(filtro===k)+'">'+t(l)+"</button>").join("")+
   '<select id="sort" class="sort" aria-label="Sort"><option value="price"'+(ordine==="price"?" selected":"")+">"+t("sortP")+'</option><option value="az"'+(ordine==="az"?" selected":"")+">"+t("sortA")+"</option></select></div></div>"+
   (vis.length?'<ul class="list">'+vis.map(x=>'<li class="item"><div class="acct">'+esc(x.n)+'<span class="sfx">.testnet</span></div><div class="meta">'+metaOf(x)+'</div><div class="price"><div><div class="pn">'+(x.k==="auc"&&!x.top?"≥ ":"")+nf(x.near)+' Ⓝ</div><div class="pe">≈ € '+nf(x.near*S.eur,2)+"</div></div>"+
     (x.k==="sold"?'<button type="button" class="btn ghost" disabled>'+t("soldBtn")+"</button>":'<button type="button" class="btn'+(x.k==="auc"?" auc":"")+'" data-open="'+esc(x.n)+'"'+(x.k==="auc"&&x.fine&&x.fine<Date.now()?" disabled":"")+">"+(x.k==="auc"?t("bid"):t("buy"))+"</button>")+"</div></li>").join("")+"</ul>":'<p class="empty">'+t("none")+"</p>")+
   (list.length>shown?'<div class="more"><button type="button" class="btn ghost" id="more">'+t("more")+" ("+(list.length-shown)+")</button></div>":"")+
   '<footer>'+t("footer")+"</footer></div>";
  if(sheetName)drawSheet();
}
function closeSheet(){sheetName=null;["#sheet","#scrim"].forEach(s=>{const e=$(s);if(e)e.remove()})}
function drawSheet(){
  const row=S.nomi.find(r=>r[0]===sheetName);if(!row)return closeSheet();
  const x={n:row[0],...info(row[0],row[1],row[2])};if(x.k==="sold"||x.k==="hidden")return closeSheet();
  const auc=x.k==="auc",minB=auc?(x.top?round(x.top*1.1+0.001):MIN_BID):x.near,steps=auc?t("howBid"):t("howBuy");
  const link="https://t.me/"+encodeURIComponent(S.bot)+"?start="+(auc?"bid_":"buy_")+encodeURIComponent(x.n);
  if(!$("#scrim")){const c=document.createElement("div");c.id="scrim";c.className="scrim";c.addEventListener("click",closeSheet);document.body.appendChild(c)}
  let el=$("#sheet");if(!el){el=document.createElement("div");el.id="sheet";el.className="sheet";el.setAttribute("role","dialog");document.body.appendChild(el)}
  el.setAttribute("aria-label",x.n+".testnet");
  el.innerHTML='<div class="in"><div class="row2"><h2>'+esc(x.n)+'<span style="color:var(--muted);font-weight:500">.testnet</span></h2><button type="button" class="btn ghost" id="s-close">'+t("close")+"</button></div>"+
   '<div class="meta">'+metaOf(x)+'</div><div><div class="pn">'+(auc?t("minBid")+" "+nf(minB):nf(x.near))+' Ⓝ</div><div class="pe">≈ € '+nf(minB*S.eur,2)+"</div></div>"+
   '<div class="botbox"><ol class="steps">'+steps.map(s=>"<li>"+s+"</li>").join("")+'</ol><a class="btn big" href="'+link+'" target="_blank" rel="noopener">'+t("openBot")+' @'+esc(S.bot)+'</a></div>'+
   '<p class="hint">'+t("help")+' <span class="copyline">@'+esc(S.tg)+"</span></p></div>";
  $("#s-close").addEventListener("click",closeSheet);
}
document.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
  if(b.dataset.lang){lang=b.dataset.lang;try{localStorage.setItem("nh-lang",lang)}catch(_){}render();return}
  if(b.dataset.f){filtro=b.dataset.f;shown=60;render();return}
  if(b.dataset.open){sheetName=b.dataset.open;drawSheet();return}
  if(b.id==="more"){shown+=60;render()}});
document.addEventListener("input",e=>{if(e.target.id==="q"){q=e.target.value.trim().toLowerCase().replace(/\.testnet$/,"");shown=60;const p=e.target.selectionStart;render();const i=$("#q");i.focus();try{i.setSelectionRange(p,p)}catch(_){}}});
document.addEventListener("change",e=>{if(e.target.id==="sort"){ordine=e.target.value;render()}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&sheetName)closeSheet()});
async function load(){
  try{const r=await fetch("stato.json?t="+Date.now(),{cache:"no-store"});if(!r.ok)throw 0;S=await r.json();render()}
  catch(e){if(!S)$("#root").innerHTML='<div class="wrap"><p class="skeleton">'+t("loadErr")+"</p></div>"}
}
load();setInterval(()=>{if(!document.hidden&&!sheetName)load()},60000);
})();
