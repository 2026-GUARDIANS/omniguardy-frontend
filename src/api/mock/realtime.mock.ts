import type { RealtimeService } from '../interfaces';
import type { RealtimeMessage, RealtimeStatus } from '../types';
import { MOCK_HIGH_ALERT_DELAY_MS } from './constants';
import { makeExampleEvent } from './example-fixtures';
import { mockStore } from './store';

/**
 * mock WebSocket. connect() 후 MOCK_HIGH_ALERT_DELAY_MS 뒤 HIGH 예시 이벤트를 1회 발행합니다.
 * triggerHighAlert()로 즉시 발행할 수도 있습니다(개발용 버튼).
 */
class MockRealtimeService implements RealtimeService {
  private status: RealtimeStatus = 'disconnected';
  private listeners = new Set<(m: RealtimeMessage) => void>();
  private statusListeners = new Set<(s: RealtimeStatus) => void>();
  private timers: ReturnType<typeof setTimeout>[] = [];
  private nextHighIsGesture = true;

  connect() {
    if (this.status !== 'disconnected') return;
    this.setStatus('connecting');
    this.timers.push(setTimeout(() => this.setStatus('connected'), 300));
    this.timers.push(setTimeout(() => this.triggerHighAlert(), MOCK_HIGH_ALERT_DELAY_MS));
  }

  disconnect() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.setStatus('disconnected');
  }

  subscribe(listener: (m: RealtimeMessage) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  subscribeStatus(listener: (s: RealtimeStatus) => void) {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  getStatus() {
    return this.status;
  }

  triggerHighAlert() {
    const event = makeExampleEvent(this.nextHighIsGesture ? 'emergencyGesture' : 'rearApproach', new Date());
    this.nextHighIsGesture = !this.nextHighIsGesture;
    mockStore.events.unshift(event);
    mockStore.warningActive = true;
    this.listeners.forEach((l) => l({ type: 'event', event }));
  }

  private setStatus(s: RealtimeStatus) {
    this.status = s;
    this.statusListeners.forEach((l) => l(s));
  }
}

export const mockRealtime = new MockRealtimeService();
