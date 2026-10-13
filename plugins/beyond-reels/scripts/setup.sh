#!/bin/zsh
# Nastavení Macu pro reely Beyond. Spouští se jednou na každém Macu (a klidně znovu po aktualizaci pluginu, nic nerozbije).
#   zsh setup.sh              vše
#   zsh setup.sh --kontrola   jen řekne, co chybí
#   zsh setup.sh --matanyone  navíc MatAnyone2 (masky lidí pro text za osobou, asi 2,5 GB)
# Výsledek: ~/.config/beyond-reels/env.sh (cesty pro skilly a funkce hf), Python prostředí v ~/.cache/beyond-reels,
# Helvetica Neue vytažená z macOS (písmo se nesmí šířit, proto ho plugin nenese), model pro přepisy, složka na reely.
set -e
BR=~/.cache/beyond-reels; CFG=~/.config/beyond-reels; mkdir -p $BR $CFG
KONTROLA=0; MATANYONE=0
for a in "$@"; do [[ $a == --kontrola ]] && KONTROLA=1; [[ $a == --matanyone ]] && MATANYONE=1; done
CHYBI=0
ok() { print -P "%F{green}ok%f    $1"; }
chybi() { print -P "%F{red}chybí%f $1"; CHYBI=1; }
[[ -f $CFG/nastaveni.sh ]] && source $CFG/nastaveni.sh   # dřív zvolené cesty (reely, média)

[[ "$(uname -m)" == "arm64" ]] || { echo "Potřeba Mac s Apple čipem"; exit 1; }

# 1) programy z Homebrew
command -v brew >/dev/null || { echo "Chybí Homebrew: nainstaluj ho z https://brew.sh a spusť setup znovu"; exit 1; }
for p in ffmpeg node uv yt-dlp whisper-cli; do
  if command -v $p >/dev/null; then ok $p
  elif (( KONTROLA )); then chybi $p
  else f=$p; [[ $p == whisper-cli ]] && f=whisper-cpp; brew install $f >/dev/null && ok "$p (nainstalováno)"; fi
done

# 2) složka na reely (projekty každého člena týmu) a balík médií (hudba, B-rolly)
REELY=${BR_REELY:-~/Documents/beyond-reely}; mkdir -p $REELY; ok "reely v $REELY"
MEDIA=${BR_MEDIA:-}
if [[ -z $MEDIA ]]; then
  for k in ~/Documents/beyond-reels-media ~/Documents/GitHub/beo-motion/hyperframes; do
    [[ -d $k/hudba && -d $k/B-rolls ]] && { MEDIA=$k; break; }
  done
fi
if [[ -n $MEDIA && -d $MEDIA/hudba && -d $MEDIA/B-rolls ]]; then ok "média v $MEDIA"
else
  chybi "balík médií (hudba a B-rolly): stáhni beyond-reels-media.zip od Štěpána a rozbal do ~/Documents/beyond-reels-media, pak setup znovu"
  MEDIA=~/Documents/beyond-reels-media
fi
print "BR_REELY=$REELY\nBR_MEDIA=$MEDIA" > $CFG/nastaveni.sh

# 3) Python prostředí: hlavní (zvuk, zarovnání slov, nástroje) a DeepFilterNet3 (studio hlas) zvlášť, každé chce jiný torch
if [[ -x $BR/venv/bin/python ]]; then ok "python prostředí"
elif (( KONTROLA )); then chybi "python prostředí"
else
  uv venv -q $BR/venv --python 3.12
  uv pip install -q --python $BR/venv/bin/python numpy scipy soundfile pillow fonttools opencv-python-headless librosa nara-wpe resampy torch torchaudio transformers
  ok "python prostředí (nainstalováno)"
fi
if [[ -x $BR/venv_df/bin/python ]]; then ok "DeepFilterNet3"
elif (( KONTROLA )); then chybi "DeepFilterNet3"
else
  uv venv -q $BR/venv_df --python 3.11
  uv pip install -q --python $BR/venv_df/bin/python torch==2.0.1 torchaudio==2.0.2 'numpy<2' deepfilternet soundfile
  ok "DeepFilterNet3 (nainstalováno)"
fi

