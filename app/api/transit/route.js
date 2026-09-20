import { transit } from '../../../lib/kakao';

export const dynamic = 'force-dynamic';

const inKorea = (p) => Array.isArray(p) && p.length === 2 && p[0] > 33 && p[0] < 39 && p[1] > 124 && p[1] < 132;

// POST { from:[lat,lng], targets:[{id, lat, lng}] } → { results: { [id]: { status, min, transfers, fare, ... } } }
// 사용자가 화면에서 "대중교통 시간으로 계산하기"를 눌렀을 때만 호출됩니다. 출발지 좌표는 저장하지 않고 카카오로만 전달해요.
export async function POST(req) {
  const key = process.env.KAKAO_REST_API_KEY;
  if (!key) return Response.json({ error: '카카오 API 키가 서버에 설정되지 않았어요.' }, { status: 501 });
  let body;
  try { body = await req.json(); } catch (e) { return Response.json({ error: 'bad request' }, { status: 400 }); }
  const from = body.from;
  const targets = (body.targets || []).slice(0, 20).filter((t) => t && typeof t.id === 'string' && inKorea([t.lat, t.lng]));
  if (!inKorea(from) || !targets.length) return Response.json({ error: 'invalid coordinates' }, { status: 400 });

  const results = {};
  let auth = false;
  // 동시에 4개씩만 호출
  for (let i = 0; i < targets.length; i += 4) {
    await Promise.all(targets.slice(i, i + 4).map(async (t) => {
      try {
        const r = await transit(key, from, [t.lat, t.lng]);
        if (r.status === 'ERROR' && (r.http === 401 || r.http === 403)) auth = true;
        results[t.id] = r;
      } catch (e) {
        results[t.id] = { status: 'ERROR', msg: 'timeout' };
      }
    }));
  }
  if (auth) return Response.json({ error: '카카오 API 권한 오류예요. 앱 설정에서 카카오맵 사용이 켜져 있는지, REST API 키가 맞는지 확인해 주세요.' }, { status: 502 });
  return Response.json({ results });
}
