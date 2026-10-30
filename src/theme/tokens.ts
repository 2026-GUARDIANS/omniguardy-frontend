// 디자인 토큰 — 두 벌의 테마를 둔다.
//  - 'figma'  : Figma "Untitled" v1 화면 8종 기준(기존 앱 그대로). 기본값.
//  - 'custom' : Figma "v2 보안앱 톤" 섹션 + 변수 컬렉션 "v2 보안앱 톤" 기준.
// 테마는 EXPO_PUBLIC_THEME 환경변수로 "모듈 로드 시점"에 한 번 정해진다(앱 실행 중 전환 없음).
// 접근성(WCAG AA) 때문에 바꾼 값은 "Figma 원본 → 조정값"을 주석으로 남긴다.
// 대비 계산 기준: 일반 텍스트 4.5:1, 큰 텍스트(24px+ 또는 18.66px+ Bold)·UI 그래픽 3:1.

export type ThemeName = 'figma' | 'custom';

export const THEME: ThemeName = process.env.EXPO_PUBLIC_THEME === 'custom' ? 'custom' : 'figma';

const pick = <T,>(figma: T, custom: T): T => (THEME === 'custom' ? custom : figma);

// ─────────────────────────────────────────────────────────────
// v2 확정 토큰 (Figma 변수 컬렉션 "v2 보안앱 톤")
// ─────────────────────────────────────────────────────────────
const v2 = {
  bg: '#FAFAF5',
  surface: '#FFFFFF',
  line: '#E3E1D6',
  navy900: '#2E3B4B',
  slate600: '#4A5D73',
  brown600: '#6F5B3E',
  textPrimary: '#2E3B4B',
  textSecondary: '#5F6B78',
  /** 정상·보호 중. 채움·점·아이콘에만 — 글자색 금지(surface 대비 3.17:1) */
  normal: '#5E9C90',
  HIGH: '#C0392B',
  MEDIUM: '#C9822E',
  LOW: '#7C8FA3',
} as const;

// ─────────────────────────────────────────────────────────────
// 'figma' 테마 색 — 기존 tokens.ts와 같은 값(키·값 변경 금지)
// ─────────────────────────────────────────────────────────────
const figmaColors = {
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

  // ── 역할 토큰: 'figma'에서는 위 값과 같은 값을 그대로 가리킨다(화면별 쓰임이 v2에서 갈리는 곳) ──
  link: '#717262', // = primary
  ok: '#717262', // 정상 표시 점·원 (= primary)
  deviceStatusText: '#717262', // 홈 장치 타일 "연결됨" (= primary)
  inputBorder: '#DBE3E9', // = border
  headerTitle: '#6B7280', // 이벤트 상세 헤더 (= textSecondary)
  headerTitleSignup: '#737373', // 회원가입 헤더 (= textMuted)
  headerTitleProfile: '#717262', // 프로필 헤더 (= primary)
  settingsTitle: '#6B7280', // 설정 큰 제목 (= textSecondary)
  profileName: '#717262', // 프로필 이름 (= primary)
  chipText: '#6B7280', // 필터 칩 비선택 글자 (= textSecondary)
  dateTagBg: '#F2E8D5', // = parchment
  dateTagText: '#5E5F50', // = onParchment
  avatarBorder: '#F2E8D5', // = parchment
  bracket: '#A5A696', // 영상 영역 모서리 브래킷 (Figma 원본)
  tape: 'rgba(242,232,213,0.28)', // 상세 Agent 카드 위 마스킹 테이프
  exampleTagBg: '#F2E8D5', // = parchment
  exampleTagBorder: 'transparent',
  toggleTrack: '#717262', // = primary
  toggleKnob: 'rgba(0,0,0,0.32)', // Figma 원본
  buttonSecondaryBg: '#F2E8D5', // = parchment ("경고 끄기")
  onButtonSecondary: '#5E5F50', // = onParchment
  // 홈 상태 카드
  statusCardBg: '#FFFFFF',
  statusCardBorder: 'rgba(156,190,155,0.18)',
  statusCaption: '#717262',
  statusText: '#1F1F1F',
  statusMeta: '#717262',
  statusMetaValue: '#6B7280',
  statusDivider: '#DBE3E9',
  statusIconBg: '#717262',
  // 비상(위험 알림) 화면
  alertBg: '#FBFBF8',
  alertTagBg: 'rgba(0,0,0,0.71)',
  alertIconCircle: '#FFFFFF',
  alertHeadline: '#767676',
  alertDivider: '#F2E8D5',
  alertMeta: '#6B7280',
  warnPill: '#717262',
  warnPillOffBg: '#F2E8D5',
  warnPillOffText: '#5E5F50',
  alertDetailBorder: 'transparent',
  alertError: '#C9343A', // = danger
  // 위험도가 없는 이벤트(분석 중·분석 실패·판정 없음) 상태 배지와 점. 글자가 의미를 전달하고 점은 장식
  pendingBadgeBg: '#FFFFFF',
  pendingBadgeText: '#6B7280', // 흰 배경 4.8:1
  pendingBadgeBorder: '#737373', // 흰 배경 4.7:1
  pendingDot: '#DBE3E9',
  riskHalo: 'rgba(0,0,0,0.08)', // HIGH 점 주변 링 (Figma 0 0 0 4px rgba(0,0,0,0.08))
  wordmark: '#000000', // 로그인 워드마크
};

