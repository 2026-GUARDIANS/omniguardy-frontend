import { Platform } from 'react-native';

import type { RealtimeService } from '../interfaces';
import { isHighOrAbove, type RealtimeMessage, type RealtimeStatus, type SecurityEvent } from '../types';
import { request } from './client';
import type { DeviceTokenSaveRequestDto, SecurityPushDataDto } from './dto';
import { isHighPushLevel } from './mappers';
import { httpEventApi } from './events.http';

type NotificationsModule = typeof import('expo-notifications');
type Subscription = { remove(): void };

/**
 * 실시간 알림 — FCM 푸시 방식(백엔드 FirebasePushAdapter).
 * 1) 로그인 후 connect(): 알림 권한 요청 → FCM 디바이스 토큰 발급 → POST /api/device-tokens 등록
 * 2) 푸시 수신(앱 실행 중) 또는 알림 탭(백그라운드·종료 상태): data.riskLevel이 "3"(HIGH 이상)이면
 *    푸시에 eventId가 없으므로 최신 이벤트 목록을 받아 가장 최근 HIGH 이상 이벤트를 전달한다.
 *    "2"(MEDIUM)는 시스템 알림만 두고, 목록 갱신용으로 최신 이벤트를 전달한다.
 *
 * 주의: Android Expo Go에서는 원격 푸시를 받을 수 없다(SDK 53+). 개발 빌드나 APK에서만 동작하며,
 * Expo Go에서는 토큰 발급이 실패해 상태가 'disconnected'로 남는다.
 * expo-notifications는 mock 모드에서 불러오지 않도록 connect() 안에서 지연 로딩한다.
 */
export class FcmRealtimeService implements RealtimeService {
  private status: RealtimeStatus = 'disconnected';
  private listeners = new Set<(m: RealtimeMessage) => void>();
  private statusListeners = new Set<(s: RealtimeStatus) => void>();
  private subscriptions: Subscription[] = [];
  private active = false;

  connect() {
    if (this.active) return;
    this.active = true;
    this.setStatus('connecting');
    void this.start();
  }

  disconnect() {
    this.active = false;
    this.subscriptions.forEach((s) => s.remove());
    this.subscriptions = [];
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

  private async start() {
    try {
      // 지연 로딩: mock 모드·Expo Go에서 expo-notifications 초기화(원격 푸시 미지원 경고)를 피한다
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Notifications: NotificationsModule = require('expo-notifications');
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      if (Platform.OS === 'android') {
        // Android 13+는 알림 채널이 있어야 권한 요청 창이 뜬다
        await Notifications.setNotificationChannelAsync('default', {
          name: '보안 알림',
          importance: Notifications.AndroidImportance.MAX,
        });
      }
      const permission = await Notifications.requestPermissionsAsync();
      if (!permission.granted) throw new Error('알림 권한이 허용되지 않았습니다.');
      if (!this.active) return;

      this.subscriptions.push(
        Notifications.addNotificationReceivedListener((n) => this.onPush(n.request.content.data)),
        Notifications.addNotificationResponseReceivedListener((r) => this.onPush(r.notification.request.content.data)),
      );
      // 앱이 종료된 상태에서 알림을 눌러 실행된 경우
      const last = Notifications.getLastNotificationResponse();
      if (last) {
        Notifications.clearLastNotificationResponse();
        this.onPush(last.notification.request.content.data);
      }

      const token = await Notifications.getDevicePushTokenAsync(); // Android: FCM 토큰
      const body: DeviceTokenSaveRequestDto = {
        token: String(token.data),
        deviceType: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
      };
      await request('/api/device-tokens', { method: 'POST', body }); // 201
      if (this.active) this.setStatus('connected');
    } catch (e) {
      console.warn('실시간 알림(FCM) 연결 실패:', e instanceof Error ? e.message : e);
      if (this.active) this.setStatus('disconnected');
    }
  }

  private onPush(raw: unknown) {
    const data = (raw ?? {}) as SecurityPushDataDto;
    if (data.type !== 'SECURITY_EVENT') return;
    const wantHigh = isHighPushLevel(data.riskLevel);
    void this.findLatest(wantHigh)
      .then((event) => {
        if (event) this.listeners.forEach((l) => l({ type: 'event', event }));
      })
      .catch((e) => console.warn('푸시 이후 이벤트 조회 실패:', e instanceof Error ? e.message : e));
  }

  /** TODO(백엔드): 푸시 데이터에 eventId가 생기면 목록 조회 대신 상세 조회로 바꾼다 */
  private async findLatest(wantHigh: boolean): Promise<SecurityEvent | null> {
    const events = await httpEventApi.list();
    return (wantHigh ? events.find((e) => isHighOrAbove(e.risk)) : events[0]) ?? null;
  }

  private setStatus(s: RealtimeStatus) {
    this.status = s;
    this.statusListeners.forEach((l) => l(s));
  }
}
