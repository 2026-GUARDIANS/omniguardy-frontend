import type { TabKey } from '../components/BottomTabBar';
import type { MainTabParamList } from './types';

export const ROUTE_TO_TAB: Record<keyof MainTabParamList, TabKey> = { Home: 'home', Events: 'events', Settings: 'settings' };
export const TAB_TO_ROUTE: Record<TabKey, keyof MainTabParamList> = { home: 'Home', events: 'Events', settings: 'Settings' };
