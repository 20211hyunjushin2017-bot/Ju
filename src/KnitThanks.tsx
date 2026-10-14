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

// side: 'both' | 'left' | 'right' — 코의 V자 중 왼쪽/오른쪽 다리만 따로 그릴 수 있음
function stitchSprite(color: string, w: number, h: number, dpr: number, side: 'both' | 'left' | 'right' = 'both') {
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
  if (side !== 'right') leg(w * 0.29, -0.55)
  if (side !== 'left') leg(w * 0.71, 0.55)
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
  // 글자 단위로 떠지도록, 읽는 순서대로 글자마다 차지하는 칸 범위를 기록
  const pieces: ({ kind: 'char'; r0: number; r1: number; c0: number; c1: number } | { kind: 'heart'; cells: [number, number][] })[] = []
  for (const l of lines) {
    g.font = `${l.size * S}px ${l.font}`
    const w = g.measureText(l.text).width / S
    const heartW = l.heart ? HEART[0].length + 3 : 0
    const x = Math.round((cols - (w + heartW)) / 2)
    g.fillText(l.text, x * S, (y + l.size * 0.82) * S)
    const chars = Array.from(l.text)
    let acc = ''
    chars.forEach((ch, i) => {
      const a = x + g.measureText(acc).width / S
      acc += ch
      const b = x + g.measureText(acc).width / S
      if (ch.trim())
        pieces.push({
          kind: 'char',
          r0: y - Math.floor(gap / 2),
          r1: y + l.size + Math.ceil(gap / 2),
          c0: i === 0 ? 0 : Math.floor(a),
          c1: i === chars.length - 1 && !l.heart ? cols : Math.floor(b),
        })
    })
    if (l.heart) {
      const hx = Math.round(x + w + 3)
      const hy = Math.round(y + l.size * 0.82 - HEART.length - 1)
      const cells: [number, number][] = []
      HEART.forEach((row, ry) => [...row].forEach((ch, rx) => ch === '#' && cells.push([hx + rx, hy + ry])))
      heartCells.push(...cells)
      pieces.push({ kind: 'heart', cells })
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
  const sparkPieces: [number, number][][] = []
  for (const [sx, sy] of sparks) {
    const cells: [number, number][] = []
    SPARK.forEach((row, ry) =>
      [...row].forEach((ch, rx) => {
        const x = sx + rx
        const yy = sy + ry
        if (ch === '#' && x >= 0 && x < cols && yy >= 0 && yy < rows && !mask[yy * cols + x]) {
          mask[yy * cols + x] = 3
          cells.push([x, yy])
        }
      }),
    )
    sparkPieces.push(cells)
  }

  // 각 코가 몇 번째 글자에 속하는지 (-1: 배경)
  const group = new Int16Array(cols * rows).fill(-1)
  let gi = 0
  for (const pc of pieces) {
    if (pc.kind === 'heart') {
      for (const [x, yy] of pc.cells) if (x >= 0 && x < cols && yy >= 0 && yy < rows) group[yy * cols + x] = gi
    } else {
      for (let r = Math.max(0, pc.r0); r < Math.min(rows, pc.r1); r++)
        for (let c = Math.max(0, pc.c0); c < Math.min(cols, pc.c1); c++) {
          const i = r * cols + c
          if (mask[i] === 1 && group[i] < 0) group[i] = gi
        }
    }
    gi++
  }
  // 글자 폭 밖으로 삐져나온 코는 같은 단에서 가장 가까운 글자에 붙임
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c
      if (mask[i] !== 1 || group[i] >= 0) continue
      for (let d = 1; d < cols; d++) {
        const L = c - d >= 0 ? group[i - d] : -1
        const R = c + d < cols ? group[i + d] : -1
        if (L >= 0 || R >= 0) {
          group[i] = L >= 0 ? L : R
          break
        }
      }
    }
  for (const cells of sparkPieces) {
    for (const [x, yy] of cells) group[yy * cols + x] = gi
    gi++
  }
  return { mask, group, groupCount: gi }
}

// 실타래 + 지금 뜨는 코까지 이어진 실 (위층 캔버스에 매 프레임 다시 그림)
function drawTools(o: CanvasRenderingContext2D, W: number, H: number, x: number, y: number, alpha: number) {
  o.clearRect(0, 0, W, H)
  if (alpha <= 0) return
  o.globalAlpha = alpha
  const bx = W - 70
  const by = H - 64
  // 실
  o.strokeStyle = YARN_TEXT
  o.lineWidth = 2
  o.beginPath()
  o.moveTo(x, y)
  o.quadraticCurveTo((x + bx) / 2, Math.max(y, by) + 40, bx - 20, by)
  o.stroke()
  // 실타래
  o.fillStyle = YARN_TEXT
  o.beginPath()
  o.arc(bx, by, 34, 0, Math.PI * 2)
  o.fill()
  o.strokeStyle = '#cdbf9f'
  o.lineWidth = 2
  for (let k = -2; k <= 2; k++) {
    o.beginPath()
    o.ellipse(bx, by, 34, 12 + Math.abs(k) * 4, 0.6 + k * 0.35, 0, Math.PI * 2)
    o.stroke()
  }
  o.globalAlpha = 1
}

export function KnitThanks({ lines, onReplay }: { lines: KnitLine[]; onReplay: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const toolsRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    let raf = 0
    let cancelled = false

    async function start() {
      await Promise.all(lines.map((l) => document.fonts.load(`${l.size * 4}px ${l.font}`, l.text)))
      if (cancelled) return
      const W = window.innerWidth
      const H = window.innerHeight
      const dpr = Math.min(1.5, window.devicePixelRatio || 1)
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
      // 글자 폭이 화면의 약 60%가 되도록 코 크기를 정함
      const cw = Math.max(3, Math.min(8.5, W / (need / 0.6)))
      const ch = cw * 0.86
      const cols = Math.ceil(W / cw)
      const rows = Math.ceil(H / ch)
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      const g = canvas.getContext('2d')!
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
      const tools = toolsRef.current!
      tools.width = canvas.width
      tools.height = canvas.height
      tools.style.width = `${W}px`
      tools.style.height = `${H}px`
      const o = tools.getContext('2d')!
      o.setTransform(dpr, 0, 0, dpr, 0, 0)

      const bgSprites = YARN_BG.map((c) => stitchSprite(c, cw, ch, dpr))
      const colors = [YARN_TEXT, YARN_TEXT, YARN_HEART, YARN_SPARK]
      const lefts = colors.map((c) => stitchSprite(c, cw, ch, dpr, 'left'))
      const rights = colors.map((c) => stitchSprite(c, cw, ch, dpr, 'right'))
      const { mask, group, groupCount } = rasterize(layout, cols, rows)

      const bgOf = (i: number) => bgSprites[(i * 2654435761) % 3 >>> 0]
      const draw = (s: HTMLCanvasElement, col: number, row: number) => {
        g.drawImage(s, col * cw, row * ch, cw, ch)
      }
      // 코의 다리를 위에서 아래로 frac만큼만 그림 (실이 내려오며 감기는 느낌)
      const drawPart = (s: HTMLCanvasElement, col: number, row: number, frac: number) => {
        if (frac <= 0) return
        const f = Math.min(1, frac)
        g.drawImage(s, 0, 0, s.width, s.height * f, col * cw, row * ch, cw, ch * f)
      }
      g.fillStyle = '#132538'
      g.fillRect(0, 0, W, H)
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) draw(bgOf(r * cols + c), c, r)

      // 왼쪽 위 글자부터 한 글자씩. 글자 안에서는 실제 뜨개처럼 아래 단부터 위로, 단마다 방향을 바꿔 가며 한 코씩 뜸
      const perGroup = 190
      const stitchMs = 220
      const members: number[][] = Array.from({ length: groupCount }, () => [])
      // 반짝이(3)는 뜨지 않고, 글자를 다 뜬 뒤 한 번에 나타남
      const sparkCells: number[] = []
      for (let i = 0; i < mask.length; i++) {
        if (mask[i] === 3) sparkCells.push(i)
        else if (mask[i] && group[i] >= 0) members[group[i]].push(i)
      }
      const timed: { idx: number; at: number }[] = []
      members.forEach((cells, gi) => {
        const byRow = new Map<number, number[]>()
        for (const idx of cells) {
          const r = Math.floor(idx / cols)
          if (!byRow.has(r)) byRow.set(r, [])
          byRow.get(r)!.push(idx)
        }
        const ordered: number[] = []
        ;[...byRow.keys()]
          .sort((a, b) => b - a)
          .forEach((r, k) => {
            const row = byRow.get(r)!.sort((a, b) => a - b)
            ordered.push(...(k % 2 ? row.reverse() : row))
          })
        ordered.forEach((idx, k) => timed.push({ idx, at: gi * perGroup + (k / ordered.length) * perGroup * 1.15 }))
      })
      timed.sort((a, b) => a.at - b.at)
      const order = timed.map((o) => o.idx)
      const startAt = timed.map((o) => o.at)
      const done = new Uint8Array(order.length)
      let current = -1
      let finishedAt = 0
      const t0 = performance.now()
      const tick = (now: number) => {
        const t = now - t0
        for (let i = 0; i < order.length; i++) {
          const p = (t - startAt[i]) / stitchMs
          if (p <= 0) break
          if (done[i]) continue
          const idx = order[i]
          const col = idx % cols
          const row = (idx - col) / cols
          draw(bgOf(idx), col, row)
          // 왼쪽 다리 → 오른쪽 다리 순서로 실이 감기듯 그려짐
          drawPart(lefts[mask[idx]], col, row, p / 0.55)
          drawPart(rights[mask[idx]], col, row, (p - 0.45) / 0.55)
          if (p >= 1) done[i] = 1
          current = i
        }
        const remaining = done.indexOf(0) !== -1
        if (!remaining && !finishedAt) {
          finishedAt = t
          for (const idx of sparkCells) {
            const col = idx % cols
            const row = (idx - col) / cols
            draw(bgOf(idx), col, row)
            draw(lefts[3], col, row)
            draw(rights[3], col, row)
          }
        }
        if (current >= 0) {
          const idx = order[current]
          const col = idx % cols
          const row = (idx - col) / cols
          const fadeOut = finishedAt ? 1 - (t - finishedAt) / 600 : 1
          drawTools(o, W, H, col * cw + cw / 2, row * ch + ch / 2, fadeOut)
        }
        if (remaining || (finishedAt && t - finishedAt < 650)) raf = requestAnimationFrame(tick)
        else o.clearRect(0, 0, W, H)
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
      <canvas ref={toolsRef} className="knit-canvas" aria-hidden="true" />
      <h2 className="sr-only">{lines.map((l) => l.text + (l.heart ? ' 🤍' : '')).join(' ')}</h2>
      <button className="knit-replay" onClick={onReplay}>
        처음부터 다시 보기
      </button>
    </div>
  )
}
