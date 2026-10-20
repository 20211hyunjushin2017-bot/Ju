// 사이트의 모든 문구는 이 파일에서 수정합니다.
// [ ] 로 표시된 부분은 아직 내용이 들어가지 않은 자리입니다.

export type Section = {
  heading: string
  body?: string
  points?: string[]
  // 흐름형 카드: lead(크게) → 아래 화살표 → then(이어진 일들)
  lead?: string
  then?: string[]
  // 글머리표 카드: 왼쪽에 bullets, 오른쪽에 gallery 그림들 (public/images 파일 이름)
  bullets?: string[]
  gallery?: { src: string; alt: string }[]
  // 문장형 카드: 왼쪽에 문장, 오른쪽에 그림 (photo가 없으면 사진 넣을 빈 자리)
  quote?: string
  photo?: { src: string; alt: string }
  // public/images 폴더에 넣은 파일 이름 (예: 'ch1-ax.webp')
  image?: string
}

export type Chapter = {
  number: string
  title: string
  subtitle: string
  // bg: 배경색, accent: 펼쳐지는 종이의 제목 색, ink: 챕터 제목 글자색
  theme: { bg: string; accent: string; ink: string }
  // 챕터 배경 이미지 (없으면 단색 배경). 1672×941 비율 기준
  image?: string
  // 배경 위를 걸어 들어오는 캐릭터. x, y, w는 배경 이미지(1672×941) 기준 픽셀 위치
  walkers?: { src: string; x: number; y: number; w: number }[]
  // 창문 밖 도착지 풍경: stars(밤하늘 그림 + 걸어오는 히어로) / photo(image 그림을 창문에 꽉 채움)
  scene: 'stars' | 'photo'
  // 기차 안 조명: night(밤, 어둡고 램프만 켜짐) / dawn(새벽, 보랏빛으로 살짝 어둡게) / day(낮, 원래 그림 그대로)
  mood: 'night' | 'dawn' | 'day'
  // 기차가 달릴 때 창밖에 지나가는 풍경 (도착 풍경과 같은 그림을 창문 크기로 맞춘 것)
  view: 'ch1-view' | 'ch2-view' | 'ch3-view'
  // true면 창턱 위에 편지봉투가 놓이고, 누르면 마지막 페이지로 이동
  letter?: boolean
  sections: Section[]
}

export const site = {
  badgeTop: 'OCEAN',
  badgeBottom: 'JOURNEY',
  badgeSub: 'MY OJT LOG',
  byline: '기업문화혁신팀 신현주 사원',
  // Start 다음에 나오는 소개 장면 (검은 배경 흰 글씨). 줄바꿈은 \n
  introSlides: [
    '조선업의 이해, HR실 내 각 팀의 업무 개론\n(조직 구조, 인사발령, 채용 프로세스, 노무의 기초 등)',
    '우리 팀의 역할부터 Ocean Way2.0과 AX,\n리더십과 변화관리, HPSI',
  ],
  // 그 다음 흰 배경 장면에 들어가는 그림
  introDiagram: 'od-system.png',
  // 마지막 페이지: 뜨개질로 떠지는 감사 문구. size는 글자 높이(코 수)
  thanks: [
    { text: 'special thanks to.', font: "'Jacquard 24', serif", size: 24 },
    { text: '멘토 주영님', font: "'Gowun Batang', serif", size: 16 },
    { text: '& 기업문화혁신팀', font: "'Gowun Batang', serif", size: 16, heart: true },
  ],
}

const placeholder = (topic: string): Section[] => [
  {
    heading: '[소제목 1]',
    body: `[${topic}에 대해 OJT에서 배운 내용을 입력하세요]`,
    points: ['[핵심 포인트]', '[핵심 포인트]', '[핵심 포인트]'],
  },
  {
    heading: '[소제목 2]',
    body: '[에피소드나 느낀 점을 입력하세요]',
  },
  {
    heading: '나에게 남은 한 문장',
    body: '[이 챕터를 한 문장으로 정리하면?]',
  },
]

export const chapters: Chapter[] = [
  {
    number: '01',
    title: '오션Way 2.0 & AX',
    subtitle: '[챕터 1 한 줄 소개]',
    theme: { bg: '#05060a', accent: '#16324a', ink: '#e6d6b4' },
    scene: 'stars',
    mood: 'night',
    view: 'ch1-view',
    image: 'ch1-bg.webp',
    walkers: [
      { src: 'ch1-hero-yellow.webp', x: 630, y: 650, w: 170 },
      { src: 'ch1-hero-blue.webp', x: 800, y: 650, w: 175 },
      { src: 'ch1-hero-green.webp', x: 940, y: 650, w: 210 },
    ],
    sections: [
      {
        heading: '첫 업무',
        lead: 'AX 수용성 강화 Workshop\n공지 및 배너 제작',
        then: ['구성원 대상 워크샵 Co-ft', 'HERO 2.0 다른그림찾기 Event'],
      },
      {
        heading: 'AX 수용성 강화 Workshop Co-ft',
        bullets: [
          '사업부와 직무별 업무 병목과 고민, 다양한 구성원과의 소통',
          'AX와 전사 워크샵 관련 구성원 공감대 확인',
          '직원 커뮤니케이션: CEO레터, 스크린세이버, 포탈 로고 등',
        ],
        gallery: [
          { src: 'ch1-ax-screensaver.webp', alt: 'HERO 2.0 WORKSHOP 시작 화면' },
          { src: 'ch1-ax-stickers.webp', alt: 'HERO 2.0 WORKSHOP 히어로별 카드 3종' },
          { src: 'ch1-ax-photostrip.webp', alt: 'AX THE OCEAN 포토 스트립' },
        ],
      },
      {
        heading: 'HERO 2.0 다른그림찾기 EVENT FT',
        quote:
          '메시지를 많이 전달하는 것보다, 구성원이 스스로 발견하고 자신의 일과 연결할 수 있도록 만드는 것이 더 중요할 수 있음',
      },
    ],
  },
  {
    number: '02',
    title: '직무 교육과 교육 운영',
    subtitle: '[챕터 2 한 줄 소개]',
    theme: { bg: '#3b3477', accent: '#3b3477', ink: '#fbf6ec' },
    scene: 'photo',
    mood: 'dawn',
    view: 'ch2-view',
    image: 'ch2-view.webp',
    sections: placeholder('직무 교육과 교육 운영'),
  },
  {
    number: '03',
    title: 'HPSI',
    subtitle: '[챕터 3 한 줄 소개]',
    theme: { bg: '#2c5a86', accent: '#2c5a86', ink: '#ffffff' },
    scene: 'photo',
    mood: 'day',
    view: 'ch3-view',
    image: 'ch3-view.webp',
    letter: true,
    sections: placeholder('HPSI'),
  },
]

// 오프라인 HTML 파일 맨 위의 "편집용 내용" 블록(window.__OCEAN_CONTENT)이 있으면 그 내용으로 바꿔 씀
declare global {
  interface Window {
    __OCEAN_CONTENT?: { site?: Partial<typeof site>; chapters?: Chapter[] }
  }
}
const edited = typeof window !== 'undefined' ? window.__OCEAN_CONTENT : undefined
if (edited?.site) Object.assign(site, edited.site)
if (edited?.chapters) chapters.splice(0, chapters.length, ...edited.chapters)
