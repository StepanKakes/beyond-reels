#!/bin/zsh
# Sdílené jádro kitů (hyperframes/jadro) do projektu reelu, nebo přehled, kdo má jakou verzi.
#   tools/jadro.sh <slozka-projektu>   zkopíruje js/, css a Instrument Serif, zapíše .jadro-verze
#   tools/jadro.sh --stav              u všech reelů v $BR_REELY řekne, jestli sedí s jádrem
# Kopie (ne odkaz) je schválně: hotový reel se tak už nikdy nezmění. Nový reel nebo oprava = spustit znovu.
set -e
R="${0:A:h:h}"; J="$R/jadro"
if [[ "$1" == "--stav" ]]; then
  for k in $(find "${BR_REELY:-$R}" -name mason-kit.js -path "*/js/*" -not -path "*/jadro/*" -not -path "*/node_modules/*" -not -path "*/_skill-test/*"); do
    p=${k:h:h}; ok=1
    for f in js/mason-kit.js js/beyond-nove.js js/elaine-kit.js mason-kit.css beyond-kit.css elaine-kit.css; do
      [[ -f "$p/$f" ]] && ! cmp -s "$p/$f" "$J/$f" && ok=0
    done
    v=$( [[ -f "$p/.jadro-verze" ]] && cut -d' ' -f1 "$p/.jadro-verze" || echo "bez jádra" )
    echo "$( [[ $ok == 1 ]] && echo "sedí    " || echo "liší se " ) $v  ${p:t}"
  done; exit 0
fi
P="${1:?složka projektu}"; mkdir -p "$P/js" "$P/assets/fonts"
HN=~/.cache/beyond-reels/fonts; [[ -f $HN/HN-Bold.ttf ]] || ${PY:-python3} "$R/tools/hn_ze_systemu.py" "$HN" >/dev/null
cp "$J"/js/*.js "$P/js/"; cp "$J"/*.css "$P/"; cp "$J"/fonts/* "$HN"/HN-*.ttf "$P/assets/fonts/"; cp "$J/VERZE" "$P/.jadro-verze"
echo "jádro $(cut -d' ' -f1 "$J/VERZE") > $P"
