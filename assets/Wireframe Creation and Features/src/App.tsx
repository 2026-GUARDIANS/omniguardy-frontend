import { useState, useRef, useCallback, type ReactNode } from 'react'

type ScreenId =
  | 'login' | 'signup' | 'home' | 'dangerAlert' | 'deviceReg'
  | 'eventLog' | 'eventDetail' | 'cctv' | 'voiceSettings'
  | 'settings' | 'profile' | 'emergency'

const SW = 375, SH = 812
const CW = 2560, CH = 3000

const POS: Record<ScreenId, [number, number]> = {
  login:         [80,   80  ],
  signup:        [80,   1030],
  home:          [555,  80  ],
  dangerAlert:   [1030, 80  ],
  deviceReg:     [1505, 80  ],
  eventLog:      [555,  1030],
  eventDetail:   [1030, 1030],
  cctv:          [1505, 1030],
  settings:      [80,   1980],
  voiceSettings: [555,  1980],
  profile:       [1030, 1980],
  emergency:     [1505, 1980],
}

const LABELS: Record<ScreenId, string> = {
  login:         '① 로그인',
  signup:        '② 회원가입',
  home:          '③ 홈 대시보드',
  dangerAlert:   '④ 위험 감지 알림',
  deviceReg:     '⑤ 디바이스 등록',
  eventLog:      '⑥ 이벤트 기록',
  eventDetail:   '⑦ 이벤트 상세',
  cctv:          '⑧ CCTV 실시간',
  settings:      '⑨ 설정',
  voiceSettings: '⑩ 음성 경고 설정',
  profile:       '⑪ 내 프로필',
  emergency:     '⑫ 긴급 모드 (Silent Signal)',
}

const SCREEN_ORDER: ScreenId[] = [
  'login', 'signup', 'home', 'dangerAlert', 'deviceReg',
  'eventLog', 'eventDetail', 'cctv', 'settings',
  'voiceSettings', 'profile', 'emergency',
]

interface Conn {
  from: ScreenId; to: ScreenId
  fa: [number, number]; ta: [number, number]
  label: string; danger?: boolean
}

const CONNS: Conn[] = [
  { from: 'login',         to: 'home',          fa: [188, 495], ta: [0,   450], label: '로그인' },
  { from: 'login',         to: 'signup',        fa: [188, 720], ta: [188, 0  ], label: '회원가입 링크' },
  { from: 'signup',        to: 'home',          fa: [375, 380], ta: [0,   360], label: '가입 완료' },
  { from: 'home',          to: 'dangerAlert',   fa: [375, 220], ta: [0,   220], label: 'FCM 위험 알림', danger: true },
  { from: 'home',          to: 'eventLog',      fa: [130, 812], ta: [130, 0  ], label: '기록 탭' },
  { from: 'home',          to: 'cctv',          fa: [245, 812], ta: [245, 0  ], label: 'CCTV 탭' },
  { from: 'home',          to: 'settings',      fa: [0,   750], ta: [375, 580], label: '설정 탭' },
  { from: 'home',          to: 'deviceReg',     fa: [375, 75 ], ta: [0,   430], label: '미등록 시 기기 등록' },
  { from: 'dangerAlert',   to: 'cctv',          fa: [375, 710], ta: [0,   710], label: '실시간 현장 확인하기', danger: true },
  { from: 'eventLog',      to: 'eventDetail',   fa: [375, 360], ta: [0,   360], label: '이벤트 항목 탭' },
  { from: 'eventDetail',   to: 'cctv',          fa: [375, 540], ta: [375, 812], label: '영상 확인 버튼' },
  { from: 'settings',      to: 'profile',       fa: [375, 100], ta: [0,   100], label: '내 프로필' },
  { from: 'settings',      to: 'voiceSettings', fa: [375, 310], ta: [0,   310], label: '음성 경고 설정' },
  { from: 'settings',      to: 'deviceReg',     fa: [188, 0  ], ta: [188, 812], label: '디바이스 관리' },
  { from: 'profile',       to: 'emergency',     fa: [375, 580], ta: [0,   500], label: 'Silent Signal 설정' },
  { from: 'cctv',          to: 'dangerAlert',   fa: [0,   770], ta: [375, 770], label: '긴급 경보 음 송출', danger: true },
]

// ─── Primitive Atoms ──────────────────────────────────────────────────
const G = '#16a34a', BG = '#f9fafb', CARD = '#f3f4f6'

function SBar() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px 4px', fontSize: 13, fontWeight: 600, fontFamily: 'Noto Sans KR, system-ui, sans-serif' }}>
      <span>9:41</span>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center', fontSize: 11 }}>
        <span>▌▌▌</span>
        <span>WiFi</span>
        <span style={{ border: '1.5px solid #111', borderRadius: 3, padding: '0 5px', fontSize: 10, fontWeight: 700 }}>100%</span>
      </div>
    </div>
  )
}

function ABr({ title, back, right }: { title: string; back?: boolean; right?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 20px 10px', fontFamily: 'Noto Sans KR, system-ui, sans-serif' }}>
      {back ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 15, fontWeight: 700 }}>
          <span style={{ fontSize: 22, color: '#6b7280', lineHeight: 1 }}>‹</span>
          {title}
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: '#dcfce7', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🛡️</div>
          <span style={{ fontSize: 20, fontWeight: 800 }}>{title}</span>
        </div>
      )}
      {right}
    </div>
  )
}

