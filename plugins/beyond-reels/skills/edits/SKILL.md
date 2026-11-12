---
name: edits
description: Postup editu talking head videa v appce Edits od Instagramu přes její MCP (metapilot-native). Hrubý střih z nejlepších pokusů, střih pauz podle zvuku, titulky, hook, rozložení obrazu, hudba a vyvážený zvuk, kontrola před exportem. Použij, když někdo napíše /edits, "edituj v Edits", "střihni to v Edits", "udělej edit přes Edits", nebo pošle video a chce ho upravit v Edits. Platí pro každý styl, barvy a písma si volí klient.
---

# /edits: edit videa v Edits přes MCP

Tohle je postup, ne styl. Drží pořadí kroků a kontroly, které platí pro každé video. Jaké titulky, barvy a písma, to rozhoduje klient.

## 0. Než začneš

- **Všechno se dělá v Edits přes MCP.** Přepis, střih, titulky i hudba. Žádný whisper, ffmpeg ani jiný program bokem, i když by to šlo rychleji. Klient chce projekt, který si v Edits otevře a dál upraví.
- **Připojení:** když nástroje `metapilot-native` chybí, řekni klientovi, ať v Edits zkopíruje prompt pro připojení ke Claudovi, vloží ho sem a pak restartuje Claude Code. Nic sám neinstaluj.
- **Soubory:** Edits nevidí do Stažených souborů ani do dočasných složek. Video, screenshoty a loga do Media Panelu v Edits nahraje klient sám. Ty je pak vezmeš přes `getMediaPanelItems` a `addMediaPanelItemsToTimeline`.
- **Brief:** zeptej se jen na to, co nevíš: o čem video je, pro koho a jak dlouhé má být. Zbytek navrhni sám.

## 1. Přepis a hrubý střih

1. `transcribeClip` na celé surové video, počkej přes `jobStatus`.
2. Z přepisu vyber u každé myšlenky nejlepší pokus: celá věta, bez zakoktání, s energií. Opakované pokusy vyhoď, nech poslední dobrý.
3. Napiš klientovi krátký seznam, co zůstává a co letí. U sporných míst se zeptej.
4. Stříhej `splitAt` a mazáním, pak kousky dej k sobě, ať mezi nimi nezůstane mezera. Zapiš si mapu střihů (zdrojový čas → čas na timeline), budeš ji potřebovat.

## 2. Pauzy podle skutečného ticha

- Pauzy hledej `findPauses` (ticho ve zvuku), **ne podle mezer mezi titulky.** Titulky se ticha neřídí.
- Vystřihni pauzy uvnitř vět i mezi nimi. Na hranách nech kousek nádechu, ať střih nezní useknutě.
- Po střihu znovu zkontroluj, že na timeline nezůstala mezera.

## 3. Titulky až po střihu

- `generateCaptions` spusť až na hotovém střihu, jinak nesedí časy.
- Po vygenerování přečti text a oprav chyby přepisu (`editCaption`): jména, čísla, odborná slova.
- Krátké řádky se čtou na telefonu líp než dlouhé bloky. Dělení `splitCaption` jde jen přesně na začátek slova a vrací dvě nová ID, dál děl levé.
- Pozici měň u každého titulku zvlášť (`setTextPosition`), hromadně to nejde.

## 4. Rozložení obrazu

- **Obličej je svatý.** Nic nesmí zakrývat oči, ústa ani bradu. Titulky dej hned pod bradu, ne doprostřed obličeje a ne úplně dolů pod rozhraní Instagramu.
- **Hook** v prvních 3 sekundách nahoře nad hlavou. Musí být čitelný na jakémkoli pozadí, na světlém nebe i tmavé zdi. Když si nejsi jistý, dej text na kontrastní podklad.
- Grafika a obrázky (ukázky, loga, čísla) jdou nad hlavu nebo pod titulky, nikdy přes obličej.
- Nové prvky, které mají být navrchu, přesuň na vyšší vrstvu (`moveToLayer`). Když vrstva neexistuje, přidej pomocný prvek, přesuň do jeho stopy a pomocný smaž.
- Efekty, které Edits přes MCP neumí pořádně, vynech. Výřez postavy (`addStickerFromCutout`) bere jen první snímek, na videu se postava rozjede, takže green screen přes MCP nedělej.

## 5. Hudba

- Hledej `searchMusic` a `listMusicTracks`, přidej `addSongToComposition`.
- Vyber podkres, který sedí k náladě a nepřebíjí řeč. Obyčejný instrumentál bez zpěvu skoro vždy vyhraje nad něčím výrazným, temným nebo "filmovým". Když si nejsi jistý, navrhni klientovi dvě možnosti.
- Skladba musí pokrýt celé video. Když je kratší, vyber jinou, ne smyčku se slyšitelným skokem.
- Na konci dej hudbě doznít (`setFade`, fade out kolem 1 s).

## 6. Vyvážený zvuk

Cíl: klient je slyšet celé video stejně dobře a hudba ho nikde neruší.

1. **Změř hlas:** `loudness` na klipech s řečí. Surový záběr z telefonu bývá kolem -22 LUFS, na sociální sítě chceš blíž k -14.
2. **Zvedni hlas** `setVolume` na všech klipech s řečí stejně, obvykle 1,5 až 1,8. Hlídej špičku z měření: každé zdvojnásobení přidá asi 6 dB.
3. **Hudba nízko:** `setVolume` kolem 0,1 až 0,15 a `setDucking` s chováním `video`, ať se pod řečí ještě ztiší.
4. **Přehraj a změř:** `seek`, `play`, `sampleOutputLevel` po úsecích přes celé video, pak `pause`. Špička nesmí sahat na 1,0. Kde sahá, uber hlas jen v tom úseku.
5. Když hlas a hudba nesedí ani po úpravě, změň hudbu, ne hlas.

## 7. Kontrola před exportem

- `captureFrame` z každé části videa (začátek, každý blok, konec): obličej volný, titulky čitelné, nic nepřetéká přes okraj.
- Zvuk změřený v celé délce podle kroku 6.
- `saveProject`.
- Klientovi napiš krátce, co je hotové a co jsi neověřil (poslech ušima nezvládneš, jen čísla). Export spusť až na jeho pokyn.

## Pořadí je pravidlo

Střih, pauzy, titulky, obraz, hudba, zvuk, kontrola. Když klient v půlce změní střih, titulky vygeneruj znovu a zvuk znovu změř.
