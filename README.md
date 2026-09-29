# name Hunter Market

Catalogo pubblico di nomi account NEAR **testnet**, con prezzi calcolati sulle vendite reali in mainnet. Acquisti e offerte passano dal bot Telegram [@NameHunterMarketBot](https://t.me/NameHunterMarketBot).

- `index.html` + `app.js`: il sito (GitHub Pages).
- `stato.json`: catalogo, prezzi, aste e vendite. Sito e app lo leggono in tempo reale, il bot lo aggiorna.
- `inquilino.html` + `inquilino.js`: il Pannello inquilino per usare un nome preso in affitto (la chiave resta nel browser).
- `comandi.json`: coda di comandi per il bot (esito in `log.json`).

Gli account testnet non hanno valore economico. Nessuna chiave privata è in questo repository.

**Affitti.** I nomi si possono anche affittare (nomi interi e sottonomi, testnet e mainnet). Il nome resta di Name Hunter; l'inquilino riceve una chiave limitata e lo usa tramite un contratto aperto (`contratto.zig`), che gli impedisce di prenderne il controllo o di toccare il deposito del proprietario. A fine affitto i NEAR versati dall'inquilino gli vengono restituiti in automatico.
