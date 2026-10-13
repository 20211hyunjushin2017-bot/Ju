import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { chapters, site, type Chapter } from './content'
import { TrainScene, type TrainHandle } from './TrainScene'
import { soundOff, soundOn } from './sound'
import './App.css'

type Phase = 'landing' | 'ride' | 'chapter' | 'gift'

const imgUrl = (name: string) => `${import.meta.env.BASE_URL}images/${name}`

function Ticket({ top, title, bottom, note }: { top: string; title: string[]; bottom: string; note?: string }) {
  return (
    <div className="ticket-wrap">
      <div className="ticket-back" />
      <div className="ticket">
        <p className="ticket-small">{top}</p>
        <h1 className="ticket-title">
          <span>{title[0]}</span>
          <span className="indent">{title[1]}</span>
        </h1>
        <p className="ticket-small">{bottom}</p>
        {note && <p className="ticket-note">{note}</p>}
      </div>
    </div>
  )
}

function Arrow() {
  return (
    <svg className="arrow" viewBox="0 0 16 22" aria-hidden="true">
      <path d="M3 2l10 9-10 9" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
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

function ExplorePanel({ chapter, onClose }: { chapter: Chapter; onClose: () => void }) {
  return (
    <motion.div
      className="explore-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.article
        className="explore"
        role="dialog"
        aria-modal="true"
        aria-label={`Chapter ${chapter.number} ${chapter.title}`}
        style={{ '--accent': chapter.theme.bg } as CSSProperties}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="explore-head">
          <div>
            <p className="eyebrow">CHAPTER {chapter.number}</p>
            <h2>{chapter.title}</h2>
          </div>
          <button className="close" onClick={onClose} aria-label="닫기">
            ×
          </button>
        </header>
        <div className="explore-grid">
          {chapter.sections.map((s, i) => (
            <motion.section
              key={i}
              className={i === 0 ? 'card wide' : 'card'}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.1 }}
            >
              {s.image && <img src={imgUrl(s.image)} alt="" />}
              <h3>{s.heading}</h3>
              <p>{s.body}</p>
              {s.points && (
                <ul>
                  {s.points.map((pt, j) => (
                    <li key={j}>{pt}</li>
                  ))}
                </ul>
              )}
            </motion.section>
          ))}
        </div>
      </motion.article>
    </motion.div>
  )
}

