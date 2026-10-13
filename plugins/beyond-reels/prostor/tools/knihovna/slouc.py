# Sloučí výřezy komponent z více reelů do dokumentů knihovny: jedna karta = jedna komponenta, reely jako varianty.
# python3 -I tools/knihovna/slouc.py <assets.json> <vystupni_slozka> <reel.json>...
# reel.json je výstup podle _knihovna/prod/ZADANI.md, assets.json mapuje "<id>.mp4" a "<id>.jpg" na url assetu.
# Volitelně --puvodni <slozka>: dokumenty dřív zapsané ručně (efekty), jejichž stav a popis se převezmou podle klíče komponenty.
import json, sys, time
from pathlib import Path

args = sys.argv[1:]
puvodni = {}
if "--puvodni" in args:
    i = args.index("--puvodni"); slozka = Path(args[i + 1]); del args[i:i + 2]
    puvodni = {f.stem: json.loads(f.read_text()) for f in slozka.glob("*.json")}
assets, vys, reely = json.load(open(args[0])), Path(args[1]), args[2:]
vys.mkdir(parents=True, exist_ok=True)
NAZVY = {"heaton": "Heaton", "dalen": "Dalen", "steven": "Steven", "vince": "Vince"}

skupiny = {}
for r in reely:
    kat = json.load(open(r))
    for p in kat["polozky"]:
        p["_reel"] = kat.get("reel") or Path(r).stem
        skupiny.setdefault(p["komponenta"], []).append(p)

for poradi, (klic, pol) in enumerate(sorted(skupiny.items(), key=lambda kv: (min(p.get("kvalita", 2) for p in kv[1]), kv[0]))):
    pol.sort(key=lambda p: (p.get("kvalita", 2), list(NAZVY).index(p["_reel"]) if p["_reel"] in NAZVY else 9))
    nej = pol[0]
    var = [{"reel": NAZVY.get(p["_reel"], p["_reel"]), "ukazka": assets.get(p["id"] + ".mp4", ""), "nahled": assets.get(p["id"] + ".jpg", "")} for p in pol]
    var = [v for v in var if v["ukazka"]]
    kody = []
    for p in pol:
        for k in str(p.get("kod", "")).split(" / "):
            if k and k not in kody: kody.append(k)
    zdroj = ", ".join(NAZVY.get(p["_reel"], p["_reel"]) + (" (" + p["vyskyty"] + ")" if p.get("vyskyty") else "") for p in pol)
    did = klic if klic.startswith("mason-") else "mason-" + klic
    stary = puvodni.get(did, {})
    d = {"styl": "mason", "typ": "komponenta", "nazev": stary.get("nazev") or nej["nazev"], "popis": stary.get("popis") or nej.get("popis", ""),
         "funkce": " · ".join(kody[:3]), "zdroj": zdroj, "pomer": "4/3", "poradi": poradi, "verze": 1, "stav": stary.get("stav", "k_revizi"),
         "ukazka": var[0]["ukazka"] if var else "", "nahled": var[0]["nahled"] if var else "", "varianty": var, "zmeneno": int(time.time() * 1000)}
    (vys / f"{did}.json").write_text(json.dumps(d, ensure_ascii=False))
    print(did, len(var), "variant", "" if var else "BEZ VIDEA")
