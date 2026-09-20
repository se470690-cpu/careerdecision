import { POSTINGS } from '../../../lib/data';
import { fetchDaangn } from '../../../lib/daangn';
import { fetchGreeting } from '../../../lib/greeting';

export const dynamic = 'force-dynamic';

// 회사별 수집기. 새 회사는 여기에 한 줄 추가하면 됩니다.
const SOURCES = [
  { companyId: 'daangn', run: () => fetchDaangn() },
  { companyId: 'catchtable', run: () => fetchGreeting({ base: 'https://career.catchtable.co.kr', companyId: 'catchtable', listPath: '/ko/jobs' }) },
  { companyId: 'kakaomobility', run: () => fetchGreeting({ base: 'https://kakaomobility.career.greetinghr.com', companyId: 'kakaomobility', listPath: '/ko/guide' }) },
  { companyId: 'yeogi', run: () => fetchGreeting({ base: 'https://gccompany.career.greetinghr.com', companyId: 'yeogi', listPath: '/ko/apply' }) },
  { companyId: 'kakaoent', run: () => fetchGreeting({ base: 'https://careers.kakaoenterprise.com', companyId: 'kakaoent', listPath: '/ko/job' }) },
];

let cache = { at: 0, data: null };
const TTL = 60 * 60 * 1000;
const snapshot = () => ({ postings: POSTINGS, live: false, liveCompanies: [], fetchedAt: '2026-09-19' });

export async function GET() {
  // LIVE_DAANGN 은 이전 이름이라 같이 인정합니다.
  if (process.env.LIVE_COLLECT !== '1' && process.env.LIVE_DAANGN !== '1') return Response.json(snapshot());
  if (cache.data && Date.now() - cache.at < TTL) return Response.json(cache.data);

  const results = await Promise.allSettled(SOURCES.map((s) => s.run()));
  let postings = [...POSTINGS];
  const liveCompanies = [];
  results.forEach((r, i) => {
    // 회사 스냅샷이 없으면 1개 이상, 있으면 3개 이상 읽었을 때만 실시간 결과로 교체합니다.
    const hasSnap = POSTINGS.some((p) => p.companyId === SOURCES[i].companyId);
    if (r.status === 'fulfilled' && r.value.length >= (hasSnap ? 3 : 1)) {
      const id = SOURCES[i].companyId;
      postings = [...postings.filter((p) => p.companyId !== id), ...r.value];
      liveCompanies.push(id);
    }
  });
  const data = liveCompanies.length
    ? { postings, live: true, liveCompanies, fetchedAt: new Date().toISOString().slice(0, 10) }
    : snapshot();
  if (liveCompanies.length) cache = { at: Date.now(), data };
  return Response.json(data);
}
