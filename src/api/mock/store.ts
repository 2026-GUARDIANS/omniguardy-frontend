// mock 구현들이 공유하는 메모리 저장소. 앱을 다시 시작하면 초기화됩니다.
import type { ResponseSettings, SecurityEvent, User } from '../types';
import { createExampleEvents } from './example-fixtures';

export const mockStore: {
  user: User | null;
  events: SecurityEvent[];
  acknowledged: Set<string>;
  settings: ResponseSettings;
  warningActive: boolean;
} = {
  user: null,
  events: createExampleEvents(),
  acknowledged: new Set(),
  settings: { mediumNotify: true, highNotifyAndWarn: true },
  warningActive: false,
};
