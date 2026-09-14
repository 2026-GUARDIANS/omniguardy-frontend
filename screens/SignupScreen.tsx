import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { styles } from "../styles/styles";

interface SignupScreenProps {
  setIsLoggedIn: (status: boolean) => void;
  setCurrentScreen: (screen: string) => void;
  setToken: (token: string) => void;
}

export default function SignupScreen({ setIsLoggedIn, setCurrentScreen, setToken }: SignupScreenProps) {
  // 💡 노션 명세서에 명시된 4개 필드 상태 관리
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 🏃‍♂️ 실제 Spring Boot 회원가입 API 호출
  const handleSignup = async () => {
    if (!email.trim() || !password.trim() || !name.trim() || !phoneNumber.trim()) {
      Alert.alert("알림", "모든 항목을 빠짐없이 입력해 주세요.");
      return;
    }
    setIsLoading(true);

    try {
      // 💡 현재 설정된 핫스팟 백엔드 회원가입 API 주소
      const SIGNUP_API_URL = "http://10.69.37.143:8080/api/auth/signup";

      const response = await fetch(SIGNUP_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email,
          password: password,
          name: name,
          phoneNumber: phoneNumber,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // 명세서 상 회원가입 성공 시 자동 로그인을 위해 accessToken이 지급되는 구조 반영
        const token = result.data.accessToken;
        const userName = result.data.name;

        setToken(token); // 🔑 자동 로그인을 위한 전역 토큰 저장!
        Alert.alert("성공", `${userName}님, 회원가입 및 로그인이 완료되었습니다.`);
        setIsLoggedIn(true);
        setCurrentScreen("CCTV"); // 가입 완료 직후 메인 대시보드로 이동
      } else {
        Alert.alert("회원가입 실패", result.message || "입력한 형식을 다시 확인해 주세요.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("연동 에러", "서버와 통신할 수 없습니다. 핫스팟 연결을 확인하세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.scroll, { justifyContent: "center", paddingTop: 40 }]}>
      <Text style={styles.title}>OmniGuardy AI</Text>
      <Text style={styles.subtitle}>새로운 관리자 등록</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>회원가입</Text>

        {/* 이메일 입력필드 */}
        <TextInput
          style={{ backgroundColor: "#2D2F35", color: "white", padding: 12, borderRadius: 10, marginBottom: 12 }}
          placeholder="이메일을 입력하세요. (예: test@example.com)"
          placeholderTextColor="#666"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        {/* 비밀번호 입력필드 */}
        <TextInput
          style={{ backgroundColor: "#2D2F35", color: "white", padding: 12, borderRadius: 10, marginBottom: 12 }}
          placeholder="비밀번호를 입력하세요."
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* 이름 입력필드 */}
        <TextInput
          style={{ backgroundColor: "#2D2F35", color: "white", padding: 12, borderRadius: 10, marginBottom: 12 }}
          placeholder="이름을 입력하세요. (예: 홍길동)"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
        />

        {/* 전화번호 입력필드 */}
        <TextInput
          style={{ backgroundColor: "#2D2F35", color: "white", padding: 12, borderRadius: 10, marginBottom: 16 }}
          placeholder="전화번호를 입력하세요. (예: 010-1234-5678)"
          placeholderTextColor="#666"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />

        {/* 회원가입 실행 버튼 */}
        <TouchableOpacity
          style={[
            styles.uploadButton,
            { alignItems: "center", paddingVertical: 14, marginBottom: 10 },
            isLoading && { backgroundColor: "#555" }
          ]}
          onPress={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.uploadButtonText}>가입하기</Text>
          )}
        </TouchableOpacity>

        {/* 이전 화면(로그인)으로 돌아가기 버튼 */}
        <TouchableOpacity
          style={{ backgroundColor: "transparent", alignItems: "center", paddingVertical: 10 }}
          onPress={() => setCurrentScreen("LOGIN")}
          disabled={isLoading}
        >
          <Text style={{ color: "#aaa", fontSize: 13, textDecorationLine: "underline" }}>
            이미 계정이 있으신가요? 로그인하기
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}