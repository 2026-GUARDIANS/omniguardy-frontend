import type { EventApi } from '../interfaces';
import { matchesRiskFilter } from '../types';
import { daysAgo } from '../../lib/format';
import { sleep } from './constants';
import { mockStore } from './store';

export const mockEventApi: EventApi = {
  async list(filter) {
    await sleep();
    const sorted = [...mockStore.events].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    const risk = filter?.risk;
    return risk ? sorted.filter((e) => matchesRiskFilter(e.risk, risk)) : sorted;
  },
  async getHomeSummary() {
    await sleep();
    const latest = [...mockStore.events].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))[0];
    return {
      latestRisk: latest?.risk ?? null,
      lastDetectedAt: latest?.occurredAt ?? null,
      todayEventCount: mockStore.events.filter((e) => daysAgo(e.occurredAt) === 0).length,
    };
  },
  async get(id) {
    await sleep();
    const found = mockStore.events.find((e) => e.id === id);
    if (!found) throw new Error('이벤트를 찾을 수 없습니다.');
    return found;
  },
  async getVideoUrl(id) {
    await sleep();
    return mockStore.events.find((e) => e.id === id)?.videoUrl ?? null;
  },
  async acknowledge(id) {
    await sleep();
    mockStore.acknowledged.add(id);
  },
};