function TBar({ a }: { a: 'home' | 'log' | 'cctv' | 'settings' }) {
  const tabs = [['home', '홈', '🏠'], ['log', '기록', '📋'], ['cctv', 'CCTV', '📹'], ['settings', '설정', '⚙️']] as const
  return (
    <div style={{ display: 'flex', borderTop: '1px solid #e5e7eb', background: '#fff', flexShrink: 0, fontFamily: 'Noto Sans KR, system-ui, sans-serif' }}>
      {tabs.map(([id, label, e]) => (
        <div key={id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0 10px', color: a === id ? G : '#9ca3af' }}>
          <span style={{ fontSize: 22 }}>{e}</span>
          <span style={{ fontSize: 10, fontWeight: a === id ? 700 : 400 }}>{label}</span>
        </div>
      ))}
    </div>
  )
}

function Bdg({ t }: { t: 'danger' | 'warning' | 'safe' }) {
  const m = { danger: ['#fee2e2', '#dc2626', '위험'], warning: ['#fef9c3', '#b45309', '주의'], safe: ['#dcfce7', '#16a34a', '정상'] } as const
  const [bg, c, l] = m[t]
  return <span style={{ background: bg, color: c, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 5, fontFamily: 'Noto Sans KR, system-ui, sans-serif' }}>{l}</span>
}

function Card({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: CARD, borderRadius: 16, padding: 16, fontFamily: 'Noto Sans KR, system-ui, sans-serif', ...style }}>
      {children}
    </div>
  )
}

function Inp({ label, v }: { label: string; v: string }) {
  return (
    <div style={{ marginBottom: 12, fontFamily: 'Noto Sans KR, system-ui, sans-serif' }}>
      <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 5 }}>{label}</div>
      <div style={{ background: CARD, borderRadius: 11, padding: '11px 14px', fontSize: 13, color: '#9ca3af' }}>{v}</div>
    </div>
  )
}

function Btn({ label, v = 'primary', full, sm }: { label: string; v?: 'primary' | 'danger' | 'outline' | 'gray' | 'dangerOutline'; full?: boolean; sm?: boolean }) {
  const s = { primary: { bg: G, c: '#fff', b: 'none' }, danger: { bg: '#dc2626', c: '#fff', b: 'none' }, outline: { bg: '#fff', c: G, b: `1.5px solid ${G}` }, gray: { bg: CARD, c: '#374151', b: 'none' }, dangerOutline: { bg: '#fff5f5', c: '#dc2626', b: '1.5px solid #dc2626' } }[v]
  return (
    <div style={{ background: s.bg, color: s.c, border: s.b, borderRadius: 13, padding: sm ? '9px 14px' : '14px', textAlign: 'center', fontSize: sm ? 12 : 14, fontWeight: 700, width: full ? '100%' : undefined, fontFamily: 'Noto Sans KR, system-ui, sans-serif', boxSizing: 'border-box' }}>
      {label}
    </div>
  )
}

function Row({ l, r, danger }: { l: string; r: string | ReactNode; danger?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', fontFamily: 'Noto Sans KR, system-ui, sans-serif' }}>
      <span style={{ fontSize: 13, color: '#6b7280' }}>{l}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: danger ? '#dc2626' : '#111' }}>{r}</span>
    </div>
  )
}