export type ColorTokens = { [K in keyof typeof figmaColors]: string };

// ─────────────────────────────────────────────────────────────
// 'custom'(v2) 테마 색 — 대비 조정은 "v2 원본 → 조정값" 주석
// ─────────────────────────────────────────────────────────────
const customColors: ColorTokens = {
  background: v2.bg,
  surface: v2.surface,
  primary: v2.navy900, // 주 버튼·활성 탭·원형 버튼·선택 칩
  parchment: v2.bg, // v2에는 양피지가 없음. 칩·태그·아이콘 원 배경은 bg
  onParchment: v2.textSecondary,
  tabBar: v2.line, // 탭 바 테두리
  tabBarSolid: v2.surface, // 탭 바 채움

  border: v2.line,
  borderSoft: v2.line,
  borderParchment: v2.line,
  borderParchmentSoft: v2.line,

  textStrong: v2.textPrimary,
  textTitle: v2.textPrimary,
  textSecondary: v2.textSecondary,
  textMuted: v2.textSecondary,
  textLabel: v2.textSecondary,
  textDecorativeTitle: v2.brown600, // bg 대비 6.19:1
  textInfoTitle: v2.brown600,
  textOnPrimary: '#FFFFFF',
  danger: v2.HIGH, // surface 대비 5.44:1

  overlayStrong: v2.HIGH,

  link: v2.slate600, // surface 대비 6.76:1
  ok: v2.normal,
  deviceStatusText: v2.textSecondary,
  // 입력창 테두리. v2 원본 line #E3E1D6 → 조정 LOW #7C8FA3 (surface 1.31→3.33, bg 1.25→3.18) [수정안 A]
  inputBorder: v2.LOW,
  headerTitle: v2.brown600,
  headerTitleSignup: v2.brown600,
  headerTitleProfile: v2.brown600,
  settingsTitle: v2.brown600,
  profileName: v2.brown600,
  chipText: v2.textPrimary,
  dateTagBg: v2.bg,
  dateTagText: v2.textSecondary,
  avatarBorder: v2.line,
  bracket: v2.line,
  tape: v2.bg,
  exampleTagBg: v2.surface,
  exampleTagBorder: v2.line,
  toggleTrack: v2.slate600,
  toggleKnob: '#FFFFFF',
  buttonSecondaryBg: v2.surface,
  onButtonSecondary: v2.navy900,
  statusCardBg: v2.navy900,
  statusCardBorder: v2.navy900,
  statusCaption: '#FFFFFF',
  statusText: '#FFFFFF',
  statusMeta: '#FFFFFF',
  statusMetaValue: '#FFFFFF',
  statusDivider: v2.line,
  statusIconBg: v2.normal, // navy 대비 3.60:1, 흰 아이콘 3.17:1
  alertBg: v2.navy900,
  alertTagBg: v2.HIGH, // 흰 글자 5.44:1
  alertIconCircle: v2.HIGH,
  alertHeadline: '#FFFFFF',
  alertDivider: v2.HIGH,
  alertMeta: '#FFFFFF',
  warnPill: v2.slate600, // 흰 글자 6.76:1
  warnPillOffBg: v2.surface,
  warnPillOffText: v2.navy900,
  // "상세 보기" 버튼. v2 원본은 navy 배경 위 navy 채움(경계 1.00:1) → 조정 흰 1.5px 테두리 (11.39:1) [수정안 A]
  alertDetailBorder: '#FFFFFF',
  // 비상 화면 오류 문구. danger(HIGH)를 navy 위에 쓰면 2.09:1이라 흰색 (11.39:1)
  alertError: '#FFFFFF',
  pendingBadgeBg: v2.surface,
  pendingBadgeText: v2.textSecondary, // 5.44:1
  pendingBadgeBorder: v2.textSecondary,
  pendingDot: v2.line,
  riskHalo: 'rgba(0,0,0,0.08)', // v2 PNG에서도 같은 링(#EBEBEB on white)
  wordmark: v2.brown600,
};

