# Collab: Scan token + Strategie a carta (sola lettura)

Branch: `grok/scan-token-carte-readonly`  
Pagina: `scan.html` · stub JS: `nh-scan.js`  
Data: 2026-11-05 (Europe/Rome)

## Scope confermato
- Solo sito Name Hunter (Pages). App desktop Windows dopo.
- Sola lettura: niente chiavi, seed, wallet, firma tx, `live_mode`.
- Hunter passa i pezzi; Primo collega sullo scaffold.

## File toccati (scaffold)
| File | Ruolo |
|------|--------|
| `scan.html` | UI tab Scan token + Strategie a carta |
| `nh-scan.js` | Stub DexScreener pubblici + hook paper bot |
| `app.js` | Link dal catalogo → `scan.html` |
| `COLLAB_SCAN_HUNTER.md` | Questo file |

## Punti di innesto (Hunter)
In `nh-scan.js` / `window.NHScan`:

1. **`fetchProfiles()`** — oggi chiama  
   `GET https://api.dexscreener.com/token-profiles/latest/v1` e  
   `…/token-boosts/latest/v1` (no API key). Sostituire/arricchire con la logica bonding-curve.
2. **`fetchTokenPairs(mints)`** — `GET …/latest/dex/tokens/<mints>` (max 30).
3. **`normalizePair(p)`** — allineare alla shape `scanner.json`  
   (`mint,sym,name,img,price,h1,h24,mc,liq,vol,dex,score,risks,ok`).
4. **`loadPaperBot()`** — oggi prova `bot_data.public.json` (assente → placeholder).  
   Fornire snapshot pubblico senza secret; tenere `live_mode: false`.
5. **`renderStrategies(d)`** — carte copy / reentry / arb / v1;  
   usare badge **PnL non affidabile** se i PnL copy/reentry sono falsati (handoff 28/10).

## Cosa manca da Hunter
- Snapshot `bot_data.public.json` (e opz. `v1_data.json` / `scanner.json`) da pubblicare in questo repo o URL pubblico stabile.
- Eventuale patch a `normalizePair` / filtri `pumpfun` vs `pumpswap`.
- Conferma CORS DexScreener dal dominio Pages (se fallisce, proxy senza secret o dump JSON statico).

## Sicurezza
- Non committare keystore, seed, Helius key, RPC private, wallet.
- QC verifica: nessun secret nel diff, nessun bottone compra/vendi, `live_mode` false.

## Non in scope ora
- App Windows / APK Android  
- Documento Notion principale  
- Trade live
