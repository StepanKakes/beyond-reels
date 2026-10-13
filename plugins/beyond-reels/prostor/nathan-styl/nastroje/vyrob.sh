#!/bin/bash
# celé video ze scénáře: generátor, média, zvuk, build, kontrola, render
# nastroje/vyrob.sh scenare/heaton.json [seed] [render]
set -e
cd "$(dirname "$0")/.."
PY=${PY:-python3}   # PY z ~/.config/beyond-reels/env.sh
SC=$1; N=$(python3 -c "import json;print(json.load(open('$SC'))['nazev'])")
$PY nastroje/nastupy.py $SC
python3 nastroje/generator.py $SC ${2:+--seed $2}
[ -n "$2" ] && cp plany/${N}_s$2_navrh.json plany/${N}_navrh.json
python3 nastroje/priprav.py $SC
$PY nastroje/zvuk.py $SC
node build.mjs $N
npx --yes hyperframes@0.8.105 check . --no-contrast 2>&1 | grep -E "error\(s\)|Check (passed|failed)"
if [ "$3" = "render" ]; then
  npx --yes hyperframes@0.8.105 render . --output renders/$N${2:+-s$2}.mp4 --workers 3 > renders/render.log 2>&1
  ffmpeg -v error -y -i renders/$N${2:+-s$2}.mp4 -i assets/media/${N}_mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest renders/$N${2:+-s$2}-zvuk.mp4
  echo renders/$N${2:+-s$2}-zvuk.mp4
fi
