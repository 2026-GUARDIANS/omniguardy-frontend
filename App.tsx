import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/state/AuthContext';
import { RealtimeAlertProvider } from './src/state/RealtimeAlertContext';
import { colors } from './src/theme/tokens';
import { useAppFonts } from './src/theme/useAppFonts';

export default function App() {
  const fontsReady = useAppFonts();
  if (!fontsReady) return <View style={{ flex: 1, backgroundColor: colors.background }} />;
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
