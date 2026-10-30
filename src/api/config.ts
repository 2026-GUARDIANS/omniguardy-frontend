// 환경변수는 .env.example 참고. EXPO_PUBLIC_ 접두사 변수만 앱 번들에 포함됩니다.

/** true(기본)면 mock 구현, "false"면 실제 HTTP·FCM 푸시 구현 */
export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

/** 실제 백엔드 주소. 코드에 IP/주소를 하드코딩하지 않습니다. */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
