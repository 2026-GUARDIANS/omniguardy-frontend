**그냥 정리해본거라 추후 수정 가능

### 사용자 관리 part

|  | 기능명 | 설명 | 입력 데이터 | 처리 방식 | 출력/결과 |
| --- | --- | --- | --- | --- | --- |
| 사용자 관리 | 회원가입 | 사용자 계정 생성 | 이메일, 비밀번호, 이름, 전화번호 | 사용자 정보 DB 저장 | 사용자 생성 |
| 사용자 관리 | 로그인 | 사용자 인증 및 JWT 발급 | 이메일, 비밀번호 | JWT 인증 | Access Token 발급 |
| 사용자 관리 | 로그아웃 | 사용자 세션 종료 | JWT Token | 토큰 만료 처리 | 로그아웃 완료 |
| 사용자 관리 | 사용자 정보 조회 | 사용자 프로필 조회 | user_id | DB 조회 | 사용자 정보 반환 |
| 사용자 관리 | 얼굴 등록 | 얼굴 인증용 이미지 등록 | 얼굴 이미지 | Face Embedding 추출 및 저장 | user_faces 저장 |
| 사용자 관리 | 얼굴 활성화/비활성화 | 얼굴 인증 데이터 관리 | face_id | 상태값 변경 | 인증 대상 변경 |
| 사용자 관리 | 보호자 등록 | 긴급 연락처 등록 | 이름, 전화번호, 관계 | emergency_contacts 저장 | 보호자 생성 |
| 사용자 관리 | 보호자 수정/삭제 | 보호자 정보 관리 | contact_id | 수정/삭제 처리 | 정보 변경 완료 |

---

### 디바이스 관리 part

|  | 기능명 | 설명 | 입력 데이터 | 처리 방식 | 출력/결과 |
| --- | --- | --- | --- | --- | --- |
| 디바이스 관리 | 기기 등록 | 현관 디바이스 등록 | device_name, location | devices 저장 | device_id 생성 |
| 디바이스 관리 | 기기 인증 | 디바이스 서버 인증 | device_id, secret_key | 디바이스 검증 | 인증 완료 |
| 디바이스 관리 | 사용자-기기 연결 | 사용자와 기기 매핑 | user_id, device_id | FK 연결 | 사용자별 현관 관리 |
| 디바이스 관리 | 기기 상태 조회 | 온라인 여부 확인 | device_id | 상태 조회 | ACTIVE/INACTIVE |
| 디바이스 관리 | 위치 정보 관리 | 기기 위치 저장 | location_name | DB 저장 | 위치 정보 반환 |

---

### 출입 관리 part

|  | 기능명 | 설명 | 입력 데이터 | 처리 방식 | 출력/결과 |
| --- | --- | --- | --- | --- | --- |
| 출입 관리 | 사용자 접근 감지 | 현관 앞 접근 감지 | 카메라 프레임 | Motion Detection | 접근 이벤트 생성 |
| 출입 관리 | 얼굴 인증 | 등록 사용자 여부 확인 | 얼굴 이미지 | Face Matching | 인증 성공/실패 |
| 출입 관리 | 귀가 알림 | 정상 사용자 귀가 알림 | 인증 성공 이벤트 | Push Notification | 귀가 알림 |
| 출입 관리 | 인증 실패 안내 | 얼굴 인식 실패 시 음성 안내 | 인증 실패 횟수 | TTS 출력 | 음성 안내 |
| 출입 관리 | 본인 확인 요청 | 반복 실패 시 사용자 확인 | 실패 횟수 ≥ 3 | 앱 Push 전송 | 본인 확인 요청 |

---

### Vision AI part - 임의로 정한거라 수정 가능

|  | 기능명 | 설명 | 입력 데이터 | 처리 방식 | 출력/결과 |
| --- | --- | --- | --- | --- | --- |
| Vision AI | 객체 탐지 | 사람 및 객체 탐지 | Video Frame | YOLO Detection | object_type |
| Vision AI | 객체 추적 | 동일 객체 추적 | Detection 결과 | BoT-SORT | track_id |
| Vision AI | ROI 기반 탐지 | 현관 앞 영역만 분석 | ROI 영역 | Region Crop | 오탐 감소 |
| Vision AI | 동적 FPS 제어 | 상황 기반 FPS 변경 | Motion/dB 이벤트 | FPS Scheduling | 연산량 감소 |
| Vision AI | 행동 분석 | 행동 패턴 추출 | 위치/속도 데이터 | Feature Extraction | behavior |
| Vision AI | 배회 감지 | 장시간 체류 감지 | dwell_time | Threshold 분석 | LOITERING |
| Vision AI | 급접근 감지 | 빠른 접근 행동 탐지 | approach_speed | 속도 분석 | RAPID_APPROACH |
| Vision AI | 카메라 가림 감지 | 렌즈 가림 여부 탐지 | 프레임 변화 | Occlusion 분석 | CAMERA_OCCLUSION |
| Vision AI | 이벤트 JSON 생성 | Agent AI 전달용 데이터 생성 | Feature 데이터 | JSON 변환 | vision_events 저장 |

---

### Audio AI part - 임의로 정한거라 수정 가능

