import type { Api, DevTools } from '../interfaces';
import { mockAuthApi } from './auth.mock';
import { mockDeviceApi, mockSettingsApi } from './devices.mock';
import { mockEventApi } from './events.mock';
import { mockRealtime } from './realtime.mock';

export function createMockApi(): Api {
  return {
    auth: mockAuthApi,
    events: mockEventApi,
    devices: mockDeviceApi,
    settings: mockSettingsApi,
    realtime: mockRealtime,
  };
}

export const mockDevTools: DevTools = {
  triggerHighAlert: () => mockRealtime.triggerHighAlert(),
};
