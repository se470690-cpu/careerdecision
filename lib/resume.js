// 이력서 파일을 브라우저 안에서만 읽습니다. 파일은 서버로 전송되지 않습니다.
// 1) 텍스트가 들어 있는 PDF/DOCX/TXT 는 그대로 추출합니다.
// 2) 스캔본·이미지로 내보낸 PDF, 사진(PNG/JPG)은 브라우저에서 글자 인식(OCR, tesseract.js)으로 읽습니다.

const TESS_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
export const MAX_OCR_PAGES = 5;

// 추출한 글자가 너무 적거나 깨져 있으면 OCR 이 필요한 파일로 봅니다.
export function needsOcr(text) {
  const t = String(text || '').replace(/\s+/g, '');
  if (t.length < 30) return true;
  const broken = (t.match(/[\uFFFD\uE000-\uF8FF]/g) || []).length;
  if (broken / t.length > 0.05) return true;
  const readable = (t.match(/[가-힣A-Za-z0-9]/g) || []).length;
  return readable / t.length < 0.5;
}

// OCR 이 한글 글자 사이에 공백을 끼워 넣는 경우("김 세 연")를 정리합니다. 대부분 한 글자 토큰이면 붙입니다.
export function fixKoreanSpacing(text) {
  const tokens = text.split(/\s+/).filter((w) => /^[가-힣]+$/.test(w));
  if (tokens.length < 20) return text;
  const single = tokens.filter((w) => w.length === 1).length / tokens.length;
  return single > 0.4 ? text.replace(/([가-힣])[ \t]+(?=[가-힣])/g, '$1') : text;
}

function loadTesseract() {
  if (typeof window !== 'undefined' && window.Tesseract) return Promise.resolve(window.Tesseract);
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = TESS_URL;
    s.async = true;
    s.onload = () => (window.Tesseract ? resolve(window.Tesseract) : reject(new Error('글자 인식 엔진을 불러오지 못했어요.')));
    s.onerror = () => reject(new Error('글자 인식 엔진을 내려받지 못했어요. 인터넷 연결을 확인해 주세요.'));
    document.head.appendChild(s);
  });
}

async function ocrCanvases(canvases, onProgress) {
  const T = await loadTesseract();
  let cur = 0;
  onProgress({ stage: 'load' });
  const worker = await T.createWorker('kor+eng', 1, {
    logger: (m) => { if (m.status === 'recognizing text') onProgress({ stage: 'ocr', page: cur + 1, pages: canvases.length, pct: Math.round(m.progress * 100) }); },
  });
  try {
    let out = '';
    for (let i = 0; i < canvases.length; i++) {
      cur = i;
      const { data } = await worker.recognize(canvases[i]);
      out += data.text + '\n';
    }
    return out;
  } finally {
    await worker.terminate();
  }
}

async function pageToCanvas(page, scale = 2.5) {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const canvasContext = canvas.getContext('2d');
  await page.render({ canvasContext, canvas, viewport }).promise;
  return canvas;
}

async function imageToCanvas(file) {
  const bmp = await createImageBitmap(file);
  const scale = Math.max(1, Math.min(2, 1800 / Math.max(bmp.width, bmp.height)));
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(bmp.width * scale);
  canvas.height = Math.floor(bmp.height * scale);
  canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return canvas;
}

// public/ 에 복사해 둔 워커와 한글 폰트 매핑(cmaps)을 먼저 쓰고, 실패하면 번들러가 만든 워커 주소로 다시 시도합니다.
async function openPdf(pdfjs, buffer) {
  const opts = { cMapUrl: '/cmaps/', cMapPacked: true, useSystemFonts: true };
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  try {
    return await pdfjs.getDocument({ ...opts, data: new Uint8Array(buffer.slice(0)) }).promise;
  } catch (e) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.min.mjs', import.meta.url).toString();
    return await pdfjs.getDocument({ ...opts, data: new Uint8Array(buffer.slice(0)) }).promise;
  }
}

const clean = (t) => t.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

// onProgress({stage:'read'|'load'|'ocr'|'done', page, pages, pct, method})
export async function extractResumeText(file, onProgress = () => {}) {
  const name = (file.name || '').toLowerCase();
  const done = (text, method) => { onProgress({ stage: 'done', method }); return text; };

  if (/\.(txt|md)$/.test(name) || (file.type || '').startsWith('text/')) return done((await file.text()).trim(), 'text');

  if (/\.(png|jpe?g|webp)$/.test(name) || (file.type || '').startsWith('image/')) {
    const ocr = fixKoreanSpacing(await ocrCanvases([await imageToCanvas(file)], onProgress)).trim();
    if (needsOcr(ocr)) throw new Error('글자를 인식하지 못했어요. 화질이 낮거나 손글씨일 수 있어요. 텍스트를 직접 붙여 넣어 주세요.');
    return done(ocr, 'ocr');
  }

  if (name.endsWith('.pdf')) {
    onProgress({ stage: 'read' });
    // legacy 빌드는 구형 브라우저·Next 번들러와의 호환성이 더 좋아요.
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const doc = await openPdf(pdfjs, await file.arrayBuffer());
    let out = '';
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const tc = await page.getTextContent();
      out += tc.items.map((it) => ('str' in it ? it.str + (it.hasEOL ? '\n' : ' ') : '')).join('') + '\n';
    }
    const text = clean(out);
    if (!needsOcr(text)) return done(text, 'text');

    // 스캔본이거나 글자가 도형으로 저장된 PDF: 쪽을 그림으로 그려 글자 인식
    const pages = Math.min(doc.numPages, MAX_OCR_PAGES);
    const canvases = [];
    for (let i = 1; i <= pages; i++) canvases.push(await pageToCanvas(await doc.getPage(i)));
    const ocr = clean(fixKoreanSpacing(await ocrCanvases(canvases, onProgress)));
    if (needsOcr(ocr)) throw new Error('글자를 인식하지 못했어요. 화질이 낮거나 손글씨일 수 있어요. 텍스트를 직접 붙여 넣어 주세요.');
    return done(ocr, 'ocr');
  }

  if (name.endsWith('.docx')) {
    const mod = await import('mammoth/mammoth.browser');
    const mammoth = mod.default || mod;
    const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return done(value.trim(), 'text');
  }
  throw new Error('PDF, DOCX, TXT, PNG, JPG 파일만 읽을 수 있어요. HWP는 PDF로 저장해서 올려 주세요.');
}

export const SAMPLE_RESUME = `서비스 운영 3년 경력. 검색 서비스 운영을 담당하며 검색 결과 품질을 모니터링하고 개선 요청을 정리했습니다.
상품 등록 프로세스를 분석하고 등록 단계를 개선해 운영 효율화를 이끌었습니다.
어드민 기능 개선을 기획하고 PRD를 작성해 개발자, 디자이너와 협업했습니다.
SQL로 지표를 추출하고 대시보드를 만들어 주간 리포트를 운영했습니다.
A/B 테스트 결과를 분석해 노출 정책 변경을 제안했습니다.
운영 이슈가 반복되는 원인을 분석해 정책과 운영 기준을 정비하고 CS 대응 가이드를 만들었습니다.`;
