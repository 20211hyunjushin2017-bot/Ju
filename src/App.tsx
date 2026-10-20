import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { chapters, site, type Chapter } from './content'
import { TrainScene, type TrainHandle } from './TrainScene'
import { KnitThanks } from './KnitThanks'
import { imgUrl } from './assets'
import { soundOn } from './sound'
import './App.css'
import './nanum.css'

type Phase = 'landing' | 'slides' | 'ride' | 'chapter' | 'thanks'


// 첫 화면 제목: 스크립트체 T + 고전 세리프, 손으로 쓴 듯한 whimsical 느낌
const SPARKLES = [
  { x: '6%', y: '8%', s: 22, d: 0 },
  { x: '92%', y: '4%', s: 16, d: 0.8 },
  { x: '97%', y: '56%', s: 26, d: 1.6 },
  { x: '2%', y: '70%', s: 14, d: 2.2 },
  { x: '58%', y: '-6%', s: 12, d: 1.2 },
  { x: '30%', y: '102%', s: 18, d: 0.4 },
]

// 글자마다 아주 조금씩 기울기·높이를 달리해 손으로 찍은 듯한 느낌 (고정값, 움직이지 않음)
function Wobbly({ text, seed }: { text: string; seed: number }) {
  return (
    <>
      {Array.from(text).map((ch, i) => {
        const r = hashRand(seed * 97 + i * 7 + 1) * 2.2
        const y = hashRand(seed * 97 + i * 7 + 2) * 0.035
        const sc = 1 + hashRand(seed * 97 + i * 7 + 3) * 0.03
        return ch === ' ' ? (
          ' '
        ) : (
          <span key={i} className="wob" style={{ transform: `translateY(${y}em) rotate(${r}deg) scale(${sc})` }}>
            {ch}
          </span>
        )
      })}
    </>
  )
}

function HeroTitle() {
  const lines = [
    <span key="1">
      <span className="swash">T</span>
      <Wobbly text="he OCEAN" seed={1} />
    </span>,
    <Wobbly key="2" text="JOURNEY" seed={2} />,
    <span key="3" className="hero-l3">
      <span className="hero-rule" aria-hidden="true" />
      <span>
        <Wobbly text="Begins" seed={3} />
      </span>
    </span>,
  ]
  return (
    <div className="hero">
      <h1 className="hero-title" aria-label="The OCEAN JOURNEY Begins">
        {lines.map((l, i) => (
          <motion.span
            key={i}
            className={`hero-line l${i + 1}`}
            aria-hidden="true"
            initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.2 + i * 0.35, duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
          >
            {l}
          </motion.span>
        ))}
      </h1>
      {SPARKLES.map((p, i) => (
        <svg
          key={i}
          className="sparkle"
          viewBox="-10 -10 20 20"
          aria-hidden="true"
          style={{ left: p.x, top: p.y, width: p.s, height: p.s, animationDelay: `${p.d}s` }}
        >
          <path d="M0 -10 C1 -2 2 -1 10 0 C2 1 1 2 0 10 C-1 2 -2 1 -10 0 C-2 -1 -1 -2 0 -10Z" />
        </svg>
      ))}
    </div>
  )
}

// 손으로 그은 화살표 (첫 화면 Start, 소개 장면에서 같이 씀)
function InkArrow() {
  return (
    <svg className="start-arrow" viewBox="0 0 120 24" aria-hidden="true">
      <path d="M3 13.2 C 30 11.6, 62 12.9, 112 11.4" />
      <path d="M97 3.5 C 103 7, 108 9.6, 113.5 11.5 C 108 13.6, 103 16.6, 97.5 20.5" />
    </svg>
  )
}

