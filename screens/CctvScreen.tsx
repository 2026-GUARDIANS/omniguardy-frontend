import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from "react-native";
import { Video, ResizeMode } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import { styles } from "../styles/styles";
import { Ionicons } from '@expo/vector-icons';

interface CctvScreenProps {
  token: string;
}

export default function CctvScreen({ token }: CctvScreenProps) {
  const BASE_URL = "http://10.69.37.143:8080";

  const [visionScore, setVisionScore] = useState(0);
  const [audioScore, setAudioScore] = useState(0);
  const [audioStatus, setAudioStatus] = useState("");
  const [behavior, setBehavior] = useState("영상을 업로드하고 분석을 시작하세요.");
  const [riskLevel, setRiskLevel] = useState("NORMAL");

  const [uploaded, setUploaded] = useState(false);
  const [videoUri, setVideoUri] = useState("");
  const [displayVideoUri, setDisplayVideoUri] = useState("");
  const [videoName, setVideoName] = useState("");
  const [loading, setLoading] = useState(false);

  const [videoHeight, setVideoHeight] = useState(220);
  const screenWidth = Dimensions.get("window").width;

  // 💡 파이썬 JSON에 등록된 정확한 실제 파일명 목록 (가운데 공백까지 완벽 반영)
  const validNames = [
    "(정상)문열고들어감2",
    "노크",
    "노크2",
    "뒤로지나감",
    "비번틀림반복",
    "사용자뒤접근", // 👈 공백 포함
    "외부인혼자지나감",
    "정상(문열고 들어감)", // 👈 괄호 및 공백 포함
    "카메라가림",
    "택배배달",
    "택배배달2"
  ];

  const pickVideo = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "video/*" });
    if (!result.canceled) {
      setVideoUri(result.assets[0].uri);
      setDisplayVideoUri(result.assets[0].uri);
      setVideoName(result.assets[0].name || "");
      setUploaded(true);
    }
  };

  const handleVideoReady = (event: any) => {
      console.log("Video event:", event);
    };

  const analyzeVideo = async () => {
    if (!token) {
      Alert.alert(
        "인증 오류",
        "로그인 토큰이 유효하지 않습니다. 다시 로그인해 주세요."
      );
      return;
    }

    if (!videoUri) {
      Alert.alert("알림", "업로드된 영상이 없습니다.");
      return;
    }

    setLoading(true);

    try {
      // 업로드한 파일명 정리
      const baseName = videoName
        .replace(/\.[^/.]+$/, "")
        .replace(/\s+/g, "");

      // 파이썬 JSON과 이름 맞추기
      let matchedName = baseName;
      for (const validName of validNames) {
        const cleanValidName = validName.replace(/\s+/g, "");
        if (
          baseName.includes(cleanValidName) ||
          cleanValidName.includes(baseName)
        ) {
          matchedName = validName;
          break;
        }
      }

      const targetFileName = `${matchedName}.mp4`;
      console.log(
        "🔍 [이름 유연 매칭 결과] 최종 전송 파일명:",
        targetFileName
      );

      // React Native에서는 File() 생성하지 말고 uri를 직접 넘긴다
      const formData = new FormData();

      formData.append(
        "file",
        {
          uri: videoUri,
          name: targetFileName,
          type: "video/mp4",
        } as any
      );

      const response = await fetch(`${BASE_URL}/api/ai/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      console.log("백엔드 응답:", result);

      if (response.ok && result.success === true) {

        const visionData = result.data?.vision;
        const audioData = result.data?.audio;

        // ------------------
        // Vision 결과
        // ------------------
        let displayBehavior = "감지된 행동 없음";

        if (visionData?.events) {
          displayBehavior = Array.isArray(visionData.events)
            ? visionData.events.join(", ")
            : String(visionData.events);
        }

        setBehavior(displayBehavior);

        setVisionScore(
          visionData?.riskScore ?? 0
        );

        setRiskLevel(
          visionData?.riskLevel ?? "NORMAL"
        );

        // ------------------
        // Audio 결과
        // ------------------
        setAudioScore(
          Math.round(
            (audioData?.probability ?? 0)
          )
        );

        setAudioStatus(
          audioData?.status ?? "normal"
        );

        // ------------------
        // 분석 영상
        // ------------------
        if (visionData?.annotatedVideo) {

          const encodedUrl = encodeURI(
            visionData.annotatedVideo
          );

          console.log(
            "분석 영상 URL:",
            encodedUrl
          );

          setDisplayVideoUri(
            encodedUrl
          );
        }

        Alert.alert(
          "분석 완료",
          result.message || "AI 분석이 완료되었습니다."
        );
      } else {
        Alert.alert(
          "분석 실패",
          result.message || "서버 응답 오류가 발생했습니다."
        );
      }
    } catch (error) {
      console.error("스프링부트 통신 실패:", error);
      Alert.alert(
        "에러",
        "Spring Boot 서버 상태 또는 네트워크 연결을 확인해 주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>OmniGuardy AI</Text>
      <Text style={styles.subtitle}>1학기 시연용 Prototype</Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>CCTV 영상</Text>

          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={pickVideo}
              disabled={loading}
            >
              <Text style={styles.uploadButtonText}>
                {uploaded ? "영상 변경" : "영상 업로드"}
              </Text>
            </TouchableOpacity>

            {uploaded && (
              <TouchableOpacity
                style={[
                  styles.analyzeButton,
                  { marginLeft: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }
                ]}
                onPress={analyzeVideo}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.uploadButtonText}>분석 시작</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View
          style={{
            width: "100%",
            aspectRatio: 16 / 9,   // 또는 9/16 (영상에 맞게)
            backgroundColor: "#000",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {videoUri ? (
            <Video
              source={{ uri: displayVideoUri || videoUri }}
              useNativeControls
              shouldPlay={false}
              resizeMode={ResizeMode.CONTAIN} // 비율 유지하며 채우기
              style={{ width: "100%", height: "100%", objectFit: "contain" as any, }}
            />
            ) : (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Ionicons name="images-outline" size={32} color="#4E515B" style={{ marginBottom: 8 }} />
                <Text style={styles.placeholderText}>CCTV 영상을 선택해 주세요.</Text>
              </View>
          )}
        </View>

        {uploaded && (
          <View style={{ flexDirection: "row", alignItems: "center", padding: 10 }}>
            <Ionicons name="document-attach-outline" size={14} color="#666" style={{ marginRight: 4 }} />
            <Text style={{ color: '#666', fontSize: 12 }} numberOfLines={1}>선택된 원본: {videoName}</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>감지 행동</Text>
        <Text style={styles.behavior}>{behavior}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>위험도 분석</Text>
        <Text style={styles.score}>Vision Score : {visionScore}</Text>
        <Text style={styles.score}>Audio Status : {audioStatus}</Text>
      </View>

      <View style={[
        styles.alertBox,
        riskLevel === "NORMAL" && { backgroundColor: "#2ec4b6" },
        riskLevel === "LOW" && { backgroundColor: "#e9c46a" },
        riskLevel === "MIDDLE" && { backgroundColor: "#f4a261" },
        riskLevel === "HIGH" && { backgroundColor: "#e76f51" }
      ]}>
        <Text style={styles.alertTitle}>⚠ 위험 단계</Text>
        <Text style={styles.alertValue}>{riskLevel}</Text>
      </View>
    </ScrollView>
  );
}