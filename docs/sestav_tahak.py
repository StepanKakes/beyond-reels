# Sestaví tahak.html z tahak.src.html: obrázky z docs/obr vloží jako data URI (Artifact nesmí načítat soubory z jiných hostů)
import base64, re, pathlib
d = pathlib.Path(__file__).parent
def uri(m):
    p = d / 'obr' / m.group(1); typ = 'image/webp' if p.suffix == '.webp' else 'image/jpeg'
    return f'data:{typ};base64,' + base64.b64encode(p.read_bytes()).decode()
h = re.sub(r'\{\{img:([^}]+)\}\}', uri, (d / 'tahak.src.html').read_text())
(d / 'tahak.html').write_text(h); print('tahak.html', len(h) // 1024, 'kB')
