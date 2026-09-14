import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { styles } from "../styles/styles";
import { Ionicons } from '@expo/vector-icons';

// 💡 부모(App.tsx)로부터 전역 토큰을 받기 위한 interface 선언
interface TtsSettingProps {
  token: string | null;
}

export default function TtsSetting({ token }: TtsSettingProps) {
  // 사용자가 입력하는 텍스트 상태 변수 (message)
  const [message, setMessage] = useState("위험 행동이 감지되었습니다. 즉시 중단하세요.");
  const [isLoading, setIsLoading] = useState(false);

  const sendTtsRequest = async () => {
      if (!token) {
        alert("❌ 로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch("http://10.69.37.143:8080/api/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          credentials: "include",
          body: JSON.stringify({ message: message }) // 프론트가 백엔드로 보낼 때 (Request)
        });

        // 💡 403, 500 등 HTTP 에러 상태코드 우선 가드
        if (!response.ok) {
          if (response.status === 403) {
            alert("❌ 접근 권한이 없습니다 (403). 로그아웃 후 다시 로그인해보세요.");
          } else {
            alert(`❌ 서버 에러 발생 (상태코드: ${response.status})`);
          }
          return;
        }

        // 💡 백엔드 응답 파싱: { "message": "택배는 문 앞에 두고 가주세요!" }
        const result = await response.json();

        // response.ok가 true라는 것 자체가 서버가 200 성공을 줬다는 뜻이므로 바로 성공 처리합니다.
        if (response.ok && result.message) {
          alert(`🎉 성공: 라즈베리파이로 TTS 음성 송출 완료!\n(전송된 문구: ${result.message})`);
        } else {
          alert("❌ 실패: 올바르지 않은 서버 응답 형식입니다.");
        }

      } catch (error) {
        console.error("TTS 요청 에러:", error);
        alert("❌ 연동 실패: 서버와 통신할 수 없거나 MQTT 전송에 실패했습니다. 핫스팟 및 백엔드 서버 상태를 확인하세요.");
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>OmniGuardy AI</Text>
      <Text style={styles.subtitle}>1학기 시연용 Prototype</Text>

      <Text style={[styles.cardTitle, { color: "blue", fontSize: 18, marginTop: 10, marginBottom: 16 }]}>
        음성 경고 설정
      </Text>

      <View style={styles.card}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={[styles.cardTitle, { marginBottom: 0 }]}>송출할 문구 입력</Text>
        </View>
        <TextInput
          style={{
            backgroundColor: "#2D2F35",
            color: "white",
            padding: 12,
            borderRadius: 10,
            fontSize: 15,
            minHeight: 60,
            textAlignVertical: "top",
          }}
          placeholder="라즈베리파이 스피커로 출력할 경고 문구를 적으세요."
          placeholderTextColor="#666"
          multiline
          maxLength={100}
          value={message}
          onChangeText={setMessage}
        />
        <Text style={{ color: "#888", fontSize: 12, textAlign: "right", marginTop: 6 }}>
          {message.length} / 100자
        </Text>
      </View>

      <View style={styles.card}>
        <Ionicons name="alert-circle-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
        <Text style={[styles.cardTitle, { marginBottom: 0 }]}>자동 경고 방송 활성화</Text>
        <Text style={styles.behavior}>현재 상태: 실시간 작동 중</Text>
      </View>

      {/*<View style={styles.card}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          <Ionicons name="volume-medium-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={[styles.cardTitle, { marginBottom: 0 }]}>경고 오디오 선택</Text>
        </View>
        <Text style={styles.score}>• 경고음 타입 A (기본 사이렌)</Text>
        <Text style={styles.score}>• 경고음 타입 B (TTS 안내 음성)</Text>
        <Text style={styles.score}>• 사용자 지정 녹음 파일</Text>
      </View>
      */}

      <TouchableOpacity
        style={[
          styles.uploadButton,
          { alignItems: "center", paddingVertical: 14 },
          isLoading && { backgroundColor: "#555" }
        ]}
        onPress={sendTtsRequest}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
            <View style={{flexDirection: "row", alignItems: "center", marginBottom: 10}}>
                <Ionicons name="megaphone-outline" size={18} color="white" style={{ marginRight: 6 }} />
                <Text style={styles.uploadButtonText}>테스트 음성 송출</Text>
            </View>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}