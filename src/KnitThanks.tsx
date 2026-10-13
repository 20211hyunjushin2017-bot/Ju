import { useEffect, useRef } from 'react'

// 뜨개 원단 위에 글자가 한 코씩 떠지는 마지막 페이지
// 글자를 코(stitch) 단위 격자로 래스터화한 뒤, 아래 단부터 위로 지그재그로 떠 올라갑니다.

export type KnitLine = { text: string; font: string; size: number; heart?: boolean }

const YARN_BG = ['#1c3550', '#1f3a57', '#1a324b']
const YARN_TEXT = '#f3e9d2'
const YARN_HEART = '#ffffff'
const YARN_SPARK = '#e9c77b'

// 하트 모양 (7×6 코)
const HEART = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...']
// 반짝이 모양 (5×5 코)
const SPARK = ['..#..', '..#..', '#####', '..#..', '..#..']

function stitchSprite(color: string, w: number, h: number, dpr: number) {
  const c = document.createElement('canvas')
  c.width = Math.ceil(w * dpr)
  c.height = Math.ceil(h * dpr)
  const g = c.getContext('2d')!
  g.scale(dpr, dpr)
  const leg = (cx: number, rot: number) => {
    g.save()
    g.translate(cx, h * 0.52)
    g.rotate(rot)
    const grad = g.createLinearGradient(-w * 0.28, 0, w * 0.28, 0)
    grad.addColorStop(0, shade(color, -0.35))
    grad.addColorStop(0.45, shade(color, 0.12))
    grad.addColorStop(1, shade(color, -0.3))
    g.fillStyle = grad
    g.beginPath()
    g.ellipse(0, 0, w * 0.27, h * 0.62, 0, 0, Math.PI * 2)
    g.fill()
    g.restore()
  }
  leg(w * 0.29, -0.55)
  leg(w * 0.71, 0.55)
  return c
}

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16)
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)))
  const r = f((n >> 16) & 255)
  const gg = f((n >> 8) & 255)
  const b = f(n & 255)
  return `rgb(${r},${gg},${b})`
}

// 좁은 화면에서는 한 줄을 띄어쓰기 기준으로 두 줄로 나눔
function splitLines(lines: KnitLine[]): KnitLine[] {
  return lines.flatMap((l) => {
    const words = l.text.split(' ')
    if (words.length < 2) return [l]
    let best = 1
    for (let i = 1; i < words.length; i++) {
      const a = words.slice(0, i).join(' ').length
      const b = words.slice(i).join(' ').length
      const ba = words.slice(0, best).join(' ').length
      const bb = words.slice(best).join(' ').length
      if (Math.abs(a - b) < Math.abs(ba - bb)) best = i
    }
    return [
      { ...l, text: words.slice(0, best).join(' '), heart: false },
      { ...l, text: words.slice(best).join(' ') },
    ]
  })
}

// 텍스트를 cols×rows 격자의 코 마스크로 변환
function rasterize(lines: KnitLine[], cols: number, rows: number) {
  const S = 4
  const c = document.createElement('canvas')
  c.width = cols * S
  c.height = rows * S
  const g = c.getContext('2d', { willReadFrequently: true })!
  g.fillStyle = '#000'
  g.textBaseline = 'alphabetic'
  g.textAlign = 'left'
  const heights = lines.map((l) => l.size)
  const gap = 5
  const total = heights.reduce((a, b) => a + b, 0) + gap * (lines.length - 1)
  let y = Math.round((rows - total) / 2)
  const heartCells: [number, number][] = []
  const bounds = { x0: cols, y0: rows, x1: 0, y1: 0 }
  for (const l of lines) {
    g.font = `${l.size * S}px ${l.font}`
    const w = g.measureText(l.text).width / S
    const heartW = l.heart ? HEART[0].length + 3 : 0
    const x = Math.round((cols - (w + heartW)) / 2)
    g.fillText(l.text, x * S, (y + l.size * 0.82) * S)
    if (l.heart) {
      const hx = Math.round(x + w + 3)
      const hy = Math.round(y + l.size * 0.82 - HEART.length - 1)
      HEART.forEach((row, ry) => [...row].forEach((ch, rx) => ch === '#' && heartCells.push([hx + rx, hy + ry])))
    }
    bounds.x0 = Math.min(bounds.x0, x)
    bounds.x1 = Math.max(bounds.x1, x + w + heartW)
    y += l.size + gap
  }
  bounds.y0 = Math.round((rows - total) / 2)
  bounds.y1 = bounds.y0 + total
  const data = g.getImageData(0, 0, c.width, c.height).data
  const mask = new Uint8Array(cols * rows)
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      let a = 0
      for (let yy = 0; yy < S; yy++)
        for (let xx = 0; xx < S; xx++) a += data[((r * S + yy) * c.width + col * S + xx) * 4 + 3]
      if (a / (S * S * 255) > 0.42) mask[r * cols + col] = 1
    }
  }
  for (const [x, yy] of heartCells) if (x >= 0 && x < cols && yy >= 0 && yy < rows) mask[yy * cols + x] = 2
  const left = Math.max(1, bounds.x0 - 9)
  const right = Math.round(Math.min(cols - 6, bounds.x1 + 3))
  const sparks: [number, number][] = [
    [left, bounds.y0 - 6],
    [right, bounds.y0 - 2],
    [Math.max(1, bounds.x0 - 5), bounds.y1 - 2],
    [right - 3, bounds.y1 + 4],
    [Math.round((bounds.x0 + bounds.x1) / 2) - 2, Math.round(bounds.y0 - 11)],
  ]
  for (const [sx, sy] of sparks)
    SPARK.forEach((row, ry) =>
      [...row].forEach((ch, rx) => {
        const x = sx + rx
        const yy = sy + ry
        if (ch === '#' && x >= 0 && x < cols && yy >= 0 && yy < rows && !mask[yy * cols + x]) mask[yy * cols + x] = 3
      }),
    )
  return mask
}