|  | 기능명 | 설명 | 입력 데이터 | 처리 방식 | 출력/결과 |
| --- | --- | --- | --- | --- | --- |
| Audio AI | Baseline 학습 | 환경 평균 소음 학습 | Audio Stream | RMS 평균 계산 | baseline_db |
| Audio AI | 실시간 dB 분석 | 현재 소리 크기 측정 | Audio Frame | RMS → dB 변환 | current_db |
| Audio AI | 이상 소리 탐지 | 임계치 초과 감지 | current_db | Threshold 비교 | 이벤트 후보 |
| Audio AI | FFT 분석 | 주파수 특징 추출 | Audio Signal | FFT 변환 | Frequency Feature |
| Audio AI | MFCC 추출 | AI 분류용 특징 생성 | Audio Signal | MFCC 생성 | Audio Feature |
| Audio AI | 오디오 이벤트 분류 | 위험 소리 종류 분류 | MFCC/Spectrogram | Fine-tuned AI Model | sound_type |
| Audio AI | 자동 녹음 시작 | 이벤트 발생 시 녹음 | 위험 이벤트 | Buffer 저장 | 녹음 시작 |
| Audio AI | Silence Detection | 무음 시 녹음 종료 | dB 변화 | Silence Counter | 녹음 종료 |
| Audio AI | 이벤트 JSON 생성 | Agent 전달용 데이터 생성 | 분석 결과 | JSON 변환 | audio_events 저장 |

---

### Agent AI part - 임의로 정한거라 수정 가능

|  | 기능명 | 설명 | 입력 데이터 | 처리 방식 | 출력/결과 |
| --- | --- | --- | --- | --- | --- |
| Agent AI | 이벤트 수신 | Vision/Audio 이벤트 수신 | Event JSON | API 처리 | 이벤트 저장 |
| Agent AI | Event Fusion | 시간 기준 이벤트 통합 | timestamp | Context Grouping | event_context 생성 |
| Agent AI | Context 분석 | 이벤트 흐름 분석 | 이벤트 시퀀스 | 패턴 분석 | 위험 상황 판단 |
| Agent AI | Risk Score 계산 | 이벤트 점수 계산 | behavior, sound_type | Rule-based Scoring | risk_score |
| Agent AI | 위험 Level 산정 | 최종 위험 단계 결정 | risk_score | Level Mapping | LEVEL_1~4 |
| Agent AI | AI 판단 기록 | 판단 근거 저장 | 분석 결과 | ai_decisions 저장 | reason, confidence |
| Agent AI | 대응 정책 결정 | 상황별 대응 선택 | Level, Context | 정책 매핑 | recommended_action |

---

### 외부인 대응 part

|  | 기능명 | 설명 | 입력 데이터 | 처리 방식 | 출력/결과 |
| --- | --- | --- | --- | --- | --- |
| 외부인 대응 | 일반 방문 감지 | 짧은 체류 방문 감지 | dwell_time < 10s | PERSON_DETECTED | 무음 푸시 |
| 외부인 대응 | 배회 감지 | 장시간 체류 감지 | dwell_time ≥ 20s | LOITERING 분석 | 진동 알림 |
| 외부인 대응 | 실시간 영상 전송 | 위험 상황 영상 전달 | 위험 이벤트 | 스트리밍 연결 | 실시간 영상 |
| 외부인 대응 | 빠른 대응 버튼 | 즉시 음성 경고 | 사용자 입력 | TTS 출력 | 현관 음성 |
| 외부인 대응 | 침입 시도 감지 | 강제 개방/충격 감지 | 충격음, 강제 접근 | Context 분석 | 비상 모드 |

---

### 사용자 보호 part

|  | 기능명 | 설명 | 입력 데이터 | 처리 방식 | 출력/결과 |
| --- | --- | --- | --- | --- | --- |
| 사용자 보호 | 단순 통과 판별 | 단순 이동 상황 무시 | 짧은 체류 | 오탐 필터링 | 무반응 |
| 사용자 보호 | 뒤따라오기 감지 | 사용자 뒤 배회 감지 | 사용자+외부인 거리 | Context 분석 | 진동 알림 |
| 사용자 보호 | 급접근 감지 | 사용자 근처 빠른 접근 | 거리, 속도 | 위험 행동 분석 | 경고음 출력 |

---

### Silent Signal part

|  | 기능명 | 설명 | 입력 데이터 | 처리 방식 | 출력/결과 |
| --- | --- | --- | --- | --- | --- |
| Silent Signal | 긴급 비밀번호 입력 | 위협 상황 긴급 신호 | DoorLock Input | 긴급 코드 비교 | emergency_event 생성 |
| Silent Signal | 긴급 모드 진입 | 앱 긴급 상태 활성화 | 긴급 이벤트 | 앱 상태 변경 | 긴급 UI 표시 |
| Silent Signal | GPS 수집 | 현재 사용자 위치 확보 | GPS | 위치 조회 | 위치 데이터 |
| Silent Signal | 112 신고 연결 | 신고 화면 진입 | 긴급 상태 | 신고 연결 처리 | 신고 UI |
| Silent Signal | 보호자 알림 | 긴급 메시지 전송 | 위치/시간 정보 | Push/SMS 전송 | 보호자 알림 |
| Silent Signal | 긴급 로그 저장 | 긴급 대응 기록 저장 | emergency_event | emergency_action_logs 저장 | 긴급 기록 |

---

### 알림 시스템 part

| 대분류 | 기능명 | 설명 | 입력 데이터 | 처리 방식 | 출력/결과 |
| --- | --- | --- | --- | --- | --- |
| 알림 시스템 | 위험 알림 전송 | 위험 단계별 Push 전송 | Level | FCM 전송 | 앱 알림 |
| 알림 시스템 | 실시간 스트리밍 | 현관 상황 확인 | Video Stream | RTSP/WebRTC | 실시간 영상 |
| 알림 시스템 | 이벤트 로그 조회 | 과거 이벤트 조회 | user_id | DB 조회 | 이벤트 리스트 |
| 알림 시스템 | 녹화 파일 저장 | 영상/오디오 저장 | Recording Data | event_media 저장 | 증거 데이터 |
| 알림 시스템 | 이벤트 상태 관리 | 위험 이벤트 진행 관리 | context_id | 상태 변경 | ACTIVE/CLOSED |