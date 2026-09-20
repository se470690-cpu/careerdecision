import { COMPANIES, COMPANY_BY_ID, ROLES } from './data';
import { CONCEPTS, conceptsOf, bigrams } from './concepts';
import { parseResume } from './resumeParse';
import { josa } from './ko';

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
  let need = '이력서에서 직무와 관련된 내용을 충분히 찾지 못했어요. 담당 업무와 성과를 문장으로 더 적어 주세요.';
  if (has('ops_process') && (has('planning') || has('improve')) && (has('data') || has('sql'))) {
    need = '운영만 하기보다, 문제를 찾아서 서비스를 고치는 쪽으로 커리어를 넓히고 싶은 것 같아요.';
  } else if (top.length) {
    need = `${top[0].label} 경험이 가장 눈에 띄어요. 이 방향의 공고에서 근거를 가장 많이 댈 수 있어요.`;
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
  q1: { lead: '먼저 가볍게 하나만 골라 볼게요', q: '둘 중 하나만 고를 수 있다면요?', a: { t: '하고 싶은 일이 많지만', s: '출퇴근 60분 · 주 5일 출근' }, b: { t: '일은 조금 덜 맞지만', s: '출퇴근 30분 · 주 2회 출근' } },
  q2a: { lead: '일에서 얼마나 배우고 싶은지 볼게요', q: '하고 싶은 일이라면, 주 5일 출근이어도 괜찮으세요?', a: { t: '네, 일이 맞으면 괜찮아요', s: '출근 횟수보다 일의 내용' }, b: { t: '아니요, 주 2~3회는 돼야 해요', s: '일하는 방식도 조건이에요' } },
  q2b: { lead: '출퇴근이 얼마나 중요한지 볼게요', q: '집에서 가깝지만 배울 게 적은 곳이라면요?', a: { t: '가까우니까 그냥 갈래요', s: '생활이 안정되는 게 먼저예요' }, b: { t: '50분 걸려도 배울 게 많은 곳', s: '성장할 기회가 먼저예요' } },
  q3: { lead: '어떤 역할이 끌리는지 볼게요', q: '둘 중 어떤 역할이 더 끌려요?', a: { t: '문제를 정의하는 것부터 하는 역할', s: '범위가 넓고 정해진 답이 없어요' }, b: { t: '이미 있는 운영을 넓혀 가는 역할', s: '기준이 분명하고 안정적이에요' } },
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
export const TOP_LABEL = { growth: '성장', commute: '출퇴근 거리', worklife: '워라밸', mode: '근무 방식' };

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
    ok.push({ p, c, km, min, minSrc, transfers, fare: tr ? tr.fare : null, route: tr, days, adjacent, unknownDays: c.office == null, sc, career: sc.career, life, pref, total, contrib: { career: (W.career * sc.career) / wsum, life: (W.life * life) / wsum, pref: (W.pref * pref) / wsum } });
  }
  ok.sort((a, b) => b.total - a.total);
  funnel.left = ok.length;
  return { ok, ex, funnel, an };
}

export const DIM = { career: '직무 적합도', life: '생활 적합도', pref: '선호 적합도' };
export function explainDecision(o, list) {
  const items = [];
  const b = o.sc;
  items.push({ ok: true, t: `핵심 요건 ${b.mustN}개 중 ${b.mustHit}개를 내 경험으로 설명할 수 있어요.` });
  const best = b.rows.filter((r) => r.m.level === 'match')[0];
  if (best) items.push({ ok: true, t: `"${best.t.slice(0, 32)}…" 요건은 이력서 경험과 거의 맞아요.` });
  items.push({ ok: true, t: `편도 약 ${o.min}분(${o.minSrc === 'transit' ? `대중교통${o.transfers != null ? `, 환승 ${o.transfers}회` : ''}` : '직선거리 추정'}), ${o.unknownDays ? '출근 정책을 확인하지 못해서 주 5일로 계산했어요' : `주 ${o.days}회 출근이에요`}.` });
  const g = b.rows.find((r) => r.kind === 'must' && r.m.level !== 'match');
  if (g) items.push({ ok: false, t: g.m.gap ? `경력 ${g.m.gap.need}년 이상을 요구해요. 지원서에서 비슷한 경험으로 보완해 설명하세요.` : `"${g.t.slice(0, 32)}…" 관련 경험은 지원서에서 더 설명해야 해요.` });
  let judge = `지금까지 고른 걸 보면 ${DIM[Object.entries(o.contrib).sort((a, b2) => b2[1] - a[1])[0][0]]}를 가장 중요하게 봤어요. 그 기준으로는 ${o.c.name}의 “${o.p.title}” 자리를 먼저 살펴보시는 게 좋아 보여요.`;
  if (list && list[1]) {
    let bestK = null, gap = -1;
    Object.keys(DIM).forEach((k) => { const d = o.contrib[k] - list[1].contrib[k]; if (d > gap) { gap = d; bestK = k; } });
    if (bestK && gap > 0.005) judge += ` 2순위 “${list[1].p.title}”보다 ${DIM[bestK]} 쪽에서 앞서요.`;
  }
  return { items, judge };
}


