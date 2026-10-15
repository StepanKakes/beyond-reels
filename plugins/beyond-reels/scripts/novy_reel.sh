#!/bin/zsh
# Nový projekt reelu ve sdíleném prostoru.
#   zsh novy_reel.sh <styl> <nazev>      styl: mason | noske | matt-gray | lumitris | nathan | caspar | soowei
# Mason (a obecně Beyond) dostane sdílené jádro kitů a šablonu src/reel.html, ostatní styly kopii svého stylového projektu bez renderů.
set -e
source ~/.config/beyond-reels/env.sh 2>/dev/null || { echo "Nejdřív spusť setup.sh pluginu"; exit 1; }
STYL=${1:?styl}; NAZEV=${2:?název reelu, třeba heaton nebo klient-petr}
P="$BR_REELY/$NAZEV"; [[ -e "$P" ]] && { echo "Projekt $P už existuje"; exit 1; }
SAB="${0:A:h}/sablona"
case $STYL in
  mason)
    mkdir -p "$P"/{src,zdroj,nastroje,renders,vendor,assets/{media,sfx,fonts}}
    cp "$SAB/build.mjs" "$SAB/hyperframes.json" "$P/"; cp "$SAB/src/reel.html" "$P/src/"
    cp "$BR_PROSTOR/vendor/gsap.min.js" "$P/vendor/"
    zsh "$BR_PROSTOR/tools/jadro.sh" "$P" ;;
  noske|matt-gray|nathan)
    Z="$BR_PROSTOR/$STYL-styl"; [[ -d "$Z" ]] || { echo "Chybí $Z"; exit 1; }
    mkdir -p "$P"; rsync -a --exclude renders --exclude snapshots --exclude zdroj --exclude 'assets/media' "$Z/" "$P/"
    mkdir -p "$P"/{renders,zdroj,assets/media}
    cp "$BR_FONTS"/HN-*.ttf "$P/assets/fonts/" 2>/dev/null || true ;;
  lumitris)
    Z="$BR_PROSTOR/lumitris-styl/v2"; mkdir -p "$P"; rsync -a --exclude renders --exclude plany "$Z/" "$P/"; mkdir -p "$P"/{renders,plany,zdroj}
    cp "$BR_FONTS"/HN-*.ttf "$P/assets/fonts/" 2>/dev/null || true ;;
  *)   # styl naučený přes /novy-styl: projekt $BR_PROSTOR/<styl>-styl
    Z="$BR_PROSTOR/$STYL-styl"; [[ -d "$Z" ]] || { echo "Neznámý styl $STYL (mason, noske, matt-gray, lumitris, nathan nebo složka <styl>-styl)"; exit 1; }
    mkdir -p "$P"; rsync -a --exclude renders --exclude snapshots --exclude zdroj --exclude 'assets/media' "$Z/" "$P/"
    mkdir -p "$P"/{renders,zdroj,assets/media}; cp "$BR_FONTS"/HN-*.ttf "$P/assets/fonts/" 2>/dev/null || true ;;
esac
cat > "$P/.gitignore" <<'E'
renders/
zdroj/*.wav
zdroj/*.mp4
assets/media/*.mp4
assets/fonts/HN-*.ttf
index.html
E
echo "{\"styl\": \"$STYL\", \"vytvoreno\": \"$(date +%Y-%m-%d)\"}" > "$P/reel.json"
echo "$P"