export const colors: ColorTokens = pick(figmaColors, customColors);

// 위험도 색. 반드시 HIGH/MEDIUM/LOW 텍스트 라벨과 함께 쓴다(색만으로 구분 금지).
type RiskTone = {
  dot: string;
  badge: string;
  badgeText: string;
  chipDot: string;
  /** 배지 1px 테두리 색. null이면 테두리 없음 */
  badgeBorder: string | null;
};
type RiskTokens = Record<'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL', RiskTone>;

const figmaRiskBase: Omit<RiskTokens, 'CRITICAL'> = {
  HIGH: {
    dot: '#901318', // 원본 그대로
    // 배지 배경. Figma 원본 rgba(144,19,24,0.32) → 조정 #901318 불투명 (흰 글자 9.2:1, 원본 1.6:1)
    badge: '#901318',
    badgeText: '#FFFFFF',
    chipDot: '#901318',
    badgeBorder: null,
  },
  MEDIUM: {
    dot: '#815F15',
    // Figma 원본 rgba(129,95,21,0.32) → 조정 #815F15 불투명 (흰 글자 5.9:1, 원본 1.7:1)
    badge: '#815F15',
    badgeText: '#FFFFFF',
    chipDot: '#815F15',
    badgeBorder: null,
  },
  LOW: {
    dot: '#DBE3E9', // 원본 그대로. 텍스트 배지가 함께 있으므로 장식 점으로 취급
    // Figma 원본 rgba(0,0,0,0.32) → 조정 #6B7280 (흰 글자 4.8:1, 원본 2.2:1)
    badge: '#6B7280',
    badgeText: '#FFFFFF',
    chipDot: '#A89B8A', // 필터 칩의 점. 원본 그대로
    badgeBorder: null,
  },
};

const customRiskBase: Omit<RiskTokens, 'CRITICAL'> = {
  HIGH: { dot: v2.HIGH, badge: v2.HIGH, badgeText: '#FFFFFF', chipDot: v2.HIGH, badgeBorder: null }, // 흰 글자 5.44:1
  MEDIUM: {
    dot: v2.MEDIUM,
    // 배지. v2 원본 #C9822E 채움 + navy 글자(3.64:1) → 조정 옅은 배경 #F6EBDE(MEDIUM 16%) + brown-600 글자 (5.51:1) [수정안 A]
    badge: '#F6EBDE',
    badgeText: v2.brown600,
    chipDot: v2.MEDIUM,
    // 옅은 배경만으로는 흰 카드와 구분이 약해(ΔE 7.7) 위험도 색 1px 테두리 추가 (흰 카드 대비 3.13:1)
    badgeBorder: v2.MEDIUM,
  },
  LOW: {
    dot: v2.LOW,
    // 배지. v2 원본 #7C8FA3 채움 + navy 글자(3.43:1) → 조정 옅은 배경 #E7EBEE(LOW 18%) + slate-600 글자 (5.64:1) [수정안 A]
    badge: '#E7EBEE',
    badgeText: v2.slate600,
    chipDot: v2.LOW,
    // 옅은 배경만으로는 흰 카드와 구분이 약해(ΔE 4.7) 위험도 색 1px 테두리 추가 (흰 카드 대비 3.33:1)
    badgeBorder: v2.LOW,
  },
};

// CRITICAL: 백엔드 정의값(현재 판정 규칙으로는 나오지 않음). 배지 글자는 "CRITICAL", 색은 두 테마 모두 HIGH와 같게(사용자 결정)
const figmaRisk: RiskTokens = { ...figmaRiskBase, CRITICAL: figmaRiskBase.HIGH };
const customRisk: RiskTokens = { ...customRiskBase, CRITICAL: customRiskBase.HIGH };

export const riskColors: RiskTokens = pick(figmaRisk, customRisk);

// ─────────────────────────────────────────────────────────────
// 글꼴 — useAppFonts.ts가 같은 이름으로 등록한다. Android에서 커스텀 글꼴은 fontWeight가
// 무시/합성되므로 굵기마다 별도 family 이름을 쓰고 fontWeight는 지정하지 않는다.
// ─────────────────────────────────────────────────────────────
type FontTokens = {
  sansRegular: string;
  sansMedium: string;
  sansSemiBold: string;
  sansBold: string;
  /** 영문·숫자 데이터(배지, 시각, 이메일 등) */
  monoRegular: string;
  monoMedium: string;
  monoSemiBold: string;
  /** 한글이 들어가는 데이터 문구. 'figma'는 기존과 같은 Plex Mono, 'custom'은 한글 글꼴(Plex Sans KR) */
  monoKoRegular: string;
  monoKoMedium: string;
  monoKoSemiBold: string;
  /** MixedText의 영문·숫자 구간 */
  latinRegular: string;
  latinMedium: string;
  latinSemiBold: string;
  latinBold: string;
  latinLight: string;
};

