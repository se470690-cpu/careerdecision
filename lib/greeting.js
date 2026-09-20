// 그리팅(Greeting) 채용 페이지 수집기. career.<회사>.co.kr/ko/jobs 형태의 사이트에서
// 목록(/ko/o/<id> 링크) → 상세 → { does, must, nice } 로 변환합니다.
// 서버 렌더링 HTML 구조를 전제로 하며, 마크업이 바뀌면 빈 결과를 내고 /api/postings 가 스냅샷으로 되돌아갑니다.
import { htmlToLines, roleOf } from './daangn';
import { isAllowed } from './robots';

const UA = 'CareerDecisionBot/0.1 (personal portfolio project)';

// 회사·공고마다 섹션 이름이 조금씩 달라서 여러 표현을 받아 줍니다. 제목처럼 짧은 줄에만 적용합니다.
const H_DOES = /(주요\s*업무|담당\s*업무|하시는\s*일|이런\s*일을|이런\s*업무를|합류.*(업무|일을))/;
const H_MUST = /(자격\s*요건|필수\s*(요건|사항)|지원\s*자격|이런\s*분을\s*찾고|이런\s*동료를\s*기다립니다)/;
const H_NICE = /(우대\s*(요건|사항)|이런\s*경험이\s*있다면|이런\s*분이면\s*더|더\s*좋아요|더욱\s*좋습니다)/;
// "이런 분과 함께 하고 싶어요": 캐치테이블에서는 문화 소개(중지)지만 여기어때에서는 필수 요건입니다.
// 필수·우대 항목이 아직 하나도 없을 때 나오면 필수 요건으로 봅니다.
const H_TOGETHER = /이런\s*분과\s*함께/;
const H_STOP = /(소개해요|소개합니다|이렇게\s*합류|꼭\s*확인|확인해\s*주세요|채용\s*원칙|혜택\s*및\s*복지|유의\s*사항|합류\s*여정|영입\s*여정|팀\s*소개|팀을\s*소개|크루의\s*한마디|채용\s*절차|전형\s*절차|근무\s*조건|지원\s*전|Contact)/;

const uniq = (a) => [...new Set(a)];
const ADDR = /(?:경기도|서울(?:특별시)?|인천|부산|대구|대전|광주|울산|세종|강원|충청|전라|경상|제주)[^\n,]{2,40}?\d+(?:-\d+)?(?:,\s*[^\n]{2,30}?(?:호|층))?/;

export function parseGreetingPosting(html, { base, companyId, id, source }) {
  const lines = htmlToLines(html).map((l) => l.replace(/[\u200b-\u200d\ufeff]/g, '').replace(/[*_]{2,}/g, '').trim()).filter(Boolean);
  const meta = (html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) || [])[1]
    || (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
  const title = meta.replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim();
  if (!title) return null;

  // 헤더(경력·고용형태·근무지)는 마크업이 달라도 읽히도록 라벨 뒤 텍스트에서 패턴으로 찾습니다.
  const flat = lines.join(' ');
  const at = (label, len) => { const i = flat.indexOf(label); return i >= 0 ? flat.slice(i + label.length, i + label.length + len) : ''; };
  const career = (at('경력사항', 30).match(/경력\s*무관|경력\s*\d+(?:\s*~\s*\d+)?\s*년(?:\s*이상)?|신입/) || [''])[0];
  const type = (at('고용형태', 20).match(/정규직|계약직|인턴/) || ['정규직'])[0];
  const address = (at('근무지', 200).match(ADDR) || [''])[0].replace(/^(서울|경기|인천)?대한민국\s*/, '');

  const sec = { does: [], must: [], nice: [] };
  let cur = null;
  for (const l of lines) {
    if (l.startsWith('• ')) { if (cur) sec[cur].push(l.slice(2).trim()); continue; }
    if (l.length > 45) continue; // 본문 문장은 제목으로 보지 않습니다.
    if (H_TOGETHER.test(l)) cur = !sec.must.length && !sec.nice.length ? 'must' : null;
    else if (H_STOP.test(l)) cur = null;
    else if (H_DOES.test(l)) cur = 'does';
    else if (H_MUST.test(l)) cur = 'must';
    else if (H_NICE.test(l)) cur = 'nice';
    else if (/^\[.+\]$/.test(l)) cur = null; // 그 밖의 대괄호 섹션(회사·서비스 소개 등)
  }
  // 페이지에 본문이 두 번 들어 있는 경우가 있어 중복을 제거합니다.
  const does = uniq(sec.does), must = uniq(sec.must), nice = uniq(sec.nice);
  if (!must.length && !does.length) return null;

  // 헤더의 "경력 N년 이상"을 요건으로 올려 경력 비교에 쓰이게 합니다.
  const ym = career.match(/(\d+)\s*년\s*이상/);
  const rm = career.match(/(\d+)\s*~\s*(\d+)\s*년/);
  if (ym && !must.some((m) => new RegExp(`${ym[1]}\\s*년\\s*이상`).test(m))) must.unshift(`경력 ${ym[1]}년 이상 (공고 헤더 기준)`);
  else if (rm && +rm[1] > 0 && !must.some((m) => new RegExp(`${rm[1]}\\s*년\\s*이상`).test(m))) must.unshift(`경력 ${rm[1]}년 이상 (공고 헤더 기준: ${rm[1]}~${rm[2]}년)`);

  return {
    id: `${companyId}-${id}`, companyId, role: roleOf(title), title, team: '', type,
    url: `${base}/ko/o/${id}`, deadline: null, fetchedAt: new Date().toISOString().slice(0, 10), source,
    locNote: address ? `공고 근무지: ${address}` : undefined, does, must, nice,
  };
}

async function getText(url) {
  if (!(await isAllowed(url))) throw new Error(`robots.txt 가 허용하지 않아요: ${url}`);
  const r = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html' }, next: { revalidate: 3600 } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function fetchGreeting({ base, companyId, listPath = '/ko/jobs', limit = 40 }) {
  const source = `${new URL(base).host} (실시간 수집)`;
  const listHtml = await getText(`${base}${listPath}`);
  // 인재풀 등록·사외 추천처럼 실제 공고가 아닌 항목은 제외
  const items = [...listHtml.matchAll(/<a[^>]+href=["'][^"']*\/ko\/o\/(\d+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map((m) => ({ id: m[1], text: m[2].replace(/<[^>]+>/g, ' ') }))
    .filter((x) => !/인재풀|Talent\s*Pool|사외\s*추천/i.test(x.text));
  const ids = [...new Set(items.map((x) => x.id))].slice(0, limit);
  const out = [];
  for (let i = 0; i < ids.length; i += 4) {
    const batch = await Promise.all(ids.slice(i, i + 4).map(async (id) => {
      try { return parseGreetingPosting(await getText(`${base}/ko/o/${id}`), { base, companyId, id, source }); } catch { return null; }
    }));
    out.push(...batch.filter(Boolean));
    await sleep(200);
  }
  return out;
}
