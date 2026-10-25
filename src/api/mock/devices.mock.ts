import type { DeviceApi, SettingsApi } from '../interfaces';
import { sleep } from './constants';
import { mockStore } from './store';

/** mock: 장치 상태는 예시 값입니다(화면에도 "예시"로 표기). */
export const mockDeviceApi: DeviceApi = {
  async getStatuses() {
    await sleep();
    return [
      { kind: 'camera', connected: true },
      { kind: 'voice', connected: true },
      { kind: 'keypad', connected: true },
    ];
  },
  async stopWarning() {
    await sleep();
    mockStore.warningActive = false;
  },
};

export const mockSettingsApi: SettingsApi = {
  async getResponseSettings() {
    await sleep();
    return { ...mockStore.settings };
  },
  async updateResponseSettings(patch) {
    await sleep();
    mockStore.settings = { ...mockStore.settings, ...patch };
    return { ...mockStore.settings };
  },
};
