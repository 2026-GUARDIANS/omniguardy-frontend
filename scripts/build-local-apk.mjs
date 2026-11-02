// EAS 클라우드 빌드 대신 이 PC에서 APK를 만든다(EAS 무료 빌드 횟수를 다 썼을 때 등).
// 사용: node scripts/build-local-apk.mjs <eas.json 빌드 프로필> <versionCode> [--skip-prebuild]
//   예) node scripts/build-local-apk.mjs device-test 18
//   --skip-prebuild: 이미 만든 android 폴더를 다시 쓴다. 패키지가 같은 프로필끼리만 쓸 것(예: device-test → device-test-custom).
//                    네이티브 빌드 결과를 재사용해 훨씬 빠르다. 테마 등 EXPO_PUBLIC 값은 Gradle의 JS 번들 단계에서 반영된다
//
// - eas.json 프로필의 env(EXPO_PUBLIC_*, APP_VARIANT)를 그대로 쓴다(extends 포함)
// - 서명: EAS에서 내려받은 credentials.json(eas credentials → Download)의 키. 같은 키라 기존 앱 위에 덮어 설치된다.
//   데모 앱(demo-custom)은 키가 달라서 그 프로필로 다시 내려받은 credentials.json이 있어야 한다.
// - 비밀번호는 명령줄에 남지 않게 환경변수(ORG_GRADLE_PROJECT_*)로 Gradle에 넘긴다
// - versionCode는 휴대폰에 깔린 앱보다 커야 덮어 설치된다(EAS 원격 버전 번호보다 크게)
// - 결과: dist-apk/<프로필>-vc<versionCode>.apk (.gitignore)
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const skipPrebuild = args.includes('--skip-prebuild');
const [profileName, versionCodeArg] = args.filter((a) => !a.startsWith('--'));
const versionCode = Number(versionCodeArg);
if (!profileName || !Number.isInteger(versionCode) || versionCode < 1) {
  console.error('사용: node scripts/build-local-apk.mjs <프로필> <versionCode> [--skip-prebuild]');
  process.exit(1);
}

const root = resolve(import.meta.dirname, '..');
const androidDir = join(root, 'android');
const eas = JSON.parse(readFileSync(join(root, 'eas.json'), 'utf8'));

function profileEnv(name) {
  const p = eas.build[name];
  if (!p) throw new Error(`eas.json에 ${name} 프로필이 없습니다`);
  return { ...(p.extends ? profileEnv(p.extends) : {}), ...(p.env ?? {}) };
}

const creds = JSON.parse(readFileSync(join(root, 'credentials.json'), 'utf8')).android.keystore;
const keystore = resolve(root, creds.keystorePath);
if (!existsSync(keystore)) throw new Error(`서명 키 파일이 없습니다: ${creds.keystorePath}`);

const env = {
  ...process.env,
  ...profileEnv(profileName),
  NODE_ENV: 'production',
  JAVA_HOME: process.env.JAVA_HOME || 'C:\\Program Files\\Android\\Android Studio\\jbr',
  'ORG_GRADLE_PROJECT_android.injected.signing.store.file': keystore,
  'ORG_GRADLE_PROJECT_android.injected.signing.store.password': creds.keystorePassword,
  'ORG_GRADLE_PROJECT_android.injected.signing.key.alias': creds.keyAlias,
  'ORG_GRADLE_PROJECT_android.injected.signing.key.password': creds.keyPassword,
};

const run = (cmd, cmdArgs, cwd = root) => execFileSync(cmd, cmdArgs, { cwd, env, stdio: 'inherit', shell: true });

if (!skipPrebuild || !existsSync(androidDir)) {
  console.log(`\n▶ ${profileName} — prebuild`);
  // prebuild는 package.json의 android/ios 스크립트를 "expo run:*"으로 바꾼다. 저장소 파일은 그대로 두려고 되돌린다
  const pkgPath = join(root, 'package.json');
  const pkg = readFileSync(pkgPath, 'utf8');
  try {
    run('npx', ['expo', 'prebuild', '--platform', 'android', '--clean', '--no-install']);
  } finally {
    writeFileSync(pkgPath, pkg);
  }
}

// Gradle의 android.injected.version.code는 명령줄 빌드에 적용되지 않아 build.gradle에 직접 쓴다
const gradleFile = join(androidDir, 'app', 'build.gradle');
let gradle = readFileSync(gradleFile, 'utf8');
if (!/versionCode \d+/.test(gradle)) throw new Error('build.gradle에서 versionCode를 찾지 못했습니다');
gradle = gradle.replace(/versionCode \d+/, `versionCode ${versionCode}`);
// JS 번들: EXPO_PUBLIC 값(테마 등)은 번들에 박히는데, Gradle은 환경변수 변경을 모르고 Metro는 캐시를 쓴다.
// 프로필마다 값이 다를 수 있으니 매번 Metro 캐시 없이 다시 만들고, 이전 번들 결과도 지운다
gradle = gradle.replace(/\/\/ extraPackagerArgs = \[\]/, 'extraPackagerArgs = ["--reset-cache"]');
writeFileSync(gradleFile, gradle);
for (const dir of ['assets', 'res']) {
  rmSync(join(androidDir, 'app', 'build', 'generated', dir, 'react'), { recursive: true, force: true });
}

console.log(`\n▶ ${profileName} (versionCode ${versionCode}) — gradle assembleRelease`);
// 현재 폴더의 실행 파일을 찾지 않는 환경(NoDefaultCurrentDirectoryInExePath)도 있어 절대 경로로 실행한다
const gradlew = join(androidDir, process.platform === 'win32' ? 'gradlew.bat' : 'gradlew');
run(`"${gradlew}"`, ['assembleRelease', '--no-daemon'], androidDir);

const out = join(root, 'dist-apk');
mkdirSync(out, { recursive: true });
const dest = join(out, `${profileName}-vc${versionCode}.apk`);
copyFileSync(join(androidDir, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk'), dest);
console.log(`\n✔ ${dest}`);
