const pad = (n: number) => String(n).padStart(2, '0');

/** "14:05" */
export function formatTime(iso: string) {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** 오늘 기준 며칠 전인지(0 = 오늘) */
export function daysAgo(iso: string, now: Date = new Date()) {
  return Math.round((startOfDay(now) - startOfDay(new Date(iso))) / 86_400_000);
}

/** 날짜 묶음 라벨: "오늘" / "어제" / "10월 23일" */
export function formatDayLabel(iso: string, now: Date = new Date()) {
  const diff = daysAgo(iso, now);
  if (diff === 0) return '오늘';
  if (diff === 1) return '어제';
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/** "오늘 14:05" / "10월 23일 14:05" */
export function formatDateTime(iso: string, now: Date = new Date()) {
  const label = formatDayLabel(iso, now);
  return `${label} ${formatTime(iso)}`;
}

/** 마지막 글자에 받침이 있으면 true(한글이 아니면 false) */
function hasFinalConsonant(word: string) {
  const code = word.trim().charCodeAt(word.trim().length - 1);
  return code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
}

/**
 * 알림 문장. 제목이 이미 문장("…습니다.")이면 그대로, 명사형 제목이면 "○○이/가 감지되었습니다"로 만든다.
 * (실제 서버의 제목 대응표가 정해지기 전에는 판단 근거 문장이 제목으로 온다)
 */
export function detectedSentence(title: string, lineBreak = false) {
  const t = title.trim();
  if (/[.!?]$|다$/.test(t)) return t;
  return `${t}${hasFinalConsonant(t) ? '이' : '가'}${lineBreak ? '\n' : ' '}감지되었습니다`;
}
