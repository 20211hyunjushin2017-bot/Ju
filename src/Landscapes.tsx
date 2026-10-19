// 창문 밖 도착지 풍경 (그림 파일 없이 SVG로 그린 장면)
// viewBox 1000×500 은 기차 창문 비율(약 2:1)에 맞춤

// 챕터 2: 푸른 새벽, 보랏빛 바다와 등대
export function LighthouseDawn() {
  return (
    <svg className="land" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="ld-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#141c44" />
          <stop offset="0.38" stopColor="#3b3477" />
          <stop offset="0.62" stopColor="#8a5f9e" />
          <stop offset="0.78" stopColor="#d99aa6" />
          <stop offset="0.86" stopColor="#f4c3a4" />
        </linearGradient>
        <linearGradient id="ld-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a5c96" />
          <stop offset="0.35" stopColor="#3f3672" />
          <stop offset="1" stopColor="#141333" />
        </linearGradient>
        <radialGradient id="ld-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd9c0" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffd9c0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ld-beam" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#fff4d0" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff4d0" stopOpacity="0" />
        </linearGradient>
        <filter id="ld-soft" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <rect width="1000" height="500" fill="url(#ld-sky)" />
      <ellipse cx="420" cy="345" rx="420" ry="70" fill="url(#ld-glow)" />

      {/* 별과 초승달 */}
      <g fill="#fff">
        {[
          [80, 40, 1.4, 0],
          [190, 85, 1, 1.2],
          [310, 30, 1.2, 0.6],
          [560, 55, 1, 1.8],
          [660, 25, 1.5, 0.3],
          [880, 70, 1.1, 2.2],
          [940, 30, 0.9, 1],
          [470, 100, 0.8, 2.6],
        ].map(([x, y, r, d], i) => (
          <circle key={i} className="tw" cx={x} cy={y} r={r} style={{ animationDelay: `${d}s` }} />
        ))}
      </g>
      <path d="M752 70 a20 20 0 1 0 22 30 a16 16 0 1 1 -22 -30Z" fill="#fde9c8" opacity="0.9" />

      {/* 흘러가는 구름 */}
      <g className="drift" filter="url(#ld-soft)" opacity="0.75">
        <ellipse cx="180" cy="210" rx="150" ry="16" fill="#e8a7b4" />
        <ellipse cx="560" cy="180" rx="190" ry="14" fill="#c98aae" />
        <ellipse cx="860" cy="235" rx="140" ry="12" fill="#f1b9b0" />
        <ellipse cx="1180" cy="200" rx="160" ry="14" fill="#d796ae" />
      </g>

      {/* 먼 산 */}
      <path d="M0 331 C40 312 70 300 110 306 C150 312 170 292 215 284 C260 276 290 306 330 310 C370 314 410 318 470 331 Z" fill="#4c3f7c" opacity="0.85" />
      <path d="M360 331 C410 318 450 300 500 304 C540 307 570 296 610 300 C650 304 680 320 720 331 Z" fill="#5d4a8a" opacity="0.6" />
      {/* 수평선 위 옅은 안개 */}
      <rect x="0" y="318" width="1000" height="22" fill="#f4c3b4" opacity="0.35" filter="url(#ld-soft)" />

      {/* 바다와 물결 반짝임 */}
      <rect y="330" width="1000" height="170" fill="url(#ld-sea)" />
      <g fill="#ffd9c8">
        {Array.from({ length: 34 }, (_, i) => {
          const r1 = ((i * 9301 + 49297) % 233280) / 233280
          const r2 = ((i * 4253 + 1931) % 1000) / 1000
          const y = 336 + Math.pow(r2, 1.4) * 150
          const spread = 90 + (y - 336) * 2.2
          const x = 420 - spread / 2 + r1 * spread
          const w = 6 + (1 - (y - 336) / 150) * 26 * (0.5 + r1)
          return (
            <ellipse
              key={i}
              className="shim"
              cx={x}
              cy={y}
              rx={w}
              ry="0.9"
              style={{ animationDelay: `${(r1 * 2.4).toFixed(2)}s` }}
            />
          )
        })}
      </g>

      {/* 절벽과 등대 */}
      <path d="M700 500 L700 400 Q730 360 780 350 L830 340 Q880 345 905 372 L960 420 L1000 430 L1000 500 Z" fill="#18153a" />
      <g>
        <polygon points="806,346 834,346 828,250 812,250" fill="#ece6f6" />
        <polygon points="809.5,318 830.5,318 829.4,300 810.6,300" fill="#b44c68" />
        <polygon points="811.3,284 828.7,284 828,270 812,270" fill="#b44c68" />
        <rect x="806" y="244" width="28" height="8" rx="2" fill="#2a2450" />
        <rect x="811" y="226" width="18" height="18" fill="#fff1c2" />
        <path d="M806 226 L820 210 L834 226 Z" fill="#2a2450" />
        <circle cx="820" cy="235" r="26" fill="url(#ld-glow)" className="lamp" />
      </g>
      {/* 회전하는 불빛 */}
      <g className="beam">
        <polygon points="820,235 300,180 300,290" fill="url(#ld-beam)" />
      </g>
    </svg>
  )
}

