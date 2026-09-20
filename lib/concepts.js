/* ───────────── 개념 사전 (규칙 기반 의미 매칭) ───────────── */
export const CONCEPTS = {
  ops_process: { n: '운영 프로세스 개선', a: ['프로세스', '운영 효율', '운영 개선', '업무 개선', '효율화', '자동화', '수작업'] },
  policy: { n: '정책·기준 설계', a: ['정책', '룰', '가이드', '운영 기준', '기준을', '대응 기준'] },
  data: { n: '데이터 분석', a: ['데이터', '지표', '분석', '대시보드', '인사이트', 'kpi', '통계', '리포트', 'ctr', 'cvr', '로그', '이탈률', '트래픽'] },
  sql: { n: 'SQL', a: ['sql', '쿼리', '데이터 추출', 'bigquery'] },
  experiment: { n: '실험·A/B 테스트', a: ['a/b', 'ab테스트', '실험', '가설'] },
  collab: { n: '협업·조율', a: ['협업', '이해관계자', '유관부서', '커뮤니케이션', '조율', '설득', '개발자', '디자이너', '파트너', '협의'] },
  risk: { n: '이슈·리스크 대응', a: ['cs', '고객 응대', '문의', '이슈', '리스크', '모니터링', '대응', '신고', '클레임', '안전'] },
  ai: { n: 'AI·LLM', a: ['ai', 'llm', 'agent', '에이전트', '생성형', 'human-in-the-loop', '프롬프트', 'gpt'] },
  planning: { n: '서비스 기획', a: ['기획', 'prd', '요구사항', '스펙', '로드맵', 'pm', 'po', '프로덕트', 'product manager', 'product owner', 'product planning', 'ux flow', 'user flow', '와이어프레임'] },
  improve: { n: '서비스 개선', a: ['개선', '고도화', '리뉴얼', '최적화', '재설계', '재정의'] },
  search_rec: { n: '검색·추천', a: ['검색', '추천', '랭킹', '노출', '큐레이션', '개인화', '자동완성', 'relevance', 'poi', 'no result', 'semantic', 'discovery'] },
  location: { n: '위치·지도', a: ['위치 기반', '위치 데이터', '지도', 'geocoding', '좌표', 'place api', 'gis', '내비게이션', '랜드마크'] },
  ux_research: { n: '사용자 리서치', a: ['사용자 인터뷰', '인터뷰', '리서치', 'ux research', '설문', 'voc', '페인포인트'] },
  ads: { n: '광고', a: ['광고', '퍼포먼스', '전환 추적', '타게팅', '지면', '수익화'] },
  payment: { n: '결제·정산', a: ['결제', '정산', '핀테크', '금융', '빌링', '대사', 'pg', '가맹점', '카드'] },
  growth: { n: '그로스·리텐션', a: ['리텐션', '리워드', '그로스', '전환율', '퍼널'] },
  ownership: { n: '주도·오너십', a: ['오너십', '주도', '스스로', '책임지'] },
  ml: { n: 'ML·모델링', a: ['머신러닝', 'nlp', '딥러닝', '모델', 'python', '파이썬', '추천 시스템'] },
  admin: { n: '어드민·운영툴', a: ['어드민', '백오피스', '관리자', '운영툴', 'cms'] },
  marketplace: { n: '마켓플레이스', a: ['중고', '마켓플레이스', '커머스', '거래', '상품 등록', '셀러'] },
  rootcause: { n: '문제 정의·원인 분석', a: ['근본 원인', '원인 분석', '문제 정의', '문제를 발견', '문제 발견', '원인을', '문제를 정의', '문제 탐색'] },
  scale: { n: '대규모·0→1', a: ['대규모', '0 to 1', '0에서 1', '0→1', '대용량', '수백만'] },
  launch: { n: 'MVP·출시', a: ['mvp', '출시', '런칭', '론칭', '베타'] },
};

const LATIN = /^[a-z0-9\/ ]+$/;
function hasAlias(t, a) {
  if (LATIN.test(a)) {
    const esc = a.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
    return new RegExp('(^|[^a-z0-9])' + esc + '([^a-z0-9]|$)').test(t);
  }
  return t.includes(a);
}
export function conceptsOf(text) {
  const t = String(text).toLowerCase();
  const out = new Set();
  for (const [id, c] of Object.entries(CONCEPTS)) if (c.a.some((a) => hasAlias(t, a))) out.add(id);
  return out;
}
export function bigrams(s) {
  const set = new Set();
  String(s).toLowerCase().replace(/[^가-힣a-z0-9]+/g, ' ').trim().split(' ').filter((x) => x.length >= 2).forEach((w) => {
    for (let i = 0; i < w.length - 1; i++) set.add(w.slice(i, i + 2));
  });
  return set;
}
