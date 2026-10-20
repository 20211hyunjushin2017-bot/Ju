# 나눔스퀘어 네오를 사이트에 쓰인 글자만 남겨 src/nanum.css 에 담습니다.
# 문구를 바꾸면 다시 실행: python3 scripts/subset-nanum.py
import base64, glob, io, urllib.request
from fontTools import subset
from fontTools.ttLib import TTFont

BASE = 'https://hangeul.pstatic.net/hangeul_static/webfont/NanumSquareNeo/NanumSquareNeoTTF-'
WEIGHTS = {300: 'aLt', 400: 'bRg', 700: 'cBd', 800: 'dEb'}

chars = {chr(c) for c in range(32, 127)}
for f in glob.glob('src/**/*.ts*', recursive=True):
    chars |= {ch for ch in open(f, encoding='utf8').read() if ord(ch) > 127 and ch.strip()}
text = ''.join(sorted(chars))

css = ["/* 자동 생성: scripts/subset-nanum.py (나눔스퀘어 네오, 사이트에 쓰인 글자만) */"]
for w, code in WEIGHTS.items():
    req = urllib.request.Request(BASE + code + '.woff', headers={'User-Agent': 'Mozilla/5.0'})
    raw = urllib.request.urlopen(req, timeout=60).read()
    font = TTFont(io.BytesIO(raw))
    opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = ['*']
    sub = subset.Subsetter(opts); sub.populate(text=text); sub.subset(font)
    out = io.BytesIO(); font.flavor = 'woff2'; font.save(out)
    b64 = base64.b64encode(out.getvalue()).decode()
    css.append(f"@font-face {{\n  font-family: 'NanumSquare Neo';\n  font-weight: {w};\n  font-display: swap;\n  src: url(data:font/woff2;base64,{b64}) format('woff2');\n}}")
    print(w, len(out.getvalue()) // 1024, 'KB')
open('src/nanum.css', 'w').write('\n'.join(css) + '\n')
