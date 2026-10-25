// 한글 구간(사이 공백 포함)과 나머지(영문·숫자·기호) 구간
const HANGUL_RUN = /[ᄀ-ᇿ㄰-㆏가-힣]+(?:\s+[ᄀ-ᇿ㄰-㆏가-힣]+)*/g;

/** "Agent 위험도 판단" → [{ "Agent ", ko:false }, { "위험도 판단", ko:true }] */
export function splitScript(text: string): { text: string; ko: boolean }[] {
  const out: { text: string; ko: boolean }[] = [];
  let last = 0;
  for (const m of text.matchAll(HANGUL_RUN)) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), ko: false });
    out.push({ text: m[0], ko: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), ko: false });
  return out;
}
