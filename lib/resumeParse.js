import { conceptsOf } from './concepts';

// 이력서 텍스트를 "줄"이 아니라 "경험 단위"로 이해합니다.
//  1) PDF 에서 줄바꿈으로 잘린 문장을 다시 이어 붙이고(reflow)
//  2) 회사·직무·기간, 프로젝트 제목, Problem/Action/Result 구조를 묶어서(blocks)
//  3) 각 경험의 성과 수치를 뽑습니다.

const STAR = /^(Problem|Action|Result|Situation|Task)(?=\s|[:：])\s*[:：-]?\s*/i;
const STAR_KO = /^(문제|행동|결과|성과|과제|해결)\s*[:：]\s*/;
const BULLET = /^[•·▪●■◦]\s*|^[-–—*]\s+/;
const DATE_RE = /^\d{4}[.\-/]\d{1,2}(\s*[~\-–—]\s*(\d{4}[.\-/]\d{1,2}|현재|재직\s*중|진행\s*중))?/;
const SECTION = /^(Skills?|Side Projects?|Projects?|Education|Experience|Work Experience|Certifications?|Awards?|Languages?|경력|경력\s*사항|학력|프로젝트|사이드\s*프로젝트|스킬|기술|보유\s*기술|자격증|수상|활동)\s*$/i;
const ROLE_WORDS = /(PM|PO|Product|Manager|Owner|Planner|Intern|Engineer|Developer|Designer|Analyst|Operator|Lead|기획|운영|인턴|개발|디자인|분석|매니저|담당)/i;
const LABEL_DASH = /^[A-Za-z가-힣0-9 &/·]{2,32}\s-\s/;
const TERMINAL = /([.!?。:]|(습니다|입니다|했다|이다|였다))\s*$/;

const isHeader = (l) => /\s\|\s/.test(l) && !DATE_RE.test(l) && l.length <= 100 && ROLE_WORDS.test(l);

function startsNewUnit(l) {
  return BULLET.test(l) || STAR.test(l) || STAR_KO.test(l) || DATE_RE.test(l) || SECTION.test(l) || isHeader(l) || LABEL_DASH.test(l);
}

// PDF 는 문단 폭에서 줄이 바뀝니다. 폭 가까이 찬 줄이 문장 부호 없이 끝나면 다음 줄과 이어 붙입니다.
export function reflowLines(text, ratio = 0.86) {
  const lines = String(text || '').split(/\r?\n/).map((l) => l.replace(/[ \t]+/g, ' ').trim()).filter(Boolean);
  if (lines.length < 4) return lines;
  const lens = lines.filter((l) => !isHeader(l) && !SECTION.test(l)).map((l) => l.length).sort((a, b) => a - b);
  const W = lens[Math.floor(lens.length * 0.9)] || 60;
  const out = [];
  let lastLen = 0;
  for (const l of lines) {
    const prev = out[out.length - 1];
    const canJoin = prev && !startsNewUnit(l) && lastLen >= W * ratio && !TERMINAL.test(prev)
      && !isHeader(prev) && !SECTION.test(prev) && !DATE_RE.test(prev);
    if (canJoin) out[out.length - 1] = `${prev} ${l}`;
    else out.push(l);
    lastLen = l.length;
  }
  return out;
}

// 성과 수치가 들어 있는 짧은 구절을 뽑습니다. 예: "시즌성 No Result 검색어 비중 약 40% 감소"
export function extractMetrics(text) {
  const out = [];
  const re = /[^,.;·]{0,26}?\d+(?:\.\d+)?\s?(?:%|배|건|시간|분|명)[^,.;·]{0,10}/g;
  for (const m of String(text).matchAll(re)) {
    const s = m[0].replace(/^\s+|\s+$/g, '');
    if (s.length >= 4 && !out.includes(s)) out.push(s);
  }
  return out.slice(0, 4);
}

