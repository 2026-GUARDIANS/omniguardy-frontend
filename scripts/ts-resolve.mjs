// 검증 스크립트 공용: 앱 코드는 Metro 방식대로 확장자 없이 import한다('../config').
// Node에서도 찾도록 .ts를 붙여 해석하는 훅. package.json의 test:* 스크립트가 --import로 먼저 불러온다.
import { register } from 'node:module';

register(
  'data:text/javascript,' +
    encodeURIComponent(
      `export async function resolve(s, c, next) {
        try { return await next(s, c); }
        catch (e) { if (s.startsWith('.') && !/\\.[a-z]+$/i.test(s)) return next(s + '.ts', c); throw e; }
      }`,
    ),
);
