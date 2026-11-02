// 실제 백엔드 구현. 기준: https://api.omniguardy.cloud/v3/api-docs
// 화면 코드는 바꾸지 않고 이 폴더와 ../types.ts만 수정한다.
import type { Api } from '../interfaces';
import { httpAuthApi } from './auth.http';
import { httpEventApi } from './events.http';
import { FcmRealtimeService } from './realtime.fcm';

export function createHttpApi(): Api {
  return {
    auth: httpAuthApi,
    events: httpEventApi,
    // 실시간 알림은 WebSocket 대신 FCM 푸시를 쓴다(사용자 결정)
    realtime: new FcmRealtimeService(),
  };
}
