# Z katalogu stylu (knihovna.json) a mapy nahraných assetů udělá dokumenty kolekce komponenty pro revizní stránku.
# python3 -I tools/knihovna/dokumenty.py <knihovna.json> <assets.json> <vystupni_slozka>
# Každý dokument jde do <vystup>/<id>.json, ArtifactData batch je pak pošle přes file_path.
import json, sys, time
from pathlib import Path

kat, assets, vys = json.load(open(sys.argv[1])), json.load(open(sys.argv[2])), Path(sys.argv[3])
vys.mkdir(parents=True, exist_ok=True)
for i, p in enumerate(kat["polozky"]):
    d = {"styl": kat["styl"], "nazev": p["nazev"], "funkce": p.get("funkce", ""), "popis": p.get("popis", ""), "typ": p.get("typ", "komponenta"),
         "pomer": p.get("pomer", kat.get("pomer", "4/3")), "poradi": p.get("poradi", i), "verze": p.get("verze", 1), "stav": p.get("stav", "k_revizi"),
         "ukazka": assets.get(p["id"] + ".mp4", ""), "nahled": assets.get(p["id"] + ".jpg", ""), "zdroj": p.get("zdroj", ""), "zmeneno": int(time.time() * 1000)}
    (vys / f"{p['id']}.json").write_text(json.dumps(d, ensure_ascii=False))
    print(p["id"], "bez videa" if not d["ukazka"] else "")
