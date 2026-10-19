import { useImperativeHandle, useRef, type ReactNode, type Ref } from 'react'
import { setTrainSpeed } from './sound'
import { imgUrl } from './assets'

// 창밖 풍경 이름. public/images에 {name}.webp, {name}-mirror.webp, 각각의 -blur.webp가 있어야 함
export type View = 'view' | 'ch1-view' | 'ch2-view' | 'ch3-view'

export type TrainHandle = {
  // 지금 보이는 풍경에서 to 풍경까지 창문 두 칸을 달려 도착
  // (가운데 칸은 떠나는 풍경의 거울상에서 도착 풍경의 거울상으로 서서히 이어져 경계가 보이지 않음)
  ride: (to: View, ms: number) => Promise<void>
  // 달리지 않고 바로 풍경만 바꿈
  setView: (v: View) => void
  skip: () => void
}

const STRIP_TILES = 3
const img = imgUrl

// children: 창문 안에 보이는 도착지 풍경 / overlay: 기차 그림 좌표 기준으로 실내에 놓는 요소 (예: 창턱 위 편지)
export function TrainScene({
  ref,
  dim,
  children,
  overlay,
  mood = 'day',
}: {
  ref?: Ref<TrainHandle>
  dim: boolean
  mood?: 'day' | 'night' | 'dawn'
  children?: ReactNode
  overlay?: ReactNode
}) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const sharpRef = useRef<HTMLDivElement>(null)
  const blurRef = useRef<HTMLDivElement>(null)
  const blurStripRef = useRef<HTMLDivElement>(null)
  const polesRef = useRef<HTMLDivElement>(null)
  const active = useRef<{ raf: number; finish: () => void } | null>(null)
  const viewRef = useRef<View>('view')

  // 칸 i의 아래층(base)과 위층(over, 오른쪽으로 갈수록 보이는 그림)
  function setTile(i: number, base: string, over?: string) {
    for (const strip of [sharpRef.current!, blurStripRef.current!]) {
      const blur = strip === blurStripRef.current ? '-blur' : ''
      const tile = strip.children[i] as HTMLElement
      ;(tile.children[0] as HTMLElement).style.backgroundImage = `url(${img(`${base}${blur}.webp`)})`
      const o = tile.children[1] as HTMLElement
      o.style.backgroundImage = over ? `url(${img(`${over}${blur}.webp`)})` : 'none'
    }
  }

  // v: 0~1 (정차~순항), tps: 순항 속도 (창문 너비/초)
  function paint(p: number, v: number, t: number, tps = 0) {
    const shift = `translate3d(${(-p * 100) / STRIP_TILES}%,0,0)`
    sharpRef.current!.style.transform = shift
    blurStripRef.current!.style.transform = shift
    const blur = Math.min(1, Math.max(0, (v * tps - 0.12) / 0.55))
    blurRef.current!.style.opacity = String(blur * blur * (3 - 2 * blur))
    const poleFrac = ((p * 2.3) / 0.6) % 1
    polesRef.current!.style.transform = `translate3d(${-poleFrac * 25}%,0,0)`
    polesRef.current!.style.opacity = String(Math.max(0, v - 0.25) * Math.min(1, tps / 0.6) * 0.9)
    const shake = Math.sin(t * 0.045) * 1.4 * v + Math.sin(t * 0.13) * 0.5 * v
    sceneRef.current!.style.transform = `translate(-50%, calc(-50% + ${shake}px))`
    setTrainSpeed(v)
  }

  useImperativeHandle(ref, () => ({
    ride(to, ms) {
      active.current?.finish()
      const from = viewRef.current
      setTile(0, from)
      setTile(1, `${from}-mirror`, `${to}-mirror`)
      setTile(2, to)
      viewRef.current = to
      const tiles = 2
      return new Promise<void>((resolve) => {
        const finish = () => {
          if (active.current) cancelAnimationFrame(active.current.raf)
          active.current = null
          // 도착 풍경을 첫 칸으로 옮겨 두고 제자리로 (다음 출발은 이 풍경에서 시작)
          setTile(0, to)
          paint(0, 0, 0)
          resolve()
        }
        const a = ms * 0.22
        const d = ms * 0.38
        const vmax = tiles / (ms - a / 2 - d / 2)
        const start = performance.now()
        const tick = (now: number) => {
          const t = now - start
          if (t >= ms) {
            finish()
            return
          }
          let p: number
          let v: number
          if (t < a) {
            p = (0.5 * vmax * t * t) / a
            v = t / a
          } else if (t < ms - d) {
            p = 0.5 * vmax * a + vmax * (t - a)
            v = 1
          } else {
            const tc = t - (ms - d)
            p = 0.5 * vmax * a + vmax * (ms - d - a) + vmax * tc - (0.5 * vmax * tc * tc) / d
            v = 1 - tc / d
          }
          paint(p, v, t, vmax * 1000)
          active.current!.raf = requestAnimationFrame(tick)
        }
        active.current = { raf: requestAnimationFrame(tick), finish }
      })
    },
    setView(v) {
      active.current?.finish()
      viewRef.current = v
      setTile(0, v)
      paint(0, 0, 0)
    },
    skip() {
      active.current?.finish()
    },
  }))

  // 처음에는 조선소 풍경 한 칸만 보임. 나머지 칸 그림은 달리기 직전에 채움
  const tiles = (blur: string) =>
    Array.from({ length: STRIP_TILES }, (_, i) => (
      <div key={i} className="tile">
        <div className="tile-base" style={i === 0 ? { backgroundImage: `url(${img(`view${blur}.webp`)})` } : undefined} />
        <div className="tile-over" />
      </div>
    ))

  return (
    <div className={`stage mood-${mood}`}>
      <div className="scene" ref={sceneRef}>
        <img className="scene-img" src={img('train.webp')} alt="" aria-hidden="true" />
        {/* 시간대에 따라 기차 안을 어둡게 하고, 벽 램프 불빛만 남김 */}
        <div className="interior-mood" aria-hidden="true">
          <span className="lamp-glow" style={{ left: '14.7%', top: '29.7%' }} />
          <span className="lamp-glow" style={{ left: '85.4%', top: '29.7%' }} />
        </div>
        <div className="window">
          <div className="strip" ref={sharpRef}>
            {tiles('')}
          </div>
          <div className="window-blur" ref={blurRef}>
            <div className="strip" ref={blurStripRef}>
              {tiles('-blur')}
            </div>
          </div>
          <div className="poles" ref={polesRef} />
          {children}
        </div>
        {/* 창문 손잡이만 오려낸 이미지 (풍경 위에 고정) */}
        <img className="latch" src={img('latch.png')} alt="" aria-hidden="true" />
        {overlay}
      </div>
      <div className={dim ? 'stage-shade on' : 'stage-shade'} />
    </div>
  )
}
