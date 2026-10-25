import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackHeader } from '../components/BackHeader';
import { PillButton } from '../components/PillButton';
import { TextField } from '../components/TextField';
import type { RootScreenProps } from '../navigation/types';
import { useAuth } from '../state/AuthContext';
import { colors, size } from '../theme/tokens';

type Field = 'name' | 'email' | 'password' | 'passwordConfirm';
type Errors = Partial<Record<Field | 'form', string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(v: Record<Field, string>): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = '이름을 입력해 주세요.';
  if (!EMAIL_RE.test(v.email.trim())) e.email = '올바른 이메일 형식이 아닙니다.';
  if (v.password.length < 8) e.password = '비밀번호는 8자 이상 입력해 주세요.';
  if (v.passwordConfirm !== v.password) e.passwordConfirm = '비밀번호가 일치하지 않습니다.';
  return e;
}

// Figma 1:246 회원가입 페이지
export function SignupScreen({ navigation }: RootScreenProps<'Signup'>) {
  const { signUp } = useAuth();
  const [values, setValues] = useState<Record<Field, string>>({ name: '', email: '', password: '', passwordConfirm: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const refs = {
    email: useRef<TextInput>(null),
    password: useRef<TextInput>(null),
    passwordConfirm: useRef<TextInput>(null),
  };

  const set = (k: Field) => (text: string) => setValues((v) => ({ ...v, [k]: text }));

  const submit = async () => {
    const e = validate(values);
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      await signUp({ name: values.name.trim(), email: values.email.trim(), password: values.password });
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : '회원가입에 실패했습니다.' });
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <BackHeader
          title="회원가입"
          backLabel="로그인으로 돌아가기"
          onBack={() => navigation.goBack()}
          buttonSize={size.iconButton}
          titleColor={colors.textMuted}
          titleSize={20}
        />
        <ScrollView style={styles.flex} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <TextField
            label="이름"
            value={values.name}
            onChangeText={set('name')}
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
            onSubmitEditing={() => refs.email.current?.focus()}
            error={errors.name}
          />
          <TextField
            ref={refs.email}
            label="이메일"
            value={values.email}
            onChangeText={set('email')}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => refs.password.current?.focus()}
            error={errors.email}
          />
          <TextField
            ref={refs.password}
            label="비밀번호"
            value={values.password}
            onChangeText={set('password')}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
            onSubmitEditing={() => refs.passwordConfirm.current?.focus()}
            error={errors.password}
          />
          <TextField
            ref={refs.passwordConfirm}
            label="비밀번호 확인"
            value={values.passwordConfirm}
            onChangeText={set('passwordConfirm')}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="done"
            onSubmitEditing={submit}
            error={errors.passwordConfirm ?? errors.form}
          />
        </ScrollView>
        <View style={styles.footer}>
          <PillButton label="가입하기" onPress={submit} loading={loading} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  form: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, gap: 16 },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 },
});
