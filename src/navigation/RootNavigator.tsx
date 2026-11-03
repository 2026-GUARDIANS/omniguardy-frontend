import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { BottomTabBar } from '../components/BottomTabBar';
import { LoginScreen as PolishLogin, SignupScreen as PolishSignup } from '../polish/screens/AuthScreens';
import { AlertScreen as PolishAlert } from '../polish/screens/AlertScreen';
import { EventDetailScreen as PolishEventDetail } from '../polish/screens/EventDetailScreen';
import { EventsScreen as PolishEvents } from '../polish/screens/EventsScreen';
import { HomeScreen as PolishHome } from '../polish/screens/HomeScreen';
import { ProfileScreen as PolishProfile } from '../polish/screens/ProfileScreen';
import { SettingsScreen as PolishSettings } from '../polish/screens/SettingsScreen';
import { TabBar as PolishTabBar } from '../polish/TabBar';
import { AlertScreen } from '../screens/AlertScreen';
import { EventDetailScreen } from '../screens/EventDetailScreen';
import { EventsScreen } from '../screens/EventsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { useAuth } from '../state/AuthContext';
import { colors, THEME } from '../theme/tokens';
import { navigationRef } from './navigationRef';
import { ROUTE_TO_TAB, TAB_TO_ROUTE } from './tabs';
import type { MainTabParamList, RootStackParamList } from './types';

// 'polish'만 src/polish/의 화면을 쓴다. 'figma'·'custom'은 기존 화면 그대로
const POLISH = THEME === 'polish';
const screens = {
  Home: POLISH ? PolishHome : HomeScreen,
  Events: POLISH ? PolishEvents : EventsScreen,
  Settings: POLISH ? PolishSettings : SettingsScreen,
  EventDetail: POLISH ? PolishEventDetail : EventDetailScreen,
  Profile: POLISH ? PolishProfile : ProfileScreen,
  Alert: POLISH ? PolishAlert : AlertScreen,
  Login: POLISH ? PolishLogin : LoginScreen,
  Signup: POLISH ? PolishSignup : SignupScreen,
};
const TabBarView = POLISH ? PolishTabBar : BottomTabBar;

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const theme: Theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.background, card: colors.background },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation }) => (
        <TabBarView
          active={ROUTE_TO_TAB[state.routes[state.index].name as keyof MainTabParamList]}
          onSelect={(key) => navigation.navigate(TAB_TO_ROUTE[key])}
        />
      )}
    >
      <Tab.Screen name="Home" component={screens.Home} />
      <Tab.Screen name="Events" component={screens.Events} />
      <Tab.Screen name="Settings" component={screens.Settings} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { user } = useAuth();
  return (
    <NavigationContainer ref={navigationRef} theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="EventDetail" component={screens.EventDetail} />
            <Stack.Screen name="Profile" component={screens.Profile} />
            <Stack.Screen
              name="Alert"
              component={screens.Alert}
              options={{ presentation: 'fullScreenModal', animation: 'fade', gestureEnabled: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={screens.Login} />
            <Stack.Screen name="Signup" component={screens.Signup} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
