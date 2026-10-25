// 디자인 토큰 — 기준: Figma "Untitled" (mhhionDCIXYuDbux9lJzaR) 화면 8종.
// 접근성(WCAG AA) 때문에 바꾼 값은 "Figma 원본 → 조정값"을 주석으로 남긴다.
// 대비 계산 기준: 일반 텍스트 4.5:1, 큰 텍스트(24px+ 또는 18.66px+ Bold)·UI 그래픽 3:1.

export const colors = {
  // 배경/표면
  background: '#FBFBF8',
  surface: '#FFFFFF',

  // 주 색상(세이지). Figma 원본 #A5A696 → 조정 #717262
  // 원본은 흰 글자·흰 아이콘과 대비 2.5:1, 배경 위 텍스트로 2.4:1이라 미달.
  // 조정값은 흰 글자 4.9:1, 배경(#FBFBF8) 위 텍스트 4.8:1.
  primary: '#717262',
  // 보조(양피지) 배경. Figma 원본 그대로.
  parchment: '#F2E8D5',
  // 양피지 위 텍스트. Figma 원본 #A5A696 → 조정 #5E5F50 (5.3:1, 원본 1.9:1)
  onParchment: '#5E5F50',
  // 하단 탭 배경. Figma 원본 그대로 (rgba(242,232,213,0.28))
  tabBar: 'rgba(242,232,213,0.28)',
  tabBarSolid: '#F8F5EE', // 위 반투명을 배경(#FBFBF8)에 합성한 값. 탭 아래로 스크롤되는 내용이 비치지 않게 사용

  // 테두리/구분선. 장식 요소라 Figma 원본 그대로.
  border: '#DBE3E9',
  borderSoft: 'rgba(156,190,155,0.18)', // Figma "color/green/68 18%"
  borderParchment: '#F2E8D5',
  borderParchmentSoft: 'rgba(242,232,213,0.16)',

  // 텍스트
  textStrong: '#1F1F1F',
  textTitle: 'rgba(0,0,0,0.7)',
  textSecondary: '#6B7280', // 원본 그대로 (흰 배경 4.8:1)
  // 값·플레이스홀더. Figma 원본 #AAAAAA → 조정 #737373 (4.7:1, 원본 2.3:1)
  textMuted: '#737373',
  // 폼 라벨·섹션 라벨(토프). Figma 원본 #A89B8A → 조정 #7A6D5D (5.0:1, 원본 2.7:1)
  textLabel: '#7A6D5D',
  // 장식용 큰 제목(홈 "OmniGuardy", "이벤트 기록" 페이지 제목). Figma 원본 그대로 유지.
  // 대비 2:1로 미달이지만 같은 정보가 하단 탭/로고로도 전달되는 장식 요소라 유지(사용자 승인).
  textDecorativeTitle: 'rgba(31,31,31,0.32)',
  // 정보 전달용 큰 제목(알림 헤드라인, 이벤트 상세 제목). Figma 원본 rgba(31,31,31,0.32) → 조정 #767676 (4.4:1, 큰 텍스트 기준 통과)
  textInfoTitle: '#767676',
  textOnPrimary: '#FFFFFF',
  danger: '#C9343A', // 로그아웃. 원본 그대로 (흰 배경 5.0:1)

  // 알림 화면 상단 "HIGH · 위험 알림" 태그. 원본 그대로 (흰 글자 대비 충분)
  overlayStrong: 'rgba(0,0,0,0.71)',
} as const;

// 위험도 색. 반드시 HIGH/MEDIUM/LOW 텍스트 라벨과 함께 쓴다(색만으로 구분 금지).
export const riskColors = {
  HIGH: {
    dot: '#901318', // 원본 그대로
    // 배지 배경. Figma 원본 rgba(144,19,24,0.32) → 조정 #901318 불투명 (흰 글자 9.2:1, 원본 1.6:1)
    badge: '#901318',
    chipDot: '#901318',
  },
  MEDIUM: {
    dot: '#815F15',
    // Figma 원본 rgba(129,95,21,0.32) → 조정 #815F15 불투명 (흰 글자 5.9:1, 원본 1.7:1)
    badge: '#815F15',
    chipDot: '#815F15',
  },
  LOW: {
    dot: '#DBE3E9', // 원본 그대로. 텍스트 배지가 함께 있으므로 장식 점으로 취급
    // Figma 원본 rgba(0,0,0,0.32) → 조정 #6B7280 (흰 글자 4.8:1, 원본 2.2:1)
    badge: '#6B7280',
    chipDot: '#A89B8A', // 필터 칩의 점. 원본 그대로
  },
} as const;

export const fonts = {
  sansRegular: 'IBMPlexSansKR_400Regular',
  sansMedium: 'IBMPlexSansKR_500Medium',
  sansSemiBold: 'IBMPlexSansKR_600SemiBold',
  sansBold: 'IBMPlexSansKR_700Bold',
  monoRegular: 'IBMPlexMono_400Regular',
  monoMedium: 'IBMPlexMono_500Medium',
  monoSemiBold: 'IBMPlexMono_600SemiBold',
} as const;

export const fontSize = {
  xxs: 11,
  xs: 12,
  sm: 13,
  md: 14,
  lg: 15,
  xl: 16,
  xxl: 17,
  h3: 18,
  h2: 24,
  h1: 28,
  display: 32,
  displayLg: 34,
  hero: 40,
} as const;

export const spacing = {
  xxs: 4,
  xs: 6,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  xxl: 16,
  x3: 18,
  x4: 20,
  x5: 24,
} as const;

export const radius = {
  pill: 999,
  card: 24,
  cardMd: 22,
  cardSm: 20,
  row: 18,
  tile: 16,
  input: 14,
} as const;

export const size = {
  minTouch: 44,
  input: 52,
  button: 56,
  buttonSecondary: 60,
  tabItem: 52,
  backButton: 46,
  iconButton: 40,
} as const;

export const shadow = {
  card: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  cardMd: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardLg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  input: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 1 },
  button: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  tabBar: { shadowColor: '#000', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.25, shadowRadius: 32, elevation: 8 },
} as const;

/** 터치 영역이 44px 미만인 요소의 보정용 hitSlop 계산 */
export function hitSlopFor(height: number, width: number = size.minTouch) {
  const v = Math.max(0, Math.ceil((size.minTouch - height) / 2));
  const h = Math.max(0, Math.ceil((size.minTouch - width) / 2));
  return { top: v, bottom: v, left: h, right: h };
}
