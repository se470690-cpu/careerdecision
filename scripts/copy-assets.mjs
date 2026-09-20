// pdf.js 워커와 한글 폰트 매핑(cmaps)을 public/ 으로 복사합니다. (predev / prebuild / postinstall 에서 자동 실행)
import { cpSync, existsSync, mkdirSync } from 'node:fs';

const base = 'node_modules/pdfjs-dist';
if (!existsSync(base)) { console.log('[copy-assets] pdfjs-dist 가 아직 설치되지 않아 건너뜁니다.'); process.exit(0); }
mkdirSync('public', { recursive: true });
try {
  cpSync(`${base}/legacy/build/pdf.worker.min.mjs`, 'public/pdf.worker.min.mjs');
  if (existsSync(`${base}/cmaps`)) cpSync(`${base}/cmaps`, 'public/cmaps', { recursive: true });
  console.log('[copy-assets] pdf 워커와 cmaps 를 public/ 에 복사했어요.');
} catch (e) {
  console.log('[copy-assets] 복사 실패(무시하고 계속):', e.message);
}
