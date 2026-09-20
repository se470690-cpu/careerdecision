// 회사 위치·공고 데이터.
// - 회사 좌표는 사무실 소재지 기준 근사값입니다. v:1 = 주소를 공개 기업정보로 확인, v:0 = 지역 수준만 확인.
// - 공고는 각 회사 공식 채용 페이지에서 2026-09-19에 읽은 내용을 요약한 스냅샷입니다.

export const ROLES = [
  { id: 'plan', n: '서비스기획·PM' },
  { id: 'ops', n: '서비스 운영' },
  { id: 'data', n: '데이터 분석' },
  { id: 'dev', n: '개발' },
  { id: 'design', n: '디자인' },
];

export const INDUSTRIES = ['플랫폼', '커머스', '핀테크', '푸드테크', '모빌리티', '여행', '게임', '엔터·콘텐츠', '엔터프라이즈'];

export const COMPANIES = [
  { id: 'daangn', name: '당근', area: '강남', lat: 37.504, lng: 127.0245, addr: '서울 서초구 강남대로 465 (교보강남타워)', v: 1, office: 5, note: '재택근무 전면 폐지, 보도 기준', ind: '플랫폼', careers: 'https://careers.daangn.com/jobs/', collect: 'live', collectNote: '공식 채용 페이지 수집(서버에서 LIVE_COLLECT=1)' },
  { id: 'toss', name: '토스', area: '역삼', lat: 37.5002, lng: 127.0366, addr: '서울 강남구 테헤란로 142 (아크플레이스)', v: 1, office: null, note: '', ind: '핀테크', careers: 'https://toss.im/career/jobs', collect: 'snapshot', collectNote: '상세 페이지만 읽을 수 있고 목록이 JS로 그려져 개별 공고만 스냅샷' },
  { id: 'remember', name: '리멤버', area: '역삼', lat: 37.5012, lng: 127.0378, addr: '서울 강남구 테헤란로 134 (포스코타워 역삼)', v: 1, office: null, note: '', ind: '플랫폼', careers: '' },
  { id: 'coupang', name: '쿠팡', area: '잠실·송파', lat: 37.5153, lng: 127.1036, addr: '서울 송파구 송파대로 570', v: 1, office: null, note: '', ind: '커머스', careers: 'https://www.coupang.jobs/kr/' },
  { id: 'woowa', name: '우아한형제들', area: '잠실·송파', lat: 37.5118, lng: 127.1088, addr: '서울 송파구 석촌호수 인근 (2028 잠실 신사옥 이전 예정 보도)', v: 0, office: 2, note: '배달의민족 운영사. 주 2회 출근 의무, 신사옥 이전 후 주 3회 예정(보도 기준)', ind: '푸드테크', careers: 'https://career.woowahan.com/', collect: 'none', collectNote: '공식 채용 사이트가 JavaScript 전용이라 서버에서 읽을 수 없음' },
  { id: 'sds', name: '삼성SDS', area: '잠실·송파', lat: 37.5142, lng: 127.1002, addr: '서울 송파구 올림픽로35길 125 (잠실)', v: 0, office: null, note: '', ind: '엔터프라이즈', careers: '' },
  { id: 'naver', name: '네이버', area: '분당', lat: 37.3595, lng: 127.1052, addr: '경기 성남시 분당구 불정로 6 (그린팩토리)', v: 0, office: null, note: '', ind: '플랫폼', careers: '', collect: 'none', collectNote: '공식 채용 사이트(recruit.navercorp.com)가 JavaScript 전용이라 서버에서 읽을 수 없음' },
  { id: 'kakao', name: '카카오', area: '판교', lat: 37.3949, lng: 127.1105, addr: '경기 성남시 분당구 판교역로 166 (판교 아지트)', v: 0, office: null, note: '', ind: '플랫폼', careers: '', collect: 'none', collectNote: '공식 채용 사이트(careers.kakao.com)가 JavaScript 전용이라 서버에서 읽을 수 없음' },
  { id: 'krafton', name: '크래프톤', area: '판교', lat: 37.4015, lng: 127.1082, addr: '경기 성남시 분당구 판교테크노밸리 일대', v: 0, office: null, note: '', ind: '게임', careers: '' },
  { id: 'nexon', name: '넥슨', area: '판교', lat: 37.3992, lng: 127.1119, addr: '경기 성남시 분당구 판교테크노밸리 일대', v: 0, office: null, note: '', ind: '게임', careers: '' },
  { id: 'nc', name: '엔씨소프트', area: '판교', lat: 37.4008, lng: 127.1058, addr: '경기 성남시 분당구 판교테크노밸리 일대', v: 0, office: null, note: '', ind: '게임', careers: '' },
  { id: 'hybe', name: '하이브', area: '용산', lat: 37.5285, lng: 126.9645, addr: '서울 용산구 한강대로 42 (용산)', v: 0, office: null, note: '', ind: '엔터·콘텐츠', careers: '' },
];

