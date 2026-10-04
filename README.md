# name Hunter Market

Catalogo pubblico di nomi account NEAR **testnet**, con prezzi calcolati sulle vendite reali in mainnet. Acquisti e offerte passano dal bot Telegram [@NameHunterMarketBot](https://t.me/NameHunterMarketBot).

- `index.html` + `app.js`: il sito (GitHub Pages).
- `stato.json`: catalogo, prezzi, aste e vendite. Sito e app lo leggono in tempo reale, il bot lo aggiorna.
- `inquilino.html` + `inquilino.js`: il Pannello inquilino per usare un nome preso in affitto (la chiave resta nel browser, cifrata con una password).
- `vendor/`: copia locale di near-api-js usata dal Pannello (vedi sotto).
- `comandi.json`: coda di comandi per il bot (esito in `log.json`).

Gli account testnet non hanno valore economico. Nessuna chiave privata è in questo repository.

**Affitti.** I nomi si possono anche affittare (nomi interi e sottonomi, testnet e mainnet). Il nome resta di Name Hunter; l'inquilino riceve una chiave limitata e lo usa tramite un contratto aperto (`contratto.zig`), che gli impedisce di prenderne il controllo o di toccare il deposito del proprietario. A fine affitto i NEAR versati dall'inquilino gli vengono restituiti in automatico.

**Sicurezza del Pannello inquilino.**
- La chiave dell'inquilino non è mai salvata in chiaro: in `localStorage` (`nh-inq-vault`) c'è solo la versione cifrata con la password scelta dall'utente (PBKDF2-SHA256 a 600.000 iterazioni + AES-GCM). In chiaro esiste solo in memoria, da sbloccata; "Blocca" o uscire dalla pagina la richiudono. Le chiavi in chiaro delle versioni precedenti (`nh-inq-key`) vengono cancellate quando l'utente le protegge con una password.
- near-api-js non arriva più da un CDN: è in `vendor/near-api-js-7.3.1.min.js` (solo le parti usate, licenze in `vendor/LICENZE.txt`). Per rigenerarlo: `sh vendor/build/build.sh` (Node 18+); con lo stesso `package-lock.json` il file esce identico, SHA-256 `edff3c42b434e0d82d999ac8dc0fb750c615435b9920c28f82da3bd65a3aa4e3`.
- `inquilino.html` ha una Content-Security-Policy: script solo da questo sito, connessioni solo alle RPC FastNEAR. Se cambiano le RPC in `inquilino.js`, va aggiornato anche `connect-src`.
