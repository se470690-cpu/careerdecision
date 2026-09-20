import { COMPANIES, COMPANY_BY_ID, ROLES } from './data';
import { CONCEPTS, conceptsOf, bigrams } from './concepts';
import { parseResume } from './resumeParse';

export { CONCEPTS, conceptsOf };

/* ───────────── 지오코딩 (내장 좌표 → OpenStreetMap Nominatim) ───────────── */
export const GAZ = {
  강남: [37.4979, 127.0276], 강남역: [37.4979, 127.0276], 강남구: [37.5172, 127.0473], 역삼역: [37.5006, 127.0364], 역삼: [37.5006, 127.0364], 역삼동: [37.5006, 127.0364],
  선릉역: [37.5045, 127.049], 삼성역: [37.5088, 127.0632], 삼성동: [37.5088, 127.0632], 논현역: [37.5111, 127.0214], 논현동: [37.5111, 127.0214], 신논현역: [37.5045, 127.025],
  대치동: [37.4946, 127.0577], 청담동: [37.5247, 127.0473], 교대역: [37.4934, 127.0146], 양재역: [37.4842, 127.0345], 서초구: [37.4837, 127.0324], 서초: [37.4837, 127.0324], 서초동: [37.4917, 127.0074], 반포동: [37.504, 127.0087],
  송파구: [37.5145, 127.1059], 송파: [37.5145, 127.1059], 잠실역: [37.5133, 127.1002], 잠실: [37.5133, 127.1002], 잠실동: [37.5133, 127.1002], 석촌역: [37.5055, 127.1069], 방이동: [37.51, 127.123],
  강동구: [37.5301, 127.1238], 천호역: [37.5387, 127.1238], 하남: [37.5393, 127.2148], 위례: [37.478, 127.144],
  판교역: [37.3948, 127.1112], 판교: [37.3948, 127.1112], 분당구: [37.3671, 127.1082], 분당: [37.3671, 127.1082], 정자역: [37.3671, 127.1082], 서현역: [37.385, 127.1231], 수내역: [37.378, 127.1142], 성남시: [37.42, 127.1265], 성남: [37.42, 127.1265],
  동작구: [37.5124, 126.9393], 사당역: [37.4765, 126.9816], 사당동: [37.4765, 126.9816], 노량진역: [37.5133, 126.9424], 노량진동: [37.5133, 126.9424], 상도역: [37.5029, 126.9477], 상도동: [37.5029, 126.9477], 흑석역: [37.5088, 126.9636], 이수역: [37.4857, 126.982],
  관악구: [37.4784, 126.9516], 신림역: [37.4842, 126.9298], 신림동: [37.4842, 126.9298], 봉천동: [37.4826, 126.9418], 서울대입구역: [37.4813, 126.9527],
  영등포구: [37.5264, 126.8962], 영등포: [37.5264, 126.8962], 여의도: [37.5217, 126.9243], 당산역: [37.5343, 126.9025], 구로디지털단지역: [37.4853, 126.9015], 구로구: [37.4954, 126.8874], 가산디지털단지역: [37.4816, 126.8827], 금천구: [37.4569, 126.8955],
  마포구: [37.5663, 126.9019], 홍대입구역: [37.5572, 126.9245], 홍대: [37.5572, 126.9245], 합정역: [37.5495, 126.9139], 공덕역: [37.544, 126.9516], 상암동: [37.579, 126.89],
  용산구: [37.5324, 126.9906], 용산역: [37.5299, 126.9648], 용산: [37.5299, 126.9648], 서울역: [37.5547, 126.9707], 종로구: [37.5735, 126.979], 광화문: [37.5716, 126.9769], 시청: [37.5657, 126.9769],
  성수: [37.5446, 127.0559], 성수역: [37.5446, 127.0559], 성동구: [37.5634, 127.0369], 건대입구역: [37.5404, 127.0692], 광진구: [37.5385, 127.0823], 왕십리역: [37.5612, 127.0371],
  강서구: [37.551, 126.8495], 마곡: [37.5667, 126.8275], 양천구: [37.5169, 126.8664], 목동: [37.5264, 126.8646],
  은평구: [37.6027, 126.9291], 노원구: [37.6542, 127.0568], 성북구: [37.5894, 127.0167], 동대문구: [37.5744, 127.0396], 중랑구: [37.6063, 127.0927], 강북구: [37.6397, 127.0257], 도봉구: [37.6688, 127.0471],
  과천: [37.4292, 126.9876], 안양: [37.3943, 126.9568], 평촌: [37.3944, 126.9636], 수원: [37.266, 127.0001], 광교: [37.29, 127.053], 수지: [37.3222, 127.0951], 부천: [37.4989, 126.7831], 일산: [37.6432, 126.788], 인천: [37.4563, 126.7052],
};