// 챕터 3: 노을 지는 항구로 돌아오는 배 (종착역)
export function HarborSunset() {
  return (
    <svg className="land" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a1c4c" />
          <stop offset="0.32" stopColor="#7b3a6e" />
          <stop offset="0.55" stopColor="#d9675c" />
          <stop offset="0.7" stopColor="#f6a768" />
          <stop offset="0.76" stopColor="#ffd394" />
        </linearGradient>
        <linearGradient id="hs-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e98a63" />
          <stop offset="0.3" stopColor="#9a4a5e" />
          <stop offset="1" stopColor="#2c1835" />
        </linearGradient>
        <radialGradient id="hs-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6d8" />
          <stop offset="0.35" stopColor="#ffe2a0" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffb070" stopOpacity="0" />
        </radialGradient>
        <filter id="hs-soft" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      <rect width="1000" height="500" fill="url(#hs-sky)" />

      {/* 해 */}
      <circle cx="560" cy="350" r="150" fill="url(#hs-sun)" />
      <circle cx="560" cy="350" r="40" fill="#fff4d2" />

      {/* 길게 늘어진 노을 구름 */}
      <g className="drift" filter="url(#hs-soft)">
        <ellipse cx="200" cy="150" rx="220" ry="12" fill="#b9527a" opacity="0.8" />
        <ellipse cx="640" cy="120" rx="240" ry="10" fill="#9c4675" opacity="0.7" />
        <ellipse cx="420" cy="240" rx="200" ry="9" fill="#ff9a78" opacity="0.8" />
        <ellipse cx="860" cy="270" rx="180" ry="9" fill="#ffb486" opacity="0.8" />
        <ellipse cx="1150" cy="190" rx="200" ry="10" fill="#c45a7c" opacity="0.7" />
      </g>

      {/* 먼 산 */}
      <path d="M0 351 C50 330 90 316 140 322 C190 328 220 302 270 306 C310 310 330 336 360 351 Z" fill="#7a3a5a" opacity="0.85" />
      <path d="M740 351 C790 334 830 318 880 324 C930 330 960 310 1000 312 L1000 351 Z" fill="#7a3a5a" opacity="0.85" />
      <rect x="0" y="338" width="1000" height="20" fill="#ffd2a0" opacity="0.35" filter="url(#hs-soft)" />

      {/* 바다 */}
      <rect y="350" width="1000" height="150" fill="url(#hs-sea)" />
      {/* 해 그림자 기둥 */}
      <g fill="#ffe7b0">
        {Array.from({ length: 22 }, (_, i) => {
          const y = 356 + i * 6.5
          const w = 70 + i * 6 - ((i * 37) % 30)
          const x = 560 - w / 2 + (((i * 29) % 21) - 10)
          return (
            <rect
              key={i}
              className="shim"
              x={x}
              y={y}
              width={w}
              height="2"
              rx="1"
              style={{ animationDelay: `${(i % 6) * 0.35}s` }}
            />
          )
        })}
      </g>

      {/* 항구의 골리앗 크레인과 부두 */}
      <g fill="#3a1d36">
        <rect x="0" y="344" width="310" height="8" />
        <path d="M40 344 L50 252 L56 252 L48 344 Z" />
        <path d="M160 344 L152 252 L158 252 L168 344 Z" />
        <rect x="20" y="244" width="166" height="9" rx="1" />
        <rect x="88" y="234" width="28" height="11" rx="1" />
        <rect x="102" y="253" width="1.5" height="40" />
        <rect x="222" y="282" width="4" height="62" />
        <path d="M224 282 L292 298 L292 301 L224 289 Z" />
        <rect x="246" y="324" width="52" height="20" rx="1" />
      </g>

      {/* 돌아오는 배 */}
      <g className="ship" fill="#2a1528">
        <path d="M700 352 L880 352 L866 368 L712 368 Z" />
        <rect x="830" y="326" width="30" height="26" />
        <rect x="838" y="314" width="10" height="12" />
        <rect x="726" y="338" width="90" height="14" />
        <circle cx="844" cy="334" r="2" fill="#ffe0a0" />
      </g>

      {/* 갈매기 */}
      <g fill="none" stroke="#3a1d36" strokeWidth="2.4" strokeLinecap="round">
        <path className="gull" d="M760 150 q10 -9 20 0 q10 -9 20 0" />
        <path className="gull g2" d="M820 180 q7 -6 14 0 q7 -6 14 0" />
        <path className="gull g3" d="M720 195 q6 -5 12 0 q6 -5 12 0" />
      </g>
    </svg>
  )
}
