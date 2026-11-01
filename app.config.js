// app.json 설정을 받아 google-services.json 경로만 정한다(나머지 설정은 app.json).
// EAS 빌드: 파일 환경변수 GOOGLE_SERVICES_JSON(빌드 서버에 올린 파일의 경로)
// 로컬: 프로젝트 맨 위의 google-services.json(.gitignore로 커밋되지 않음)
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
  },
});
