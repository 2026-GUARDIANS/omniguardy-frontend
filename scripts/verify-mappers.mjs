// 서버 응답 → 앱 타입 변환(mappers.ts)과 알림 문장(detectedSentence) 검증. 사용: npm run test:mappers
// 입력 예시는 Swagger 응답 예시와 백엔드 코드(omniguardy-backend 351cb5d)의 상태값을 기준으로 만들었다.
import assert from 'node:assert/strict';

import { detectedSentence } from '../src/lib/format.ts';
import {
  parseVisionEventTypes,
  toEventStatus,
  toRiskLevel,
  toSecurityEvent,
  toSession,
} from '../src/api/http/mappers.ts';

let passed = 0;
const ok = (label, fn) => {
  fn();
  console.log(`OK  ${label}`);
  passed++;
};

// Swagger 응답 예시(GET /api/security-events/{eventId})
const swaggerExample = {
  id: 41,
  eventId: 'evt-video-20261029-001',
  userId: 17,
  triggerId: 'trigger-keypad-001',
  triggerType: 'KEYPAD',
  status: 'ANALYZED',
  audioEventType: null,
  audioProbability: null,
  visionPrediction: 'A18',
  visionConfidence: 0.91,
  visionAnalysisMode: 'exhibition_rules',
  classProbabilities: '{"A18":0.91,"NORMAL":0.09}',
  visionEvents: '[{"eventType":"PERSON_DWELL_OBSERVED"}]',
  personCount: 1,
  videoDurationSeconds: 4.2,
  riskLevel: 'HIGH',
  riskScore: 82,
  agentReason: '문 앞 배회 행동이 감지되었습니다.',
  triggeredAt: '2026-10-29T20:10:15+09:00',
  visionAnalyzedAt: '2026-10-29T20:10:19+09:00',
  createdAt: '2026-10-29T20:10:15',
  updatedAt: '2026-10-29T20:10:20',
};
const pending = { ...swaggerExample, eventId: 'evt-2', status: 'CAMERA_REQUESTED', riskLevel: null, riskScore: null, agentReason: null };

ok('Swagger 예시 → 앱 이벤트', () => {
  const e = toSecurityEvent(swaggerExample);
  assert.equal(e.id, 'evt-video-20261029-001'); // 숫자 id가 아니라 eventId
  assert.equal(e.risk, 'HIGH');
  assert.equal(e.status, 'COMPLETED'); // 위험도가 있으면 판정 완료(예시의 "ANALYZED"는 실제 상태값이 아님)
  assert.equal(e.occurredAt, '2026-10-29T20:10:15+09:00'); // triggeredAt 우선
  assert.equal(e.title, '문 앞 배회 행동이 감지되었습니다.'); // 제목 대응표 확정 전: 판단 근거 문장
  assert.equal(e.videoUrl, null);
  assert.deepEqual(e.agentJudgement, { risk: 'HIGH', action: '모바일 알림 + 경고 출력', reason: '문 앞 배회 행동이 감지되었습니다.' });
});
ok('분석 중(위험도 없음)', () => {
  const e = toSecurityEvent(pending);
  assert.equal(e.risk, null);
  assert.equal(e.status, 'ANALYZING');
  assert.equal(e.title, '분석 중인 보안 이벤트');
  assert.deepEqual(e.agentJudgement, { risk: null, action: '', reason: '' });
});
ok('실패 / 판정 없음 상태', () => {
  assert.equal(toEventStatus('FAILED', null), 'FAILED');
  assert.equal(toEventStatus('COMPLETED', null), 'COMPLETED'); // completeWithoutRisk
  for (const s of ['AUDIO_DETECTED', 'CAMERA_REQUESTED', 'VISION_ANALYZED', null]) assert.equal(toEventStatus(s, null), 'ANALYZING');
});
ok('위험도 값', () => {
  assert.equal(toRiskLevel('CRITICAL'), 'CRITICAL');
  assert.equal(toRiskLevel('medium'), 'MEDIUM');
  assert.equal(toRiskLevel('UNKNOWN'), null);
  assert.equal(toRiskLevel(null), null);
  assert.equal(toSecurityEvent({ ...swaggerExample, riskLevel: 'CRITICAL' }).agentJudgement.action, '모바일 알림 + 사이렌 출력');
});
ok('createdAt만 있을 때(시간대 없음)', () => {
  assert.equal(toSecurityEvent({ ...swaggerExample, triggeredAt: null }).occurredAt, '2026-10-29T20:10:15');
});
ok('visionEvents 파싱(잘못된 JSON은 빈 목록)', () => {
  assert.deepEqual(parseVisionEventTypes('[{"eventType":"SILENT_SIGNAL"},{"x":1}]'), ['SILENT_SIGNAL']);
  assert.deepEqual(parseVisionEventTypes('not json'), []);
  assert.deepEqual(parseVisionEventTypes(null), []);
});
ok('로그인 응답 → 세션', () => {
  const s = toSession({ accessToken: 't', tokenType: 'Bearer', userId: 17, email: 'guard@example.com', name: '김가디' });
  assert.deepEqual(s, { accessToken: 't', user: { name: '김가디', email: 'guard@example.com' } });
});
ok('알림 문장(detectedSentence)', () => {
  assert.equal(detectedSentence('비상 손동작'), '비상 손동작이 감지되었습니다'); // 받침 있음 → 이
  assert.equal(detectedSentence('후방 접근 의심', true), '후방 접근 의심이\n감지되었습니다');
  assert.equal(detectedSentence('카메라 가림'), '카메라 가림이 감지되었습니다');
  assert.equal(detectedSentence('보안 이벤트 발생 시도'), '보안 이벤트 발생 시도가 감지되었습니다'); // 받침 없음 → 가
  assert.equal(detectedSentence('문 앞 배회 행동이 감지되었습니다.'), '문 앞 배회 행동이 감지되었습니다.'); // 이미 문장
});

console.log(`\n${passed}건 통과`);