# 4) MatAnyone2 (volitelné): masky lidí po snímcích pro text za osobou
if [[ -x $BR/MatAnyone2/.venv/bin/python ]]; then ok "MatAnyone2"
elif (( MATANYONE && ! KONTROLA )); then
  git clone -q https://github.com/pq-yang/MatAnyone2.git $BR/MatAnyone2
  (cd $BR/MatAnyone2 && uv venv -q --python 3.11 && uv pip install -q -e . && mkdir -p pretrained_models \
    && curl -sL -o pretrained_models/matanyone2.pth https://github.com/pq-yang/MatAnyone2/releases/download/v1.0.0/matanyone2.pth)
  ok "MatAnyone2 (nainstalováno)"
else print -P "%F{yellow}volitelné%f MatAnyone2 pro text za osobou: zsh setup.sh --matanyone"; fi

# 5) Helvetica Neue ze systému tohoto Macu
PL="${0:A:h:h}"
if [[ -f $BR/fonts/HN-Bold.ttf ]]; then ok "Helvetica Neue"
elif (( KONTROLA )); then chybi "Helvetica Neue (vytáhne se ze systému)"
else $BR/venv/bin/python "$PL/prostor/tools/hn_ze_systemu.py" $BR/fonts >/dev/null && ok "Helvetica Neue (vytaženo ze systému)"; fi

# 6) model pro přepisy (whisper.cpp large-v3-turbo); když ho má Vowen, použije se ten
W=$(ls ~/Library/Application\ Support/vowen/models/*large*turbo*.bin 2>/dev/null | head -1)
[[ -z "$W" && -f $BR/whisper/ggml-large-v3-turbo.bin ]] && W=$BR/whisper/ggml-large-v3-turbo.bin
if [[ -n "$W" ]]; then ok "whisper model"
elif (( KONTROLA )); then chybi "whisper model"
else
  mkdir -p $BR/whisper; W=$BR/whisper/ggml-large-v3-turbo.bin
  curl -sL -o $W https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo.bin && ok "whisper model (staženo)"
fi

# 7) HyperFrames v pevné verzi do cache npx
(( KONTROLA )) || { npx --yes hyperframes@0.8.105 --version >/dev/null 2>&1 && ok "hyperframes 0.8.105"; }

# 8) cesty pro skilly. BR_PLUGIN se hledá při každém načtení, takže po aktualizaci pluginu není potřeba setup znovu.
cat > $CFG/env.sh <<EOF
# vytvořil setup.sh pluginu beyond-reels, skilly ho načtou před každým příkazem
_br_plugin() {
  [ -n "\$ZSH_VERSION" ] && setopt local_options null_glob
  local d c=""
  for d in ~/.claude/plugins/cache/*/beyond-reels/*; do [ -f "\$d/prostor/jadro/VERZE" ] && c="\$d"; done   # nainstalovaná, nejvyšší verze
  [ -z "\$c" ] && for d in ~/.claude/plugins/marketplaces/*/plugins/beyond-reels "$PL"; do [ -z "\$c" ] && [ -f "\$d/prostor/jadro/VERZE" ] && c="\$d"; done
  echo "\$c"
}
export BR_PLUGIN="\$(_br_plugin)"
export BR_PROSTOR="\$BR_PLUGIN/prostor"
export BR_REELY="$REELY"
export BR_MEDIA="$MEDIA"
export BR_HUDBA="$MEDIA/hudba"
export BR_BROLLS="$MEDIA/B-rolls"
export BR_INSPIRACE="\$HOME/Documents/inspirace-reels"
export PY="$BR/venv/bin/python"
export BR_DFPY="$BR/venv_df/bin/python"
export BR_MATANYONE="$BR/MatAnyone2"
export BR_FONTS="$BR/fonts"
export BR_WHISPER="$W"
hf() { npx --yes hyperframes@0.8.105 "\$@"; }   # hf check, hf snapshot, hf render (pevná verze)
EOF
mkdir -p ~/Documents/inspirace-reels
ok "cesty v $CFG/env.sh"
(( CHYBI )) && { echo "Něco chybí, viz výše."; exit 1; }
echo "Hotovo. V Claude Code napiš /beyond-reels:reel"