// Start 다음 소개 장면: 검은 배경 글 두 장 → 흰 배경 그림 한 장
function IntroSlides({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0)
  const count = site.introSlides.length + 1
  const next = () => (i < count - 1 ? setI(i + 1) : onDone())
  const prev = () => setI((n) => Math.max(0, n - 1))
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  const isDiagram = i === count - 1
  return (
    <motion.div
      className={isDiagram ? 'slides light' : 'slides'}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          className="slide"
          initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
          transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
        >
          {isDiagram ? (
            <img className="slide-diagram" src={imgUrl(site.introDiagram)} alt="오션의 OD 시스템" />
          ) : (
            <p className="slide-text">
              {site.introSlides[i].split('\n').map((line, j) => (
                <span key={j}>{line}</span>
              ))}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
      <button className="slide-next" onClick={next} aria-label={isDiagram ? '여정 시작하기' : '다음'}>
        <InkArrow />
      </button>
      <div className="slide-dots" aria-hidden="true">
        {Array.from({ length: count }, (_, k) => (
          <span key={k} className={k === i ? 'on' : ''} />
        ))}
      </div>
    </motion.div>
  )
}

function Arrow() {
  return (
    <svg className="arrow" viewBox="0 0 16 22" aria-hidden="true">
      <path d="M3 2l10 9-10 9" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
    </svg>
  )
}

// 빨간 편지봉투 아이콘 (편지지가 살짝 올라온 모양 + 반짝이)
function LetterIcon() {
  const ink = '#231f20'
  const spark = 'M0 -9 C1 -2 2 -1 9 0 C2 1 1 2 0 9 C-1 2 -2 1 -9 0 C-2 -1 -1 -2 0 -9Z'
  return (
    <svg className="letter-icon" viewBox="0 0 120 112" aria-hidden="true">
      <path d={spark} transform="translate(36 14)" fill={ink} />
      <path d={spark} transform="translate(98 26) scale(.85)" fill={ink} />
      <path d={spark} transform="translate(14 42) scale(.85)" fill={ink} />
      <g className="letter-paper">
        <path d="M60 22 L74 33 H46 Z" fill="#f53333" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
        <path d="M24 56 L33 49 V70 Z M96 56 L87 49 V70 Z" fill="#f53333" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
        <rect x="33" y="33" width="54" height="44" fill="#efe3c8" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
      </g>
      <path d="M24 56 L60 85 L96 56 V102 a5 5 0 0 1 -5 5 H29 a5 5 0 0 1 -5 -5 Z" fill="#ff4848" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
      <path d="M27 104 L57 73 a4 4 0 0 1 6 0 L93 104" fill="#ff4848" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
    </svg>
  )
}

function Captions({ lines, interval }: { lines: string[]; interval: number }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (lines.length < 2) return
    const id = window.setInterval(() => setI((n) => Math.min(n + 1, lines.length - 1)), interval)
    return () => window.clearInterval(id)
  }, [lines, interval])
  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={i}
        className="ride-caption"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.5 }}
      >
        {lines[i]}
      </motion.p>
    </AnimatePresence>
  )
}

const IMG_W = 1672
const IMG_H = 941

// 제목 안의 *기울임* 부분을 회색 이탤릭으로
function Accent({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*[^*]+\*)/).map((part, i) =>
        part.startsWith('*') && part.endsWith('*') ? <em key={i}>{part.slice(1, -1)}</em> : part,
      )}
    </>
  )
}

