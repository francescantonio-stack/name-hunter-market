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
  rent:"Affitta",from:"da",perDay:"al giorno",once:"pagamento unico",rentedTag:"In affitto",rentedUntil:"affittato fino al",months:"Durata",total:"Totale",
  rentLead:"Il nome resta di Name Hunter: tu lo usi come tuo per il periodo pagato (ricevi e invii NEAR, usi contratti e app).",
  howRent:["Apri il <a href=\"inquilino.html\" target=\"_blank\" rel=\"noopener\">Pannello inquilino</a> e crea la tua chiave: resta solo nel tuo browser.","Apri il bot: ti chiede la chiave pubblica e l'account NEAR da cui paghi.","Paghi e mandi l'hash: il bot attiva l'affitto in automatico. Poi usi il nome dal Pannello."],
  rentTerms:"Paghi tutto subito. Dopo la scadenza hai da 1 a 3 giorni (in base alla durata) per rinnovare o ritirare i tuoi NEAR; poi l'affitto si chiude e i NEAR che hai versato sul nome ti tornano in automatico. Token e NFT lasciati sul nome dopo la fine non vengono restituiti.",
  subTitle:"Affitta un sottonome",subLead:"Un nome tuo sotto i nostri domini, es. mario.dominio. Viene creato quando paghi.",subCheck:"Verifica",subFree:"Libero",subTaken:"Già preso",subBad:"Solo lettere minuscole, numeri, - e _ (da 2 a 32 caratteri).",subErr:"Verifica non riuscita, riprova.",panel:"Pannello inquilino",mainTitle:"Nomi .near in affitto",mainLead:"Nomi veri della mainnet NEAR, da usare come tuoi per il periodo pagato.",
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
  rent:"Rent",from:"from",perDay:"per day",once:"one-off payment",rentedTag:"Rented",rentedUntil:"rented until",months:"Duration",total:"Total",
  rentLead:"The name stays with Name Hunter: you use it as yours for the paid period (receive and send NEAR, use contracts and apps).",
  howRent:["Open the <a href=\"inquilino.html\" target=\"_blank\" rel=\"noopener\">Tenant panel</a> and create your key: it stays only in your browser.","Open the bot: it asks for your public key and the NEAR account you pay from.","Pay and send the hash: the bot activates the rental automatically. Then use the name from the panel."],
  rentTerms:"You pay everything upfront. After expiry you have 1 to 3 days (depending on the duration) to renew or withdraw your NEAR; then the rental closes and the NEAR you deposited on the name come back to you automatically. Tokens and NFTs left on the name after the end are not returned.",
  subTitle:"Rent a sub-name",subLead:"Your own name under our domains, e.g. mario.domain. It is created when you pay.",subCheck:"Check",subFree:"Available",subTaken:"Taken",subBad:"Only lowercase letters, digits, - and _ (2 to 32 characters).",subErr:"Check failed, try again.",panel:"Tenant panel",mainTitle:".near names for rent",mainLead:"Real NEAR mainnet names, yours to use for the paid period.",
  footer:"Name Hunter · names already sold on mainnet start from a share of the real price: 50% under €10, 40% up to €50, 30% up to €200, 20% up to €1,000."}};
