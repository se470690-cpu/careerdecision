// 당근 채용 페이지(careers.daangn.com) 실시간 수집기.
// 공고 목록·상세가 서버 렌더링 HTML로 내려오는 것을 확인한 구조를 전제로 하며,
// 마크업이 바뀌면 파서가 빈 결과를 낼 수 있습니다. 그 경우 /api/postings 는 스냅샷으로 되돌아갑니다.

import { isAllowed } from './robots';

const BASE = 'https://careers.daangn.com';
const UA = 'CareerDecisionBot/0.1 (personal portfolio project)';

export function htmlToLines(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<\/(li|p|h1|h2|h3|h4|div|section|ul|ol|tr|blockquote)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .split('\n').map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
}

const H_DOES = /^이런 일을 해요/;
const H_MUST = /^이런 분(을 찾고 있어요|과 함께하고 싶어요)/;
const H_NICE = /^이런 분이면 더 좋아요/;
const H_STOP = /^(이렇게 합류해요|참고해 주세요|팀 동료들의 한마디|연관 공고|연관 콘텐츠|이 역할에서 얻을 수 있는 것|지원하기|목록으로 돌아가기)/;

export function roleOf(title) {
  if (/Sales|경영지원|HRBP|ER Manager|Legal|Finance|법무|재무|영업|마케터|Marketing|Business Development|사업개발|회계/i.test(title)) return 'etc';
  if (/Designer|Design Engineer|디자인|Illustrator/i.test(title)) return 'design';
  if (/Machine Learning|Engineer|Developer|개발/i.test(title)) return 'dev';
  if (/Data|분석|Analyst/i.test(title)) return 'data';
  if (/Product Manager|Product Owner|프로덕트\s*매니저|기획|\bPM\b/i.test(title) && !/Operation|오퍼레이션/i.test(title)) return 'plan';
  if (/Operation|Operator|Trust|운영|오퍼레이션|CX|Manager|매니저/i.test(title)) return 'ops';
  return 'etc';
}

export function parseDaangnPosting(html, id) {
  const lines = htmlToLines(html);
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1];
  const title = (h1 ? h1.replace(/<[^>]+>/g, '') : '').replace(/&amp;/g, '&').trim();
  if (!title) return null;
  const sec = { does: [], must: [], nice: [] };
  let cur = null;
  for (const l of lines) {
    if (H_DOES.test(l)) { cur = 'does'; continue; }
    if (H_MUST.test(l)) { cur = 'must'; continue; }
    if (H_NICE.test(l)) { cur = 'nice'; continue; }
    if (H_STOP.test(l)) { cur = null; continue; }
    if (cur && l.startsWith('• ')) sec[cur].push(l.slice(2).trim());
  }
  if (!sec.must.length && !sec.does.length) return null;
  const type = (lines.slice(0, 40).find((l) => /^(정규직|계약직|인턴)$/.test(l))) || '정규직';
  const dl = lines.join(' ').match(/(\d{1,2})월 (\d{1,2})일[^.]{0,20}마감/);
  const year = new Date().getFullYear();
  return {
    id: `daangn-${id}`, companyId: 'daangn', role: roleOf(title), title, team: (title.split(' - ')[1] || '').trim(), type,
    url: `${BASE}/jobs/role/${id}/`, deadline: dl ? `${year}-${String(dl[1]).padStart(2, '0')}-${String(dl[2]).padStart(2, '0')}` : null,
    fetchedAt: new Date().toISOString().slice(0, 10), source: 'careers.daangn.com (실시간 수집)',
    does: sec.does, must: sec.must, nice: sec.nice,
  };
}

async function getText(url) {
  if (!(await isAllowed(url))) throw new Error(`robots.txt 가 허용하지 않아요: ${url}`);
  const r = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html' }, next: { revalidate: 3600 } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
}

export async function fetchDaangn({ limit = 60 } = {}) {
  const listHtml = await getText(`${BASE}/jobs/`);
  const ids = [...new Set([...listHtml.matchAll(/\/jobs\/role\/(\d+)\/?/g)].map((m) => m[1]))].slice(0, limit);
  const out = [];
  for (let i = 0; i < ids.length; i += 5) {
    const batch = await Promise.all(ids.slice(i, i + 5).map(async (id) => {
      try { return parseDaangnPosting(await getText(`${BASE}/jobs/role/${id}/`), id); } catch { return null; }
    }));
    out.push(...batch.filter(Boolean));
  }
  return out;
}