// 캐치테이블: 공식 채용 사이트(그리팅 기반)에서 근무지 주소를 확인했고, 좌표는 판교 유스페이스 일대 근사값입니다.
COMPANIES.push({ id: 'catchtable', name: '캐치테이블', area: '판교', lat: 37.4008, lng: 127.1095, addr: '경기 성남시 분당구 대왕판교로 660 유스페이스1 A동 605호', v: 1, office: null, note: '', ind: '푸드테크', careers: 'https://career.catchtable.co.kr/ko/jobs', collect: 'live', collectNote: '서버 렌더링 채용 사이트(그리팅)라 목록·상세·근무지를 읽을 수 있음' });

// 카카오모빌리티·카카오엔터프라이즈: 그리팅 기반 채용 사이트. 주소는 공고·채용 사이트에서 확인했고 좌표는 판교역 일대 근사값입니다.
COMPANIES.push(
  { id: 'kakaomobility', name: '카카오모빌리티', area: '판교', lat: 37.3944, lng: 127.1097, addr: '경기 성남시 분당구 판교역로 152 알파돔타워', v: 1, office: null, note: '', ind: '모빌리티', careers: 'https://kakaomobility.career.greetinghr.com/ko/guide', collect: 'live', collectNote: '그리팅 기반 서버 렌더링 채용 사이트 (목록 /ko/guide)' },
  { id: 'kakaoent', name: '카카오엔터프라이즈', area: '판교', lat: 37.4017, lng: 127.1089, addr: '경기 성남시 분당구 판교역로 235 에이치스퀘어 N동', v: 1, office: null, note: '', ind: '엔터프라이즈', careers: 'https://careers.kakaoenterprise.com/ko/job', collect: 'live', collectNote: '그리팅 기반. 2026-09-19 확인 시 진행 중 공고 0개' },
);

// 여기어때컴퍼니: 그리팅 기반. 근무지 주소는 공고에서 확인, 좌표는 강남구 봉은사로 일대 근사값입니다.
// 요기요·마이리얼트립: 공식 채용 사이트에서 공고 목록을 서버가 읽을 수 없어 수집 못 함(위치는 참고용 근사값).
COMPANIES.push(
  { id: 'yeogi', name: '여기어때', area: '강남', lat: 37.5083, lng: 127.0433, addr: '서울 강남구 봉은사로 479 (여기어때컴퍼니 본사)', v: 1, office: null, note: '', ind: '여행', careers: 'https://gccompany.career.greetinghr.com/ko/apply', collect: 'live', collectNote: '그리팅 기반 서버 렌더링 채용 사이트 (목록 /ko/apply)' },
  { id: 'myrealtrip', name: '마이리얼트립', area: '강남', lat: 37.4946, lng: 127.0285, addr: '서울 서초구 강남대로 311 드림플러스 강남 (타사 게재 공고 기준)', v: 0, office: null, note: '', ind: '여행', careers: 'https://about.myrealtrip.com/', collect: 'none', collectNote: '공식 채용 사이트가 JavaScript 전용이라 서버에서 읽을 수 없음' },
  { id: 'yogiyo', name: '요기요', area: '역삼', lat: 37.5, lng: 127.0365, addr: '서울 강남구 (상세 주소 미확인)', v: 0, office: null, note: '', ind: '푸드테크', careers: 'https://wesangcareer.ninehire.site/apply', collect: 'none', collectNote: '채용 사이트(나인하이어)의 공고 목록이 브라우저에서 그려져 서버 HTML에는 없음' },
);

export const COMPANY_BY_ID = Object.fromEntries(COMPANIES.map((c) => [c.id, c]));

const FETCHED = '2026-09-19';

