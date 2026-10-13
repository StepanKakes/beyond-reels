# Helvetica Neue z macOS (/System/Library/Fonts/HelveticaNeue.ttc) do TTF souborů, které HyperFrames umí načíst.
# Písmo se nesmí šířit, proto ho plugin nenese: každý Mac si ho vytáhne ze svého systému (setup.sh) do ~/.cache/beyond-reels/fonts.
# python3 tools/hn_ze_systemu.py [cilova_slozka]
import sys, pathlib
from fontTools.ttLib import TTCollection
cil = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else pathlib.Path.home() / ".cache/beyond-reels/fonts"); cil.mkdir(parents=True, exist_ok=True)
CHCI = {"HelveticaNeue": "HN-Regular", "HelveticaNeue-Medium": "HN-Medium", "HelveticaNeue-Bold": "HN-Bold", "HelveticaNeue-BoldItalic": "HN-BoldItalic"}
for f in TTCollection("/System/Library/Fonts/HelveticaNeue.ttc").fonts:
    ps = f["name"].getDebugName(6)
    if ps in CHCI: f.save(cil / f"{CHCI[ps]}.ttf"); print(CHCI[ps], "ok")
