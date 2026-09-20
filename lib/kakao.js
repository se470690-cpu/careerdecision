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

// 출발지 → 도착지 대중교통. 후보 경로 중 가장 빠른 경로의 소요 시간(분)·환승·요금을 돌려줍니다.
// 좌표는 [위도, 경도] 순서로 받아 카카오 규격(x=경도, y=위도)으로 바꿉니다.
export async function transit(key, from, to) {
  const { ok, http, j } = await kget(key, '/v2/routing/publictraffic', {
    start_x: from[1], start_y: from[0], s_name: '출발', end_x: to[1], end_y: to[0], e_name: '도착',
  });
  if (!ok) return { status: 'ERROR', http, msg: (j && (j.message || j.msg)) || '' };
  if (!j || j.status !== 'OK' || !Array.isArray(j.routes) || !j.routes.length) return { status: (j && j.status) || 'NO_RESULTS' };
  const best = j.routes.reduce((a, b) => (b.properties.totalTime < a.properties.totalTime ? b : a));
  const p = best.properties;
  return {
    status: 'OK',
    min: Math.max(1, Math.round(p.totalTime / 60)),
    transfers: typeof p.transfers === 'number' ? p.transfers : null,
    fare: p.fare && typeof p.fare.value === 'number' ? p.fare.value : null,
    type: p.type || null,
    km: Math.round(p.totalDistance / 100) / 10,
    landingURL: (j.properties && j.properties.landingURL) || null,
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
