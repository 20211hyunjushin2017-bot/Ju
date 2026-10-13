// 사이트의 모든 문구는 이 파일에서 수정합니다.
// [ ] 로 표시된 부분은 아직 내용이 들어가지 않은 자리입니다.

export type Section = {
  heading: string
  body: string
  points?: string[]
  // public/images 폴더에 넣은 파일 이름 (예: 'ch1-ax.webp')
  image?: string
}

export type Chapter = {
  number: string
  title: string
  subtitle: string
  // 오른쪽 아래 자막 상자에 나오는 문장
  caption: string
  // bg: 배경색, accent: 펼쳐지는 종이의 제목 색, ink: 챕터 제목 글자색
  theme: { bg: string; accent: string; ink: string }
  // 챕터 배경 이미지 (없으면 단색 배경). 1672×941 비율 기준
  image?: string
  // 배경 위를 걸어 들어오는 캐릭터. x, y, w는 배경 이미지(1672×941) 기준 픽셀 위치
  walkers?: { src: string; x: number; y: number; w: number }[]
  sections: Section[]
}

export const site = {
  badgeTop: 'OCEAN',
  badgeBottom: 'JOURNEY',
  badgeSub: 'MY OJT LOG',
  ticket: { top: 'THE', title: ['OCEAN', 'JOURNEY'], bottom: 'BEGINS' },
  ticketNote: '모든 챕터를 둘러보면 특별한 선물이 기다리고 있어요.',
  soundHint: '소리를 켜면 더 생생하게 즐길 수 있어요.',
  introCaptions: [
    '하나의 여정, 세 개의 정거장.',
    '한화오션에 입사한 날부터 지금까지,',
    'OJT를 하며 배운 것들을 함께 둘러볼까요?',
  ],
  gift: {
    top: 'THE',
    title: ['OCEAN', 'JOURNEY'],
    bottom: 'CONTINUES',
    message: '[팀원들에게 전하고 싶은 메시지를 입력하세요]',
    from: '[이름]',
  },
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
    caption: '[챕터 1 자막 문장]',
    theme: { bg: '#05060a', accent: '#16324a', ink: '#e6d6b4' },
    image: 'ch1-bg.webp',
    walkers: [
      { src: 'ch1-hero-yellow.webp', x: 630, y: 650, w: 170 },
      { src: 'ch1-hero-blue.webp', x: 800, y: 650, w: 175 },
      { src: 'ch1-hero-green.webp', x: 940, y: 650, w: 210 },
    ],
    sections: placeholder('오션Way 2.0과 AX'),
  },
  {
    number: '02',
    title: '직무 교육과 교육 운영',
    subtitle: '[챕터 2 한 줄 소개]',
    caption: '[챕터 2 자막 문장]',
    theme: { bg: '#1f4a45', accent: '#1f4a45', ink: '#f3ead8' },
    sections: placeholder('직무 교육과 교육 운영'),
  },
  {
    number: '03',
    title: 'HPSI',
    subtitle: '[챕터 3 한 줄 소개]',
    caption: '[챕터 3 자막 문장]',
    theme: { bg: '#6b3a2e', accent: '#6b3a2e', ink: '#f6ecdc' },
    sections: placeholder('HPSI'),
  },
]
