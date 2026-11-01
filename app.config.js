// app.json 설정을 받아 빌드별로 바뀌는 값만 정한다(나머지 설정은 app.json).
//
// google-services.json 경로
// - EAS 빌드: 파일 환경변수 GOOGLE_SERVICES_JSON(빌드 서버에 올린 파일의 경로)
// - 로컬: 프로젝트 맨 위의 google-services.json(.gitignore로 커밋되지 않음)
//
// APP_VARIANT=demo (eas.json의 demo-custom 프로필): 팀 시연용 mock 앱
// - 패키지명을 달리해 실제 서버용 앱과 한 휴대폰에 따로 설치된다
// - Firebase에 등록되지 않은 패키지라 google-services.json을 쓰지 않는다(mock은 푸시를 쓰지 않음)
const IS_DEMO = process.env.APP_VARIANT === 'demo';

module.exports = ({ config }) => {
  if (IS_DEMO) {
    const { googleServicesFile: _unused, ...android } = config.android ?? {};
    return {
      ...config,
      name: 'OmniGuardy 데모',
      android: { ...android, package: 'cloud.omniguardy.app.demo' },
    };
  }
  return {
    ...config,
    android: {
      ...config.android,
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
    },
  };
};
