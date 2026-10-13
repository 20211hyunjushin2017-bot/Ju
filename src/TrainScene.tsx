import { useImperativeHandle, useRef, type Ref } from 'react'
import { setTrainSpeed } from './sound'

export type TrainHandle = {
  // tiles: 창문 너비 몇 칸만큼 풍경이 지나갈지 (짝수여야 원래 풍경에서 멈춤)
  ride: (tiles: number, ms: number) => Promise<void>
  skip: () => void
}

const STRIP_TILES = 13
const img = (name: string) => `${import.meta.env.BASE_URL}images/${name}`

export function TrainScene({ ref, dim }: { ref?: Ref<TrainHandle>; dim: boolean }) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const sharpRef = useRef<HTMLDivElement>(null)
  const blurRef = useRef<HTMLDivElement>(null)
  const blurStripRef = useRef<HTMLDivElement>(null)
  const polesRef = useRef<HTMLDivElement>(null)
  const active = useRef<{ raf: number; finish: () => void } | null>(null)

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
    ride(tiles, ms) {
      active.current?.finish()
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      return new Promise<void>((resolve) => {
        const finish = () => {
          if (active.current) cancelAnimationFrame(active.current.raf)
          active.current = null
          paint(0, 0, 0)
          resolve()
        }
        if (reduced) {
          finish()
          return
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
    skip() {
      active.current?.finish()
    },
  }))

  // 홀수 칸은 좌우 반전된 풍경 (반전 시 글자가 뒤집혀 보이지 않도록 로고를 지운 이미지)
  const tiles = (name: string, mirror: string) =>
    Array.from({ length: STRIP_TILES }, (_, i) => (
      <div key={i} className="tile" style={{ backgroundImage: `url(${img(i % 2 ? mirror : name)})` }} />
    ))

  return (
    <div className="stage" aria-hidden="true">
      <div className="scene" ref={sceneRef}>
        <img className="scene-img" src={img('train.webp')} alt="" />
        <div className="window">
          <div className="strip" ref={sharpRef}>
            {tiles('view.webp', 'view-mirror.webp')}
          </div>
          <div className="window-blur" ref={blurRef}>
            <div className="strip" ref={blurStripRef}>
              {tiles('view-blur.webp', 'view-mirror-blur.webp')}
            </div>
          </div>
          <div className="poles" ref={polesRef} />
        </div>
        {/* 창문 손잡이만 오려낸 이미지 (풍경 위에 고정) */}
        <img className="latch" src={img('latch.png')} alt="" />
      </div>
      <div className={dim ? 'stage-shade on' : 'stage-shade'} />
    </div>
  )
}
