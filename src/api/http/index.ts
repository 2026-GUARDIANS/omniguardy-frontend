// 실제 백엔드 구현 자리. 명세 확정 전이라 모든 메서드는 TODO입니다.
// 구현 시 화면 코드는 바꾸지 않고, 이 폴더와 ../types.ts만 수정합니다.
import type { Api, AuthApi, DeviceApi, EventApi, SettingsApi } from '../interfaces';
import { NotImplementedError } from './client';
import { WebSocketRealtimeService } from './realtime.ws';

const todo = (what: string) => (): never => {
  throw new NotImplementedError(what);
};

// TODO: POST /auth/login, POST /auth/signup, POST /auth/logout, GET /users/me (경로 미정)
//       로그인 성공 시 client.setAccessToken(token) 호출
const httpAuthApi: AuthApi = {
  login: todo('auth.login'),
  signup: todo('auth.signup'),
  logout: todo('auth.logout'),
  getMe: todo('auth.getMe'),
};

// TODO: 이벤트 목록/상세/확인 처리 API (경로 미정)
const httpEventApi: EventApi = {
  list: todo('events.list'),
  get: todo('events.get'),
  acknowledge: todo('events.acknowledge'),
};

// TODO: 장치 상태 조회, 경고 출력 중지 API (경로 미정)
const httpDeviceApi: DeviceApi = {
  getStatuses: todo('devices.getStatuses'),
  stopWarning: todo('devices.stopWarning'),
};

// TODO: 위험도별 대응 설정 API (경로 미정)
const httpSettingsApi: SettingsApi = {
  getResponseSettings: todo('settings.getResponseSettings'),
  updateResponseSettings: todo('settings.updateResponseSettings'),
};

export function createHttpApi(): Api {
  return {
    auth: httpAuthApi,
    events: httpEventApi,
    devices: httpDeviceApi,
    settings: httpSettingsApi,
    realtime: new WebSocketRealtimeService(),
  };
}
