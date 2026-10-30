// 실제 백엔드 구현. 기준: https://api.omniguardy.cloud/v3/api-docs
// 화면 코드는 바꾸지 않고 이 폴더와 ../types.ts만 수정한다.
import type { Api, DeviceApi } from '../interfaces';
import { httpAuthApi } from './auth.http';
import { NotImplementedError } from './client';
import { httpEventApi } from './events.http';
import { FcmRealtimeService } from './realtime.fcm';

const notInSpec = (what: string) => (): never => {
  throw new NotImplementedError(what);
};

// 서버 명세 없음: 장치 연결 상태 조회, 경고음 중지(/api/sounds/{type}은 재생만 있음)
const httpDeviceApi: DeviceApi = {
  getStatuses: notInSpec('장치 상태 조회'),
  stopWarning: notInSpec('경고 끄기'),
};

export function createHttpApi(): Api {
  return {
    auth: httpAuthApi,
    events: httpEventApi,
    devices: httpDeviceApi,
    // 실시간 알림은 WebSocket 대신 FCM 푸시를 쓴다(사용자 결정)
    realtime: new FcmRealtimeService(),
  };
}