function ChapterScreen({
  chapter,
  explored,
  onExplore,
  showCaption,
  onToggleCaption,
}: {
  chapter: Chapter
  explored: boolean
  onExplore: () => void
  showCaption: boolean
  onToggleCaption: () => void
}) {
  const t = chapter.theme
  return (
    <motion.section
      className="chapter"
      style={
        {
          '--bg': t.bg,
          '--band': t.band,
          '--accent': t.accent,
          '--ink': t.ink,
          backgroundImage: chapter.image ? `url(${imgUrl(chapter.image)})` : undefined,
        } as CSSProperties
      }
      initial={{ clipPath: 'polygon(0 0, 0 0, -30% 100%, -30% 100%)' }}
      animate={{ clipPath: 'polygon(0 0, 130% 0, 100% 100%, -30% 100%)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: [0.7, 0, 0.2, 1] }}
    >
      <div className="chapter-tint" />
      <div className="band band-top" />
      <div className="band band-bottom" />
      <div className="chapter-numeral" aria-hidden="true">
        {chapter.number}
      </div>
      <div className="chapter-center">
        <motion.p
          className="chapter-label"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          CHAPTER {chapter.number}
        </motion.p>
        <motion.h2
          className="chapter-title"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.75, duration: 0.6 }}
        >
          {chapter.title}
        </motion.h2>
        <motion.p
          className="chapter-sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {chapter.subtitle}
        </motion.p>
        <motion.button
          className="explore-btn"
          onClick={onExplore}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.15 }}
          whileHover={{ x: 6 }}
        >
          {explored ? 'EXPLORE AGAIN' : 'EXPLORE'} <Arrow />
        </motion.button>
      </div>
      <div className="cc-box">
        {showCaption && <p>{chapter.caption}</p>}
        <button className={showCaption ? 'cc on' : 'cc'} onClick={onToggleCaption} aria-pressed={showCaption}>
          CC
        </button>
      </div>
    </motion.section>
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
  const [sound, setSound] = useState(false)
  const [showCaption, setShowCaption] = useState(true)
  const [toast, setToast] = useState(false)
  const allDone = explored.size === chapters.length

  const toggleSound = () => {
    if (sound) soundOff()
    else soundOn()
    setSound(!sound)
  }

  const ride = useCallback(async (lines: string[], tiles: number, ms: number, intro = false) => {
    setMenuOpen(false)
    setExploring(false)
    setRideLines(lines)
    setRideMs(ms)
    setIsIntro(intro)
    setPhase('ride')
    await train.current!.ride(tiles, ms)
  }, [])

  const goToChapter = useCallback(
    async (i: number) => {
      const c = chapters[i]
      await ride([`다음 정거장 · CHAPTER ${c.number}`, c.title], 4, 3400)
      setCurrent(i)
      setPhase('chapter')
    },
    [ride],
  )

  const start = async () => {
    await ride(site.introCaptions, 12, 9000, true)
    setCurrent(0)
    setPhase('chapter')
  }

  const goToGift = async () => {
    setToast(false)
    await ride(['종착역에 도착합니다', '선물이 기다리고 있어요'], 6, 4200)
    setPhase('gift')
  }

  const openExplore = () => {
    setExploring(true)
    if (!explored.has(current)) {
      const next = new Set(explored).add(current)
      setExplored(next)
      if (next.size === chapters.length) setToast(true)
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
      <TrainScene ref={train} dim={phase === 'landing' || phase === 'gift'} />

      <AnimatePresence>
        {phase === 'chapter' && (
          <ChapterScreen
            key={current}
            chapter={chapters[current]}
            explored={explored.has(current)}
            onExplore={openExplore}
            showCaption={showCaption}
            onToggleCaption={() => setShowCaption(!showCaption)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'landing' && (
          <motion.div
            key="landing"
            className="center-layer"
            exit={{ opacity: 0, y: -60, rotate: -3 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Ticket {...site.ticket} note={site.ticketNote} />
            </motion.div>
            <motion.button
              className="start-btn"
              onClick={start}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
            >
              Start now
            </motion.button>
            <button className="sound-hint" onClick={toggleSound} aria-pressed={sound}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M4 15v-3a8 8 0 0 1 16 0v3M4 15h3v5H4zM17 15h3v5h-3z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
              {sound ? '소리가 켜져 있어요' : site.soundHint}
            </button>
          </motion.div>
        )}

        {phase === 'ride' && (
          <motion.div key="ride" className="ride-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Captions lines={rideLines} interval={rideMs / (rideLines.length + 0.6)} />
            {isIntro && (
              <button className="skip-btn" onClick={() => train.current?.skip()}>
                SKIP INTRO <Arrow />
              </button>
            )}
          </motion.div>
        )}

        {phase === 'gift' && (
          <motion.div key="gift" className="center-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Ticket {...site.gift} />
            <motion.div
              className="gift-letter"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <p>{site.gift.message}</p>
              <p className="from">— {site.gift.from}</p>
            </motion.div>
            <button className="start-btn" onClick={() => void goToChapter(0)}>
              처음부터 다시 보기
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {phase !== 'landing' && (
        <>
          <div className="badge" aria-label={`${site.badgeTop} ${site.badgeBottom}`}>
            <span className="badge-main">
              {site.badgeTop}
              <br />
              {site.badgeBottom}
            </span>
            <span className="badge-sub">{site.badgeSub}</span>
          </div>

          <button className="menu-btn" onClick={() => setMenuOpen(true)} aria-label="챕터 메뉴 열기">
            <span />
            <span />
            <span />
          </button>

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

      <button className={sound ? 'sound-btn on' : 'sound-btn'} onClick={toggleSound} aria-label="소리 켜기/끄기" aria-pressed={sound}>
        ♪
      </button>

      <AnimatePresence>
        {exploring && phase === 'chapter' && (
          <ExplorePanel key="explore" chapter={chapters[current]} onClose={() => setExploring(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
          >
            <motion.nav
              className="menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close" onClick={() => setMenuOpen(false)} aria-label="메뉴 닫기">
                ×
              </button>
              <p className="eyebrow">ROUTE MAP</p>
              <ol className="route">
                {chapters.map((c, i) => (
                  <li key={c.number}>
                    <button onClick={() => void goToChapter(i)}>
                      <span className="stop" data-done={explored.has(i)} />
                      <span>
                        <small>CHAPTER {c.number}</small>
                        {c.title}
                      </span>
                    </button>
                  </li>
                ))}
                <li>
                  <button disabled={!allDone} onClick={goToGift}>
                    <span className="stop gift" data-done={allDone} />
                    <span>
                      <small>FINAL STOP</small>
                      {allDone ? '선물 받기' : `선물 (${explored.size}/${chapters.length} 챕터 완료)`}
                    </span>
                  </button>
                </li>
              </ol>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && !exploring && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
          >
            <p>모든 챕터를 둘러봤어요! 선물이 도착했습니다.</p>
            <button onClick={goToGift}>
              선물 받으러 가기 <Arrow />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
