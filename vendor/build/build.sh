#!/bin/sh
# Rigenera vendor/near-api-js-7.3.1.min.js e vendor/LICENZE.txt.
# Le versioni sono bloccate in package-lock.json: con lo stesso lock il file
# esce identico byte per byte (confronta l'impronta SHA-256 nel README).
# Uso: sh vendor/build/build.sh   (serve Node 18 o più recente)
set -e
cd "$(dirname "$0")"
npm ci --no-audit --no-fund --loglevel=error
# is-my-json-valid serve solo a validare gli ABI dei contratti (non usato qui)
# e porterebbe new Function: lo sostituiamo con uno stub.
npx esbuild entry.js --bundle --format=esm --minify --target=es2020 --platform=browser \
  --alias:is-my-json-valid=./stub-validator.js --legal-comments=eof --log-level=warning \
  --banner:js='/*! near-api-js 7.3.1 e dipendenze (MIT, Apache-2.0: vedi LICENZE.txt). Generato da vendor/build/build.sh */' \
  --outfile=../near-api-js-7.3.1.min.js
{
  echo "Licenze delle librerie incluse in near-api-js-7.3.1.min.js"
  for p in near-api-js borsh @noble/curves @noble/hashes @noble/post-quantum @scure/base; do
    for f in node_modules/$p/LICENSE*; do
      echo; echo "===== $p ($(basename "$f")) ====="; cat "$f"
    done
  done
} > ../LICENZE.txt
sha256sum ../near-api-js-7.3.1.min.js 2>/dev/null || shasum -a 256 ../near-api-js-7.3.1.min.js
