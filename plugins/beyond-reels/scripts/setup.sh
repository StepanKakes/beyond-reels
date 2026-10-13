#!/bin/zsh
# Nastavení Macu pro reely Beyond. Spouští se jednou na každém Macu (a znovu po aktualizaci pluginu, nic nerozbije).
#   zsh setup.sh            vše
#   zsh setup.sh --kontrola jen řekne, co chybí
# Výsledek: ~/.config/beyond-reels/env.sh (cesty pro skilly), Python prostředí v ~/.cache/beyond-reels,
# Helvetica Neue vytažená z macOS (písmo se nesmí šířit, proto ho plugin nenese), model pro přepisy.
set -e
BR=~/.cache/beyond-reels; CFG=~/.config/beyond-reels; mkdir -p $BR $CFG
PLUGIN="${0:A:h:h}"
KONTROLA=0; [[ "$1" == "--kontrola" ]] && KONTROLA=1
ok() { print -P "%F{green}ok%f   $1"; }
chybi() { print -P "%F{red}chybí%f $1"; CHYBI=1; }
CHYBI=0

[[ "$(uname -m)" == "arm64" ]] || { echo "Potřeba Mac s Apple čipem"; exit 1; }

# 1) programy z Homebrew
command -v brew >/dev/null || { chybi "Homebrew (https://brew.sh), nainstaluj ho a spusť znovu"; exit 1; }
for p in ffmpeg node uv yt-dlp whisper-cli; do
  if command -v $p >/dev/null; then ok $p
  elif (( KONTROLA )); then chybi $p
  else
    f=$p; [[ $p == whisper-cli ]] && f=whisper-cpp
    brew install $f >/dev/null && ok "$p (nainstalováno)"
  fi
done

# 2) sdílený prostor (repo beo-motion/hyperframes: jádro kitů, styly, B-rolly, hudba, SFX, nástroje)
PROSTOR=""; [[ -f $CFG/env.sh ]] && PROSTOR=$(zsh -c "source $CFG/env.sh; echo \$BR_PROSTOR")
[[ -d "$PROSTOR/jadro" ]] || PROSTOR=~/Documents/GitHub/beo-motion/hyperframes
if [[ ! -d "$PROSTOR/jadro" ]]; then
  if (( KONTROLA )); then chybi "sdílený prostor (beo-motion/hyperframes)"; else
    print "Kde máš složku beo-motion/hyperframes (se složkou jadro)? Zadej cestu:"; read PROSTOR
    [[ -d "$PROSTOR/jadro" ]] || { echo "Ve $PROSTOR není jadro/, naklonuj si repo beo-motion a spusť znovu"; exit 1; }
  fi
fi
[[ -d "$PROSTOR/jadro" ]] && ok "prostor $PROSTOR"
INSPIRACE=~/Documents/inspirace-reels; mkdir -p $INSPIRACE

# 3) Python prostředí: hlavní (zvuk, zarovnání, nástroje) a DeepFilterNet3 (studio hlas) zvlášť, každé chce jiný torch
if [[ -x $BR/venv/bin/python ]]; then ok "python venv"
elif (( KONTROLA )); then chybi "python venv"
else
  uv venv -q $BR/venv --python 3.12
  uv pip install -q --python $BR/venv/bin/python numpy scipy soundfile pillow fonttools opencv-python-headless librosa nara-wpe resampy torch torchaudio transformers
  ok "python venv (nainstalováno)"
fi
if [[ -x $BR/venv_df/bin/python ]]; then ok "DeepFilterNet3 venv"
elif (( KONTROLA )); then chybi "DeepFilterNet3 venv"
else
  uv venv -q $BR/venv_df --python 3.11
  uv pip install -q --python $BR/venv_df/bin/python torch==2.0.1 torchaudio==2.0.2 'numpy<2' deepfilternet soundfile
  ok "DeepFilterNet3 venv (nainstalováno)"
fi

# 4) Helvetica Neue ze systému tohoto Macu
if [[ -f $BR/fonts/HN-Bold.ttf ]]; then ok "Helvetica Neue"
elif (( KONTROLA )); then chybi "Helvetica Neue (vytáhne se ze systému)"
else $BR/venv/bin/python "$PROSTOR/tools/hn_ze_systemu.py" $BR/fonts >/dev/null && ok "Helvetica Neue (vytaženo ze systému)"; fi

# 5) model pro přepisy (whisper.cpp large-v3-turbo); když ho má Vowen, použije se ten
W=$(ls ~/Library/Application\ Support/vowen/models/*large*turbo*.bin 2>/dev/null | head -1)
[[ -z "$W" && -f $BR/whisper/ggml-large-v3-turbo.bin ]] && W=$BR/whisper/ggml-large-v3-turbo.bin
if [[ -n "$W" ]]; then ok "whisper model"
elif (( KONTROLA )); then chybi "whisper model"
else
  mkdir -p $BR/whisper; W=$BR/whisper/ggml-large-v3-turbo.bin
  curl -sL -o $W https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo.bin && ok "whisper model (staženo)"
fi

# 6) HyperFrames v pevné verzi do cache npx
HF=0.8.105
if (( ! KONTROLA )); then npx --yes hyperframes@$HF --version >/dev/null 2>&1 && ok "hyperframes $HF"; fi

# 7) cesty pro skilly
cat > $CFG/env.sh <<EOF
# vytvořil setup.sh pluginu beyond-reels, skilly si ho načtou před každým příkazem
export BR_PROSTOR="$PROSTOR"
export BR_INSPIRACE="$INSPIRACE"
export BR_PLUGIN="$PLUGIN"
export PY="$BR/venv/bin/python"
export BR_DFPY="$BR/venv_df/bin/python"
export BR_FONTS="$BR/fonts"
export BR_WHISPER="$W"
hf() { npx --yes hyperframes@$HF "\$@"; }   # hf check, hf snapshot, hf render (pevná verze)
EOF
ok "cesty v $CFG/env.sh"
(( CHYBI )) && { echo "Něco chybí, spusť zsh setup.sh bez --kontrola"; exit 1; }
echo "Hotovo. V Claude Code napiš /beyond-reels:reel"
