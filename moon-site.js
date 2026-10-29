(function(){
"use strict";
// Pagina Account Moon / Relics del sito: sola lettura via RPC "view". Nessuna chiave, nessuna firma, nessun wallet.
const RPC="https://rpc.mainnet.fastnear.com",C="aa-harvest-moon.near",R="aa-harvest-moon-relics.near",BOT="NameHunterMarketBot";
const esc=t=>String(t==null?"":t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fm=(x,d)=>(+x||0).toLocaleString("it-IT",{maximumFractionDigits:d});
const u8=s=>{try{return Number(BigInt(String(s)))/1e8}catch(e){return null}};
const tmo=(p,ms)=>Promise.race([p,new Promise((_,r)=>setTimeout(()=>r(new Error("timeout")),ms))]);
async function view(ct,m,a){const r=await tmo(fetch(RPC,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:"query",params:{request_type:"call_function",finality:"final",account_id:ct,method_name:m,args_base64:btoa(JSON.stringify(a))}})}).then(r=>r.json()),8000);
  if(r.error||r.result?.error)throw new Error(JSON.stringify(r.error||r.result.error).slice(0,200));return JSON.parse(new TextDecoder().decode(new Uint8Array(r.result.result)))}
const SN=()=>typeof MOON_SNAP!=="undefined"?MOON_SNAP:window.MOON_SNAP;
const snap=a=>(SN()?.acc||[]).find(x=>x.a===a)||null;
let SLOT={1:1,2:2,3:3,4:4,5:5,6:6},TN={},RN={};const DATI={};
async function leggi(a){try{const [info,nf]=await Promise.all([view(C,"view_account_info",{account_id:a}),view(R,"nft_tokens_for_owner",{account_id:a,from_index:"0",limit:100}).catch(()=>[])]);
  if(!info)return {reg:false,rel:[]};
  const rel=[...(info.staked_relics||[]).map(s=>{const sid=String(s.relic_nft_token_id||"").split(":")[0];return {n:RN[sid]||("Relic "+sid),b:+s.multiplier_in_percent||null,s:true,id:s.relic_nft_token_id}}),
    ...(Array.isArray(nf)?nf:[]).map(t=>{const m=/^(.*?)\s*\((\d+)%\)\s*$/.exec(String(t?.metadata?.title||""));return {n:m?m[1]:String(t?.metadata?.title||t?.token_id),b:m?+m[2]:null,s:false,id:t?.token_id}})];
  return {reg:true,tot:u8(info.production_per_hour),liv:{vault:info.vault_level,gear:info.gear_level},rel,tk:{own:info.space_tinkers||{},dep:(info.deployed_space_tinkers||[]).length},live:true}}
 catch(e){if(/No account|not registered/i.test(e.message))return {reg:false,rel:[]};const s=snap(a);return s?{...s,live:false}:null}}
const contatti=()=>'<a class="btn" href="https://t.me/'+BOT+'" target="_blank" rel="noopener">Fai un\'offerta su Telegram</a>';
function card(a){const x=MMK.scheda(a,DATI[a]||null,SLOT,TN),P=x.prezzi;let h='<div class="card"><div class="k">'+esc(x.dom)+'</div>';
  if(x.nonreg)return h+'<p class="hint">Non registrato su Moon · solo il nome</p><span class="b">Solo offerte</span> <span class="b">prezzo da definire</span><br>'+contatti()+'</div>';
  const st=x.rel.filter(r=>r.s).length;
  h+='<dl><dt>Moon avviato</dt><dd>'+(x.avviato==null?"—":x.avviato?"sì":"no")+'</dd><dt>Vault</dt><dd>livello '+esc(x.vault??"—")+'</dd><dt>Gear</dt><dd>livello '+esc(x.gear??"—")+'</dd>'+
   '<dt>Slot relic</dt><dd>'+esc(x.slot??"—")+(x.slot!=null?" ("+st+" occupati)":"")+'</dd><dt>Relic</dt><dd>'+x.rel.length+(x.rel.length?" · "+esc(x.rel.map(r=>r.n).join(", ")):"")+'</dd>'+
   '<dt>Tinker</dt><dd>'+(x.tinker?x.tinkTot+" · "+esc(x.tinker.map(t=>t.n+"× "+t.nome).join(", ")):"—")+'</dd><dt>Produzione</dt><dd>'+(x.prod==null?"—":fm(x.prod,4))+' $MOON/h</dd></dl>';
  if(x.soloOff)return h+'<span class="b">Solo offerte</span><br>'+contatti()+'</div>';
  return h+'<dl><dt>Affitto</dt><dd>'+MMK.prezzoTxt(P.affitto,"/mese")+'</dd><dt>Asta (base)</dt><dd>'+MMK.prezzoTxt(P.asta)+'</dd><dt>Compra subito</dt><dd>'+MMK.prezzoTxt(P.compra)+'</dd></dl>'+
   '<span class="b">Affitto · Asta · Compra subito · Offerta</span><br>'+contatti()+'</div>'}
function render(){const E=MMK.elenco(),RL=MMK.relics(a=>DATI[a]);
  document.getElementById("root").innerHTML=
   '<h2>Vendibili ('+E.vend.length+') · affitto, asta, compra subito, offerta</h2><p class="hint">Prezzi: da definire.</p>'+E.vend.map(card).join("")+
   '<h2>Solo offerte ('+E.off.length+')</h2><p class="hint">Account protetti: niente affitto, asta o compra subito, solo offerte.</p>'+E.off.map(card).join("")+
   '<h2>Non registrati su Moon ('+E.nonreg.length+') · solo offerte</h2><p class="hint">Per ora solo offerte, in attesa di decisione.</p>'+E.nonreg.map(card).join("")+
   '<h2>Relics ('+RL.length+')</h2><div class="card"><p>'+esc(MMK.NOTA_RELIC)+'</p><p>'+esc(MMK.NOTA_TINKER)+'</p><ul>'+
   RL.map(r=>'<li>'+esc(r.n)+(r.b!=null?" +"+fm(r.b,0)+" %":"")+' · da '+esc(r.o)+' · '+(r.s?"in staking: serve unstake":"nel wallet")+' · prezzo da definire</li>').join("")+'</ul>'+contatti()+'</div>'+
   '<p class="hint">'+(Object.values(DATI).some(d=>d&&d.live===false)?"Alcuni dati vengono dall'istantanea "+esc(SN()?.ora||"")+" (RPC non raggiungibile).":"")+'</p>'}
async function main(){Object.assign(DATI,Object.fromEntries([...MMK.L.vend,...MMK.L.off,...MMK.L.keep].map(a=>{const s=snap(a);return [a,s?{...s,live:false}:null]})));render();
  try{const [g,tl,rl]=await Promise.all([view(C,"get_gear_levels",{}).catch(()=>[]),view(C,"get_space_tinkers_list",{}).catch(()=>[]),view(C,"get_relic_list",{}).catch(()=>[])]);
    (g||[]).forEach(x=>{if(x.level)SLOT[x.level]=+x.relic_capacity});TN=MMK.tinkNomi(tl);(rl||[]).forEach(x=>{if(x?.nft_contract_id===R)RN[String(x.nft_series_id)]=String(x.name||"").replace(/\s*\(\d+%\)\s*$/,"")})}catch(e){}
  const coda=[...MMK.L.vend,...MMK.L.off,...MMK.L.keep];const lav=async()=>{while(coda.length){const a=coda.shift();const d=await leggi(a);if(d)DATI[a]=d;render()}};
  await Promise.all([lav(),lav()])}  // 2 richieste alla volta
main();
})();