// Explore 버튼이 그대로 늘어나 둥근 카드가 되는 챕터 소개
function ExploreCard({
  chapter,
  onClose,
  isLast,
  onNext,
}: {
  chapter: Chapter
  onClose: () => void
  isLast: boolean
  onNext: () => void
}) {
  const [idx, setIdx] = useState(0)
  // 카드 안 그림을 크게 보기
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null)
  const total = chapter.sections.length
  const s = chapter.sections[idx]
  const go = (d: number) => setIdx((i) => Math.min(total - 1, Math.max(0, i + d)))
  const pad = (n: number) => String(n).padStart(2, '0')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (zoom) {
        if (e.key === 'Escape') setZoom(null)
        return
      }
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <motion.div
      className="card-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      onClick={onClose}
    >
      <motion.div
        className="xcard"
        layoutId={`explore-${chapter.number}`}
        style={{ borderRadius: 28 }}
        transition={{ type: 'spring', damping: 30, stiffness: 210 }}
        role="dialog"
        aria-modal="true"
        aria-label={`Chapter ${chapter.number} ${chapter.title}`}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          className="xcard-inner"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.28, duration: 0.4 } }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
        >
          <header className="xcard-head">
            <p className="xcard-eyebrow">
              <span className="dot-live" /> CHAPTER {chapter.number} · {chapter.title}
            </p>
            <div className="xcard-head-right">
              <span className="xcard-count">
                {pad(idx + 1)} / {pad(total)}
              </span>
              <button className="xcard-close" onClick={onClose} aria-label="닫기">
                ×
              </button>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              className="xcard-body"
              initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
              transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
            >
              {s.bullets ? (
                <div className="xlist">
                  <h3 className="xflow-title">
                    <Accent text={s.heading} />
                  </h3>
                  <div className="xlist-grid">
                    <ul className="xlist-bullets">
                      {s.bullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                    {s.gallery && (
                      <div className={`xgallery n${s.gallery.length}`}>
                        {s.gallery.map((g, j) => (
                          <button key={g.src} className={`xgallery-item g${j + 1}`} onClick={() => setZoom(g)}>
                            <img src={imgUrl(g.src)} alt={g.alt} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : s.lead ? (
                <div className="xflow">
                  <h3 className="xflow-title">
                    <Accent text={s.heading} />
                  </h3>
                  <div className="xflow-box">
                    <p className="xflow-lead">
                      {s.lead.split('\n').map((line, j) => (
                        <span key={j}>{line}</span>
                      ))}
                    </p>
                    {s.then && (
                      <>
                        <svg className="xflow-arrow" viewBox="0 0 24 60" aria-hidden="true">
                          <path d="M12 3 C 11.4 20, 12.6 36, 12 54" />
                          <path d="M4 44 C 7 47.5, 9.6 50.5, 12 55 C 14.4 50.5, 17 47.5, 20 44" />
                        </svg>
                        <ul className="xflow-then">
                          {s.then.map((t, j) => (
                            <li key={j}>{t}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="xcard-main">
                  <h3>
                    <Accent text={s.heading} />
                  </h3>
                  {s.body && <p>{s.body}</p>}
                </div>
              )}
              {!s.lead && !s.bullets && (s.image || s.points) && (
                <div className="xcard-side">
                  {s.image && <img src={imgUrl(s.image)} alt="" />}
                  {s.points && (
                    <ol>
                      {s.points.map((pt, j) => (
                        <li key={j}>
                          <span>{pad(j + 1)}</span>
                          {pt}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {zoom && (
              <motion.button
                className="xzoom"
                onClick={() => setZoom(null)}
                aria-label="크게 보기 닫기"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.img
                  src={imgUrl(zoom.src)}
                  alt={zoom.alt}
                  initial={{ scale: 0.92 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  transition={{ type: 'spring', damping: 26, stiffness: 260 }}
                />
              </motion.button>
            )}
          </AnimatePresence>

          <footer className="xcard-foot">
            <div className="xcard-tabs" role="tablist" aria-label="소개 순서">
              {chapter.sections.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === idx}
                  className={i === idx ? 'on' : ''}
                  onClick={() => setIdx(i)}
                >
                  {pad(i + 1)}
                </button>
              ))}
            </div>
            <div className="xcard-actions">
              <button className="pill ghost" onClick={() => go(-1)} disabled={idx === 0} aria-label="이전">
                <Arrow />
              </button>
              {idx < total - 1 ? (
                <button className="pill solid" onClick={() => go(1)}>
                  다음 이야기 <span className="ne">↗</span>
                </button>
              ) : isLast ? (
                <button className="pill solid letter-pill" onClick={onNext} aria-label="마지막 편지 열기">
                  <LetterIcon /> 편지 열기
                </button>
              ) : (
                <button className="pill solid" onClick={onNext}>
                  다음 챕터로 <span className="ne">↗</span>
                </button>
              )}
            </div>
          </footer>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

function Walkers({ walkers }: { walkers: NonNullable<Chapter['walkers']> }) {
  const walk = 3.4
  return (
    <>
      {walkers.map((w, i) => (
        <motion.div
          key={w.src}
          className="walker"
          style={{ left: `${(w.x / IMG_W) * 100}%`, top: `${(w.y / IMG_H) * 100}%`, width: `${(w.w / IMG_W) * 100}%` }}
          initial={{ x: '70cqw' }}
          animate={{ x: 0 }}
          transition={{ delay: 0.5 + i * 0.35, duration: walk, ease: [0.1, 0.4, 0.4, 1] }}
        >
          <motion.img
            src={imgUrl(w.src)}
            alt=""
            animate={{ y: [0, -5, 0, -5, 0], rotate: [0, -2, 0, 2, 0] }}
            transition={{ delay: 0.5 + i * 0.35, duration: 0.7, repeat: Math.round(walk / 0.7) - 1, ease: 'linear' }}
          />
        </motion.div>
      ))}
    </>
  )
}

// 글자마다 조금씩 다른 각도·위치로 떨리는 손그림 느낌의 제목
const hashRand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return (x - Math.floor(x)) * 2 - 1
}

function BoilText({ text }: { text: string }) {
  const words = useMemo(() => {
    const vars = ['--r1', '--r2', '--r3', '--x1', '--y1', '--x2', '--y2', '--x3', '--y3']
    const scale = [2.4, 2.4, 2.4, 0.025, 0.03, 0.025, 0.03, 0.025, 0.03]
    const unit = ['deg', 'deg', 'deg', 'em', 'em', 'em', 'em', 'em', 'em']
    return text.split(' ').map((w, wi) =>
      Array.from(w).map((ch, j) => {
        const i = wi * 50 + j
        const style = Object.fromEntries(
          vars.map((v, k) => [v, `${hashRand(i * 9 + k + text.length * 31) * scale[k]}${unit[k]}`]),
        ) as CSSProperties
        return { ch, style }
      }),
    )
  }, [text])
  return (
    <span aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true">
          {i > 0 && ' '}
          <span className="boil-word">
            {w.map((c, j) => (
              <span key={j} className={/[WVY]/.test(c.ch) ? 'boil tight' : 'boil'} style={c.style}>
                {c.ch}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  )
}

// 창문 안 도착지: 풍경이 흐릿하게 확대된 상태에서 또렷하게 자리 잡고, 그 위에 챕터 제목이 뜸
function Destination({
  chapter,
  explored,
  ready,
  exploring,
  onExplore,
}: {
  chapter: Chapter
  explored: boolean
  ready: boolean
  exploring: boolean
  onExplore: () => void
}) {
  return (
    <motion.div
      className="dest"
      style={{ '--ink': chapter.theme.ink } as CSSProperties}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      transition={{ duration: 0.35 }}
    >
      <div className="dest-bg">
        <div className="dest-drift">
          {chapter.scene === 'stars' && chapter.image && (
            <div className="dest-imgbox">
              <img src={imgUrl(chapter.image)} alt="" />
              {chapter.walkers && <Walkers walkers={chapter.walkers} />}
            </div>
          )}
          {chapter.scene === 'photo' && chapter.image && (
            <img className="land-photo" src={imgUrl(chapter.image)} alt="" />
          )}
        </div>
      </div>
      <div className={`dest-vignette mood-${chapter.mood}`} />
      <AnimatePresence>
        {ready && (
          <motion.div
            key="text"
            className={`dest-text scene-${chapter.scene}`}
            initial="hide"
            animate="show"
            exit="hide"
            variants={{ show: { transition: { staggerChildren: 0.18 } } }}
          >
            {[
              <p key="l" className="chapter-label">
                <BoilText text={`CHAPTER ${chapter.number}`} />
              </p>,
              <h2 key="t" className="chapter-title">
                <BoilText text={chapter.title} />
              </h2>,
              <p key="s" className="chapter-sub">
                {chapter.subtitle}
              </p>,
              exploring ? (
                <span key="e" className="explore-btn ghost" aria-hidden="true">
                  Explore <Arrow />
                </span>
              ) : (
                <motion.button
                  key="e"
                  layoutId={`explore-${chapter.number}`}
                  style={{ borderRadius: 999 }}
                  className="explore-btn"
                  onClick={onExplore}
                  transition={{ type: 'spring', damping: 30, stiffness: 210 }}
                >
                  <motion.span layout="position" className="explore-label">
                    {explored ? 'Explore again' : 'Explore'} <Arrow />
                  </motion.span>
                </motion.button>
              ),
            ].map((el) => (
              <motion.div
                key={el.key}
                className="dest-row"
                variants={{
                  hide: { opacity: 0, y: 14, filter: 'blur(6px)' },
                  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8 } },
                }}
              >
                {el}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function App() {
  const train = useRef<TrainHandle>(null)
  const [phase, setPhase] = useState<Phase>('landing')
  const [current, setCurrent] = useState(0)
  const [rideLines, setRideLines] = useState<string[]>([])
  const [rideMs, setRideMs] = useState(0)
  const [isIntro, setIsIntro] = useState(false)
  const [exploring, setExploring] = useState(false)
  const [explored, setExplored] = useState<Set<number>>(new Set())
  const [menuOpen, setMenuOpen] = useState(false)
  // 창문 밖에 보이는 도착지 (null이면 조선소 풍경)
  const [dest, setDest] = useState<number | null>(null)
  // 기차 안 조명 (도착할 챕터의 시간대를 따라 달리는 동안 서서히 바뀜)
  const [mood, setMood] = useState<Chapter['mood']>('day')
  // 이동 중에 메뉴로 다른 곳을 고르면, 앞서 시작한 이동은 도착해도 화면을 바꾸지 않음
  const navId = useRef(0)

  // 도착했을 때 이 이동이 여전히 마지막으로 고른 이동이면 true
  // arriveAt: 도착할 챕터. 창밖은 지금 풍경에서 그 챕터 풍경까지 이어서 흘러감
  const ride = useCallback(async (lines: string[], arriveAt: number, ms: number, intro = false) => {
    const id = ++navId.current
    setExploring(false)
    setMenuOpen(false)
    setRideLines(lines)
    setRideMs(ms)
    setIsIntro(intro)
    setPhase('ride')
    setDest(null)
    setMood(chapters[arriveAt].mood)
    await train.current!.ride(chapters[arriveAt].view, ms)
    if (id !== navId.current) return false
    setCurrent(arriveAt)
    setDest(arriveAt)
    return true
  }, [])

  const goToChapter = useCallback(
    async (i: number) => {
      // 메뉴에서 바로 고를 때도 첫 클릭이면 소리를 켤 수 있게
      soundOn()
      const c = chapters[i]
      if (!(await ride([`다음 정거장 · CHAPTER ${c.number}`, c.title], i, 5000))) return
      setPhase('chapter')
    },
    [ride],
  )

  // Start: 소개 장면부터 보여 줌
  // Start: 조선소 풍경 속을 잠시 달린 뒤 소개 장면으로
  const start = async () => {
    // 첫 클릭 때 오디오를 켜 두면, 기차가 달릴 때만 소리가 납니다
    soundOn()
    const id = ++navId.current
    setMenuOpen(false)
    setRideLines([])
    setIsIntro(true)
    setPhase('ride')
    await train.current!.ride('view', 4500)
    if (id === navId.current) setPhase('slides')
  }

  // 소개 장면이 끝나면 챕터 1로 출발 (자막 없이 풍경만)
  const depart = async () => {
    if (!(await ride([], 0, 6000, true))) return
    setPhase('chapter')
  }

  const goToIntro = () => {
    navId.current++
    train.current?.setView('view')
    setExploring(false)
    setMenuOpen(false)
    setDest(null)
    setMood('day')
    setPhase('landing')
  }

  const openLetter = () => {
    navId.current++
    setExploring(false)
    setMenuOpen(false)
    setPhase('thanks')
  }

  const openExplore = () => {
    if (phase !== 'chapter') return
    setExploring(true)
    if (!explored.has(current)) {
      setExplored(new Set(explored).add(current))
    }
  }

  useEffect(() => {
    if (phase !== 'chapter' || exploring) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && current < chapters.length - 1) void goToChapter(current + 1)
      if (e.key === 'ArrowLeft' && current > 0) void goToChapter(current - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, exploring, current, goToChapter])

  return (
    <main className="app">
      <TrainScene
        ref={train}
        dim={phase === 'landing'}
        mood={mood}
        overlay={
          <AnimatePresence>
            {phase === 'chapter' && chapters[current].letter && (
              <motion.button
                key="letter"
                className="letter-btn"
                onClick={openLetter}
                aria-label="마지막 편지 열기"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 1.2, type: 'spring', damping: 12, stiffness: 140 }}
                whileHover={{ scale: 1.08, rotate: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <LetterIcon />
              </motion.button>
            )}
          </AnimatePresence>
        }
      >
        <AnimatePresence>
          {dest !== null && phase !== 'thanks' && (
            <Destination
              key={dest}
              chapter={chapters[dest]}
              explored={explored.has(dest)}
              ready={phase === 'chapter'}
              exploring={exploring && phase === 'chapter'}
              onExplore={openExplore}
            />
          )}
        </AnimatePresence>
      </TrainScene>

      <AnimatePresence>
        {phase === 'landing' && (
          <motion.div
            key="landing"
            className="landing-layer"
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6 }}
          >
            <HeroTitle />
            <motion.div
              className="landing-foot"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.7 }}
            >
              <button className="start-link" onClick={start}>
                {/* 제목의 긴 선과 같은 잉크 느낌으로 손으로 그은 화살표 */}
                <InkArrow />
                <span>Start</span>
              </button>
            </motion.div>
            {/* 기차 그림 좌표에 맞춰 창문 오른쪽 아래(창턱 밑)에 놓음 */}
            <div className="landing-scene">
              <motion.p
                className="landing-byline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.7, duration: 0.8 }}
              >
                {site.byline}
              </motion.p>
            </div>
          </motion.div>
        )}

        {phase === 'slides' && <IntroSlides key="slides" onDone={() => void depart()} />}

        {phase === 'ride' && (
          <motion.div key="ride" className="ride-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {rideLines.length > 0 && <Captions lines={rideLines} interval={rideMs / (rideLines.length + 0.6)} />}
            {isIntro && (
              <button className="skip-btn" onClick={() => train.current?.skip()}>
                SKIP INTRO <Arrow />
              </button>
            )}
          </motion.div>
        )}

        {phase === 'thanks' && (
          <motion.div key="thanks" className="thanks-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <KnitThanks lines={site.thanks} onReplay={() => void goToChapter(0)} />
          </motion.div>
        )}
      </AnimatePresence>

      {phase !== 'landing' && phase !== 'thanks' && phase !== 'slides' && (
        <>
          <div className="badge" aria-label={`${site.badgeTop} ${site.badgeBottom}`}>
            <span className="badge-main">
              {site.badgeTop}
              <br />
              {site.badgeBottom}
            </span>
            <span className="badge-sub">{site.badgeSub}</span>
          </div>

          {phase === 'chapter' && (
            <nav className="chapter-nav" aria-label="챕터 이동">
              <button disabled={current === 0} onClick={() => void goToChapter(current - 1)} aria-label="이전 챕터">
                <Arrow />
              </button>
              {chapters.map((c, i) => (
                <span key={c.number} className={`dot${i === current ? ' current' : ''}${explored.has(i) ? ' done' : ''}`} />
              ))}
              <button
                disabled={current === chapters.length - 1}
                onClick={() => void goToChapter(current + 1)}
                aria-label="다음 챕터"
              >
                <Arrow />
              </button>
            </nav>
          )}
        </>
      )}

      <AnimatePresence>
        {exploring && phase === 'chapter' && (
          <ExploreCard
            key={`explore-${current}`}
            chapter={chapters[current]}
            onClose={() => setExploring(false)}
            isLast={current === chapters.length - 1}
            onNext={() => {
              if (current < chapters.length - 1) void goToChapter(current + 1)
              else openLetter()
            }}
          />
        )}
      </AnimatePresence>

      <div className="menu-wrap">
        <button
          className={menuOpen ? 'menu-pill open' : 'menu-pill'}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
        >
          MENU
        </button>
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              id="site-menu"
              className="menu-panel"
              aria-label="페이지 이동"
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18 }}
            >
              <button className={phase === 'landing' ? 'menu-item on' : 'menu-item'} onClick={goToIntro}>
                <small>INTRO</small>
                <span>The Ocean Journey</span>
              </button>
              {chapters.map((c, i) => (
                <button
                  key={c.number}
                  className={phase === 'chapter' && current === i ? 'menu-item on' : 'menu-item'}
                  onClick={() => void goToChapter(i)}
                >
                  <small>CHAPTER {c.number}</small>
                  <span>{c.title}</span>
                </button>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