const figmaFonts: FontTokens = {
  sansRegular: 'IBMPlexSansKR_400Regular',
  sansMedium: 'IBMPlexSansKR_500Medium',
  sansSemiBold: 'IBMPlexSansKR_600SemiBold',
  sansBold: 'IBMPlexSansKR_700Bold',
  monoRegular: 'IBMPlexMono_400Regular',
  monoMedium: 'IBMPlexMono_500Medium',
  monoSemiBold: 'IBMPlexMono_600SemiBold',
  monoKoRegular: 'IBMPlexMono_400Regular',
  monoKoMedium: 'IBMPlexMono_500Medium',
  monoKoSemiBold: 'IBMPlexMono_600SemiBold',
  // 'figma'에서 MixedText는 분리하지 않으므로 사용되지 않는다
  latinRegular: 'IBMPlexMono_400Regular',
  latinMedium: 'IBMPlexMono_500Medium',
  latinSemiBold: 'IBMPlexMono_600SemiBold',
  latinBold: 'IBMPlexMono_600SemiBold',
  latinLight: 'IBMPlexMono_400Regular',
};

const customFonts: FontTokens = {
  sansRegular: 'IBMPlexSansKR_400Regular',
  sansMedium: 'IBMPlexSansKR_500Medium',
  sansSemiBold: 'IBMPlexSansKR_600SemiBold',
  sansBold: 'IBMPlexSansKR_700Bold',
  monoRegular: 'NunitoSans_400Regular',
  monoMedium: 'NunitoSans_500Medium',
  monoSemiBold: 'NunitoSans_600SemiBold',
  monoKoRegular: 'IBMPlexSansKR_400Regular',
  monoKoMedium: 'IBMPlexSansKR_500Medium',
  monoKoSemiBold: 'IBMPlexSansKR_600SemiBold',
  latinRegular: 'NunitoSans_400Regular',
  latinMedium: 'NunitoSans_500Medium',
  latinSemiBold: 'NunitoSans_600SemiBold',
  latinBold: 'NunitoSans_700Bold',
  latinLight: 'NunitoSans_300Light',
};

export const fonts: FontTokens = pick(figmaFonts, customFonts);

/** 한글 글꼴(Plex Sans KR)의 기본 줄 높이 비율 = (hhea 1085 + 415) / 1000. MixedText에서 사용 */
export const KO_LINE_HEIGHT_RATIO = 1.5;
/** IBM Plex Mono의 기본 줄 높이 비율 = (1025 + 275) / 1000. 'figma'에서 mono 스타일이던 MixedText의 줄 간격 유지용 */
export const MONO_LINE_HEIGHT_RATIO = 1.3;

/** 테마별 모양 차이(색·글꼴 외) */
export const themeFlags = {
  /** 비상 화면 동심원 */
  alertRings: pick(true, false),
  /** 이벤트 상세 Agent 카드 위 마스킹 테이프 장식(Figma "Overlay"). custom에서는 의미 없는 도형으로 보여 숨김 */
  agentCardTape: pick(true, false),
  /** 이벤트 기록 날짜 태그 기울기 */
  dateTagRotate: pick('-1.5deg', '0deg'),
  /** 원본 SVG 선 색(#A5A696) 아이콘의 덮어쓰기 색. undefined면 원본 색 */
  iconTint: pick<string | undefined>(undefined, v2.slate600),
  /** 비상 화면 경고 아이콘 색 */
  alertIconColor: pick<string | undefined>(undefined, '#FFFFFF'),
  /** 로그인 슬로건 자간 */
  sloganLetterSpacing: pick(0, 1.4),
  /** 홈 헤더 프로필 버튼을 헤더 오른쪽 끝(카드와 같은 16px 여백)에 둔다. 두 테마 공통(구조 변경) */
  homeProfileAtEdge: pick(true, true),
};

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
  dateTag: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 1 },
  avatar: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
} as const;

/** 터치 영역이 44px 미만인 요소의 보정용 hitSlop 계산 */
export function hitSlopFor(height: number, width: number = size.minTouch) {
  const v = Math.max(0, Math.ceil((size.minTouch - height) / 2));
  const h = Math.max(0, Math.ceil((size.minTouch - width) / 2));
  return { top: v, bottom: v, left: h, right: h };
}
