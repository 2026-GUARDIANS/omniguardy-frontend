import React, { useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, type TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { digitsOnly, isEmail, isMobilePhone } from '../../lib/validation';
import type { RootScreenProps } from '../../navigation/types';
import { useAuth } from '../../state/AuthContext';
import { colors, fontSize, fonts } from '../../theme/tokens';
import { FadeUp } from '../motion';
import { Wordmark } from '../Wordmark';
import { P, PBackHeader, PButton, PField, Press } from '../ui';

const logo = require('../../../assets/figma/logo-mark.png');

// 'polish' 로그인. 검증·동작은 screens/LoginScreen.tsx와 같다
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
    if (!isEmail(email)) {
      setError('올바른 이메일 형식이 아닙니다.');
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
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.loginContent} keyboardShouldPersistTaps="handled">
          <FadeUp index={0} style={s.brand}>
            <Image source={logo} style={s.logo} accessibilityIgnoresInvertColors accessible={false} />
            <Wordmark />
            <Text style={s.tagline}>YOUR DOOR, OUR GUARD</Text>
          </FadeUp>

          <FadeUp index={1} style={s.form}>
            <PField
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
            <PField
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
            <View style={s.submit}>
              <PButton label="로그인" onPress={submit} loading={loading} />
            </View>
          </FadeUp>

          <FadeUp index={2} style={s.footer}>
            <Text style={s.footerText}>아직 계정이 없으신가요?</Text>
            <Press
              accessibilityRole="link"
              accessibilityLabel="회원가입"
              onPress={() => navigation.navigate('Signup')}
              style={s.footerLink}
            >
              <Text style={s.footerLinkText}>회원가입</Text>
            </Press>
          </FadeUp>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FieldName = 'name' | 'email' | 'password' | 'phone';
type Errors = Partial<Record<FieldName | 'form', string>>;

function validate(v: Record<FieldName, string>): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = '이름을 입력해 주세요.';
  if (!isEmail(v.email)) e.email = '올바른 이메일 형식이 아닙니다.';
  if (v.password.length < 8) e.password = '비밀번호는 8자 이상 입력해 주세요.';
  if (!isMobilePhone(v.phone)) e.phone = '휴대폰 번호를 숫자만 정확히 입력해 주세요. (예: 01012345678)';
  return e;
}

// 'polish' 회원가입. 검증·동작은 screens/SignupScreen.tsx와 같다
export function SignupScreen({ navigation }: RootScreenProps<'Signup'>) {
  const { signUp } = useAuth();
  const [values, setValues] = useState<Record<FieldName, string>>({ name: '', email: '', password: '', phone: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  const set = (k: FieldName) => (text: string) => setValues((v) => ({ ...v, [k]: text }));

  const submit = async () => {
    const e = validate(values);
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      await signUp({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        phone: digitsOnly(values.phone),
      });
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : '회원가입에 실패했습니다.' });
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <PBackHeader title="회원가입" backLabel="로그인으로 돌아가기" onBack={() => navigation.goBack()} />
        <ScrollView style={s.flex} contentContainerStyle={s.signupForm} keyboardShouldPersistTaps="handled">
          <PField
            label="이름"
            value={values.name}
            onChangeText={set('name')}
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            error={errors.name}
          />
          <PField
            ref={emailRef}
            label="이메일"
            value={values.email}
            onChangeText={set('email')}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            error={errors.email}
          />
          <PField
            ref={passwordRef}
            label="비밀번호"
            value={values.password}
            onChangeText={set('password')}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
            onSubmitEditing={() => phoneRef.current?.focus()}
            error={errors.password}
          />
          <PField
            ref={phoneRef}
            label="휴대폰 번호"
            placeholder="01012345678"
            value={values.phone}
            onChangeText={(text) => set('phone')(digitsOnly(text))}
            maxLength={11}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            returnKeyType="done"
            onSubmitEditing={submit}
            error={errors.phone ?? errors.form}
          />
        </ScrollView>
        <View style={s.signupFooter}>
          <PButton label="가입하기" onPress={submit} loading={loading} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  loginContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: P.space.xl, paddingVertical: P.space.xl, gap: 40 },
  brand: { alignItems: 'center', gap: P.space.sm },
  logo: { width: 96, height: 93, marginBottom: P.space.sm },
  tagline: { fontFamily: fonts.latinRegular, fontSize: fontSize.md, letterSpacing: 1.2, color: colors.textSecondary },
  form: { gap: P.space.lg },
  submit: { paddingTop: P.space.sm },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: P.space.xs },
  footerText: { fontFamily: fonts.sansRegular, fontSize: fontSize.md, color: colors.textSecondary },
  footerLink: { minHeight: P.minTouch, justifyContent: 'center', paddingHorizontal: P.space.sm, borderRadius: P.radius.input },
  footerLinkText: { fontFamily: fonts.sansSemiBold, fontSize: fontSize.md, color: colors.link },
  signupForm: { paddingHorizontal: P.space.xl, paddingTop: P.space.xl, paddingBottom: P.space.lg, gap: P.space.lg },
  signupFooter: { paddingHorizontal: P.space.xl, paddingTop: P.space.md, paddingBottom: P.space.xxl },
});