/* ───────────── 추천 이유 설계: 계산에 실제로 쓴 값에서만 설명을 만듭니다 ───────────── */
export const PRESETS = [
  ['균형 있게', { career: 40, life: 30, pref: 30 }],
  ['성장 우선', { career: 60, life: 15, pref: 25 }],
  ['출퇴근 우선', { career: 25, life: 55, pref: 20 }],
  ['선호 우선', { career: 25, life: 20, pref: 55 }],
];

// "어디서 타서 어디서 내리는지"를 순서대로 풀어 씁니다.
export function routeSummary(route) {
  if (!route || !route.legs || !route.legs.length) return null;
  const rides = route.legs.filter((l) => l.type === 'BUS' || l.type === 'SUBWAY');
  if (!rides.length) return null;
  const place = (l, w) => (l.type === 'SUBWAY' && w && !/역$/.test(w) ? `${w}역` : l.type === 'BUS' && w && !/정류장$/.test(w) ? `${w} 정류장` : w);
  const name = (l) => l.label || (l.type === 'SUBWAY' ? '지하철' : '버스');
  const steps = rides.map((l, i) => (i === 0 ? `${place(l, l.from)}에서 ${name(l)} 승차` : `${place(l, l.from)}에서 ${name(l)}${josa(name(l), '으로/로')} 갈아타기`));
  const last = rides[rides.length - 1];
  steps.push(`${place(last, last.to)}에서 하차`);
  return { steps, board: steps[0], alight: steps[steps.length - 1], chain: rides.map(name).join(' → ') };
}

const shortT = (t, n = 34) => (t.length > n ? t.slice(0, n) + '…' : t);
const SEV = { no: 0, warn: 1, info: 2 };

// 가중치를 바꿔 봐도 1순위가 유지되는지 확인합니다.
export function stabilityCheck(input, postings, topId) {
  return PRESETS.map(([label, W]) => {
    const t = computeAll({ ...input, W }, postings).ok[0];
    return { label, id: t ? t.p.id : null, name: t ? t.c.name : '-', title: t ? t.p.title : '', same: !!t && t.p.id === topId };
  });
}

