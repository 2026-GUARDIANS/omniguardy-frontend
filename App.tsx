import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/state/AuthContext';
import { RealtimeAlertProvider } from './src/state/RealtimeAlertContext';
import { useAppFonts } from './src/theme/useAppFonts';

// 글꼴 로드가 끝날 때까지 스플래시를 유지해 글꼴이 바뀌며 깜빡이지 않게 한다.
void SplashScreen.preventAutoHideAsync();

export default function App() {
  const fontsReady = useAppFonts();

  useEffect(() => {
    if (fontsReady) void SplashScreen.hideAsync();
  }, [fontsReady]);

  if (!fontsReady) return null;
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <RealtimeAlertProvider>
          <RootNavigator />
        </RealtimeAlertProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
