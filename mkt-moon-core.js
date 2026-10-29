"use strict";
// Name Hunter 3.8 - Market "Account Moon" e "Relics": logica pura, identica in app e sul sito. Sola lettura: nessuna chiave, nessuna firma.
const MMK=(()=>{
  // 3.8.1: normalizza i suffissi (.near/.testnet) cosi' catalogo testnet e account mainnet si confrontano
  const full=a=>{a=String(a||'').trim().toLowerCase().replace(/\.(near|testnet)$/,'');return a+'.near'};
  const C=typeof MOON_MKT!=='undefined'?MOON_MKT:{prezzi:{},prezziAccount:{},vendibili:[],soloOfferte:[],tenere:[],nonRegistrati:[],soloOfferteNomi:[]};
  const L={vend:(C.vendibili||[]).map(full),off:(C.soloOfferte||[]).map(full),keep:(C.tenere||[]).map(full),nonreg:(C.nonRegistrati||[]).map(full)};
  // tipo di annuncio: vend | off | nonreg | keep | null
  const tipo=a=>{a=full(a);for(const k of ['nonreg','off','vend','keep'])if(L[k].includes(a))return k;return null};
  const num=x=>x==null||x===''||!Number.isFinite(+x)||+x<=0?null:+x;
  const prezzi=a=>{const p={...(C.prezzi||{}),...((C.prezziAccount||{})[full(a)]||(C.prezziAccount||{})[full(a).slice(0,-5)]||{})};return {affitto:num(p.affitto),asta:num(p.asta),compra:num(p.compra)}};
  const fm=(x,d)=>(+x||0).toLocaleString('it-IT',{maximumFractionDigits:d});
  const prezzoTxt=(x,suf='')=>x==null?'prezzo da definire':fm(x,2)+' Ⓝ'+suf;
  // nomi dei tinker: catalogo get_space_tinkers_list [{id,name,production_rate_per_hour}]
  const tinkNomi=l=>{const o={};(Array.isArray(l)?l:[]).forEach(x=>{if(x&&x.id!=null)o[String(x.id)]={n:String(x.name||('Tinker '+x.id)).slice(0,40),p:Number(x.production_rate_per_hour)/1e8||0}});return o};
  // scheda account da dato Moon d = {reg, tot, rel:[{n,b,s,id}], liv:{vault,gear}, tk:{own:{id:n}, dep:n}}; slot = tabella gear->slot
  function scheda(a,d,slot={},tn={}){a=full(a);const t=tipo(a),L2=d?.liv||{},rel=Array.isArray(d?.rel)?d.rel:[];
    const own=d?.tk?.own&&typeof d.tk.own==='object'?d.tk.own:null,tk=own?Object.entries(own).filter(([,n])=>+n>0).map(([id,n])=>({id,n:+n,nome:tn[id]?.n||('Tinker '+id)})):null;
    return {a,dom:a,tipo:t,soloOff:t==='off'||t==='keep'||t==='nonreg',nonreg:t==='nonreg',avviato:t==='nonreg'?false:d?(d.reg===false?false:true):null,vault:L2.vault??null,gear:L2.gear??null,
      slot:L2.gear!=null?(slot[L2.gear]??L2.slot??null):null,rel:rel.map(r=>({n:String(r.n||'Relic'),b:r.b==null?null:+r.b,s:r.s===true,id:String(r.id||'')})),
      tinker:tk,tinkTot:tk?tk.reduce((s,x)=>s+x.n,0):null,tinkDep:d?.tk?.dep??null,prod:d?.tot??null,prezzi:prezzi(a)}}
  // 3.8: i "da tenere" sono nel market come i solo-offerte: SOLO offerta (niente affitto, asta, compra subito)
  // 3.8.1: anche i non registrati sono solo offerta (in attesa della decisione di Max)
  const offOnly=a=>{const t=tipo(a);return t==='off'||t==='keep'||t==='nonreg'};
  const elenco=()=>({vend:L.vend.slice(),off:[...L.off,...L.keep],nonreg:L.nonreg.slice()});
  const inVendita=a=>tipo(a)!=null;
  // relic come NFT a se': da tutti gli account in vendita
  function relics(dati){const out=[];for(const a of [...L.vend,...L.off,...L.keep]){const d=dati(a);(d?.rel||[]).forEach(r=>out.push({n:String(r.n||'Relic'),b:r.b==null?null:+r.b,s:r.s===true,id:String(r.id||''),o:a}))}
    return out.sort((x,y)=>(y.b||0)-(x.b||0)||(x.n<y.n?-1:1))}
  // "Solo offerte" generale: account solo-offerte + qualsiasi annuncio messo in soloOfferteNomi
  const soloOfferte=()=>[...new Set([...L.off,...L.keep,...L.nonreg,...(C.soloOfferteNomi||[]).map(full)])];
  const isSoloOfferta=n=>!!String(n||'').trim()&&soloOfferte().includes(full(n));
  return {full,offOnly,tipo,prezzi,prezzoTxt,tinkNomi,scheda,elenco,inVendita,relics,soloOfferte,isSoloOfferta,L,
    NOTA_RELIC:"Ogni relic è un NFT a sé (aa-harvest-moon-relics.near). Se è in staking, chi lo possiede deve prima toglierlo dallo staking (unstake) per poterlo trasferire.",
    NOTA_TINKER:"I tinker non sono NFT: si cedono solo con l'account."}})();
if(typeof module!=='undefined')module.exports=MMK;
