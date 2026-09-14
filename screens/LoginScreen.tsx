import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { styles } from "../styles/styles";

interface LoginScreenProps {
  setIsLoggedIn: (status: boolean) => void;
  setCurrentScreen: (screen: string) => void;
  setToken: (token: string) => void;
}

export default function LoginScreen({ setIsLoggedIn, setCurrentScreen, setToken}: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
          Alert.alert("알림", "이메일과 비밀번호를 모두 입력해 주세요.");
          return;
        }
        setIsLoading(true);

        try {
              const LOGIN_API_URL = "http://10.69.37.143:8080/api/auth/login";
              const response = await fetch(LOGIN_API_URL, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                  email: email,
                  password: password,
                }),
              });

              const result = await response.json();

              if (response.ok && result.success) {
                // 🔑 로그인 성공 시 서버가 준 accessToken 추출
                const token = result.data.accessToken;
                const userName = result.data.name;
                setToken(token);
                console.log("발급된 JWT 토큰:", token);

                Alert.alert("성공", `${userName}님, 환영합니다!`);
                setIsLoggedIn(true);
                setCurrentScreen("CCTV"); // 로그인 완료 후 CCTV 대시보드로 이동
              } else {
                Alert.alert("로그인 실패", result.message || "이메일 또는 비밀번호를 확인하세요.");
              }
            } catch (error) {
              console.error(error);
              Alert.alert("연동 에러", "서버와 통신할 수 없습니다. IP 주소나 네트워크 상태를 확인하세요.");
            } finally {
              setIsLoading(false);
            }
          };

  // 💡 회원가입 버튼 클릭 시 실행될 함수
  const handleRegister = () => {
    Alert.alert("알림", "회원가입 화면은 프로토타입 준비 중입니다.");

  };

  return (
    <View style={[styles.scroll, { justifyContent: "center", paddingTop: 70 }]}>
      <Text style={styles.title}>OmniGuardy AI</Text>
      <Text style={styles.subtitle}></Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>로그인</Text>

        {/* 아이디 입력창 */}
        <TextInput
          style={{
            backgroundColor: "#2D2F35",
            color: "white",
            padding: 12,
            borderRadius: 10,
            marginBottom: 12,
          }}
          placeholder="이메일을 입력하세요"
          placeholderTextColor="#666"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        {/* 비밀번호 입력창 */}
        <TextInput
          style={{
            backgroundColor: "#2D2F35",
            color: "white",
            padding: 12,
            borderRadius: 10,
            marginBottom: 16,
          }}
          placeholder="비밀번호를 입력하세요"
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* [1] 로그인 버튼 (기본 업로드 스타일 활용) */}
        <TouchableOpacity
          style={[
            styles.uploadButton,
              { alignItems: "center", paddingVertical: 14, marginBottom: 10 },
                isLoading && { backgroundColor: "#555" }
              ]}
              onPress={handleLogin}
              disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.uploadButtonText}>로그인</Text>
              )}
        </TouchableOpacity>

        {/* [2] 회원가입 버튼 (기존 버튼과 구분되도록 짙은 배경 스타일 적용) */}
        <TouchableOpacity
          style={{ backgroundColor: "#3A3D46", alignItems: "center", paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: "#4E515B" }}
          onPress={() => setCurrentScreen("SIGNUP")}
          disabled={isLoading}
        >
          <Text style={{ color: "#eee", fontWeight: "600", fontSize: 13 }}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}