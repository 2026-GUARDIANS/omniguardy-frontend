import React, { useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PillButton } from '../components/PillButton';
import { TextField } from '../components/TextField';
import { Wordmark } from '../components/Wordmark';
import type { RootScreenProps } from '../navigation/types';
import { useAuth } from '../state/AuthContext';
import { colors, fontSize, fonts, size } from '../theme/tokens';

const logo = require('../../assets/figma/logo-mark.png');

// Figma 1:217 로그인 페이지
export function LoginScreen({ navigation }: RootScreenProps<'Login'>) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError('이메일과 비밀번호를 모두 입력해 주세요.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : '로그인에 실패했습니다.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Image source={logo} style={styles.logo} accessibilityIgnoresInvertColors accessible={false} />
            <Wordmark />
            <Text style={styles.tagline}>YOUR DOOR, OUR GUARD</Text>
          </View>

          <View style={styles.form}>
            <TextField
              label="이메일"
              placeholder="이메일을 입력하세요"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            <TextField
              ref={passwordRef}
              label="비밀번호"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={submit}
              error={error}
            />
            <View style={styles.buttonWrap}>
              <PillButton label="로그인" onPress={submit} loading={loading} elevated={false} />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>아직 계정이 없으신가요? </Text>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="회원가입"
              onPress={() => navigation.navigate('Signup')}
              style={styles.footerLink}
            >
              <Text style={styles.footerLinkText}>회원가입</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 24, gap: 40 },
  header: { alignItems: 'center', gap: 10 },
  logo: { width: 100, height: 97, marginBottom: 6 },
  tagline: { fontFamily: fonts.sansRegular, fontSize: fontSize.md, color: colors.textSecondary },
  form: { gap: 16 },
  buttonWrap: { paddingTop: 8, minHeight: 64 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  footerText: { fontFamily: fonts.sansRegular, fontSize: fontSize.md, color: colors.textSecondary },
  footerLink: { minHeight: size.minTouch, justifyContent: 'center', paddingHorizontal: 4 },
  footerLinkText: { fontFamily: fonts.sansSemiBold, fontSize: fontSize.md, color: colors.primary },
});