export function lookupLocal(text) {
  const key = String(text || '').replace(/\s+/g, '');
  if (!key) return null;
  if (GAZ[key]) return { ll: GAZ[key], src: '내장 좌표' };
  const ks = Object.keys(GAZ).sort((a, b) => b.length - a.length);
  const h1 = ks.find((k) => key.includes(k));
  if (h1) return { ll: GAZ[h1], src: `내장 좌표(${h1} 기준)` };
  const h2 = key.length >= 2 && ks.find((k) => k.includes(key));
  if (h2) return { ll: GAZ[h2], src: `내장 좌표(${h2} 기준)` };
  return null;
}

export async function geocode(text) {
  // "테헤란로 152"처럼 번지까지 적은 입력은 내장 좌표(구·역 중심점)로는 너무 거칠어서 카카오를 먼저 시도합니다.
  const detailed = /[가-힣0-9]+(로|길)\s*\d+/.test(text);
  const viaKakao = async () => {
    try {
      const r = await fetch('/api/geocode?q=' + encodeURIComponent(text));
      if (r.ok) { const j = await r.json(); if (j && j.ll) return { ll: j.ll, src: j.src + (j.label ? ` · ${j.label}` : '') }; }
    } catch (e) { /* 서버 키가 없으면 501 → 다음 방법 */ }
    return null;
  };
  if (detailed) { const k = await viaKakao(); if (k) return k; }
  const local = lookupLocal(text);
  if (local) return local;
  if (!detailed) { const k = await viaKakao(); if (k) return k; }
  try {
    const r = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=kr&accept-language=ko&q=' + encodeURIComponent(text));
    const j = await r.json();
    if (j && j[0]) return { ll: [+j[0].lat, +j[0].lon], src: 'OpenStreetMap 검색' };
  } catch (e) {
    /* 네트워크 실패 시 null */
  }
  return null;
}

