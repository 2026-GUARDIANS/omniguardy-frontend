import type { RealtimeService } from '../interfaces';
import type { RealtimeMessage, RealtimeStatus } from '../types';

/**
 * 실제 WebSocket 구현 자리 (빈 틀).
 * TODO(백엔드 명세 확정 후):
 *  - 접속 주소(EXPO_PUBLIC_API_BASE_URL 기반 ws/wss 경로), 인증 방식(토큰 전달)
 *  - 서버 메시지 → RealtimeMessage 변환
 *  - 재연결/heartbeat 정책
 */
export class WebSocketRealtimeService implements RealtimeService {
  private status: RealtimeStatus = 'disconnected';
  private listeners = new Set<(m: RealtimeMessage) => void>();
  private statusListeners = new Set<(s: RealtimeStatus) => void>();

  connect() {
    // TODO: new WebSocket(url) 후 onopen/onmessage/onclose에서 setStatus·listeners 호출
    console.warn('WebSocketRealtimeService.connect: TODO(백엔드 명세 확정 후 구현)');
  }

  disconnect() {
    // TODO: socket.close()
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

  private setStatus(s: RealtimeStatus) {
    this.status = s;
    this.statusListeners.forEach((l) => l(s));
  }
}
