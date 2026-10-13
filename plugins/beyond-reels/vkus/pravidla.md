# Vkus Beyond: pravidla pro každý reel v každém stylu

Sepsáno z připomínek Tima a Štěpána k reelům Dalen, Heaton, Steven, Vince, Noske, Nathan a Lumitris (září až říjen 2026).
Platí bez připomínání. Co se naučíme z revizí, přibývá do `$BR_PROSTOR/vkus/verdikty.md` (sdílený v gitu), ten má přednost, když si odporují.

## Originalita a knihovna
- Naše komponenty v knihovně jsou inspirace, ne stavebnice. Schválená = připravená k použití, ne povinná. Neschválené nejsou zakázané.
- Každé video je originál: ke každé důležité větě nabídni víc směrů (obměna komponenty z knihovny, nová varianta inspirovaná knihovnou, vlastní nápad v našem jazyce).
- Žádné vymyšlené koncepty, které přebalí celou pasáž do jedné metafory (story karty jako nit, telefon fanouška, nuly jako okna, účtenka). Originalita = nové obměny a kombinace našeho slovníku, ne koncepty zvenku.
- Když Tim vybere variantu z hotové ukázky, kopíruje se přesně (rozložení, pozadí, rytmus) a mění se jen obsah.

## Obsah obrazu
- Ilustrace je doslovná, nikdy metafora k luštění. Co je trychtýř, kresli jako trychtýř.
- Firmy a značky jen záběrem s viditelným logem nebo logem samotným, nikdy názvem napsaným textem. Jména lidí na štítcích ano.
- U lidí karty s jejich videi, ne výstřižky. Citace = klip, kde mluví celou dobu, střih hned po poslední větě, české titulky na černém štítku přes jeho vypálené titulky (Nathan styl: čistý klip bez překladu).
- Žádné vymyšlené čísla, komentáře, profily ani fakta. Komentáře skutečné (yt-dlp --write-comments) se skutečnými avatary.
- Žádné prvky, které vyskočí a už se s nimi nepracuje. Prvek zůstává a rozvíjí se.
- Hustota až do konce, tělo nesmí polevit.
- Tim jen v úsecích, kdy kouká do kamery. Čtení z telefonu nebo uhnutí pohledem zakrýt B-rollem nebo grafikou, ani na pár snímků.
- Webka nikdy vystřižená z pozadí. Výstřižky jen u AI fotek a cizích lidí z jejich videí.
- Šipka ke jménu vždy zleva, hrot vedle obličeje, nikdy přes něj (obličej měř po snímcích).
- B-rolly z `$BR_PROSTOR/B-rolls` (KATALOG.md), čitelné, bez skoku na jiný záběr uvnitř (scdet). Grade neměnit.
- AI fotky: jen Seedream v4 edit, 2 až 3 generace, studiový portrét od stehen nahoru na bílém, bez glow, pak BiRefNet bez pozadí.

## Zakázáno
- Záře a glow kolem karet a výřezů, glitch, stroboskop, pixelový rozpad, konfety, pastelové panáčky, mřížky avatarů, pilulky rozházené kolem, tečkované mapy s oblouky, váhy, přeškrtnutá slova.
- Nafukování z nuly a pop s překmitem u štítků a textů (MK.stitekPop, MK.pop). Naskočení průhledností 40 > 100 % za 3 sn. nebo posunem (MK.prijezd).
- Titulní snímek nebo shrnující grafika na konci.
- Emoji, pomlčky, tečky na konci řádků, anglické texty v obraze (kromě citací v originále).

## Písmo a barvy
- Helvetica Neue Bold vede, nikdy kurzívou. Instrument Serif jen jako druhý hlas nebo pointa, vždy rovný řez 400 (`font-synthesis: none`), nikdy kurzíva ani umělé ztučnění.
- Papír #F4F2EE, černá #111, bílá, jedna akcentní červená #FF0E00 na věc, která v záběru znamená nejvíc. Jen tokeny z kitu, žádné inline hex.
- Obří slovo verzálkami přes skoro celou šířku, roztažené na výšku, na střed nebo za osobou.
- CTA slovo vždy v uvozovkách obou nahoře: “START”.

## Titulky
- Generují se samy ze zarovnaných slov (BN.titulkyZeSlov) po 1 až 3 slovech, max 20 znaků, zlom na interpunkci, snímek před slovem.
- Bílé Helvetica Bold s jemným stínem přes záběry, tmavé se světlou aurou na papíře. Stejná pozice, velikost i styl. Bez podkladu, bez obrysu, bez verzálek.
- Tmavé nikdy přes tmavou plochu, bílé nikdy přes bílé triko (posuň rozložení).
- Každé slovo mimo úseky, kde je totéž velké v obraze, musí zaznít. Titulek aspoň 13 snímků, kratší kus se složí se sousedem ve větě, nikdy se nezahodí.
- Nikdy přes obličej.

## Pohyb
- Plynulé křivky z jádra (MK.KRIVKY): nástup softLand 12 sn. nebo snapSettle 11 sn. z 1,25x, odjezd accelExit 13 sn. do střihu, švih whip 7 až 8 sn. bez záblesku.
- Nástupy krátké, bez dlouhého kmitání, po nástupu prvek stojí nebo jemně driftuje. Obří slova a čísla bodů bez driftu (MK.drift přepíše scaleY u .obri).
- Zoomy jen plynulé po křivce, punch-in max 1,15 od horního okraje, žádné rychlé odzoomování.
- Klid: záběr aspoň 1,7 s, scény s lidmi aspoň 2 s, bílé záblesky nejvýš 2 až 5 na video.

## Střih a zvuk
- Hrany střihu do ticha podle průběhu hlasitosti, ne podle časů z whisperu. Po každém střihu `$PY $BR_PROSTOR/tools/kontrola_strihu.py`, dokud nehlásí 0. Splývající slova nedělit.
- Střih po celých snímcích zdroje (25 fps), fps 30 až po spojení.
- Text scénáře se nezkracuje vystřižením vět, délka se řeší při psaní. Citace vždy celé.
- Hlas: jen čistá stopa z kamery bez filtrů, `studio_hlas.py` ve výchozím režimu (s ozvěnou `--podcast`), intro a tělo jedním během.
- Mix `$BR_PROSTOR/tools/mix.py`: hlas -5,5 dB, hudba -24 dB RMS se sidechainem -6 dB, citace v originále, -14 LUFS, -1,5 dBTP.
- SFX jen z `$BR_PROSTOR/sfx/zaklad`, vždy navázané na změnu v obraze (naskočí, dosedne, změní se, přesune), hluboké, ne cinkavé. Kliky na slova vypisovaná po jednom, závěrka na záběry a karty (ne na každý střih), švih na přesun. Nikdy klik3 ani dřevěný ťuk. Titulek naskočený najednou bez zvuku.
- Nikdy nepřehrávat zvuk nahlas na Macu (afplay, say).

## Výroba
- Revizní stránka u každého renderu, scény kotvené na slova, storyboard ke schválení před renderem, rychlé náhledy jen změněného úseku.
- Render jen v plné kvalitě, žádné mobilní náhledy.