function Toggle({ on = true }: { on?: boolean }) {
  return (
    <div style={{ width: 44, height: 26, background: on ? G : '#d1d5db', borderRadius: 13, position: 'relative', flexShrink: 0 }}>
      <div style={{ width: 20, height: 20, background: '#fff', borderRadius: 10, position: 'absolute', top: 3, left: on ? 20 : 3, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </div>
  )
}

function NavTag({ label }: { label: string }) {
  return (
    <div style={{ position: 'absolute', top: -9, right: -6, background: '#3b82f6', color: '#fff', fontSize: 9, padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap', fontWeight: 700, zIndex: 3, boxShadow: '0 2px 6px rgba(59,130,246,0.4)' }}>
      → {label}
    </div>
  )
}

// ─── Screen Contents ────────────────────────────────────────────────
function SLogin() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', fontFamily: 'Noto Sans KR, system-ui, sans-serif' }}>
      <SBar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 72, height: 72, background: '#dcfce7', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🛡️</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>OmniGuardy AI</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>AI 기반 현관 보안 시스템</div>
          </div>
        </div>
        <Inp label="이메일" v="hong@example.com" />
        <Inp label="비밀번호" v="••••••••" />
        <div style={{ position: 'relative' }}>
          <Btn label="로그인" full />
          <NavTag label="홈" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          <span style={{ fontSize: 12, color: '#9ca3af' }}>또는</span>
          <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '11px', textAlign: 'center', fontSize: 13, color: '#374151', fontWeight: 600 }}>카카오로 로그인</div>
        <div style={{ textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
          계정이 없으신가요?{' '}
          <span style={{ color: G, fontWeight: 700, position: 'relative' }}>
            회원가입
            <span style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', background: '#3b82f6', color: '#fff', fontSize: 9, padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap', fontWeight: 700 }}>→ 회원가입</span>
          </span>
        </div>
        <div style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>비밀번호 찾기</div>
      </div>
    </div>
  )
}

function SSignup() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', fontFamily: 'Noto Sans KR, system-ui, sans-serif' }}>
      <SBar />
      <ABr title="회원가입" back />
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '0 20px 24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>계정 정보를 입력해 주세요</div>
        <Inp label="이름" v="홍길동" />
        <Inp label="이메일" v="hong@example.com" />
        <Inp label="비밀번호" v="8자 이상 입력" />
        <Inp label="비밀번호 확인" v="비밀번호 재입력" />
        <Inp label="전화번호" v="010-0000-0000" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0 16px' }}>
          <div style={{ width: 18, height: 18, background: '#dcfce7', border: `2px solid ${G}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: G, flexShrink: 0 }}>✓</div>
          <span style={{ fontSize: 12, color: '#374151' }}>이용약관 및 개인정보 처리방침에 동의합니다</span>
        </div>
        <div style={{ position: 'relative' }}>
          <Btn label="가입 완료" full />
          <NavTag label="홈" />
        </div>
      </div>
    </div>
  )
}

function SHome() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: BG, fontFamily: 'Noto Sans KR, system-ui, sans-serif' }}>
      <SBar />
      <ABr title="OmniGuardy AI" right={
        <div style={{ width: 36, height: 36, background: CARD, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer' }}>☰</div>
      } />
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, background: '#dcfce7', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🔓</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>현재 상태: 정상 감시 중</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>마이크 상시 감지 중 | 상태: 정상</div>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>마이크 감지 상태</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2.5, height: 44, marginBottom: 8 }}>
            {[3, 5, 8, 4, 9, 14, 7, 10, 6, 16, 8, 5, 7, 11, 5, 4, 8, 6, 9, 4].map((h, i) => (
              <div key={i} style={{ width: 3, height: h * 2.4, background: i === 9 ? G : '#d1d5db', borderRadius: 2 }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280' }}>
            <span>마이크 상시 감지 중 | 상태: 정상</span>
            <span style={{ color: G, fontWeight: 700 }}>LIVE</span>
          </div>
        </Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 2px' }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>최근 탐지 이벤트</span>
          <span style={{ fontSize: 13, color: G }}>더보기</span>
        </div>
        {[
          { e: '🔔', title: '비명 소리 감지', t: 'danger' as const, time: '오전 10:14', loc: '현관 앞 2m 이내', desc: '이상 소리 감지 → Agent AI 분석 완료' },
          { e: '⏰', title: '수상한 서성임 감지', t: 'warning' as const, time: '오전 09:45', loc: '카메라 8초 배회', desc: '이상 소리 감지 → Agent AI 분석 완료' },
        ].map(ev => (
          <div key={ev.title} style={{ position: 'relative' }}>
            <Card style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 44, height: 44, background: ev.t === 'danger' ? '#fee2e2' : '#fef9c3', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{ev.e}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{ev.title}</span>
                  <Bdg t={ev.t} />
                </div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{ev.time} · {ev.loc}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{ev.desc}</div>
              </div>
            </Card>
            {ev.t === 'danger' && <NavTag label="위험 감지" />}
          </div>
        ))}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Card style={{ textAlign: 'center', padding: '14px 10px', cursor: 'pointer' }}>
            <div style={{ fontSize: 26, marginBottom: 4 }}>📹</div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>CCTV 확인</div>
          </Card>
          <Card style={{ textAlign: 'center', padding: '14px 10px', cursor: 'pointer' }}>
            <div style={{ fontSize: 26, marginBottom: 4 }}>🚨</div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>긴급 신고</div>
          </Card>
        </div>
        <Card style={{ background: '#f0fdf4' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: G, marginBottom: 6 }}>디바이스 상태</div>
          <Row l="Raspberry Pi" r={<span style={{ color: G }}>● 온라인</span>} />
          <Row l="마이크 모듈" r={<span style={{ color: G }}>동작 중</span>} />
          <Row l="카메라 모듈" r={<span style={{ color: G }}>동작 중 (1080p)</span>} />
        </Card>
      </div>
      <TBar a="home" />
    </div>
  )
}

function SDangerAlert() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', fontFamily: 'Noto Sans KR, system-ui, sans-serif' }}>
      <SBar />
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
        <div style={{ width: 84, height: 84, background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>⚠️</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#dc2626' }}>위험 감지!</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>현관 외부에 비정상 패턴이 감지되었습니다</div>
        </div>
        <Card style={{ width: '100%' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>이상 소리 감지 결과</div>
          <Row l="감지된 소리 유형" r={<span style={{ color: '#dc2626', fontWeight: 700 }}>비명/충격음</span>} />
          <Row l="감지 시간" r="오전 10:14:02" />
          <Row l="위험도 점수" r="87 / 100점" danger />
          <Row l="AI 판단 레벨" r="LEVEL 3 (위험)" danger />
        </Card>
        <Card style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, background: '#dc2626', borderRadius: '50%' }} />
              <span style={{ fontSize: 14, fontWeight: 700 }}>현관 카메라 촬영 중...</span>
            </div>
            <span style={{ fontSize: 12, color: '#6b7280' }}>7초 / 10초</span>
          </div>
          <div style={{ height: 7, background: '#f3f4f6', borderRadius: 4 }}>
            <div style={{ width: '70%', height: '100%', background: '#dc2626', borderRadius: 4 }} />
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8, lineHeight: 1.6 }}>
            촬영 완료 후 Vision AI 심층 분석 및 Agent AI 상황 판단 요약이 즉시 제공됩니다.
          </div>
        </Card>
        <Card style={{ width: '100%', background: '#fff5f5', borderLeft: '3px solid #dc2626' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#dc2626', marginBottom: 6 }}>Agent AI 판단 결과</div>
          <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>
            비명 소리 + 급격한 접근 패턴이 동시 감지됨. 침입 시도 가능성 높음. 즉각적인 대응이 필요합니다.
          </div>
        </Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
          <Btn label="🔊 경고 방송" v="gray" />
          <Btn label="📞 112 신고" v="danger" />
        </div>
        <div style={{ position: 'relative', width: '100%' }}>
          <Btn label="실시간 현장 확인하기" v="danger" full />
          <NavTag label="CCTV" />
        </div>
      </div>
    </div>
  )
}

function SDeviceReg() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', fontFamily: 'Noto Sans KR, system-ui, sans-serif' }}>
      <SBar />
      <ABr title="디바이스 등록" back />
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>QR 코드 스캔</div>
          <div style={{ width: 140, height: 140, background: '#e5e7eb', borderRadius: 14, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>📱</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 10 }}>Raspberry Pi 기기의 QR 코드를 스캔하세요</div>
        </Card>
        <div style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>─── 또는 직접 입력 ───</div>
        <Inp label="기기 이름" v="거실 현관 카메라" />
        <Inp label="기기 ID (device_id)" v="RPi-ABC1234" />
        <Inp label="설치 위치" v="현관 외부" />
        <Inp label="Secret Key" v="••••••••••••" />
        <Card style={{ background: '#f0fdf4' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: G, marginBottom: 8 }}>연결 상태 확인</div>
          <Row l="서버 연결" r={<span style={{ color: G }}>● 온라인</span>} />
          <Row l="MQTT 브로커" r={<span style={{ color: G }}>Connected</span>} />
          <Row l="마이크 모듈" r="감지 대기 중" />
          <Row l="카메라 모듈" r="정상 (1080p)" />
        </Card>
        <div style={{ position: 'relative' }}>
          <Btn label="기기 등록 완료" full />
          <NavTag label="홈" />
        </div>
      </div>
    </div>
  )
}

function SEventLog() {
  const events = [
    { e: '🔴', title: '비명 소리 감지', t: 'danger' as const, desc: '현관 앞 고데시벨 소음 감지, CCTV 녹화 완료', time: '10:14' },
    { e: '🟡', title: '수상한 배회 감지', t: 'warning' as const, desc: '초인종 부근 8초 배회 후 자동 경고 방송 작동', time: '09:45' },
    { e: '🟢', title: '방문객 통화 발생', t: 'safe' as const, desc: '사용자 TTS 기능 활용 현관 방문객 대응 완료', time: '08:12' },
    { e: '🔴', title: '금속 충격음 감지', t: 'danger' as const, desc: '철제 마찰 소음 감지 긴급 카메라 스냅샷 촬영', time: '어제 22:15' },
    { e: '🟢', title: '택배 배송 완료', t: 'safe' as const, desc: '문 앞 물체 감지, 택배 기사 전달 완료', time: '어제 14:20' },
    { e: '🟢', title: '귀가 알림', t: 'safe' as const, desc: '얼굴 인증 성공 - 홍길동 귀가 확인', time: '어제 18:30' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: BG, fontFamily: 'Noto Sans KR, system-ui, sans-serif' }}>
      <SBar />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px 0' }}>
        <span style={{ fontSize: 20, fontWeight: 800 }}>이벤트 기록</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, border: '1px solid #e5e7eb', borderRadius: 8, padding: '5px 10px', fontSize: 12 }}>
          🔽 최신순
        </div>
      </div>
      <div style={{ padding: '10px 16px 6px' }}>
        <div style={{ background: CARD, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', fontSize: 13, color: '#9ca3af' }}>
          🔍 이벤트 유형, 감지된 소리 검색...
        </div>
      </div>
      <div style={{ display: 'flex', gap: 7, padding: '0 16px 10px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {['전체', '위험', '주의', '정상'].map((f, i) => (
          <div key={f} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: i === 0 ? G : CARD, color: i === 0 ? '#fff' : '#374151', whiteSpace: 'nowrap', flexShrink: 0 }}>{f}</div>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        {events.map(ev => (
          <div key={ev.title} style={{ position: 'relative' }}>
            <Card style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 40, height: 40, background: ev.t === 'danger' ? '#fee2e2' : ev.t === 'warning' ? '#fef9c3' : '#dcfce7', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {ev.t === 'danger' ? '🚨' : ev.t === 'warning' ? '⚠️' : '✅'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{ev.title}</span>
                  <Bdg t={ev.t} />
                </div>
                <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.4 }}>{ev.desc}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{ev.time}</div>
              </div>
            </Card>
            <NavTag label="이벤트 상세" />
          </div>
        ))}
      </div>
      <TBar a="log" />
    </div>
  )
}

function SEventDetail() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: BG, fontFamily: 'Noto Sans KR, system-ui, sans-serif' }}>
      <SBar />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 20px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 15, fontWeight: 700 }}>
          <span style={{ fontSize: 22, color: '#6b7280' }}>‹</span>
          이벤트 상세
        </div>
        <Bdg t="danger" />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ height: 190, background: '#111827', borderRadius: 16, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', top: 10, left: 10, background: '#dc2626', color: '#fff', fontSize: 10, padding: '3px 7px', borderRadius: 4, fontWeight: 700 }}>● REC</div>
          <div style={{ position: 'absolute', top: 10, right: 10, color: '#4ade80', fontSize: 11, fontWeight: 700 }}>20:35:17</div>
          <div style={{ color: '#fff', fontSize: 44, opacity: 0.5 }}>▶</div>
          <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', color: '#9ca3af', fontSize: 11 }}>LIVE FEED — CAM 01</div>
        </div>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>이벤트 정보</div>
          <Row l="이벤트 유형" r="비명 소리 감지" />
          <Row l="발생 시간" r="2026.09.09 오전 10:14:02" />
          <Row l="위치" r="현관 앞 2m 이내" />
          <Row l="처리 상태" r={<span style={{ color: G }}>● 확인 완료</span>} />
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Audio AI 분석 결과</div>
          <Row l="감지 소리 유형" r={<span style={{ color: '#dc2626', fontWeight: 700 }}>비명/충격음</span>} />
          <Row l="음량 (dB)" r="84.7 dB" />
          <Row l="FFT 주파수 특성" r="2.4kHz 피크" />
          <Row l="분류 신뢰도" r="91.3%" />
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Vision AI 분석 결과</div>
          <Row l="감지 객체" r="사람 1명" />
          <Row l="행동 패턴" r={<span style={{ color: '#dc2626' }}>RAPID_APPROACH</span>} />
          <Row l="배회 시간" r="23초" />
          <Row l="카메라 가림" r="없음" />
        </Card>
        <Card style={{ background: '#fff5f5', border: '1px solid #fecaca' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>Agent AI 최종 판단</div>
          <Row l="위험 레벨" r="LEVEL 3 (위험)" danger />
          <Row l="Risk Score" r="87 / 100" danger />
          <Row l="권장 대응" r="즉각 대응 필요" danger />
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8, lineHeight: 1.5, padding: '8px 10px', background: '#fee2e2', borderRadius: 8 }}>
            비명 + 급접근 동시 감지로 침입 시도 가능성 높음. FCM 알림 발송 및 TTS 경고 완료.
          </div>
        </Card>
        <div style={{ position: 'relative' }}>
          <Btn label="📹 영상 확인하기" v="outline" full />
          <NavTag label="CCTV" />
        </div>
        <Btn label="이벤트 닫기 (해결됨)" v="gray" full />
        <Btn label="📞 112 신고" v="danger" full />
      </div>
    </div>
  )
}

function SCCTV() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: BG, fontFamily: 'Noto Sans KR, system-ui, sans-serif' }}>
      <SBar />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 20px 10px' }}>
        <span style={{ fontSize: 18, fontWeight: 800 }}>CCTV 실시간 분석</span>
        <div style={{ background: '#3b82f6', color: '#fff', borderRadius: 10, padding: '7px 12px', fontSize: 12, fontWeight: 700 }}>+ 영상 업로드</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ height: 210, background: '#111827', borderRadius: 16, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
            <div style={{ background: '#16a34a', color: '#fff', fontSize: 10, padding: '3px 8px', borderRadius: 5, fontWeight: 700 }}>20:35:17</div>
            <div style={{ background: '#dc2626', color: '#fff', fontSize: 10, padding: '3px 8px', borderRadius: 5, fontWeight: 700 }}>● 실시간 FEED</div>
          </div>
          <div style={{ position: 'absolute', top: 10, right: 10, color: '#fff', fontSize: 11, fontWeight: 700 }}>REC ●</div>
          <div style={{ width: '65%', height: 100, background: '#1f2937', borderRadius: 10, border: '1px solid #374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#6b7280', fontSize: 12 }}>📷 CAM 01</span>
          </div>
          <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', color: '#9ca3af', fontSize: 10 }}>LIVE FEED — CAM 01</div>
        </div>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>감지 행동</div>
          <div style={{ fontSize: 13, color: G, fontWeight: 700, marginBottom: 6 }}>현재 상황: 일반 배달 기사 통행 중</div>
          <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
            객체 인식: 택배 상자 소지 완료, 현관 이탈 중 (정상 상태 판단)
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>위험도 분석</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 3 }}>Vision AI 위험 수치</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: G }}>12점 / 100점</div>
            </div>
            <Bdg t="safe" />
          </div>
          <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4 }}>
            <div style={{ width: '12%', height: '100%', background: G, borderRadius: 4 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9ca3af', marginTop: 4 }}>
            <span>안전 0</span><span>주의 40</span><span>위험 70</span><span>100</span>
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>얼굴 인식 결과</div>
          <Row l="등록 사용자 여부" r={<span style={{ color: '#dc2626' }}>미등록 외부인</span>} />
          <Row l="체류 시간" r="4초" />
          <Row l="이동 방향" r="현관 이탈 중" />
        </Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Btn label="🔊 수동 경고 방송" v="primary" />
          <div style={{ position: 'relative' }}>
            <Btn label="🚨 긴급 경보 음 송출" v="dangerOutline" />
            <NavTag label="위험 감지" />
          </div>
        </div>
      </div>
      <TBar a="cctv" />
    </div>
  )
}

function SVoiceSettings() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: BG, fontFamily: 'Noto Sans KR, system-ui, sans-serif' }}>
      <SBar />
      <ABr title="음성 경고 설정" back />
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>AI 자동 경고 문구 생성</div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>
            LLM이 상황에 맞는 경고 문구를 자동 생성합니다.
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af' }}>
            <span>Agent AI 상황 판단 결과에 따라 자동 생성</span>
            <span style={{ color: G }}>최근 생성됨</span>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>자동 경고 방송 활성화</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>위험 판단 시 Raspberry Pi로 즉시 전송</div>
            </div>
            <Toggle on={true} />
          </div>
          <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 7, height: 7, background: G, borderRadius: '50%' }} />
            <span style={{ fontSize: 12, color: G, fontWeight: 600 }}>현재 상태: 실시간 작동 중</span>
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>경고 방송 출력 볼륨</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
            <span>Raspberry Pi 스피커 볼륨</span>
            <span style={{ fontWeight: 700, color: '#111' }}>80%</span>
          </div>
          <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, position: 'relative' }}>
            <div style={{ width: '80%', height: '100%', background: '#3b82f6', borderRadius: 3 }} />
            <div style={{ position: 'absolute', top: '50%', left: '80%', transform: 'translate(-50%,-50%)', width: 16, height: 16, background: '#fff', border: '2px solid #3b82f6', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9ca3af', marginTop: 4 }}>
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </Card>
        <Btn label="🔊 기기 테스트 방송 송출" v="gray" full />
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>최근 생성된 경고 문구</span>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>3개</span>
          </div>
          {[
            '"경찰 신고 중. 즉시 현장에서 물러가 주세요."',
            '"관계자 외 접근 금지. 보안 시스템이 작동 중입니다."',
            '"이 구역은 24시간 AI 모니터링 중입니다."',
          ].map((msg, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderTop: i > 0 ? '1px solid #f3f4f6' : undefined }}>
              <div style={{ width: 36, height: 36, background: '#fee2e2', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🔊</div>
              <div>
                <div style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>경고 문구 {i + 1}</div>
                <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>{msg}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

function SSettings() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: BG, fontFamily: 'Noto Sans KR, system-ui, sans-serif' }}>
      <SBar />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 20px 10px' }}>
        <span style={{ fontSize: 20, fontWeight: 800 }}>설정</span>
        <div style={{ position: 'relative' }}>
          <div style={{ border: `1.5px solid ${G}`, borderRadius: 20, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: G, fontWeight: 600 }}>
            👤 내 프로필
          </div>
          <NavTag label="프로필" />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>하드웨어 디바이스 관리 (Raspberry Pi)</div>
          <Row l="디바이스 연결 상태" r={<span style={{ color: G }}>연결됨 (Online)</span>} />
          <Row l="마이크 감지 모듈" r={<span style={{ color: G }}>동작 중</span>} />
          <Row l="CCTV 카메라 모듈" r={<span style={{ color: G }}>동작 중 (1080p)</span>} />
          <div style={{ marginTop: 10, position: 'relative' }}>
            <Btn label="디바이스 관리" v="gray" full sm />
            <NavTag label="디바이스 등록" />
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>알림 설정</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: '#374151' }}>백그라운드 푸시 알림 받기</span>
            <Toggle on={true} />
          </div>
          <Row l="이상 감지 민감도" r="보통 (Standard)" />
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            {['낮음', '보통', '높음'].map((s, i) => (
              <div key={s} style={{ flex: 1, textAlign: 'center', padding: '7px', borderRadius: 8, background: i === 1 ? G : CARD, color: i === 1 ? '#fff' : '#374151', fontSize: 12, fontWeight: 600 }}>{s}</div>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>실시간 AI 서버 및 MQTT 통신 연동</div>
          <Row l="브로커 주소" r="mqtt://15.165.xxx.xx" />
          <Row l="연결 상태" r={<span style={{ color: G }}>양호 (Connected)</span>} />
        </Card>
        <div style={{ position: 'relative' }}>
          <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: G }}>→ 음성 경고 설정</span>
            <span style={{ fontSize: 20, color: '#9ca3af' }}>›</span>
          </Card>
          <NavTag label="음성 경고 설정" />
        </div>
        <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#6b7280' }}>앱 버전 정보</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>v1.2.4 (Latest)</span>
        </Card>
        <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
          <span style={{ fontSize: 14 }}>이용약관 및 개인정보 정책</span>
          <span style={{ fontSize: 20, color: '#9ca3af' }}>›</span>
        </Card>
      </div>
      <TBar a="settings" />
    </div>
  )
}

function SProfile() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: BG, fontFamily: 'Noto Sans KR, system-ui, sans-serif' }}>
      <SBar />
      <ABr title="내 프로필" back />
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 52, height: 52, background: '#dcfce7', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>👤</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700 }}>홍길동</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>hong@example.com</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>010-1234-5678</div>
          </div>
          <div style={{ border: `1.5px solid ${G}`, borderRadius: 8, padding: '5px 12px', fontSize: 12, color: G, fontWeight: 600 }}>편집</div>
        </Card>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>보호자 연락처</span>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>2명 등록</span>
          </div>
          {[{ name: '김부모', rel: '부모', phone: '010-9876-5432' }, { name: '이형제', rel: '형제', phone: '010-5555-4444' }].map(g => (
            <div key={g.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: '1px solid #f3f4f6' }}>
              <div style={{ width: 36, height: 36, background: '#dcfce7', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>👤</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{g.name}</span>
                  <span style={{ background: '#dcfce7', color: G, fontSize: 10, padding: '1px 6px', borderRadius: 4 }}>{g.rel}</span>
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{g.phone}</div>
              </div>
              <span style={{ color: '#9ca3af', fontSize: 18 }}>›</span>
            </div>
          ))}
          <div style={{ textAlign: 'center', padding: '10px', borderTop: '1px solid #f3f4f6', fontSize: 13, color: '#6b7280', fontWeight: 600 }}>+ 보호자 추가</div>
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>계정 보안</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: 13 }}>비밀번호 변경</span>
            <span style={{ color: '#9ca3af', fontSize: 18 }}>›</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid #f3f4f6', position: 'relative' }}>
            <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 600 }}>긴급 비밀번호 (Silent Signal) 설정</span>
            <div style={{ position: 'relative' }}>
              <span style={{ color: '#9ca3af', fontSize: 18 }}>›</span>
              <div style={{ position: 'absolute', top: -18, right: -5, background: '#3b82f6', color: '#fff', fontSize: 9, padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap', fontWeight: 700 }}>→ 긴급 모드</div>
            </div>
          </div>
        </Card>
        <div style={{ border: '1.5px solid #fecaca', borderRadius: 14, padding: '14px', textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#dc2626' }}>로그아웃</div>
      </div>
    </div>
  )
}

function SEmergency() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', fontFamily: 'Noto Sans KR, system-ui, sans-serif' }}>
      <SBar />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 20px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 15, fontWeight: 700 }}>
          <span style={{ fontSize: 22, color: '#6b7280' }}>‹</span>
          긴급 모드 (Silent Signal)
        </div>
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>● ACTIVE</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: '#dc2626', borderRadius: 18, padding: '22px 16px', textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🚨</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 5 }}>긴급 모드 활성화</div>
          <div style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.5 }}>Silent Signal이 감지되었습니다. 보호자에게 알림이 자동 전송됩니다.</div>
        </div>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>현재 위치 정보 (GPS)</div>
          <div style={{ height: 100, background: '#e5e7eb', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 36 }}>🗺️</span>
          </div>
          <Row l="GPS 상태" r={<span style={{ color: G }}>위치 확보 완료</span>} />
          <Row l="현재 위치" r="서울시 관악구 신림동" />
          <Row l="수집 시각" r="2026.09.09 10:14:35" />
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>보호자 알림 현황</div>
          {[{ name: '김부모 (부모)', status: 'FCM 전송 완료' }, { name: '이형제 (형제)', status: 'SMS 전송 완료' }].map(g => (
            <div key={g.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: 13 }}>👤 {g.name}</span>
              <span style={{ fontSize: 13, color: G, fontWeight: 600 }}>● {g.status}</span>
            </div>
          ))}
        </Card>
        <Btn label="📞 112 신고하기" v="danger" full />
        <Btn label="💬 보호자에게 메시지 재전송" v="dangerOutline" full />
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>긴급 메시지 내용</div>
          <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6, background: '#f3f4f6', borderRadius: 10, padding: 12 }}>
            "도움이 필요합니다. 위치: 서울시 관악구 신림동. 시각: 10:14:35. OmniGuardy AI 긴급 신호 감지."
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>긴급 대응 로그</div>
          {[['10:14:35', 'Silent Signal 감지됨'], ['10:14:36', 'GPS 위치 수집 완료'], ['10:14:37', '보호자 FCM 알림 전송'], ['10:14:38', '보호자 SMS 전송 완료']].map(([t, a]) => (
            <div key={t} style={{ fontSize: 12, color: '#374151', padding: '4px 0', display: 'flex', gap: 10 }}>
              <span style={{ color: '#9ca3af', width: 60, flexShrink: 0 }}>{t}</span>
              <span>{a}</span>
            </div>
          ))}
        </Card>
        <Btn label="긴급 모드 해제" v="gray" full />
      </div>
    </div>
  )
}

// ─── Screen Map ───────────────────────────────────────────────────────
const SCREEN_MAP: Record<ScreenId, () => React.ReactElement> = {
  login: SLogin, signup: SSignup, home: SHome, dangerAlert: SDangerAlert,
  deviceReg: SDeviceReg, eventLog: SEventLog, eventDetail: SEventDetail,
  cctv: SCCTV, voiceSettings: SVoiceSettings, settings: SSettings,
  profile: SProfile, emergency: SEmergency,
}

// ─── SVG Arrows ───────────────────────────────────────────────────────
function Arrows() {
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: CW, height: CH, pointerEvents: 'none', zIndex: 1 }}>
      <defs>
        {CONNS.map((c, i) => {
          const color = c.danger ? '#ef4444' : '#60a5fa'
          return (
            <marker key={i} id={`mk${i}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L7,3 L0,6 Z" fill={color} />
            </marker>
          )
        })}
      </defs>
      {CONNS.map((c, i) => {
        const fp = POS[c.from], tp = POS[c.to]
        if (!fp || !tp) return null
        const x1 = fp[0] + c.fa[0], y1 = fp[1] + c.fa[1]
        const x2 = tp[0] + c.ta[0], y2 = tp[1] + c.ta[1]
        const dx = x2 - x1, dy = y2 - y1
        const adx = Math.abs(dx), ady = Math.abs(dy)
        const cx = adx > ady ? dx * 0.42 : 0
        const cy = adx > ady ? 0 : dy * 0.42
        const path = `M ${x1} ${y1} C ${x1 + cx} ${y1 + cy}, ${x2 - cx} ${y2 - cy}, ${x2} ${y2}`
        const color = c.danger ? '#ef4444' : '#60a5fa'
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
        const lw = Math.min(110, c.label.length * 8 + 20)
        return (
          <g key={i}>
            <path d={path} fill="none" stroke={color} strokeWidth={c.danger ? 2.5 : 1.8}
              strokeDasharray={c.danger ? undefined : '6,4'}
              markerEnd={`url(#mk${i})`} opacity={0.85} />
            <rect x={mx - lw / 2} y={my - 10} width={lw} height={20} rx={5} fill={color} opacity={0.9} />
            <text x={mx} y={my + 4} textAnchor="middle" fontSize={9.5} fill="#fff" fontWeight="700" fontFamily="Noto Sans KR, system-ui, sans-serif">{c.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── App ──────────────────────────────────────────────────────────────
export default function App() {
  const [zoom, setZoom] = useState(0.3)
  const [pan, setPan] = useState({ x: 24, y: 24 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, px: 0, py: 0 })
  const [selected, setSelected] = useState<ScreenId | null>(null)
  const [hovered, setHovered] = useState<ScreenId | null>(null)

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1.06 : 0.94
    setZoom(z => Math.max(0.12, Math.min(1.2, z * factor)))
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-screen]')) return
    setDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY, px: pan.x, py: pan.y })
  }, [pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return
    setPan({ x: dragStart.px + e.clientX - dragStart.x, y: dragStart.py + e.clientY - dragStart.y })
  }, [dragging, dragStart])

  const handleMouseUp = useCallback(() => setDragging(false), [])

  const zoomTo = (delta: number) => setZoom(z => Math.max(0.12, Math.min(1.2, z + delta)))
  const reset = () => { setZoom(0.3); setPan({ x: 24, y: 24 }) }

  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0f1e', overflow: 'hidden', position: 'relative', fontFamily: 'Noto Sans KR, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 54, background: 'rgba(10,15,30,0.97)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', zIndex: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #16a34a, #4ade80)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🛡️</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: -0.3 }}>OmniGuardy AI</div>
            <div style={{ fontSize: 10, color: '#64748b' }}>와이어프레임 플로우 다이어그램 · 12개 화면</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 3 }}>
            <button onClick={() => zoomTo(-0.05)} style={{ width: 26, height: 26, background: 'transparent', border: 'none', borderRadius: 6, color: '#94a3b8', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
            <div style={{ width: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e2e8f0', fontSize: 11, fontWeight: 700 }}>{Math.round(zoom * 100)}%</div>
            <button onClick={() => zoomTo(0.05)} style={{ width: 26, height: 26, background: 'transparent', border: 'none', borderRadius: 6, color: '#94a3b8', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          </div>
          <button onClick={reset} style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 7, color: '#60a5fa', fontSize: 11, padding: '5px 12px', cursor: 'pointer', fontWeight: 700 }}>초기화</button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ position: 'absolute', bottom: 16, left: 16, background: 'rgba(10,15,30,0.92)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 16px', zIndex: 30, fontSize: 11, color: '#94a3b8', backdropFilter: 'blur(8px)' }}>
        <div style={{ fontWeight: 800, color: '#e2e8f0', marginBottom: 8, fontSize: 12 }}>범례</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <svg width="28" height="10"><line x1="0" y1="5" x2="28" y2="5" stroke="#60a5fa" strokeWidth="1.8" strokeDasharray="5,3" /></svg>
          <span>일반 내비게이션</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <svg width="28" height="10"><line x1="0" y1="5" x2="28" y2="5" stroke="#ef4444" strokeWidth="2.5" /></svg>
          <span>위험 / 긴급 흐름</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 16, background: '#3b82f6', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontWeight: 700 }}>→</div>
          <span>화면 내 이동 버튼 태그</span>
        </div>
      </div>

      {/* Hint */}
      <div style={{ position: 'absolute', bottom: 16, right: 16, background: 'rgba(10,15,30,0.92)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 16px', zIndex: 30, fontSize: 11, color: '#64748b', textAlign: 'right', backdropFilter: 'blur(8px)', lineHeight: 1.7 }}>
        <div style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 2 }}>조작 방법</div>
        <div>드래그 — 캔버스 이동</div>
        <div>휠 스크롤 — 확대 / 축소</div>
        <div>화면 클릭 — 전체 화면 보기</div>
      </div>

      {/* Canvas */}
      <div
        style={{ position: 'absolute', inset: 0, top: 54, cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Dot grid background */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }}>
          <defs>
            <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#94a3b8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0', width: CW, height: CH, position: 'relative' }}>
          {/* Group zone backgrounds */}
          {[
            { x: 60, y: 58, w: 415, h: 1760, label: '인증 흐름', color: 'rgba(59,130,246,0.04)' },
            { x: 535, y: 58, w: 1385, h: 900, label: '메인 / 이벤트', color: 'rgba(16,163,74,0.04)' },
            { x: 60, y: 1958, w: 1870, h: 870, label: '설정 / 프로필 / 긴급', color: 'rgba(168,85,247,0.04)' },
          ].map(z => (
            <div key={z.label} style={{ position: 'absolute', left: z.x, top: z.y, width: z.w, height: z.h, background: z.color, border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 20 }}>
              <div style={{ position: 'absolute', top: -12, left: 16, background: '#0a0f1e', padding: '0 8px', fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: 0.5 }}>{z.label}</div>
            </div>
          ))}

          <Arrows />

          {/* Screen Frames */}
          {SCREEN_ORDER.map(id => {
            const [sx, sy] = POS[id]
            const Content = SCREEN_MAP[id]
            const isHov = hovered === id
            return (
              <div
                key={id}
                data-screen={id}
                style={{ position: 'absolute', left: sx, top: sy, zIndex: 2 }}
                onClick={() => setSelected(id)}
                onMouseEnter={() => setHovered(id)}
                onMouseLeave={() => setHovered(null)}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)', marginBottom: 8, textAlign: 'center', letterSpacing: 0.3, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                  {LABELS[id]}
                </div>
                <div style={{
                  width: SW, height: SH, borderRadius: 32, background: '#fff',
                  boxShadow: isHov
                    ? '0 24px 70px rgba(0,0,0,0.6), 0 0 0 8px #1e3a5f, 0 0 0 10px #3b82f6'
                    : '0 20px 56px rgba(0,0,0,0.55), 0 0 0 8px #1e293b, 0 0 0 10px #334155',
                  overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s',
                  transform: isHov ? 'translateY(-3px)' : 'none',
                }}>
                  <div style={{ height: '100%', overflowY: 'auto', scrollbarWidth: 'none' }}>
                    <Content />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Full-screen overlay */}
      {selected && (() => {
        const idx = SCREEN_ORDER.indexOf(selected)
        const Content = SCREEN_MAP[selected]
        return (
          <div
            style={{ position: 'absolute', inset: 0, top: 54, background: 'rgba(0,0,0,0.82)', zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
            onClick={() => setSelected(null)}
          >
            <div
              style={{ width: 390, height: 844, borderRadius: 38, background: '#fff', boxShadow: '0 32px 90px rgba(0,0,0,0.7), 0 0 0 10px #1e293b, 0 0 0 12px #475569', overflow: 'hidden', position: 'relative', flexShrink: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ height: '100%', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#d1d5db #f9fafb' }}>
                <Content />
              </div>
            </div>
            {/* Close */}
            <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 16, right: 16, width: 38, height: 38, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 300 }}>✕</button>
            {/* Screen label */}
            <div style={{ position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
              {LABELS[selected]}
            </div>
            {/* Prev / Next */}
            {idx > 0 && (
              <button onClick={e => { e.stopPropagation(); setSelected(SCREEN_ORDER[idx - 1]) }}
                style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, color: '#fff', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
            )}
            {idx < SCREEN_ORDER.length - 1 && (
              <button onClick={e => { e.stopPropagation(); setSelected(SCREEN_ORDER[idx + 1]) }}
                style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, color: '#fff', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
            )}
            {/* Screen pills */}
            <div style={{ position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 640 }}>
              {SCREEN_ORDER.map(id => (
                <button key={id} onClick={e => { e.stopPropagation(); setSelected(id) }}
                  style={{ padding: '4px 9px', background: id === selected ? '#3b82f6' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: '#fff', fontSize: 10, cursor: 'pointer', fontWeight: id === selected ? 700 : 400, whiteSpace: 'nowrap' }}>
                  {LABELS[id].replace(/[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬] /, '')}
                </button>
              ))}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