// 요건 문장은 공고 원문의 "이런 분을 찾고 있어요(필수)" / "이런 분이면 더 좋아요(우대)" 항목을 요약한 것입니다.
export const POSTINGS = [
  {
    id: 'daangn-6640388003', companyId: 'daangn', role: 'plan', title: 'Product Manager - 광고 (광고 상품)', team: '광고', type: '정규직',
    url: 'https://careers.daangn.com/jobs/role/6640388003/', deadline: null, fetchedAt: FETCHED, source: 'careers.daangn.com',
    does: [
      '지면의 수익화를 고민하고 새로운 광고 상품을 만들거나 기존 상품에 편입해요',
      '광고주 성과와 유저 경험을 모두 끌어올릴 수 있는 광고 노출 방식을 고민해요',
      'ML 모델이나 서빙 로직 개선을 통해 광고 퍼포먼스를 극대화해요',
      '타게팅 도구, 전환 추적 도구, 광고 운영 API 등 광고 도구를 만들고 개선해요',
    ],
    must: [
      'Product Manager(Product Owner) 경력 3년 이상',
      '퍼포먼스 광고 상품이나 플랫폼을 2년 이상 경험해 본 분',
      '제품에 대한 강한 오너십을 가지고 스스로 로드맵을 그리며 주도적으로 일하는 분',
      '다양한 이해관계자와 함께 커뮤니케이션하며 프로젝트를 이끌어 본 경험',
    ],
    nice: [
      '퍼포먼스 광고 상품 전반을 기획하고 출시까지 진행해 본 경험',
      '기존 퍼포먼스 광고 상품을 개선하여 다음 단계로 끌어올려 본 경험',
      '광고의 특정 영역(지면 수익화, 전환 추적 도구, 광고 ML 등)에 깊은 전문성',
    ],
  },
  {
    id: 'daangn-6685198003', companyId: 'daangn', role: 'ops', title: 'Product Operations Manager - 중고거래', team: '중고거래', type: '정규직',
    url: 'https://careers.daangn.com/jobs/role/6685198003/', deadline: null, fetchedAt: FETCHED, source: 'careers.daangn.com',
    does: [
      '운영·정책·사용자 경험 문제를 스스로 발견하고, 반복 구조와 근본 원인을 파악해 제품과 비즈니스 과제로 전환해요',
      '제품 플로우·정책 기준·운영 시스템·AI 자동화 구조를 함께 재설계해요',
      'AI와 데이터로 문제 탐지·분류·판단·모니터링 체계를 설계해요',
      '신규 기능 출시 전후의 리스크를 예측하고 정책·가이드·프로세스·모니터링 구조를 설계해요',
    ],
    must: [
      '누가 시키지 않아도 문제를 발견하면 근본 원인을 파고들고 해결까지 주도적으로 끌고 가는 분',
      '운영을 처리하는 일이 아니라 제품과 서비스를 성장시키는 일로 바라보고 제품 구조와 비즈니스 모델 개선의 기회로 해석하는 분',
      '운영 매니저로서 5년 이상의 경험을 바탕으로 프로덕트팀과 원 팀으로 서비스를 운영·관리하며 성장시켜 본 분',
      '반복적이고 비효율적인 과정을 발견했을 때 AI·자동화·프로세스 개선을 통해 확장 가능한 방식으로 해결하는 실행력',
      '다양한 조직(CS·프로덕트·정책·PR·GR 등)과 원활히 협업하며 복잡한 문제를 정렬하고 실행까지 이끌 수 있는 분',
      '정해진 답을 따르기보다 더 나은 기준과 방식을 새롭게 만들어가는 데 동기부여를 느끼는 분',
    ],
    nice: [],
  },
  {
    id: 'daangn-7578967003', companyId: 'daangn', role: 'plan', title: 'Product Manager - 당근페이 (Offline Payment)', team: '당근페이', type: '정규직',
    url: 'https://careers.daangn.com/jobs/role/7578967003/', deadline: null, fetchedAt: FETCHED, source: 'careers.daangn.com',
    does: [
      '현장결제·당근카드 같은 오프라인 결제 제품의 전략을 세우고 실행해요',
      '리워드·리텐션 중심의 제품 실험을 설계하고 운영해요',
      '카드사·파트너사 등 다양한 이해관계자와 협업해 제품을 만들어요',
      '데이터로 문제를 정의하고 정성·정량 인사이트로 가설을 검증하며 제품을 고도화해요',
    ],
    must: [
      '모바일 서비스(웹/앱) 기획/PM 경력 5년 이상',
      '현장에서 고객의 문제를 직접 듣고 실행 중심으로 해결한 경험',
      '도전적인 목표 앞에서도 끝까지 파고들어 수치로 증명되는 임팩트를 만들어낸 분',
      '복잡한 제약과 여러 이해관계자 사이에서 논리적 근거로 설득하며 협업을 이끄는 분',
    ],
    nice: [
      '금융 및 핀테크, 특히 결제 도메인에 대한 이해와 경험',
      '리텐션/리워드 등 그로스 관점의 제품 실험을 설계하고 ROI를 측정해 본 경험',
      '오프라인 결제 또는 사업주 향 제품을 기획·운영해 본 경험',
    ],
  },
  {
    id: 'daangn-7611095003', companyId: 'daangn', role: 'ops', title: 'Trust & Safety Manager - 로컬 잡스', team: '로컬 잡스', type: '정규직',
    url: 'https://careers.daangn.com/jobs/role/7611095003/', deadline: null, fetchedAt: FETCHED, source: 'careers.daangn.com',
    does: [
      '당근알바의 안전한 서비스 환경(Safety System)을 만들어요',
      '안전을 위협하거나 운영정책을 위반하는 사례를 효율적으로 탐색하고 대응할 수 있는 시스템을 만들어요',
      '새로운 패턴에 대한 정책을 정의하고 룰을 정비해요',
      '내부 운영툴(LLM/Agent)을 활용해 AI 기반 운영시스템을 고도화해요',
      '다양한 유저의 CS를 듣고 가이드와 FAQ를 발행해요',
    ],
    must: [
      'AI·LLM을 활용해 업무를 자동화하거나 효율화, 분석하는 데 관심이 많은 분',
      '서비스 정책을 세우고 운영 프로세스를 설계·고도화해 본 경험이 있으며 서비스 운영 전반을 기획할 수 있는 역량',
      '다양한 운영 리스크 상황을 관리·대응해 본 경험이 있고 안정적인 서비스 경험을 보장할 수 있는 역량',
    ],
    nice: [
      '2년 이상의 서비스 운영/기획 경험',
      'SQL 등으로 데이터를 추출·분석하고 이를 통해 인사이트를 도출해 본 경험',
    ],
  },
  {
    id: 'daangn-6610455003', companyId: 'daangn', role: 'dev', title: 'Software Engineer, Machine Learning - 검색 (품질)', team: '검색', type: '정규직',
    url: 'https://careers.daangn.com/jobs/role/6610455003/', deadline: null, fetchedAt: FETCHED, source: 'careers.daangn.com',
    does: [
      '사용자의 검색 의도를 파악하여 맞춤형 키워드, 컬렉션, 상품 등을 추천해요',
      '자연어처리, 그래프 기반 모델, 개인화 알고리즘으로 검색 품질을 향상시켜요',
      '모델의 실시간 서빙을 위한 경량화 및 아키텍처를 설계해요',
      '컬렉션 랭킹, 지식그래프, 키워드 제안 등의 모델 개선 실험과 운영을 담당해요',
    ],
    must: [
      '머신러닝 기반 추천/검색/랭킹 시스템을 실제로 설계·운영해 본 경험',
      '자연어처리(NLP) 또는 그래프 기반 추천 시스템 개발 경험',
      'Python 기반의 머신러닝 훈련 파이프라인 구축 경험',
      '대용량 데이터를 활용한 실험 설계 및 A/B 테스트 경험',
      '모델 서빙과 성능 최적화를 고려한 시스템 구현 경험',
    ],
    nice: [
      '검색어 자동완성, 연관검색어, 오타교정 등 검색어 제안에 대한 모델링 경험',
      '실시간으로 딥러닝 모델 추론을 활용한 서빙 경험',
      'ML 엔지니어 팀에서 오너십을 갖고 특정 도메인(랭킹/추천 등)을 리딩해 본 경험',
    ],
  },
  {
    id: 'daangn-7993813003', companyId: 'daangn', role: 'ops', title: 'Service Operations Manager (계약직) - 당근페이 (정산)', team: '당근페이', type: '계약직(12개월)',
    url: 'https://careers.daangn.com/jobs/role/7993813003/', deadline: '2026-09-23', fetchedAt: FETCHED, source: 'careers.daangn.com',
    does: [
      '당근 내 지급결제와 프로모션 정산을 운영하고 거래·정산 데이터를 대사해 차이가 생기면 원인을 확인해 해결해요',
      '입점 가맹점, PG사, 금융사 등 외부 파트너와 개발·회계·사업 부서를 연결하고 정산 현황과 이슈를 구조화해 공유해요',
      '수작업이 많거나 오류가 생기기 쉬운 지점을 찾아 정산 프로세스를 개선하고 정산 고도화 과제의 요구사항을 정리해요',
      '운영에서 발견한 문제를 정책과 프로덕트 개선 제안으로 직접 연결해요',
    ],
    must: [
      '결제, 정산, 빌링 관련 업무를 2년 이상 경험하고 영세·중소 가맹점 대상 차액 정산을 수행해 본 분',
      '거래·정산 데이터를 꼼꼼하게 확인하고 숫자나 기준의 작은 차이도 놓치지 않는 분',
      '정산 이슈가 생겼을 때 원인을 구조적으로 파악하고 필요한 사람들과 협업해 해결까지 이끌어 본 분',
    ],
    nice: [
      '개발, 회계, 사업 부서와 외부 파트너 등 다양한 채널에서 커뮤니케이션을 해 본 분',
      'PG사, 금융사, 가맹점 등 결제 파트너와 협업하며 정산 이슈를 해결해 본 분',
      '복잡한 데이터를 체계적으로 관리하고 운영 기준을 수립하여 정리할 수 있는 분',
    ],
  },
  {
    id: 'daangn-7988737003', companyId: 'daangn', role: 'ops', title: 'Trust & Safety Manager - 부동산', team: '부동산', type: '정규직',
    url: 'https://careers.daangn.com/jobs/role/7988737003/', deadline: null, fetchedAt: FETCHED, source: 'careers.daangn.com',
    does: [
      'VOC·CS 데이터·신고 로그를 파고들어 유저가 어디서 막히는지 찾아내고, 문제가 반복되는 근본 원인을 밝혀 해결해요',
      '허위 매물, 임대인·중개사 사칭, 외부 결제 유도 같은 어뷰징 패턴을 정의하고 탐지·제재 룰을 만들어요',
      '내부 운영 툴(LLM/Agent)을 활용해 AI 기반 운영 시스템 고도화와 효율화 체계를 만들어요',
      '내·외부 유관 부서 및 기관과 소통하며 이슈에 대응해요',
      '사용자가 거래 과정에서 안전을 느낄 수 있는 프로젝트를 기획해요',
    ],
    must: [
      '3년 이상 서비스 운영·기획 경험이 있고, 정책을 세우고 운영 프로세스를 설계·고도화해 보신 분',
      'AI·LLM을 활용해 업무를 자동화·효율화하거나 분석하는 데 관심이 많으신 분',
      'CS·프로덕트·법무·홍보 등 여러 조직 사이에서 복잡한 문제를 정렬하고 실행까지 끌고 가 보신 분',
      '정답이 없는 영역에서 기준을 새로 만드는 데 동기부여를 느끼시는 분',
    ],
    nice: [
      'SQL로 직접 데이터를 추출·분석하고 인사이트를 도출해 보신 분',
      'AI 및 LLM을 실제 업무에 활용해 보신 분(프롬프트 설계, 에이전트, MCP, 자동화 워크플로우 등)',
      '서비스 정책 및 문의·신고 항목 설계 경험이 있으신 분',
    ],
  },
  {
    id: 'toss-6301568003', companyId: 'toss', role: 'plan', title: 'Product Manager (토스페이먼츠 소속)', team: '결제', type: '정규직',
    url: 'https://toss.im/career/job-detail?job_id=6301568003', deadline: null, fetchedAt: FETCHED, source: 'toss.im/career',
    locNote: '토스페이먼츠 소속 공고예요. 계열사 사무실 위치는 확인하지 못해 토스 역삼 일대로 표시했어요.',
    reqNote: '원문에 필수/우대 구분이 없어 “이런 분과 함께하고 싶어요” 항목을 모두 필수로 취급했어요.',
    does: [
      '결제창, 결제 위젯, 브랜드페이, 퀵계좌이체 등 결제 제품으로 최상의 결제 경험을 제공해요',
      '운영 어드민: 정성·정량 데이터로 운영팀의 요구를 파악해 결제·청약·정산 프로세스가 신뢰성 높게 운영되도록 제품을 만들어요',
      '사업자 어드민: 사업자가 결제·정산 정보를 손쉽게 확인할 수 있는 직관적인 관리 도구를 제공해요',
      '링크페이, 정산지급대행, 개발자센터 등 다양한 서비스를 제공해요',
    ],
    must: [
      '고객의 입장에서 문제를 정의하고 해결해 본 경험이 있는 분',
      '문제 인식, 솔루션 도출, 비즈니스 임팩트까지의 연결이 논리적이고 합리적인 분',
      '업무를 주도적으로 수행하고 요구사항을 발굴해 비즈니스와 제품에 유의미한 성과를 만들거나 실패를 통해 배운 경험이 있는 분',
      '기획·디자인·개발·CX·제휴사 등 다양한 이해관계자와 소통하며 서비스를 안정적으로 운영하거나 개선한 경험이 있는 분',
      '어려운 미션과 도전적인 목표 앞에서도 임팩트를 만들어 내는 분',
      '팀원들에게 동기를 부여하고 함께 성장하는 팀 문화를 만들 수 있는 분',
    ],
    nice: [],
  },
  {
    id: 'catchtable-190734', companyId: 'catchtable', role: 'plan', title: 'B2C Product Manager (Search&Discovery-PM)', team: 'Search & Discovery', type: '정규직',
    url: 'https://career.catchtable.co.kr/ko/o/190734', deadline: null, fetchedAt: FETCHED, source: 'career.catchtable.co.kr',
    locNote: '공고 근무지: 판교 오피스 (경기 성남시 분당구 대왕판교로 660, 유스페이스1 A동 605호)',
    does: [
      '홈·서치리스트·지도 영역의 프로덕트 로드맵을 세우고 KPI를 설정·관리해요',
      '검색 품질, 랭킹 로직, 추천 콘텐츠, 지도 탐색 경험을 고도화하고 발견 여정의 전환을 개선해요',
      '가설과 근거를 바탕으로 문제 정의, 실험 설계·실행, 결과 분석, 다음 과제로 이어지는 개선 사이클을 이끌어요',
      '탐색 퍼널의 고객 여정 데이터를 분석해 실행 가능한 개선 방안과 인사이트를 도출해요',
      '홈·서치리스트·지도 영역의 UX/UI 개선과 탐색 플로우 고도화를 기획해요',
      '개발·디자인·데이터·검색/추천 엔지니어링과 협업해 기획부터 개발, 출시, 운영까지 리딩해요',
    ],
    must: [
      '서비스 기획 및 프로덕트 매니지먼트(PM) 경험 5년 이상',
      '탐색·추천·검색 등 Discovery 성격의 프로덕트를 직접 개선해 본 경험',
      '가설과 근거를 세워 제품을 개선하고 그 결과를 데이터로 분석·검증할 수 있는 분',
      '데이터 기반 문제 정의, 실험 설계, KPI 설계·운영이 가능한 분',
      '하나의 개선으로 끝내지 않고 다음 과제를 계속 발굴·정의해 낼 수 있는 분',
      '기획부터 개발, 출시, 운영까지 전 프로덕트 라이프사이클 경험이 있는 분',
      '논리적 사고를 바탕으로 명확하고 설득력 있게 커뮤니케이션할 수 있는 분',
    ],
    nice: [
      '플랫폼 기업(커머스·콘텐츠·포털·O2O 등)에서 검색·추천·탐색 서비스를 운영하고 개선해 본 경험',
      'AI 기반 개발 방법론으로 PM이 기획부터 구현까지 직접 수행해 본 경험(LLM·AI 툴을 활용한 프로토타이핑 포함)',
      '랭킹·추천 알고리즘 또는 검색 관련성(relevance)에 대한 이해',
      'SQL 등으로 데이터를 직접 조회·분석할 수 있는 분',
      '데이터 기반으로 서비스 KPI를 설계·운영하며 성과를 개선한 경험',
      '대규모 트래픽 서비스 또는 다수 이해관계자가 얽힌 프로젝트를 성공적으로 리드한 경험',
      '외식업, 예약, 커머스, 숙박 등 유사 서비스 도메인 경험',
    ],
  },
  {
    id: 'catchtable-232973', companyId: 'catchtable', role: 'ops', title: 'B2B 오퍼레이션 매니저 (2년차 이상)', team: '사장님그로스팀', type: '정규직',
    url: 'https://career.catchtable.co.kr/ko/o/232973', deadline: null, fetchedAt: FETCHED, source: 'career.catchtable.co.kr',
    locNote: '공고 근무지: 판교 오피스 (경기 성남시 분당구 대왕판교로 660, 유스페이스1 A동 605호)',
    reqNote: '공고 헤더의 “경력 2년 이상”을 필수 요건에 함께 넣었어요.',
    does: [
      '매장 기본 정보(영업시간, 메뉴, 위치, 사진 등) 데이터를 모니터링하고 등록·수정·검수로 정합성을 유지해요',
      '허위 정보, 어뷰징 등 서비스 내 이상 케이스를 모니터링하고 운영 정책에 따라 대응해요',
      '정기적인 데이터 정제로 검색·노출 품질을 높은 수준으로 유지해요',
      '반복되는 운영 업무를 매뉴얼화·표준화하고 자동화할 수 있는 업무를 발굴해요',
      '운영 지표(처리 건수, 처리 시간, 이슈 재발률 등)를 관리하고 개선 포인트를 도출해요',
      '입점 매장의 성장 방안을 수립하고 아웃바운드 컨택을 진행해요',
    ],
    must: [
      '경력 2년 이상 (공고 헤더 기준)',
      '서비스 운영, CS, 영업 지원, 사업 운영 등 관련 직무 경험이 1~3년 있는 분',
      '전화·메시지·대면 등 다양한 채널에서 상대방 눈높이에 맞게 소통할 수 있는 분',
      '스프레드시트(Excel, Google Sheets)로 데이터를 정리하고 관리하는 데 능숙한 분',
      '여러 업무를 동시에 진행하면서도 우선순위를 스스로 판단할 수 있는 분',
      '꼼꼼하고 방대한 데이터에서 오류를 찾아내는 일에 성취를 느끼는 분',
    ],
    nice: [
      '플랫폼·O2O 서비스에서 파트너(입점업체·제휴점) 운영을 경험해 본 분',
      '아웃바운드 세일즈 또는 텔레마케팅 경험',
      '외식업에 대한 이해나 관심',
      'Slack, Confluence, Jira 등 협업 툴 사용 경험',
      '운영 매뉴얼·가이드 문서를 직접 만들어 본 분',
    ],
  },
  {
    id: 'kakaomobility-236755', companyId: 'kakaomobility', role: 'plan', title: '공간정보 기획자', team: '공간정보기획파트', type: '정규직',
    url: 'https://kakaomobility.career.greetinghr.com/ko/o/236755', deadline: null, fetchedAt: FETCHED, source: 'kakaomobility.career.greetinghr.com',
    locNote: '공고 근무지: 판교 오피스 (경기 성남시 분당구 판교역로 152, 알파돔타워)',
    does: [
      '내비게이션(SDK, IVI) 서비스 관련 요구사항을 정의해요',
      '지도·경로·위치 기반 공간정보 제품과 데이터를 기획해요',
      '공간정보 데이터의 정확도, 커버리지, 최신성 개선 과제를 발굴해요',
      'AI를 활용한 지도 데이터 품질 개선, 자동화, 업무 효율화 과제를 기획해요',
    ],
    must: [
      '공간정보 업계 업무 경력 만 4년 이상',
      '지도, 내비게이션, GIS, 위치 기반 서비스, 모빌리티 분야 기획/PM 경험이 있는 분',
      '제품 기획, 기술 기획 또는 프로젝트 리딩 경험이 있는 분',
      '복잡한 데이터·기술 요구사항을 구조화하고 실행 과제로 전환할 수 있는 역량',
      '개발, 데이터, 사업, 운영 조직과 원활하게 협업하고 커뮤니케이션할 수 있는 분',
      'AI 도구를 활용해 리서치, 데이터 분석, 업무 자동화, 기획 생산성을 높인 경험',
    ],
    nice: [
      'SD Map, HD Map 등 지도 관련 경험',
      '영어 기반 업무 협의 및 문서 커뮤니케이션이 가능한 분',
      '도로 네트워크, 주소, 경로 탐색 구조에 대한 이해',
      'B2B/B2B2C 기술 제품 또는 제휴 프로젝트 PM 경험',
      'AI/ML 기반 지도 데이터 검수, 품질 개선, 자동화 과제 경험',
    ],
  },
  {
    id: 'kakaomobility-229410', companyId: 'kakaomobility', role: 'ops', title: '[Contract] 사업 운영지원 담당자', team: '사업기획팀', type: '계약직(1년)',
    url: 'https://kakaomobility.career.greetinghr.com/ko/o/229410', deadline: null, fetchedAt: FETCHED, source: 'kakaomobility.career.greetinghr.com',
    locNote: '공고 근무지: 판교 오피스 (경기 성남시 분당구 판교역로 152, 알파돔타워)',
    does: [
      '카카오모빌리티 결제/빌링 사업의 운영 및 정산 업무를 수행해요',
      '내부 유관 부서, 외부 결제 파트너사, 기관과 커뮤니케이션하고 협업해요',
      '팀 내 담당 사업의 운영 및 지원 업무를 수행해요',
    ],
    must: [
      '운영/정산 경험을 1년 이상 보유한 분',
      '다양한 이해관계자와 능동적이고 긍정적으로 소통할 수 있는 분',
      '책임감을 갖고 꼼꼼하게 업무를 수행할 수 있는 분',
      '자기주도적으로 문제를 해결하고 개선하는 데 익숙한 분',
    ],
    nice: [
      '모빌리티 산업 및 O2O 플랫폼 비즈니스에 대한 이해',
      '데이터 분석 기반의 서비스 개선 및 성과 창출 경험',
    ],
  },
  {
    id: 'yeogi-237006', companyId: 'yeogi', role: 'plan', title: 'Product Owner [주문/결제]', team: '주문결제기획팀', type: '정규직',
    url: 'https://gccompany.career.greetinghr.com/ko/o/237006', deadline: null, fetchedAt: FETCHED, source: 'gccompany.career.greetinghr.com',
    locNote: '공고 근무지: 서울 강남구 봉은사로 479 (여기어때컴퍼니 본사)',
    reqNote: '공고 헤더의 “경력 5~10년”을 필수 요건에 함께 넣었어요.',
    does: [
      '앱/웹 주문서와 예약·취소·부분취소·환불 프로세스의 정책을 세우고 프로덕트를 기획·운영해요 (백오피스 포함)',
      'PG 연동, 결제수단·간편결제 도입 등 결제 로직과 정책을 기획하고 PG사 등 결제 파트너와 제휴를 협의해요',
      '쿠폰·즉시할인·포인트·상품권 등 혜택 정책을 기획·운영하고 주문·결제 데이터와의 연계를 설계해요',
      '국내외 숙소, 채널링 등 공급사 연동 구조를 이해하고 신규 상품·사업 출시 시 주문결제 플랫폼 대응과 예약 API 연동을 기획해요',
      '주문·결제·혜택 데이터 정합성을 검증하고 거래 리스크를 관리하며, 운영 이슈가 생기면 근본 원인을 분석해 정책·시스템 개선을 이끌어요',
    ],
    must: [
      '경력 5년 이상 (공고 헤더 기준: 5~10년)',
      '프로덕트 관리(PM/PO) 경력 5년 이상인 분',
      'E-commerce 또는 예약 플랫폼에서 주문, 결제, 예약/취소, 혜택(쿠폰/포인트) 중 하나 이상의 프로덕트를 기획·운영한 경험',
      'API, 데이터 흐름, 시스템 간 연동 구조를 이해하고 개발팀과 기술적 트레이드오프를 논의할 수 있는 분',
      '복잡한 문제를 논리적으로 구조화하고 개발·QA가 바로 착수할 수 있는 수준의 정책서·PRD·인수 조건을 작성할 수 있는 분',
      '개발, QA, 디자인, 사업, 운영 등 다양한 이해관계자와 원활하게 소통하며 우선순위를 조율할 수 있는 분',
      '데이터 무결성과 정확성을 최우선으로 두고 세심하게 검증하는 태도를 가진 분',
    ],
    nice: [
      '여행, 숙박, 액티비티, 렌터카 등 여가 플랫폼(OTA) 거래 도메인 경험',
      'PG 결제 연동, 간편결제, 결제수단 도입 프로덕트 기획 경험 또는 핀테크·결제 생태계에 대한 높은 관심',
      '쿠폰·포인트·즉시할인 등 혜택 정책 설계 경험과, 혜택이 정산 데이터로 이어지는 흐름에 대한 이해',
      'B2B 서비스 또는 홀세일, 채널 연동 프로덕트 기획·운영 경험',
      '외부 공급사 채널 API 연동 프로덕트 경험',
      'SQL을 활용한 데이터 검증·분석 및 데이터 기반 의사결정 경험',
      '대규모 플랫폼 개선·재설계 등 규모 있는 프로젝트를 PO로서 발의부터 오픈까지 리딩한 경험',
    ],
  },
  {
    id: 'yeogi-234707', companyId: 'yeogi', role: 'ops', title: 'Operations Manager [Enterprise Business]', team: 'ES사업부', type: '정규직',
    url: 'https://gccompany.career.greetinghr.com/ko/o/234707', deadline: null, fetchedAt: FETCHED, source: 'gccompany.career.greetinghr.com',
    locNote: '공고 근무지: 서울 강남구 봉은사로 479 (여기어때컴퍼니 본사)',
    reqNote: '공고 헤더의 “경력 3~7년”을 필수 요건에 함께 넣었어요.',
    does: [
      '여기어때 비즈니스 Biz포인트 등 B2B 결제 정산 마감과 데이터 대사를 관리해요',
      '고객사 문의·이슈에 대응하고 유관 부서와 협업해 서비스를 운영해요',
      '고객사 신규 가입과 결제 전환율을 높이는 마케팅 활동(프로모션 콘텐츠 기획·제작, 채널 운영)을 수행해요',
      '사업부 운영·마케팅 예산 집행 계획을 세우고 모니터링과 결산을 해요',
      '서비스 운영 정책 수립과 프로세스 개선을 지원해요',
    ],
    must: [
      '경력 3년 이상 (공고 헤더 기준: 3~7년)',
      '기업 대상 서비스 운영 관련 경력 3~7년인 분',
      '고객사 관점에서 자사 서비스 개선 경험이 있는 분',
      '콘텐츠 기획서 등 기본적인 문서 작성 역량을 갖춘 분',
      '목표 달성을 위한 전략 수립 및 실행 경험이 있는 분',
      '적극적인 태도와 원활한 협업을 위한 커뮤니케이션 역량을 가진 분',
    ],
    nice: [
      '숙박 산업 및 OTA 서비스에 대한 이해도가 높은 분',
      '복지 및 업무 지원 관련 서비스 제공 업계 경험',
      '담당 고객사에 대해 단발성이 아닌 지속적인 서비스 운영 경험',
      '데이터 기반 사고 및 업무 수행 역량',
    ],
  },
];
