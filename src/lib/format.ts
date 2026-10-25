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