export function explainRecommendation(o, list, ctx) {
  const { W, maxMin, years, stability } = ctx;
  const second = list && list[1];
  const rows = o.sc.rows;

  const parts = ['career', 'life', 'pref'].map((k) => ({ key: k, label: DIM[k], weight: W[k], value: Math.round(o[k] * 100), points: Math.round(o.contrib[k] * 100) }));

  // 이 공고가 맞는 이유: 실제 프로젝트·경력 문장으로 근거를 댈 수 있는 요건 위주
  const strong = rows.filter((r) => r.m.level === 'match' && r.m.sent && r.m.score >= 0.3);
  const withBlock = strong.filter((r) => r.m.block && r.m.block.kind !== 'summary');
  const rank = (r) => r.w * 10 + r.m.score * 3 + (r.m.block && r.m.block.metrics && r.m.block.metrics.length ? 4 : 0);
  const pool = (withBlock.length >= 2 ? withBlock : strong).sort((a, b) => rank(b) - rank(a));
  const seen = new Set();
  const picked = [];
  pool.forEach((r) => { const key = r.m.block ? r.m.block.label : r.t; if (picked.length < 3 && !seen.has(key)) { seen.add(key); picked.push(r); } }); // 같은 경험이 반복되지 않게
  const strengths = picked.map((r) => ({ req: r.t, kind: r.kind, sent: r.m.sent, block: r.m.block, metrics: r.m.block ? (r.m.block.metrics || []).slice(0, 2) : [] }));

  // 걸리는 점
  const risks = [];
  rows.filter((r) => r.kind === 'must' && r.m.gap).forEach((r) => risks.push({ level: 'no', text: `경력 ${r.m.gap.need}년 이상을 요구해요. 입력한 경력은 ${years}년이라, 지원서에서 비슷한 경험으로 메워야 해요.` }));
  rows.filter((r) => r.kind === 'must' && !r.m.gap && r.m.level !== 'match').slice(0, 2).forEach((r) => risks.push({ level: r.m.level === 'gap' ? 'no' : 'warn', text: `“${shortT(r.t)}” 요건은 ${r.m.level === 'gap' ? '이력서에서 근거를 찾지 못했어요' : '근거가 약해요'}.`, req: r.t }));
  if (o.minSrc === 'estimate') risks.push({ level: 'info', text: '통근시간은 직선거리로 추정한 값이에요. 실제 대중교통 시간은 다를 수 있어요.' });
  else if (o.min > maxMin * 0.8) risks.push({ level: 'warn', text: `통근이 ${o.min}분이라 허용시간(${maxMin}분)에 가까워요.` });
  if (o.transfers != null && o.transfers >= 2) risks.push({ level: 'warn', text: `환승이 ${o.transfers}회예요. 출근길이 번거로울 수 있어요.` });
  if (o.unknownDays) risks.push({ level: 'info', text: '공고에 출근 횟수가 없어서 주 5일로 계산했어요. 실제로는 다를 수 있어요.' });
  if (o.adjacent) risks.push({ level: 'info', text: '희망 직무와 결이 가까운 다른 직무예요.' });
  risks.sort((a, b) => SEV[a.level] - SEV[b.level]);

  // 2순위와 비교
  let versus = null;
  if (second) {
    const diff = (k) => Math.round((o.contrib[k] - second.contrib[k]) * 100);
    versus = {
      name: second.c.name, title: second.p.title, total: Math.round((o.total - second.total) * 100),
      dims: ['career', 'life', 'pref'].map((k) => ({ key: k, label: DIM[k], diff: diff(k) })),
      minDiff: second.min - o.min,
    };
  }

  // 확신도: 점수 차이, 요건 근거, 기준을 바꿔도 유지되는지, 데이터의 질
  const gapPts = second ? Math.round((o.total - second.total) * 100) : 99;
  const cover = o.sc.mustN ? o.sc.mustHit / o.sc.mustN : 0;
  const nStab = stability ? stability.length : 0;
  const stable = stability ? stability.filter((x) => x.same).length : null;
  let level = 'mid';
  if (gapPts >= 8 && cover >= 0.7 && (stable == null || stable >= 3)) level = 'high';
  else if (gapPts < 3 || cover < 0.4 || (stable != null && stable <= 1)) level = 'low';
  const reasons = [];
  reasons.push(second ? `2순위와 총점이 ${gapPts}점 차이 나요${gapPts < 3 ? ' (거의 박빙이에요)' : ''}.` : '비교할 다른 후보가 없어요.');
  reasons.push(`필수 요건 ${o.sc.mustN}개 중 ${o.sc.mustHit}개를 내 경험으로 설명할 수 있어요.`);
  if (stable != null) reasons.push(`기준을 바꿔 본 ${nStab}가지 중 ${stable}가지에서도 1순위예요.`);
  if (o.minSrc === 'estimate') reasons.push('통근시간이 실제 경로가 아니라 직선거리 추정이에요.');
  if (o.c.v === 0) reasons.push('회사 위치가 정확한 주소가 아니라 지역 기준이에요.');
  reasons.push('요건 매칭은 키워드와 문장 구조를 보는 방식이라, 소프트 스킬은 점수가 후하게 나올 수 있어요.');
  const LABEL = { high: '꽤 확실해요', mid: '보통이에요', low: '아직 확신하기 어려워요' };

  // 지원서에 이렇게 써 보세요
  const tips = [];
  strengths.filter((x) => x.block).slice(0, 2).forEach((x) => tips.push(`지원서 앞부분에 “${x.block.label}” 경험을 쓰세요.${x.metrics[0] ? ` “${x.metrics[0]}” 같은 수치를 그대로 넣으면 더 설득력 있어요.` : ''}`));
  risks.filter((r) => r.req).slice(0, 2).forEach((r) => tips.push(`“${shortT(r.req, 28)}” 요건은 비슷한 경험이 있다면 한 문장이라도 구체적으로 적어서 보완하세요.`));
  if (risks.some((r) => r.level === 'no' && /경력/.test(r.text))) tips.push('경력 요건이 높아도 지원할 수는 있지만, 자기소개서에서 연차 대신 맡았던 역할의 크기를 보여 주세요.');

  const title = o.p.title;
  const headline = `“${title}” 자리가 지금 기준으로 1순위예요. 일이 맞는 정도는 ${parts[0].value}점이고, 출퇴근은 편도 ${o.min}분이에요.`;
  return { headline, parts, total: Math.round(o.total * 100), strengths, risks: risks.slice(0, 4), versus, confidence: { level, label: LABEL[level], reasons }, stability: stability || [], tips };
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