export function extractHints(text) {
  const t = String(text || '');
  const hints = {};
  const y = t.match(/경력\s*(\d+)\s*년(?:\s*(\d+)\s*개월)?/);
  if (y) hints.years = { years: +y[1], months: y[2] ? +y[2] : 0, label: `${y[1]}년${y[2] ? ` ${y[2]}개월` : ''}` };
  const a = t.match(/((?:서울(?:특별시)?|경기도?|인천(?:광역시)?)\s*[가-힣]+(?:구|시|군))\s*(?:거주|\||$)/m) || t.match(/([가-힣]+구)\s*거주/);
  if (a) hints.addr = a[1].replace(/특별시|광역시/g, '').trim();
  return hints;
}

export function parseResume(text) {
  const units = reflowLines(text);
  const blocks = [];
  let org = null, cur = null, section = '';
  const start = (b) => { cur = { id: blocks.length, org: '', role: '', period: '', title: '', problem: '', action: '', result: '', lines: [], kind: 'summary', section, ...b }; blocks.push(cur); return cur; };
  start({ kind: 'summary' });

  units.forEach((u, i) => {
    const next = units[i + 1] || '';
    if (SECTION.test(u)) { section = u.trim(); org = null; start({ kind: /skill|스킬|기술/i.test(u) ? 'skills' : 'section', title: u.trim() }); return; }
    if (isHeader(u)) {
      const [o, r] = u.split(/\s\|\s/).map((x) => x.trim());
      org = start({ kind: 'org', org: o, role: r });
      // 헤더 줄에 붙은 경력·거주지 같은 부가 정보는 요약으로 취급
      if (blocks.length === 2 && /경력|거주/.test(u)) { org.kind = 'summary'; org.org = ''; org.role = ''; org.lines.push(u); }
      return;
    }
    if (DATE_RE.test(u)) {
      const [d, ...rest] = u.split(/\s\|\s/);
      const holder = org || cur;
      if (holder && !holder.period) holder.period = d.trim();
      if (rest.length) (org || cur).lines.push(rest.join(' | ').trim());
      return;
    }
    const star = u.match(STAR) || u.match(STAR_KO);
    if (star) {
      const kind = star[1].toLowerCase();
      const body = u.slice(star[0].length).trim();
      if (cur && cur.kind === 'project') {
        if (/problem|situation|task|문제|과제/.test(kind)) { cur.problem = body; cur.last = 'problem'; }
        else if (/action|행동|해결/.test(kind)) { cur.action = body; cur.last = 'action'; }
        else { cur.result = body; cur.last = 'result'; }
      } else cur.lines.push(body);
      return;
    }
    // 프로젝트 제목: 짧고 문장 부호가 없으며 바로 다음 줄이 Problem/Action 이다.
    if (u.length <= 40 && !TERMINAL.test(u) && (STAR.test(next) || STAR_KO.test(next)) && org) {
      start({ kind: 'project', org: org.org, role: org.role, period: org.period, title: u });
      return;
    }
    const plain = u.replace(BULLET, '');
    if (cur && cur.kind === 'project' && cur.last) { cur[cur.last] += ` ${plain}`; return; } // 줄이 덜 채워져 이어 붙지 못한 꼬리 문장
    (cur || start({})).lines.push(plain);
  });

  const out = blocks.filter((b) => b.lines.length || b.problem || b.action || b.result || b.kind === 'org').map((b, idx) => {
    const parts = [b.title, b.problem, b.action, b.result, ...b.lines].filter(Boolean);
    const text2 = parts.join(' ');
    const label = [b.org, b.title || b.role].filter(Boolean).join(' · ') || (b.kind === 'summary' ? '자기소개·요약' : b.title || '');
    const metricSrc = [b.result || b.action, ...b.lines].join(' ');
    return { ...b, id: idx, label, text: text2, cs: [...conceptsOf(`${b.role} ${text2}`)], metrics: extractMetrics(metricSrc) };
  });
  // 검색·매칭에 쓰는 "문장 단위": 블록 안의 각 조각을 블록 라벨과 함께 보관합니다.
  const sentUnits = [];
  out.forEach((b) => {
    const pieces = [b.problem, b.action, b.result, ...b.lines].filter(Boolean);
    if (b.role) pieces.unshift(`${b.org} ${b.role}`);
    pieces.forEach((s) => sentUnits.push({ s, b: b.id, label: b.label, cs: [...conceptsOf(s)] }));
  });
  return { units: sentUnits, blocks: out, hints: extractHints(text) };
}
