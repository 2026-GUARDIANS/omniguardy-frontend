// HTTP 클라이언트(src/api/http/client.ts) 검증: 가짜 fetch로 토큰 재발급·세션 만료·오류 처리 흐름을 확인한다.
// 사용: npm run test:client
import assert from 'node:assert/strict';
import { register } from 'node:module';

// 앱 코드는 Metro 방식대로 확장자 없이 import한다('../config'). Node에서도 찾도록 .ts를 붙여 해석하는 훅
register(
  'data:text/javascript,' +
    encodeURIComponent(
      `export async function resolve(s, c, next) {
        try { return await next(s, c); }
        catch (e) { if (s.startsWith('.') && !/\\.[a-z]+$/i.test(s)) return next(s + '.ts', c); throw e; }
      }`,
    ),
);

process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.test';
const client = await import('../src/api/http/client.ts');
const { request, requestData, setAccessToken, setSessionHooks, ApiError } = client;

const json = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
  text: async () => (body === undefined ? '' : JSON.stringify(body)),
});

/** 응답을 순서대로 돌려주는 가짜 fetch. 호출 기록(경로, Authorization)을 남긴다 */
function fakeFetch(responses) {
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ path: url.replace('https://api.test', ''), auth: init.headers?.Authorization ?? null });
    const next = responses.shift();
    if (next instanceof Error) throw next;
    return next;
  };
  return calls;
}

let refreshed = [];
let expired = 0;
setSessionHooks({ onTokenRefreshed: (t) => refreshed.push(t), onExpired: () => expired++ });
const reset = () => {
  refreshed = [];
  expired = 0;
  setAccessToken('old-token');
};

let passed = 0;
const ok = async (label, fn) => {
  reset();
  await fn();
  console.log(`OK  ${label}`);
  passed++;
};

await ok('토큰을 Authorization 헤더로 보낸다', async () => {
  const calls = fakeFetch([json(200, { content: [] })]);
  await request('/api/security-events');
  assert.equal(calls[0].auth, 'Bearer old-token');
});

await ok('401 → 재발급 성공 → 새 토큰으로 재시도, 저장 훅 호출', async () => {
  const calls = fakeFetch([
    json(401, { success: false, status: 401, code: 'AUTHENTICATION_REQUIRED', message: '인증이 필요합니다.' }),
    json(200, { success: true, code: 'TOKEN_REISSUE_SUCCESS', message: '', data: { accessToken: 'new-token', tokenType: 'Bearer' } }),
    json(200, { content: [1] }),
  ]);
  const res = await request('/api/security-events');
  assert.deepEqual(res, { content: [1] });
  assert.deepEqual(calls.map((c) => c.path), ['/api/security-events', '/api/auth/refresh', '/api/security-events']);
  assert.equal(calls[2].auth, 'Bearer new-token');
  assert.deepEqual(refreshed, ['new-token']);
  assert.equal(expired, 0);
});

await ok('401 → 재발급 실패 → 세션 만료 훅 + 오류', async () => {
  fakeFetch([
    json(401, { success: false, status: 401, code: 'AUTHENTICATION_REQUIRED', message: '인증이 필요합니다.' }),
    json(401, { success: false, status: 401, code: 'REFRESH_TOKEN_NOT_FOUND', message: 'Refresh Token이 존재하지 않습니다.' }),
  ]);
  await assert.rejects(request('/api/security-events'), (e) => e instanceof ApiError && e.status === 401);
  assert.equal(expired, 1);
});

await ok('로그인처럼 토큰 없는 요청의 401은 재발급·만료 처리 안 함', async () => {
  const calls = fakeFetch([json(401, { success: false, status: 401, code: 'INVALID_CREDENTIALS', message: '이메일 또는 비밀번호가 올바르지 않습니다.' })]);
  await assert.rejects(request('/api/auth/login', { method: 'POST', body: {}, anonymous: true }), (e) => e.message === '이메일 또는 비밀번호가 올바르지 않습니다.');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].auth, null);
  assert.equal(expired, 0);
});

await ok('공통 껍데기 { success, data } 벗기기', async () => {
  fakeFetch([json(200, { success: true, code: 'LOGIN_SUCCESS', message: '', data: { accessToken: 't' } })]);
  assert.deepEqual(await requestData('/api/auth/login', { method: 'POST', body: {}, anonymous: true }), { accessToken: 't' });
});

await ok('오류 본문이 없으면 상태 코드별 기본 문구', async () => {
  fakeFetch([{ ok: false, status: 503, json: async () => { throw new Error('no body'); }, text: async () => '' }]);
  await assert.rejects(request('/hello'), (e) => e.status === 503 && e.message.includes('잠시 후'));
});

await ok('네트워크 오류', async () => {
  fakeFetch([new TypeError('Network request failed')]);
  await assert.rejects(request('/hello'), (e) => e.code === 'NETWORK_ERROR');
});

await ok('204 응답은 undefined', async () => {
  fakeFetch([{ ok: true, status: 204, json: async () => undefined, text: async () => '' }]);
  assert.equal(await request('/api/sounds/WARNING', { method: 'POST' }), undefined);
});

console.log(`\n${passed}건 통과`);
