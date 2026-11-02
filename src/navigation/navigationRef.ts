import { createNavigationContainerRef } from '@react-navigation/native';

import type { RootStackParamList } from './types';

/** 화면 밖(실시간 알림 수신 등)에서 이동할 때 사용 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