export function hav(a, b) {
  const R = 6371, r = Math.PI / 180;
  const dLa = (b[0] - a[0]) * r, dLo = (b[1] - a[1]) * r;
  const x = Math.sin(dLa / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
export function bearing(a, b) {
  const r = Math.PI / 180;
  return Math.atan2((b[1] - a[1]) * Math.cos(a[0] * r), b[0] - a[0]);
}
// 직선거리 기반 추정. 실제 대중교통 경로 시간이 아닙니다.
export const commuteMin = (km) => Math.round(8 + km * 2.6 + (km > 20 ? 8 : 0));
export const kmForMin = (m) => (m <= 60 ? Math.max(1, (m - 8) / 2.6) : Math.max(20, (m - 16) / 2.6));
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

/* ───────────── 이력서 분석 (경험 단위로 이해) ───────────── */
export const splitSentences = (t) => parseResume(t).units.map((u) => u.s);

const EXP_KINDS = new Set(['project', 'org']);

export function analyzeResume(text) {
  const parsed = parseResume(text);
  const { units, blocks, hints } = parsed;
  const tally = {};
  blocks.forEach((b) => b.cs.forEach((c) => { tally[c] = (tally[c] || 0) + 1; }));
  const top = Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([id, n]) => ({ id, n, label: CONCEPTS[id].n }));
  const has = (id) => (tally[id] || 0) > 0;
  let persona = '경험 정리가 더 필요한 지원자', role = 'plan';
  if ((has('ops_process') || has('risk')) && (has('planning') || has('improve') || has('admin')) && (has('data') || has('sql'))) {
    persona = '문제 발견형 서비스 기획자'; role = 'plan';
  } else if (has('planning') || has('improve')) { persona = '서비스 개선형 기획자'; role = 'plan'; }
  else if (has('risk') || has('ops_process')) { persona = '운영 안정화형 운영 전문가'; role = 'ops'; }
  else if (has('data') || has('sql')) { persona = '데이터 기반 분석가'; role = 'data'; }
  else if (has('ml')) { persona = '모델링 중심 개발자'; role = 'dev'; }
  let need = '이력서에서 직무 개념을 충분히 읽지 못했습니다. 담당 업무와 성과를 문장으로 더 적어 주세요.';
  if (has('ops_process') && (has('planning') || has('improve')) && (has('data') || has('sql'))) {
    need = '단순 운영보다 문제를 발견하고 서비스를 개선하는 역할로 커리어를 확장하려는 가능성이 높습니다.';
  } else if (top.length) {
    need = `${top[0].label} 경험이 가장 두드러집니다. 이 방향의 역할에서 근거를 가장 많이 연결할 수 있습니다.`;
  }
  const resumeCS = new Set(units.flatMap((u) => u.cs));
  const sents = units.map((u) => u.s);
  const evidence = units.map((u) => ({ s: u.s, cs: u.cs, label: u.label }));
  return { units, blocks, hints, sents, evidence, resumeCS, top, persona, role, need, strengths: top.length };
}

/* ───────────── 요건 ↔ 근거 매칭 (문장 + 그 문장이 속한 경험의 맥락) ───────────── */
// 특정 도구·도메인 개념(AI, SQL, 광고 등)은 이력서 전체에 아예 없으면 '연결'로 인정하지 않습니다.
const HARD = new Set(['ai', 'sql', 'ads', 'payment', 'ml', 'growth', 'search_rec', 'location']);

export function scoreReq(req, an, years) {
  const cr = conceptsOf(req), br = bigrams(req);
  const need = Math.max(1, Math.min(cr.size, 3));
  const cands = [];
  for (const u of an.units) {
    const blk = an.blocks[u.b];
    const cs = new Set(u.cs);
    const sharedU = [...cr].filter((c) => cs.has(c));
    // 프로젝트·경력 블록 안의 문장은, 같은 블록의 다른 문장이 채워 주는 맥락(예: 문제 정의 + 분석 + 성과)을 일부 인정합니다.
    const bcs = EXP_KINDS.has(blk.kind) ? new Set(blk.cs) : cs;
    const sharedB = [...cr].filter((c) => bcs.has(c));
    const ov = Math.min(1, Math.max(sharedU.length / need, (0.85 * sharedB.length) / need));
    const bs = bigrams(u.s);
    let inter = 0;
    br.forEach((x) => { if (bs.has(x)) inter++; });
    const dice = br.size + bs.size ? (2 * inter) / (br.size + bs.size) : 0;
    const score = Math.min(1, 0.8 * ov + 1.6 * dice + (blk.kind === 'project' && blk.result ? 0.03 : 0));
    cands.push({ score, unit: u, shared: sharedU.length ? sharedU : sharedB, exp: EXP_KINDS.has(blk.kind), skills: blk.kind === 'skills', nShared: sharedU.length, metrics: blk.metrics.length });
  }
  // 점수는 가장 높은 값을 쓰되, 근거로 보여줄 문장은 자기소개·스킬 목록보다 실제 프로젝트·경력 안의 문장(성과 수치가 있는 쪽)을 우선합니다.
  const top = Math.max(0, ...cands.map((c) => c.score));
  const pool = cands.filter((c) => c.score >= top - 0.15 && c.score > 0);
  const tier = (c) => (c.exp || c.skills ? 2 : 1);
  const bucket = (c) => Math.round(c.score * 10);
  pool.sort((a, b) => (tier(b) - tier(a)) || (bucket(b) - bucket(a)) || (b.nShared - a.nShared) || (b.metrics - a.metrics) || (b.score - a.score));
  let best = pool[0] ? { score: top, unit: pool[0].unit, shared: pool[0].shared } : { score: 0, unit: null, shared: [] };
  const missing = [...cr].filter((c) => HARD.has(c) && !an.resumeCS.has(c));
  if (missing.length && best.score > 0.5) best = { ...best, score: 0.5 };
  const ym = req.match(/(\d+)\s*년\s*이상/);
  const minYears = ym ? +ym[1] : 0;
  let gap = null;
  const pack = (b, level) => {
    const blk = b.unit ? an.blocks[b.unit.b] : null;
    return {
      score: b.score, sent: b.unit ? b.unit.s : null, shared: b.shared, level, minYears, gap,
      sharedLabels: b.shared.map((c) => CONCEPTS[c].n), missingLabels: missing.map((c) => CONCEPTS[c].n),
      block: blk ? { label: blk.label, period: blk.period, result: blk.result, metrics: blk.metrics, kind: blk.kind } : null,
    };
  };
  // "경력 N년 이상"만 적힌 항목은 입력한 경력으로 바로 판단합니다.
  if (minYears && years >= minYears && /^경력\s*\d+\s*년\s*이상(\s*\(.*\))?$/.test(req.trim())) {
    return { ...pack({ score: 1, unit: null, shared: [] }, 'match'), sent: `입력하신 경력 ${years}년`, sharedLabels: ['경력 연차 충족'], missingLabels: [] };
  }
  if (minYears && years < minYears) { best = { ...best, score: Math.min(best.score, 0.2) }; gap = { type: 'years', need: minYears }; }
  const level = best.score >= 0.55 ? 'match' : best.score >= 0.3 ? 'bridge' : 'gap';
  return pack(best, level);
}

export function scorePosting(p, an, years) {
  const reqs = [...p.must.map((t) => ({ t, w: 2, kind: 'must' })), ...p.nice.map((t) => ({ t, w: 1, kind: 'nice' }))];
  const rows = reqs.map((r) => ({ ...r, m: scoreReq(r.t, an, years) }));
  const credit = (l) => (l === 'match' ? 1 : l === 'bridge' ? 0.5 : 0);
  const tot = rows.reduce((a, r) => a + r.w, 0);
  const got = rows.reduce((a, r) => a + r.w * credit(r.m.level), 0);
  const must = rows.filter((r) => r.kind === 'must');
  const minYears = Math.max(0, ...must.map((r) => r.m.minYears));
  const text = [...p.does, ...p.must, ...p.nice].join(' ');
  return {
    rows, career: tot ? got / tot : 0,
    mustN: must.length, mustHit: must.filter((r) => r.m.level === 'match').length,
    counts: { match: rows.filter((r) => r.m.level === 'match').length, bridge: rows.filter((r) => r.m.level === 'bridge').length, gap: rows.filter((r) => r.m.level === 'gap').length },
    minYears, explore: conceptsOf(text).has('ownership') || conceptsOf(text).has('rootcause'),
  };
}

/* ───────────── 선택 인터뷰 (3문항, 답에 따라 다음 질문이 바뀜) ───────────── */
export const IV_QUESTIONS = {
  q1: { lead: '지금까지의 선택을 바탕으로', q: '둘 중 하나만 선택해야 한다면?', a: { t: '원하는 직무 경험이 많지만', s: '출퇴근 60분 · 주 5일 출근' }, b: { t: '직무는 조금 덜 맞지만', s: '출퇴근 30분 · 주 2회 출근' } },
  q2a: { lead: '직무 성장성을 확인하고 있어요', q: '원하는 직무라면, 주 5일 출근이어도 선택하시겠어요?', a: { t: '네, 직무가 맞으면 감수해요', s: '출근 빈도보다 일의 내용' }, b: { t: '아니요, 주 2~3회여야 해요', s: '일하는 방식도 조건이에요' } },
  q2b: { lead: '통근 편의성을 확인하고 있어요', q: '통근은 가깝지만 배울 점이 적은 곳이라면?', a: { t: '가까우니 그대로 선택해요', s: '생활 안정이 우선' }, b: { t: '통근 50분이어도 배울 점 많은 곳', s: '성장 기회가 우선' } },
  q3: { lead: '선호하는 역할의 성격을 확인하고 있어요', q: '어떤 역할이 더 끌리세요?', a: { t: '문제 정의부터 경험하는 역할', s: '범위가 넓고 정답이 정해지지 않아요' }, b: { t: '기존 운영 범위를 확장하는 역할', s: '기준이 분명하고 안정적이에요' } },
};
export function nextQuestion(answers) {
  if (answers.length === 0) return 'q1';
  if (answers.length === 1) return answers[0] === 'a' ? 'q2a' : 'q2b';
  if (answers.length === 2) return 'q3';
  return null;
}
export const DEFAULT_W = { career: 40, life: 30, pref: 30 };
export function applyInterview(answers) {
  const W = { ...DEFAULT_W };
  let scope = null, workFlex = null;
  const [q1, q2, q3] = answers;
  if (q1 === 'a') { W.career += 12; W.life -= 6; } else if (q1 === 'b') { W.life += 14; W.career -= 6; }
  if (q1 === 'a') { if (q2 === 'a') { W.career += 10; workFlex = 0; } else if (q2 === 'b') { W.life += 6; workFlex = 1; } }
  if (q1 === 'b') { if (q2 === 'a') { W.life += 10; } else if (q2 === 'b') { W.career += 10; } }
  if (q3 === 'a') scope = 'explore'; else if (q3 === 'b') scope = 'stable';
  Object.keys(W).forEach((k) => (W[k] = Math.max(10, W[k])));
  const sum = W.career + W.life + W.pref;
  Object.keys(W).forEach((k) => (W[k] = Math.round((W[k] / sum) * 100)));
  const growth = clamp((scope === 'explore' ? 85 : scope === 'stable' ? 45 : 60) + (q1 === 'a' && q2 === 'a' ? 5 : 0) + (q1 === 'b' && q2 === 'b' ? 10 : 0), 0, 100);
  const revealed = {
    jobFit: clamp(50 + (W.career - 40) * 2, 10, 100),
    growth,
    commute: clamp(50 + (W.life - 30) * 2.2, 10, 100),
    worklife: workFlex === 1 ? 80 : workFlex === 0 ? 40 : 55,
    domain: 60,
  };
  return { W, scope, workFlex, revealed };
}
export const TOP_LABEL = { growth: '직무 성장', commute: '통근 편의', worklife: '워라밸', mode: '근무 방식' };

/* ───────────── 후보 계산 (Find & Filter → Match → Decide) ───────────── */
const ADJ = { plan: ['ops', 'data'], ops: ['plan'], data: ['plan'], dev: [], design: [] };
export function computeAll({ setup, resume, W, scope, workFlex, hidden = [], transit = null }, postings) {
  const an = analyzeResume(resume);
  const years = Number(setup.years) || 0;
  const home = setup.home;
  const funnel = { initial: postings.length, life: 0, role: 0, evidence: 0, left: 0 };
  const ok = [], ex = [];
  const wsum = W.career + W.life + W.pref || 1;
  for (const p of postings) {
    if (hidden.includes(p.id)) continue;
    const c = COMPANY_BY_ID[p.companyId];
    if (!c || !home) continue;
    const km = hav(home, [c.lat, c.lng]);
    // 카카오 대중교통 경로를 조회한 회사는 그 시간을, 아니면 직선거리 추정치를 씁니다.
    const tr = transit && transit[c.id] && transit[c.id].status === 'OK' ? transit[c.id] : null;
    const min = tr ? tr.min : commuteMin(km);
    const minSrc = tr ? 'transit' : 'estimate';
    const transfers = tr ? tr.transfers : null;
    if (min > setup.maxMin) { funnel.life++; ex.push({ p, c, km, min, minSrc, kind: 'life', why: `설정한 최대 통근시간 ${setup.maxMin}분을 약 ${min - setup.maxMin}분 넘어요. (${tr ? '대중교통' : '추정'} ${min}분)` }); continue; }
    const sc = scorePosting(p, an, years);
    const adjacent = p.role !== setup.role && (ADJ[setup.role] || []).includes(p.role);
    if (p.role !== setup.role && !adjacent) { funnel.role++; ex.push({ p, c, km, min, kind: 'role', why: `희망 직무(${ROLES.find((r) => r.id === setup.role)?.n})와 다른 직무예요.` }); continue; }
    if (sc.minYears > years + 2) { funnel.role++; ex.push({ p, c, km, min, kind: 'role', why: `경력 ${sc.minYears}년 이상을 요구해요. 입력하신 경력은 ${years}년이에요.` }); continue; }
    if (sc.career < 0.25) {
      const g = sc.rows.find((r) => r.kind === 'must' && r.m.level === 'gap');
      funnel.evidence++; ex.push({ p, c, km, min, kind: 'evidence', why: `요건 중 이력서에서 근거를 찾은 비율이 ${Math.round(sc.career * 100)}%예요.${g ? ` 필수 요건 "${g.t.slice(0, 40)}…"의 근거가 없어요.` : ''}` }); continue;
    }
    const days = c.office ?? 5;
    const mode = setup.mode;
    let modeF = 1;
    if (c.office == null) modeF = 0.9;
    else if (mode === 'remote') modeF = days <= 1 ? 1 : days >= 5 ? 0.6 : 0.8;
    else if (mode === 'hybrid') modeF = days <= 3 ? 1 : 0.8;
    if (workFlex === 1 && c.office != null && days >= 5) modeF *= 0.8;
    if (transfers != null) modeF *= 1 - 0.05 * Math.min(transfers, 3); // 환승이 많을수록 생활 부담이 커집니다.
    const burden = min / setup.maxMin;
    const life = clamp((1 - 0.85 * burden * (0.4 + 0.6 * (days / 5))) * modeF, 0, 1);
    const indM = setup.inds.length ? (setup.inds.includes(c.ind) ? 1 : 0.2) : 0.5;
    const scopeM = scope ? (scope === 'explore') === sc.explore ? 1 : 0.3 : 0.5;
    const roleM = adjacent ? 0.5 : 1;
    const pref = 0.4 * indM + 0.3 * scopeM + 0.3 * roleM;
    const total = (W.career * sc.career + W.life * life + W.pref * pref) / wsum;
    ok.push({ p, c, km, min, minSrc, transfers, fare: tr ? tr.fare : null, days, adjacent, unknownDays: c.office == null, sc, career: sc.career, life, pref, total, contrib: { career: (W.career * sc.career) / wsum, life: (W.life * life) / wsum, pref: (W.pref * pref) / wsum } });
  }
  ok.sort((a, b) => b.total - a.total);
  funnel.left = ok.length;
  return { ok, ex, funnel, an };
}

export const DIM = { career: '직무 적합도', life: '생활 적합도', pref: '선호 적합도' };
export function explainDecision(o, list) {
  const items = [];
  const b = o.sc;
  items.push({ ok: true, t: `핵심 업무 ${b.mustN}개 중 ${b.mustHit}개가 실제 경험과 연결돼요.` });
  const best = b.rows.filter((r) => r.m.level === 'match')[0];
  if (best) items.push({ ok: true, t: `"${best.t.slice(0, 32)}…" 요건이 이력서 경험과 높은 수준으로 일치해요.` });
  items.push({ ok: true, t: `편도 약 ${o.min}분(${o.minSrc === 'transit' ? `대중교통${o.transfers != null ? `, 환승 ${o.transfers}회` : ''}` : '직선거리 추정'}), ${o.unknownDays ? '출근 정책은 확인되지 않아 주 5일로 가정했어요' : `주 ${o.days}회 출근이에요`}.` });
  const g = b.rows.find((r) => r.kind === 'must' && r.m.level !== 'match');
  if (g) items.push({ ok: false, t: g.m.gap ? `경력 ${g.m.gap.need}년 이상 요건이 있어요. 지원서에서 유사 경험으로 보완 설명이 필요해요.` : `"${g.t.slice(0, 32)}…" 관련 경험은 지원서에서 보완 설명이 필요해요.` });
  let judge = `현재까지의 선택 과정에서 ${DIM[Object.entries(o.contrib).sort((a, b2) => b2[1] - a[1])[0][0]]}를 가장 크게 반영했습니다. 현재 기준에서는 ${o.c.name}의 “${o.p.title.split(' - ')[0]}” 포지션을 우선적으로 고려해 볼 수 있습니다.`;
  if (list && list[1]) {
    let bestK = null, gap = -1;
    Object.keys(DIM).forEach((k) => { const d = o.contrib[k] - list[1].contrib[k]; if (d > gap) { gap = d; bestK = k; } });
    if (bestK && gap > 0.005) judge += ` 2순위 “${list[1].p.title.split(' - ')[0]}”보다 ${DIM[bestK]} 쪽에서 앞섭니다.`;
  }
  return { items, judge };
}

/* 통계용 헬퍼 */
export const progressOf = (state) => {
  let p = 0;
  if (state.setup.home) p += 25;
  if (state.resume && state.resume.length > 30) p += 25;
  if (state.iv.answers.length >= 3) p += 30;
  if (state.visited.jobs) p += 10;
  if (state.visited.decision) p += 10;
  return p;
};
export { COMPANIES };
