import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider, useAuth } from './src/state/AuthContext';
import { RealtimeAlertProvider } from './src/state/RealtimeAlertContext';
import { useAppFonts } from './src/theme/useAppFonts';

// 글꼴 로드와 저장된 로그인 세션 확인이 끝날 때까지 스플래시를 유지한다
// (글꼴이 바뀌며 깜빡이거나 로그인 화면이 잠깐 보였다 사라지지 않게)
void SplashScreen.preventAutoHideAsync();

export default function App() {
  const fontsReady = useAppFonts();
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <StartupGate fontsReady={fontsReady} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function StartupGate({ fontsReady }: { fontsReady: boolean }) {
  const { ready } = useAuth();
  const done = fontsReady && ready;

  useEffect(() => {
    if (done) void SplashScreen.hideAsync();
  }, [done]);

  if (!done) return null;
  return (
    <RealtimeAlertProvider>
      <RootNavigator />
    </RealtimeAlertProvider>
  );
}
