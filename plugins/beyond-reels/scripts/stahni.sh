#!/usr/bin/env bash
# stahni.sh: stazeni IG (i TikTok, YouTube, X) videa, popisku, prepisu a snimku.
#
# Pouziti:
#   bash stahni.sh "https://www.instagram.com/p/XXXX/"
#   JAZYK=cs bash stahni.sh URL        # vychozi auto (detekce jazyka)
#   SNIMKU=12 bash stahni.sh URL       # pocet snimku do mrizky, vychozi 9
#   COOKIES_PROHLIZEC=safari bash stahni.sh URL   # kdyz IG chce prihlaseni
#
# Vystup: slozka ~/Documents/ig-videa/<id>/ s video.mp4, info.json,
# popisek.txt, prepis.txt, prepis.srt, snimky/, mrizka.jpg, a se setupem pluginu i souhrn.txt a strihy.jpg
# (střihy, hlasitost, tempo řeči, text v obraze přes Apple Vision).
# Na stdout vypise cestu ke slozce a kratke shrnuti.

set -euo pipefail

URL="${1:?Chybi odkaz}"
JAZYK="${JAZYK:-auto}"
SNIMKU="${SNIMKU:-9}"
KOREN="${IG_VIDEA:-$HOME/Documents/ig-videa}"

vyber_model() {
  [ -n "$BR_WHISPER" ] && [ -f "$BR_WHISPER" ] && { echo "$BR_WHISPER"; return; }   # ze setup.sh pluginu
  for f in \
    "$HOME/Library/Application Support/vowen/models/ggml-large-v3-turbo.bin" \
    "$HOME/Library/Application Support/Dictum/models/ggml-large-v3.bin" \
    "$HOME/.cache/hyperframes/whisper/models/ggml-small.bin"; do
    [ -f "$f" ] && { echo "$f"; return; }
  done
}
WHISPER="$(command -v whisper-cli || true)"
[ -n "$WHISPER" ] || [ ! -x /Applications/Vowen.app/Contents/Resources/bin/whisper-cli ] || WHISPER=/Applications/Vowen.app/Contents/Resources/bin/whisper-cli
MODEL="$(vyber_model || true)"
for t in yt-dlp ffmpeg ffprobe; do command -v "$t" >/dev/null || { echo "CHYBI $t (brew install $t)"; exit 1; }; done

# Stazeni: nejdriv bez cookies, pak pres cookies z prohlizece
ID="$(yt-dlp --no-warnings --print id --skip-download "$URL" 2>/dev/null || true)"
COOK=()
if [ -z "$ID" ]; then
  for p in ${COOKIES_PROHLIZEC:-safari chrome firefox}; do
    ID="$(yt-dlp --no-warnings --cookies-from-browser "$p" --print id --skip-download "$URL" 2>/dev/null || true)"
    if [ -n "$ID" ]; then COOK=(--cookies-from-browser "$p"); break; fi
  done
fi
[ -n "$ID" ] || { echo "CHYBA: yt-dlp video nenacetl ani s cookies. Zkus: brew upgrade yt-dlp"; exit 1; }

DIR="$KOREN/$ID"
mkdir -p "$DIR/snimky"
if [ ! -f "$DIR/video.mp4" ]; then
  yt-dlp --no-warnings --quiet ${COOK[@]+"${COOK[@]}"} --no-playlist \
    -f "bv*+ba/b" --merge-output-format mp4 \
    --write-info-json -o "$DIR/video.%(ext)s" "$URL"
  [ -f "$DIR/video.info.json" ] && mv "$DIR/video.info.json" "$DIR/info.json"
fi
VIDEO="$DIR/video.mp4"
[ -f "$VIDEO" ] || VIDEO="$(ls "$DIR"/video.* | grep -v json | head -n1)"

# Popisek a metadata
python3 -I - "$DIR/info.json" > "$DIR/popisek.txt" <<'PY'
import json,sys
try: d=json.load(open(sys.argv[1]))
except Exception: sys.exit(0)
for k,l in [("uploader","autor"),("channel","ucet"),("upload_date","datum"),("duration","delka_s"),("like_count","liky"),("comment_count","komentare"),("webpage_url","odkaz")]:
    if d.get(k) is not None: print(f"{l}: {d[k]}")
print()
print(d.get("description") or d.get("title") or "")
PY

# Prepis
DELKA="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$VIDEO" | cut -d. -f1)"
if ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$VIDEO" | grep -q .; then
  if [ -n "$WHISPER" ] && [ -n "$MODEL" ]; then
    ffmpeg -y -loglevel error -i "$VIDEO" -ar 16000 -ac 1 -c:a pcm_s16le "$DIR/audio.wav"
    "$WHISPER" -m "$MODEL" -l "$JAZYK" -np -osrt -of "$DIR/prepis" "$DIR/audio.wav" >/dev/null 2>&1 || true
    "$WHISPER" -m "$MODEL" -l "$JAZYK" -np -nt "$DIR/audio.wav" 2>/dev/null | sed '/^[[:space:]]*$/d' > "$DIR/prepis.txt" || true
    rm -f "$DIR/audio.wav"
  else
    echo "(whisper-cli nebo model chybi, prepis preskocen)" > "$DIR/prepis.txt"
  fi
else
  echo "(video nema zvukovou stopu)" > "$DIR/prepis.txt"
fi

# Snimky rovnomerne pres celou delku + mrizka 3 sloupce
rm -f "$DIR"/snimky/*.jpg
D="${DELKA:-10}"; [ "$D" -gt 0 ] || D=1
for i in $(seq 1 "$SNIMKU"); do
  T=$(python3 -c "print(round($D*($i-0.5)/$SNIMKU,2))")
  ffmpeg -y -loglevel error -ss "$T" -i "$VIDEO" -frames:v 1 -vf "scale=360:-2" "$DIR/snimky/$(printf %02d "$i")_${T}s.jpg"
done
RADKU=$(( (SNIMKU + 2) / 3 ))
ffmpeg -y -loglevel error -pattern_type glob -i "$DIR/snimky/*.jpg" -vf "tile=3x${RADKU}:padding=6:color=white" -frames:v 1 "$DIR/mrizka.jpg" || true

# Shrnutí bez obrázků (Apple Vision a ffmpeg): střihy, hlasitost, tempo řeči, text v obraze, přehled podle střihů
SOUHRN="${BR_PROSTOR:-}/tools/souhrn_videa.py"
if [ -f "$SOUHRN" ] && [ -x "${PY:-}" ]; then "$PY" "$SOUHRN" "$VIDEO" --prepis "$DIR/prepis.srt" --vystup "$DIR" >/dev/null 2>&1 || true; fi

echo "SLOZKA: $DIR"
echo "DELKA: ${DELKA}s"
echo "--- POPISEK ---"; cat "$DIR/popisek.txt"
echo "--- PREPIS ---"; cat "$DIR/prepis.txt"
[ -f "$DIR/souhrn.txt" ] && { echo "--- SOUHRN (Mac změřil) ---"; cat "$DIR/souhrn.txt"; }
