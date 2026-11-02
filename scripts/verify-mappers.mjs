// 서버 응답 → 앱 타입 변환(mappers.ts)과 알림 문장(detectedSentence) 검증. 사용: npm run test:mappers
// 입력 예시는 Swagger 응답 예시와 백엔드 코드(omniguardy-backend 351cb5d)의 상태값을 기준으로 만들었다.
import assert from 'node:assert/strict';

import { detectedSentence } from '../src/lib/format.ts';
import { digitsOnly, formatMobilePhone, isMobilePhone } from '../src/lib/validation.ts';
import {
  parseVisionEventTypes,
  toEventStatus,
  toHomeSummary,
  toJudgementReason,
  toRiskLevel,
  toSecurityEvent,
  toSession,
  toUser,
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
const pending = { ...swaggerExample, eventId: 'evt-2', status: 'CAMERA_REQUESTED', riskLevel: null, riskScore: null, agentReason: null, visionEvents: null };

ok('Swagger 예시 → 앱 이벤트', () => {
  const e = toSecurityEvent(swaggerExample);
  assert.equal(e.id, 'evt-video-20261029-001'); // 숫자 id가 아니라 eventId
  assert.equal(e.risk, 'HIGH');
  assert.equal(e.status, 'COMPLETED'); // 위험도가 있으면 판정 완료(예시의 "ANALYZED"는 실제 상태값이 아님)
  assert.equal(e.occurredAt, '2026-10-29T20:10:15+09:00'); // triggeredAt 우선
  assert.equal(e.title, '현관 앞 체류 관찰'); // visionEvents PERSON_DWELL_OBSERVED → 한글 제목
  assert.equal(e.agentJudgement.reason, '키패드 입력 후 촬영한 영상에서 현관 앞 체류가 관찰되었습니다.'); // AI 원문 대신 정리된 값으로 만든 문장
  assert.equal(e.videoUrl, null);
  assert.deepEqual(e.agentJudgement, { risk: 'HIGH', action: '모바일 알림 + 경고 출력', reason: '키패드 입력 후 촬영한 영상에서 현관 앞 체류가 관찰되었습니다.' });
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
  assert.deepEqual(s, { accessToken: 't', user: { name: '김가디', email: 'guard@example.com', phone: null } });
});
ok('이벤트 제목: 한글 대응표 우선순위, 판단 근거 문장은 제목으로 쓰지 않음', () => {
  const title = (visionEvents, extra = {}) => toSecurityEvent({ ...swaggerExample, visionEvents, ...extra }).title;
  assert.equal(title('[{"eventType":"SILENT_SIGNAL"}]'), '비상 손동작');
  assert.equal(title('[{"eventType":"REAR_CLOSE_APPROACH_SUSPECTED"}]'), '후방 접근 의심');
  assert.equal(title('[{"eventType":"CAMERA_OCCLUSION_SUSPECTED"}]'), '카메라 가림 의심');
  // 여러 종류면 위험도가 높은 쪽(가림 > 체류), 순서와 상관없이
  assert.equal(title('[{"eventType":"PERSON_DWELL_OBSERVED"},{"eventType":"CAMERA_OCCLUSION_SUSPECTED"}]'), '카메라 가림 의심');
  assert.equal(title('[{"eventType":"silent_signal"}]'), '비상 손동작'); // 대소문자 무관
  // 대응표에 없거나 visionEvents가 없으면(temporal_trial6 A18/A21 등) agentReason이 아니라 기본 문구
  assert.equal(title('[{"eventType":"UNKNOWN"}]'), '보안 이벤트');
  assert.equal(title(null), '보안 이벤트');
  assert.equal(title(null, { riskLevel: null, status: 'FAILED' }), '분석에 실패한 보안 이벤트');
});
ok('판단 근거: 트리거·소리·영상 이벤트로 만든 문장(횟수·인원·확률 없음)', () => {
  // 실제 응답 예(사용자 제공): AUDIO + KNOCK + CAMERA_OCCLUSION_SUSPECTED 2회, personCount 2
  assert.equal(
    toJudgementReason({
      triggerType: 'AUDIO',
      audioEventType: 'KNOCK',
      visionEvents: '[{"eventType":"CAMERA_OCCLUSION_SUSPECTED"},{"eventType":"CAMERA_OCCLUSION_SUSPECTED"}]',
    }),
    '현관에서 노크 소리가 감지된 뒤, 카메라 가림 의심이 관찰되었습니다.',
  );
  assert.equal(
    toJudgementReason({ triggerType: 'KEYPAD', audioEventType: null, visionEvents: '[{"eventType":"SILENT_SIGNAL"}]' }),
    '키패드 입력 후 촬영한 영상에서 비상 손동작이 관찰되었습니다.',
  );
  assert.equal(
    toJudgementReason({ triggerType: 'AUDIO', audioEventType: 'HANDLE', visionEvents: '[{"eventType":"PERSON_DWELL_OBSERVED"}]' }),
    '현관에서 문손잡이 소리가 감지된 뒤, 현관 앞 체류가 관찰되었습니다.',
  );
  // 여러 종류: 위험도 순서, 조사(과/와)
  assert.equal(
    toJudgementReason({
      triggerType: 'AUDIO',
      audioEventType: 'KNOCK',
      visionEvents: '[{"eventType":"PERSON_DWELL_OBSERVED"},{"eventType":"CAMERA_OCCLUSION_SUSPECTED"}]',
    }),
    '현관에서 노크 소리가 감지된 뒤, 카메라 가림 의심과 현관 앞 체류가 관찰되었습니다.',
  );
  // 영상 이벤트 없음(temporal_trial6 A18/A21 등), 소리 종류 없음, 키패드만
  assert.equal(toJudgementReason({ triggerType: 'AUDIO', audioEventType: 'KNOCK', visionEvents: null }), '현관에서 노크 소리가 감지되었습니다.');
  assert.equal(toJudgementReason({ triggerType: 'AUDIO', audioEventType: null, visionEvents: null }), '현관에서 소리가 감지되었습니다.');
  assert.equal(toJudgementReason({ triggerType: 'KEYPAD', audioEventType: null, visionEvents: '[]' }), '키패드 입력이 감지되었습니다.');
  assert.equal(toJudgementReason({ triggerType: null, audioEventType: null, visionEvents: null }), '');
});
ok('내 정보(/api/users/me) → 사용자', () => {
  assert.deepEqual(toUser({ name: '김가디', email: 'guard@example.com', phoneNumber: '010-1234-5678' }), {
    name: '김가디',
    email: 'guard@example.com',
    phone: '010-1234-5678',
  });
  assert.equal(toUser({ name: 'a', email: 'b', phoneNumber: null }).phone, null);
  assert.equal(toUser({ name: 'a', email: 'b', phoneNumber: '  ' }).phone, null);
});
ok('홈 요약(/api/home/summary)', () => {
  assert.deepEqual(toHomeSummary({ securityStatus: 'HIGH', lastDetectedAt: '2026-10-31T14:20:00+09:00', todayEventCount: 3 }), {
    latestRisk: 'HIGH',
    lastDetectedAt: '2026-10-31T14:20:00+09:00',
    todayEventCount: 3,
  });
  assert.deepEqual(toHomeSummary({ securityStatus: null, lastDetectedAt: null, todayEventCount: 0 }), {
    latestRisk: null,
    lastDetectedAt: null,
    todayEventCount: 0,
  });
});
ok('휴대폰 번호 검사·형식', () => {
  for (const v of ['010-1234-5678', '01012345678', '010 1234 5678', '011-123-4567']) assert.equal(isMobilePhone(v), true, v);
  for (const v of ['', '02-123-4567', '010-123', '010-1234-56789', 'abc']) assert.equal(isMobilePhone(v), false, v);
  assert.equal(formatMobilePhone('01012345678'), '010-1234-5678');
  assert.equal(formatMobilePhone('0111234567'), '011-123-4567');
  assert.equal(formatMobilePhone('010-1234-5678'), '010-1234-5678'); // 서버가 하이픈 형식으로 줘도 그대로
  assert.equal(formatMobilePhone('12345'), '12345'); // 휴대폰 형식이 아니면 받은 값 그대로
  assert.equal(digitsOnly('010-1234 5678'), '01012345678'); // 회원가입 전송값·입력 필터
});
ok('회원가입 응답 → 세션(연락처는 입력값)', () => {
  const s = toSession({ accessToken: 't', tokenType: 'Bearer', userId: 17, email: 'guard@example.com', name: '김가디' }, '01000000000');
  assert.equal(s.user.phone, '01000000000');
});
ok('알림 문장(detectedSentence)', () => {
  assert.equal(detectedSentence('비상 손동작'), '비상 손동작이 감지되었습니다'); // 받침 있음 → 이
  assert.equal(detectedSentence('후방 접근 의심', true), '후방 접근 의심이\n감지되었습니다');
  assert.equal(detectedSentence('카메라 가림'), '카메라 가림이 감지되었습니다');
  assert.equal(detectedSentence('보안 이벤트 발생 시도'), '보안 이벤트 발생 시도가 감지되었습니다'); // 받침 없음 → 가
  assert.equal(detectedSentence('문 앞 배회 행동이 감지되었습니다.'), '문 앞 배회 행동이 감지되었습니다.'); // 이미 문장
});

console.log(`\n${passed}건 통과`);
