import type { EventApi } from '../interfaces';
import { sleep } from './constants';
import { mockStore } from './store';

export const mockEventApi: EventApi = {
  async list(filter) {
    await sleep();
    const sorted = [...mockStore.events].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    return filter?.risk ? sorted.filter((e) => e.risk === filter.risk) : sorted;
  },
  async get(id) {
    await sleep();
    const found = mockStore.events.find((e) => e.id === id);
    if (!found) throw new Error('이벤트를 찾을 수 없습니다.');
    return found;
  },
  async acknowledge(id) {
    await sleep();
    mockStore.acknowledged.add(id);
  },
};
