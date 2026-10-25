import React, { useMemo } from 'react';
import { SvgXml } from 'react-native-svg';

import { figmaSvgs, type FigmaIconName } from './figmaSvgs';

type Props = {
  name: FigmaIconName;
  /** Figma 원본 크기와 다를 때만 지정 */
  size?: number;
  /**
   * 선 색 덮어쓰기. 지정하지 않으면 Figma 원본 색 그대로 그린다.
   * 대비 조정(tokens.ts) 때문에 원본과 다른 색이 필요한 경우에만 사용.
   */
  color?: string;
};

const SIZE_RE = /width="(\d+(?:\.\d+)?)"/;

/** Figma에서 내려받은 SVG 아이콘. 장식용이므로 접근성 트리에서 숨긴다(라벨은 감싸는 요소에서 제공). */
export function Icon({ name, size, color }: Props) {
  const xml = useMemo(() => {
    const raw: string = figmaSvgs[name];
    return color ? raw.replace(/stroke="(?!none)[^"]*"/g, `stroke="${color}"`) : raw;
  }, [name, color]);
  const natural = Number(SIZE_RE.exec(figmaSvgs[name])?.[1] ?? 24);
  const s = size ?? natural;
  return (
    <SvgXml
      xml={xml}
      width={s}
      height={s}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
