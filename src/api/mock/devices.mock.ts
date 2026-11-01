import type { DeviceApi } from '../interfaces';
import { sleep } from './constants';
import { mockStore } from './store';

export const mockDeviceApi: DeviceApi = {
  async stopWarning() {
    await sleep();
    mockStore.warningActive = false;
  },
};
