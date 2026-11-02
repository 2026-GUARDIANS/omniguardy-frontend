// FCM 푸시 데이터 해석(mappers.ts의 toPushRiskLevel, parseSecurityPush) 검증. 사용: npm run test:push
// 현재 백엔드(351cb5d) 형식 { type, riskLevel: "2"|"3" }과 변경 요청 형식 { type, eventId, riskLevel: "HIGH" } 둘 다 확인한다.
import assert from 'node:assert/strict';

import { isHighOrAbove } from '../src/api/types.ts';
import { parseSecurityPush, toPushRiskLevel } from '../src/api/http/mappers.ts';

let passed = 0;
const ok = (label, fn) => {
  fn();
  console.log(`OK  ${label}`);
  passed++;
};

ok('숫자 문자열(현재 백엔드): "2" → MEDIUM, "3" → HIGH', () => {
  assert.equal(toPushRiskLevel('2'), 'MEDIUM');
  assert.equal(toPushRiskLevel('3'), 'HIGH');
  assert.equal(toPushRiskLevel(' 3 '), 'HIGH');
  assert.equal(toPushRiskLevel(3), 'HIGH'); // 문자열이 아니라 숫자로 와도
});

ok('enum 이름(변경 후): MEDIUM / HIGH / CRITICAL, 대소문자 무관', () => {
  assert.equal(toPushRiskLevel('MEDIUM'), 'MEDIUM');
  assert.equal(toPushRiskLevel('HIGH'), 'HIGH');
  assert.equal(toPushRiskLevel('CRITICAL'), 'CRITICAL');
  assert.equal(toPushRiskLevel('critical'), 'CRITICAL');
  assert.equal(toPushRiskLevel('LOW'), 'LOW');
});

ok('알 수 없는 값은 null (추측하지 않음)', () => {
  for (const v of [undefined, null, '', '1', '4', '2.5', 'URGENT', {}, true]) {
    assert.equal(toPushRiskLevel(v), null, `입력: ${JSON.stringify(v)}`);
  }
});

ok('HIGH 이상 판정: "3"·HIGH·CRITICAL만 비상 화면 대상', () => {
  assert.equal(isHighOrAbove(toPushRiskLevel('3')), true);
  assert.equal(isHighOrAbove(toPushRiskLevel('CRITICAL')), true);
  assert.equal(isHighOrAbove(toPushRiskLevel('2')), false);
  assert.equal(isHighOrAbove(toPushRiskLevel(undefined)), false);
});

ok('현재 백엔드 푸시: eventId 없음 → 대체 조회 대상', () => {
  assert.deepEqual(parseSecurityPush({ type: 'SECURITY_EVENT', riskLevel: '3' }), { risk: 'HIGH', eventId: null });
});

ok('변경 후 푸시: eventId 포함', () => {
  assert.deepEqual(parseSecurityPush({ type: 'SECURITY_EVENT', eventId: 'evt-1', riskLevel: 'CRITICAL' }), {
    risk: 'CRITICAL',
    eventId: 'evt-1',
  });
  // 섞인 형태(eventId만 먼저 추가된 경우)
  assert.deepEqual(parseSecurityPush({ type: 'SECURITY_EVENT', eventId: ' evt-2 ', riskLevel: '2' }), {
    risk: 'MEDIUM',
    eventId: 'evt-2',
  });
});

ok('빈 eventId·문자열이 아닌 eventId는 없는 것으로', () => {
  assert.equal(parseSecurityPush({ type: 'SECURITY_EVENT', eventId: '  ', riskLevel: '3' }).eventId, null);
  assert.equal(parseSecurityPush({ type: 'SECURITY_EVENT', eventId: 42, riskLevel: '3' }).eventId, null);
});

ok('보안 이벤트 푸시가 아니면 null', () => {
  assert.equal(parseSecurityPush({ type: 'OTHER', riskLevel: '3' }), null);
  assert.equal(parseSecurityPush({ riskLevel: '3' }), null);
  assert.equal(parseSecurityPush(undefined), null);
  assert.equal(parseSecurityPush('SECURITY_EVENT'), null);
});

console.log(`\n${passed}건 통과`);
