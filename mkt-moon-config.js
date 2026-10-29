"use strict";
// Name Hunter 3.8 - Market "Account Moon": configurazione (stessa copia nel sito). Nessuna chiave, solo nomi pubblici.
// PREZZI: null = in app e sul sito compare "prezzo da definire". Nessun prezzo e' attivo.
// Proposta fascia bassa (NON attiva, solo promemoria; per attivarla Max mette i numeri al posto di null):
//   affitto: 0.5  // NEAR al mese
//   asta:    2    // NEAR base d'asta
//   compra:  4    // NEAR compra subito
// Liste da /workspace/moon_extra/liste_vendita.json (decisione di Max, 29/10/2026).
const MOON_MKT={
  prezzi:{affitto:null,asta:null,compra:null},
  prezziAccount:{},            // prezzi per un singolo account, es. 'mainpy.near':{affitto:0.5,asta:2,compra:4} (vuoto = usa "prezzi")
  // Vendibili: affitto + asta + compra subito
  vendibili:['mainpy','n-06','5_05','8_08','9-09','9_09','3-03','xido','6_06','0-12','7_07','3_03','n-05','0-10'],
  // Solo offerte: niente asta, niente compra subito; solo "Fai un'offerta" (Telegram / sito)
  soloOfferte:['n_e_a','neofita','no-joke','1_3_5'],
  // Da tenere: nel market, SOLO "Fai un'offerta" (niente affitto, asta, compra subito)
  tenere:['7-07','00token','4-04','8-08','2_02','fairtea1148','112340','vickyss','meye','ot-7','1_1-1_1','6-06','no_joke','n-e-a','n_ea','n_e_a_r_1','4_04','cartella1','diosanto'],
  // Non registrati su Moon: solo il nome, per ora SOLO offerta (in attesa della decisione di Max)
  nonRegistrati:['ne_a','agenziadelleentrate','12_3','n-02'],
  // Sezione generale "Solo offerte": qualsiasi altro annuncio (nome del catalogo o account) da vendere solo su offerta
  soloOfferteNomi:[]
};