const t=k=>T[lang][k];
const nf=(x,d)=>(+x).toLocaleString(lang==="it"?"it-IT":"en-GB",{maximumFractionDigits:d==null?3:d});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const $=s=>document.querySelector(s);
const round=x=>x>=10?Math.round(x):x>=1?Math.round(x*10)/10:Math.max(MIN_BID,Math.round(x*100)/100);
const tier=e=>e<10?.5:e<50?.4:e<200?.3:e<1000?.2:null;
function info(n,main,kind){
  const o=S.override[n]||{},sold=S.venduti[n];
  if(o.nascosto||(AC().padri||[]).includes(n+".testnet"))return {k:"hidden"};
  if(sold)return {k:"sold",near:sold.p};
  const af=rented(n+".testnet");
  if(af)return {k:"rented",fino:af.fino,near:o.near!=null?o.near:o.eur!=null?round(o.eur/S.eur):(main&&kind!=="o"&&tier(main*S.eur))?round(main*tier(main*S.eur)):MIN_BID,main,kind};
  if(o.near!=null)return {k:"fix",near:o.near,main,kind};
  if(o.eur!=null)return {k:"fix",near:round(o.eur/S.eur),main,kind};
  if(!o.asta&&main&&kind!=="o"){const p=tier(main*S.eur);if(p)return {k:"fix",near:round(main*p),main,pct:p,kind}}
  const a=S.aste[n]||{o:[]},top=a.o.reduce((m,x)=>Math.max(m,x[1]),0);
  return {k:"auc",near:top||MIN_BID,top,count:a.o.length,fine:a.fine||null,main,kind};
}
// durate in giorni e percentuale del prezzo di vendita, pagata tutta subito (stesse regole del bot)
const AC=()=>{const d={min:.01,durate:[[1,.05],[3,.1],[7,.2],[30,.3],[90,.5],[180,.55],[365,.6]],sotto:{testnet:{base:.1},mainnet:{base:1}},padri:[],main_nomi:[]},c=S.affitti_cfg||{};return {...d,...c,sotto:{...d.sotto,...(c.sotto||{})}}};
const DUR={it:{1:"1 giorno",3:"3 giorni",7:"1 settimana",30:"1 mese",90:"3 mesi",180:"6 mesi",365:"1 anno"},en:{1:"1 day",3:"3 days",7:"1 week",30:"1 month",90:"3 months",180:"6 months",365:"1 year"}};
const durTxt=g=>DUR[lang][g]||g+(lang==="it"?" giorni":" days");
const r2=x=>Math.max(.01,Math.round(x*100)/100);
const rentPrice=(base,g)=>{const d=AC().durate.find(z=>z[0]===g);return d?r2(Math.max(AC().min,base*d[1])):null};
const rentBase=x=>x.k==="fix"?x.near:MIN_BID;
const rentFrom=base=>rentPrice(base,AC().durate[0][0]);
const subBase=net=>(AC().sotto[net]||{}).base||1;
const netOf=id=>/\.testnet$/.test(id)?"testnet":"mainnet";
function rented(id){const a=(S.affitti||{})[id];return a&&a.fino+(a.toll||3*DAY)>Date.now()?a:null}
const dShort=ms=>new Date(ms).toLocaleDateString(lang==="it"?"it-IT":"en-GB",{day:"numeric",month:"short",year:"numeric"});
let filtro="all",ordine="price",q="",shown=60,sheetName=null,sheetMode="buy",rentG=30,subL="",subP=0,subRes=null;
const all=()=>S.nomi.map(([n,m,k])=>({n,...info(n,m,k)})).filter(x=>x.k!=="hidden");
function left(f){const ms=f-Date.now();if(ms<=0)return t("closed");const d=Math.floor(ms/DAY),h=Math.floor(ms%DAY/36e5);return t("ends")+" "+(d?d+" "+t("days")+" ":"")+h+" "+t("hours")}
function metaOf(x){
  const ref=x.main?t(x.kind==="o"?"refOffer":"refSale")+" "+nf(x.main)+" Ⓝ":"";
  if(x.k==="sold")return '<span class="tag sold">'+t("sld")+"</span>";
  if(x.k==="rented")return '<span class="tag rent">'+t("rentedTag")+"</span>"+t("rentedUntil")+" "+dShort(x.fino);
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
   '<div class="stats"><span><strong>'+nf(A.length-nSold,0)+"</strong>"+t("names")+'</span><span><strong>'+nFix+"</strong>"+t("fixed")+'</span><span><strong>'+nAuc+"</strong>"+t("auctions")+'</span><span><strong>'+nSold+"</strong>"+t("sold")+'</span><span>'+t("rate")+": 1 Ⓝ = € "+nf(S.eur,2)+" · "+t("upd")+" "+esc(S.aggiornato)+"</span></div>"+subBox()+
   '<div class="bar"><input id="q" class="search" type="search" autocomplete="off" spellcheck="false" placeholder="'+t("search")+'" value="'+esc(q)+'">'+
   '<div class="chips">'+[["all","all"],["fix","fix"],["auc","auc"],["sold","sld"]].map(([k,l])=>'<button type="button" class="chip" data-f="'+k+'" aria-pressed="'+(filtro===k)+'">'+t(l)+"</button>").join("")+
   '<select id="sort" class="sort" aria-label="Sort"><option value="price"'+(ordine==="price"?" selected":"")+">"+t("sortP")+'</option><option value="az"'+(ordine==="az"?" selected":"")+">"+t("sortA")+"</option></select></div></div>"+
   (vis.length?'<ul class="list">'+vis.map(x=>'<li class="item"><div class="acct">'+esc(x.n)+'<span class="sfx">.testnet</span></div><div class="meta">'+metaOf(x)+'</div><div class="price"><div><div class="pn">'+(x.k==="auc"&&!x.top?"≥ ":"")+nf(x.near)+' Ⓝ</div><div class="pe">≈ € '+nf(x.near*S.eur,2)+"</div></div>"+
     (x.k==="rented"?'<button type="button" class="btn ghost" disabled>'+t("rentedTag")+"</button>":x.k==="sold"?'<button type="button" class="btn ghost" disabled>'+t("soldBtn")+"</button>":'<div class="btns">'+(x.k==="auc"&&x.top?"":'<button type="button" class="btn ghost sm" data-rent="'+esc(x.n)+'">'+t("rent")+" "+t("from")+" "+nf(rentFrom(rentBase(x)))+" Ⓝ</button>")+'<button type="button" class="btn'+(x.k==="auc"?" auc":"")+'" data-open="'+esc(x.n)+'"'+(x.k==="auc"&&x.fine&&x.fine<Date.now()?" disabled":"")+">"+(x.k==="auc"?t("bid"):t("buy"))+"</button></div>")+"</div></li>").join("")+"</ul>":'<p class="empty">'+t("none")+"</p>")+
   (list.length>shown?'<div class="more"><button type="button" class="btn ghost" id="more">'+t("more")+" ("+(list.length-shown)+")</button></div>":"")+
   '<footer>'+t("footer")+"</footer></div>";
  if(sheetName)drawSheet();
}
function closeSheet(){sheetName=null;["#sheet","#scrim"].forEach(s=>{const e=$(s);if(e)e.remove()})}
function mainBox(){
  const L=(AC().main_nomi||[]).filter(r=>!rented(r[0]));if(!L.length)return "";
  return '<section class="subbox"><h3>'+t("mainTitle")+'</h3><p class="hint">'+t("mainLead")+'</p><ul class="list">'+L.map(r=>'<li class="item"><div class="acct">'+esc(r[0].replace(/\.near$/,""))+'<span class="sfx">.near</span></div><div class="meta"><span class="tag rent">mainnet</span></div><div class="price"><div class="pn">'+t("from")+" "+nf(rentFrom(r[1]))+' Ⓝ</div><button type="button" class="btn" data-rentm="'+esc(r[0])+'">'+t("rent")+"</button></div></li>").join("")+"</ul></section>";
}
function subBox(){
  const P=AC().padri||[];if(!P.length)return mainBox();
  return '<section class="subbox"><h3>'+t("subTitle")+'</h3><p class="hint">'+t("subLead")+' · <a href="inquilino.html">'+t("panel")+'</a></p><div class="subrow"><input id="sub-l" class="search" autocomplete="off" spellcheck="false" placeholder="mario" value="'+esc(subL)+'" aria-label="'+t("subTitle")+'"><select id="sub-p" class="sort" aria-label="Domain">'+P.map((p,i)=>'<option value="'+i+'"'+(i===subP?" selected":"")+">."+esc(p)+"</option>").join("")+'</select><button type="button" class="btn" id="sub-go">'+t("subCheck")+'</button></div><div id="sub-out" class="hint" aria-live="polite">'+(subRes||"")+"</div></section>"+mainBox();
}
async function subCheck(){
  const P=AC().padri||[],padre=P[subP],l=subL;
  if(!/^[a-z0-9]+([_-][a-z0-9]+)*$/.test(l)||l.length<2||l.length>32){subRes=t("subBad");return render()}
  const id=l+"."+padre,net=netOf(padre),rpc=net==="testnet"?"https://rpc.testnet.fastnear.com":"https://free.rpc.fastnear.com";
  const call=(m,p)=>fetch(rpc,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:"query",params:{finality:"final",...p}})}).then(r=>r.json());
  subRes="…";render();
  try{
    const v=await call("query",{request_type:"view_account",account_id:id});
    let libero=!!(v.error&&/UNKNOWN_ACCOUNT|does not exist/i.test(JSON.stringify(v.error)));
    if(!libero&&v.result){const st=await call("query",{request_type:"call_function",account_id:id,method_name:"stato",args_base64:btoa("{}")});
      if(st.result){const j=JSON.parse(new TextDecoder().decode(new Uint8Array(st.result.result)));libero=j.affitto===null&&!rented(id)}}
    if(!libero&&!v.result&&v.error){subRes=t("subErr");return render()}
    if(libero){subRes='<b>'+esc(id)+"</b> · "+t("subFree");sheetMode="sub";rentG=30;sheetName=id;render();return}
    subRes='<b>'+esc(id)+"</b> · "+t("subTaken");render();
  }catch(e){subRes=t("subErr");render()}
}
function rentBody(base,start){
  const D=AC().durate;if(!D.some(d=>d[0]===rentG))rentG=D[Math.min(3,D.length-1)][0];
  const tot=rentPrice(base,rentG),link="https://t.me/"+encodeURIComponent(S.bot)+"?start="+start(rentG);
  return '<p class="hint">'+t("rentLead")+'</p><div class="chips" role="group" aria-label="'+t("months")+'">'+D.map(d=>'<button type="button" class="chip" data-g="'+d[0]+'" aria-pressed="'+(d[0]===rentG)+'">'+durTxt(d[0])+"</button>").join("")+"</div>"+
   '<div><div class="pn">'+t("total")+" "+nf(tot)+' Ⓝ</div><div class="pe">'+t("once")+" · ≈ "+nf(tot/rentG)+" Ⓝ "+t("perDay")+" · ≈ € "+nf(tot*S.eur,2)+"</div></div>"+
   '<div class="botbox"><ol class="steps">'+t("howRent").map(s=>"<li>"+s+"</li>").join("")+'</ol><a class="btn big" href="'+link+'" target="_blank" rel="noopener">'+t("openBot")+" @"+esc(S.bot)+"</a></div>"+
   '<p class="hint">'+t("rentTerms")+"</p>";
}
function sheetShell(title,sfx,body){
  if(!$("#scrim")){const c=document.createElement("div");c.id="scrim";c.className="scrim";c.addEventListener("click",closeSheet);document.body.appendChild(c)}
  let el=$("#sheet");if(!el){el=document.createElement("div");el.id="sheet";el.className="sheet";el.setAttribute("role","dialog");document.body.appendChild(el)}
  el.setAttribute("aria-label",title+sfx);
  el.innerHTML='<div class="in"><div class="row2"><h2>'+esc(title)+'<span style="color:var(--muted);font-weight:500">'+esc(sfx)+'</span></h2><button type="button" class="btn ghost" id="s-close">'+t("close")+"</button></div>"+body+'<p class="hint">'+t("help")+' <span class="copyline">@'+esc(S.tg)+"</span></p></div>";
  $("#s-close").addEventListener("click",closeSheet);
}
function drawSheet(){
  if(sheetMode==="main"){const r=(AC().main_nomi||[]).find(x=>x[0]===sheetName);if(!r||rented(r[0]))return closeSheet();
    return sheetShell(r[0].replace(/\.near$/,""),".near",'<div class="meta"><span class="tag rent">mainnet</span></div>'+rentBody(r[1],m=>"affm_"+m+"_"+encodeURIComponent(r[0].replace(/\.near$/,""))))}
  if(sheetMode==="sub"){const id=sheetName,P=AC().padri||[],padre=P[subP];if(!padre||!id.endsWith("."+padre))return closeSheet();
    const l=id.slice(0,-padre.length-1);return sheetShell(l,"."+padre,'<div class="meta"><span class="tag rent">'+t("subTitle")+"</span></div>"+rentBody(subBase(netOf(padre)),m=>"sub_"+m+"_"+subP+"_"+encodeURIComponent(l)))}
  const row=S.nomi.find(r=>r[0]===sheetName);if(!row)return closeSheet();
  if(sheetMode==="rent"){const x={n:row[0],...info(row[0],row[1],row[2])};if(x.k==="sold"||x.k==="hidden"||x.k==="rented")return closeSheet();
    return sheetShell(x.n,".testnet",'<div class="meta">'+metaOf(x)+"</div>"+rentBody(rentBase(x),m=>"aff_"+m+"_"+encodeURIComponent(x.n)))}
  const x={n:row[0],...info(row[0],row[1],row[2])};if(x.k==="sold"||x.k==="hidden"||x.k==="rented")return closeSheet();
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
  if(b.dataset.open){sheetMode="buy";sheetName=b.dataset.open;drawSheet();return}
  if(b.dataset.rentm){sheetMode="main";rentG=30;sheetName=b.dataset.rentm;drawSheet();return}
  if(b.dataset.rent){sheetMode="rent";rentG=30;sheetName=b.dataset.rent;drawSheet();return}
  if(b.dataset.g){rentG=+b.dataset.g;drawSheet();return}
  if(b.id==="sub-go"){subCheck();return}
  if(b.id==="more"){shown+=60;render()}});
document.addEventListener("input",e=>{if(e.target.id==="sub-l"){subL=e.target.value.trim().toLowerCase();subRes=null;return}if(e.target.id==="q"){q=e.target.value.trim().toLowerCase().replace(/\.testnet$/,"");shown=60;const p=e.target.selectionStart;render();const i=$("#q");i.focus();try{i.setSelectionRange(p,p)}catch(_){}}});
document.addEventListener("change",e=>{if(e.target.id==="sort"){ordine=e.target.value;render()}if(e.target.id==="sub-p"){subP=+e.target.value;subRes=null}});
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.id==="sub-l"){e.preventDefault();subCheck()}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&sheetName)closeSheet()});
async function load(){
  try{const r=await fetch("stato.json?t="+Date.now(),{cache:"no-store"});if(!r.ok)throw 0;S=await r.json();render()}
  catch(e){if(!S)$("#root").innerHTML='<div class="wrap"><p class="skeleton">'+t("loadErr")+"</p></div>"}
}
load();setInterval(()=>{const a=document.activeElement;if(!document.hidden&&!sheetName&&!(a&&a.id==="sub-l"))load()},60000);
})();
