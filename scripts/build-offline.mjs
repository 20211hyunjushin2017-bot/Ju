// 인터넷 없이도 열리는 단일 HTML 파일 만들기
// 사용법: npm run build:offline  →  offline/ocean-journey.html
// - 빌드된 JS·CSS, 이미지, 폰트를 모두 파일 하나에 넣습니다.
// - 폰트는 사이트에 쓰인 글자만 골라 담아 용량을 줄입니다. (문구를 바꾸면 다시 실행하세요)
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, extname } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const dist = join(root, 'dist')
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

const families = [
  'Archivo:wdth,wght@62..125,400..900',
  'Noto+Sans+KR:wght@400;500;700;900',
  'Hahmlet:wght@300..700',
  'Jacquard+24',
  'Gowun+Batang:wght@400;700',
  'Cormorant+Garamond:ital,wght@0,500;1,500;1,600',
  'Pinyon+Script',
  'IM+Fell+English:ital@0;1',
]

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)],
  )
}

// 사이트에 쓰인 모든 글자 (+ 기본 영문·숫자·기호)
const used = new Set()
for (let c = 32; c < 127; c++) used.add(String.fromCharCode(c))
for (const f of walk(join(root, 'src'))) {
  if (!/\.(ts|tsx)$/.test(f)) continue
  for (const ch of readFileSync(f, 'utf8')) if (ch.codePointAt(0) > 127 && ch.trim()) used.add(ch)
}
const text = encodeURIComponent([...used].join(''))

async function fontCss() {
  const cache = new Map()
  let out = ''
  for (const fam of families) {
    const res = await fetch(`https://fonts.googleapis.com/css2?family=${fam}&text=${text}&display=swap`, {
      headers: { 'User-Agent': UA },
    })
    if (!res.ok) throw new Error(`폰트 CSS를 받지 못했어요: ${fam} (${res.status})`)
    let css = await res.text()
    for (const [, url] of css.matchAll(/url\((https:[^)]+)\)/g)) {
      if (!cache.has(url)) {
        const buf = Buffer.from(await (await fetch(url, { headers: { 'User-Agent': UA } })).arrayBuffer())
        cache.set(url, `data:font/woff2;base64,${buf.toString('base64')}`)
      }
      css = css.replace(url, cache.get(url))
    }
    // 글자를 골라 담은 폰트라 unicode-range 제한은 빼도 됨
    out += css.replace(/\s*unicode-range:[^;]+;/g, '') + '\n'
  }
  return out
}

const mime = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' }
const images = {}
for (const f of readdirSync(join(root, 'public', 'images'))) {
  const type = mime[extname(f)]
  if (!type) continue
  images[f] = `data:${type};base64,${readFileSync(join(root, 'public', 'images', f)).toString('base64')}`
}

const assets = readdirSync(join(dist, 'assets'))
const js = readFileSync(join(dist, 'assets', assets.find((f) => f.endsWith('.js'))), 'utf8')
const css = readFileSync(join(dist, 'assets', assets.find((f) => f.endsWith('.css'))), 'utf8')
if (/<\/script/i.test(js)) throw new Error('JS 안에 </script 문자열이 있어 인라인할 수 없어요')

const fonts = await fontCss()
const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ocean Journey</title>
<style>
${fonts}
html, body { height: 100%; background: #1a0f08; color: #f3ead8; }
${css}
</style>
<script>window.__OCEAN_IMAGES = ${JSON.stringify(images)};</script>
</head>
<body>
<div id="root"></div>
<script type="module">${js}</script>
</body>
</html>
`
mkdirSync(join(root, 'offline'), { recursive: true })
const out = join(root, 'offline', 'ocean-journey.html')
writeFileSync(out, html)
console.log(`만들었어요: ${out} (${(html.length / 1024 / 1024).toFixed(2)} MB, 글자 ${used.size}개)`)
