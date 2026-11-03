import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/navigation/RootNavigator';
import { PolishSplash } from './src/polish/Splash';
import { AuthProvider, useAuth } from './src/state/AuthContext';
import { RealtimeAlertProvider } from './src/state/RealtimeAlertContext';
import { THEME } from './src/theme/tokens';
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

  // 'polish': 기본 스플래시는 바로 내리고 PolishSplash가 이어받는다(아래). 'figma'·'custom'은 기존 그대로
  const polish = THEME === 'polish';
  useEffect(() => {
    if (done || polish) void SplashScreen.hideAsync();
  }, [done, polish]);

  if (polish) {
    return (
      <PolishSplash ready={done}>
        {done ? (
          <RealtimeAlertProvider>
            <RootNavigator />
          </RealtimeAlertProvider>
        ) : null}
      </PolishSplash>
    );
  }

  if (!done) return null;
  return (
    <RealtimeAlertProvider>
      <RootNavigator />
    </RealtimeAlertProvider>
  );
}
