// 카카오맵 REST API (서버 전용). REST API 키는 서버 환경변수 KAKAO_REST_API_KEY 에만 둡니다.
//  - 대중교통 경로 조회: GET https://dapi.kakao.com/v2/routing/publictraffic
//  - 주소로 좌표 변환 / 키워드로 장소 검색: GET https://dapi.kakao.com/v2/local/search/{address|keyword}.json
const BASE = 'https://dapi.kakao.com';

async function kget(key, path, params) {
  const u = new URL(BASE + path);
  Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, String(v)));
  const r = await fetch(u, { headers: { Authorization: `KakaoAK ${key}` }, signal: AbortSignal.timeout(8000), cache: 'no-store' });
  let j = null;
  try { j = await r.json(); } catch (e) { /* JSON 이 아니면 null */ }
  return { ok: r.ok, http: r.status, j };
}

const minOf = (sec) => (sec > 0 ? Math.max(1, Math.round(sec / 60)) : 0);

// 경로의 단계(steps)를 화면에 그릴 구간 목록으로 바꿉니다.
// guidance 예: "마을 76 (판교역동편 > 성남시청전면)" → 이름 "마을 76", 승차 "판교역동편", 하차 "성남시청전면"
function toLegs(steps) {
  return (steps || []).map((st) => {
    const p = st.properties || {};
    const stops = (p.stops || []).map((x) => x && x.name).filter(Boolean);
    const veh = (p.vehicles || [])[0];
    const g = String(p.guidance || '');
    const m = g.match(/^(.*?)\s*\((.+?)\s*>\s*(.+?)\)\s*$/);
    const type = p.type === 'BUS' || p.type === 'SUBWAY' || p.type === 'WALKING' ? p.type : 'ETC';
    let label = m ? m[1].trim() : veh ? [veh.type, veh.name].filter(Boolean).join(' ') : g;
    if (type === 'WALKING' && !label) label = '도보';
    return {
      type, label,
      from: m ? m[2].trim() : stops[0] || '',
      to: m ? m[3].trim() : stops.length > 1 ? stops[stops.length - 1] : '',
      n: stops.length > 1 ? stops.length - 1 : null,
      min: minOf(p.time || 0),
      sec: p.time || 0,
    };
  });
}

// 출발지 → 도착지 대중교통. 후보 경로 중 가장 빠른 경로의 소요 시간(분)·환승·요금과, 구간별 이동 수단을 돌려줍니다.
// 좌표는 [위도, 경도] 순서로 받아 카카오 규격(x=경도, y=위도)으로 바꿉니다.
export async function transit(key, from, to) {
  const { ok, http, j } = await kget(key, '/v2/routing/publictraffic', {
    start_x: from[1], start_y: from[0], s_name: '출발', end_x: to[1], end_y: to[0], e_name: '도착',
  });
  if (!ok) return { status: 'ERROR', http, msg: (j && (j.message || j.msg)) || '' };
  if (!j || j.status !== 'OK' || !Array.isArray(j.routes) || !j.routes.length) return { status: (j && j.status) || 'NO_RESULTS' };
  const sorted = [...j.routes].sort((a, b) => a.properties.totalTime - b.properties.totalTime);
  const best = sorted[0];
  const p = best.properties;
  const legs = toLegs(best.steps);
  // 구간 시간의 합이 총 시간보다 작으면, 그 차이는 출발·도착 도보나 대기 시간으로 볼 수 있어요.
  const stepSum = legs.reduce((a, l) => a + l.sec, 0);
  const otherMin = Math.max(0, Math.round((p.totalTime - stepSum) / 60));
  const kind = (r) => ({ BUS: '버스', SUBWAY: '지하철', BUS_AND_SUBWAY: '버스+지하철' })[r.properties.type] || '대중교통';
  return {
    status: 'OK',
    min: Math.max(1, Math.round(p.totalTime / 60)),
    transfers: typeof p.transfers === 'number' ? p.transfers : null,
    fare: p.fare && typeof p.fare.value === 'number' ? p.fare.value : null,
    type: p.type || null,
    km: Math.round(p.totalDistance / 100) / 10,
    landingURL: (j.properties && j.properties.landingURL) || null,
    legs: legs.map(({ sec, ...rest }) => rest),
    otherMin,
    alts: sorted.slice(1, 3).map((r) => ({ kind: kind(r), min: Math.max(1, Math.round(r.properties.totalTime / 60)), transfers: r.properties.transfers ?? null })),
  };
}

// 주소(구·역·도로명) → 좌표. 주소 검색에 없으면 키워드(역 이름 등) 검색으로 한 번 더 찾습니다.
export async function geocodeKakao(key, q) {
  const a = await kget(key, '/v2/local/search/address.json', { query: q, size: 1 });
  if (a.ok && a.j && a.j.documents && a.j.documents[0]) {
    const d = a.j.documents[0];
    return { ll: [+d.y, +d.x], label: d.address_name, src: '카카오 주소 검색' };
  }
  const k = await kget(key, '/v2/local/search/keyword.json', { query: q, size: 1 });
  if (k.ok && k.j && k.j.documents && k.j.documents[0]) {
    const d = k.j.documents[0];
    return { ll: [+d.y, +d.x], label: d.road_address_name || d.address_name || d.place_name, src: '카카오 장소 검색' };
  }
  if (!a.ok && (a.http === 401 || a.http === 403)) return { error: 'auth', http: a.http };
  return null;
}
