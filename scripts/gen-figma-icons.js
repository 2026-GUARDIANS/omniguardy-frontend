// assets/figma/*.svg 를 SvgXml에서 쓸 수 있도록 문자열 모듈로 변환한다.
// SVG 파일이 원본이며, 생성 파일(src/components/icons/figmaSvgs.ts)은 직접 수정하지 않는다.
// 사용: npm run icons
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const srcDir = path.join(root, 'assets', 'figma');
const outFile = path.join(root, 'src', 'components', 'icons', 'figmaSvgs.ts');

const toKey = (file) =>
  path.basename(file, '.svg').replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.svg')).sort();
const lines = files.map((f) => {
  const xml = fs.readFileSync(path.join(srcDir, f), 'utf8').trim();
  return `  ${toKey(f)}: ${JSON.stringify(xml)},`;
});

const out = `// 자동 생성 파일 — 수정하지 말 것. 원본: assets/figma/*.svg (scripts/gen-figma-icons.js)
export const figmaSvgs = {
${lines.join('\n')}
} as const;

export type FigmaIconName = keyof typeof figmaSvgs;
`;
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log(`generated ${files.length} icons -> ${path.relative(root, outFile)}`);
