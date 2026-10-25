import { useFonts } from 'expo-font';
import { IBMPlexMono_400Regular } from '@expo-google-fonts/ibm-plex-mono/400Regular';
import { IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono/500Medium';
import { IBMPlexMono_600SemiBold } from '@expo-google-fonts/ibm-plex-mono/600SemiBold';
import { IBMPlexSansKR_400Regular } from '@expo-google-fonts/ibm-plex-sans-kr/400Regular';
import { IBMPlexSansKR_500Medium } from '@expo-google-fonts/ibm-plex-sans-kr/500Medium';
import { IBMPlexSansKR_600SemiBold } from '@expo-google-fonts/ibm-plex-sans-kr/600SemiBold';
import { IBMPlexSansKR_700Bold } from '@expo-google-fonts/ibm-plex-sans-kr/700Bold';
import { NunitoSans_300Light } from '@expo-google-fonts/nunito-sans/300Light';
import { NunitoSans_400Regular } from '@expo-google-fonts/nunito-sans/400Regular';
import { NunitoSans_500Medium } from '@expo-google-fonts/nunito-sans/500Medium';
import { NunitoSans_600SemiBold } from '@expo-google-fonts/nunito-sans/600SemiBold';
import { NunitoSans_700Bold } from '@expo-google-fonts/nunito-sans/700Bold';

import { THEME } from './tokens';

// 두 테마 공통: 한글 글꼴(tokens.ts fonts.sans*)
const korean = {
  IBMPlexSansKR_400Regular,
  IBMPlexSansKR_500Medium,
  IBMPlexSansKR_600SemiBold,
  IBMPlexSansKR_700Bold,
};

// 테마별로 실제 쓰는 굵기만 등록한다. 키는 tokens.ts의 fonts 이름과 같다.
const FONT_MAP =
  THEME === 'custom'
    ? {
        ...korean,
        NunitoSans_300Light, // 워드마크
        NunitoSans_400Regular,
        NunitoSans_500Medium,
        NunitoSans_600SemiBold,
        NunitoSans_700Bold, // MixedText "Agent 위험도 판단"의 영문 구간
      }
    : {
        ...korean,
        IBMPlexMono_400Regular,
        IBMPlexMono_500Medium,
        IBMPlexMono_600SemiBold,
      };

/** 로드가 끝나면(실패해도) true. 실패 시 시스템 글꼴로 화면은 뜬다. */
export function useAppFonts() {
  const [loaded, error] = useFonts(FONT_MAP);
  return loaded || error != null;
}