export function KnitThanks({ lines, onReplay }: { lines: KnitLine[]; onReplay: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    let raf = 0
    let cancelled = false

    async function start() {
      await Promise.all(lines.map((l) => document.fonts.load(`${l.size * 4}px ${l.font}`, l.text)))
      if (cancelled) return
      const W = window.innerWidth
      const H = window.innerHeight
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      // 글자가 들어갈 가로 코 수를 먼저 재고, 화면에 맞는 코 크기를 정함
      const probe = document.createElement('canvas').getContext('2d')!
      const widest = (ls: KnitLine[]) =>
        Math.max(
          ...ls.map((l) => {
            probe.font = `${l.size}px ${l.font}`
            return probe.measureText(l.text).width + (l.heart ? HEART[0].length + 3 : 0)
          }),
        )
      let layout = lines
      if (W / (widest(lines) + 26) < 5) layout = splitLines(lines)
      const need = widest(layout)
      const cw = Math.max(3, Math.min(11, W / (need + 26)))
      const ch = cw * 0.86
      const cols = Math.ceil(W / cw)
      const rows = Math.ceil(H / ch)
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      const g = canvas.getContext('2d')!
      g.setTransform(dpr, 0, 0, dpr, 0, 0)

      const bgSprites = YARN_BG.map((c) => stitchSprite(c, cw, ch, dpr))
      const sprites = [null, stitchSprite(YARN_TEXT, cw, ch, dpr), stitchSprite(YARN_HEART, cw, ch, dpr), stitchSprite(YARN_SPARK, cw, ch, dpr)]
      const mask = rasterize(layout, cols, rows)

      const bgOf = (i: number) => bgSprites[(i * 2654435761) % 3 >>> 0]
      const draw = (s: HTMLCanvasElement, col: number, row: number, alpha = 1) => {
        g.globalAlpha = alpha
        g.drawImage(s, col * cw, row * ch, cw, ch)
      }
      g.fillStyle = '#132538'
      g.fillRect(0, 0, W, H)
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) draw(bgOf(r * cols + c), c, r)

      // 아래 단부터 위로, 단마다 방향을 바꿔 가며 뜨기
      const order: number[] = []
      for (let r = rows - 1, k = 0; r >= 0; r--, k++) {
        const rowCells: number[] = []
        for (let c = 0; c < cols; c++) if (mask[r * cols + c]) rowCells.push(r * cols + c)
        if (k % 2) rowCells.reverse()
        order.push(...rowCells)
      }
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const total = reduced ? 1 : 3800
      const fade = 140
      const t0 = performance.now()
      const tick = (now: number) => {
        const t = now - t0
        for (let i = 0; i < order.length; i++) {
          const startAt = (i / order.length) * total
          const p = (t - startAt) / fade
          if (p <= 0) break
          if (p > 1 + 16 / fade) continue
          const idx = order[i]
          const col = idx % cols
          const row = (idx - col) / cols
          draw(bgOf(idx), col, row)
          draw(sprites[mask[idx]]!, col, row, Math.min(1, p))
        }
        g.globalAlpha = 1
        if (t < total + fade + 20) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }
    void start()
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [lines])

  return (
    <div className="knit-page">
      <canvas ref={canvasRef} className="knit-canvas" aria-hidden="true" />
      <h2 className="sr-only">{lines.map((l) => l.text + (l.heart ? ' 🤍' : '')).join(' ')}</h2>
      <button className="knit-replay" onClick={onReplay}>
        처음부터 다시 보기
      </button>
    </div>
  )
}
