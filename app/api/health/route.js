export const dynamic = 'force-dynamic';

// 배포된 서버가 환경변수를 실제로 어떻게 보고 있는지 알려 주는 진단 주소입니다. 키 값 자체는 절대 보여주지 않고, 있음/없음/비어 있음과 길이·형식만 알려요.
const info = (v) => {
  if (v === undefined) return '없음 (이 배포에는 이 변수가 전달되지 않았어요)';
  if (v === '') return '비어 있음 (변수는 있는데 값이 비어 있어요)';
  return `있음 (길이 ${v.length}${v.trim() !== v ? ', 앞뒤에 공백이 있어요' : ''})`;
};

export async function GET(req) {
  const key = process.env.ANTHROPIC_API_KEY;
  const url = new URL(req.url);
  const out = {
    지금_배포: { 커밋: (process.env.VERCEL_GIT_COMMIT_SHA || '').slice(0, 7) || '로컬', 환경: process.env.VERCEL_ENV || '로컬' },
    ANTHROPIC_API_KEY: info(key) + (key && !key.trim().replace(/^["']|["']$/g, '').startsWith('sk-ant-') ? ' / sk-ant- 로 시작하지 않아요. 다른 값이 들어간 것 같아요' : ''),
    ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL ? `있음 (${process.env.ANTHROPIC_MODEL})` : '없음 (기본 모델을 써요)',
    COACH_ACCESS_CODE: info(process.env.COACH_ACCESS_CODE),
    KAKAO_REST_API_KEY: info(process.env.KAKAO_REST_API_KEY),
    LIVE_COLLECT: process.env.LIVE_COLLECT === undefined ? '없음' : `있음 (${process.env.LIVE_COLLECT === '1' ? '켜짐' : '꺼짐'})`,
  };
  // ?test=1 : 실제로 아주 짧게 한 번 호출해서 어디서 막히는지 보여 줍니다. (접근 코드가 설정돼 있으면 &code=코드 가 필요해요)
  if (url.searchParams.get('test') === '1') {
    const need = process.env.COACH_ACCESS_CODE;
    const model = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';
    out.사용한_모델 = model;
    if (need && url.searchParams.get('code') !== need) out.호출_테스트 = '접근 코드가 필요해요. 주소 끝에 &code=접근코드 를 붙여 주세요.';
    else if (!key) out.호출_테스트 = '키가 없어서 건너뛰었어요.';
    else {
      try {
        const r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model, max_tokens: 5, messages: [{ role: 'user', content: '안녕' }] }),
          signal: AbortSignal.timeout(15000),
        });
        const j = await r.json().catch(() => ({}));
        out.호출_테스트 = r.ok ? '성공 (모델이 응답했어요)' : `실패 ${r.status}: ${(j.error && j.error.message) || ''}`;
      } catch (e) {
        out.호출_테스트 = `네트워크 오류: ${e.message}`;
      }
    }
  }
  return Response.json(out, { headers: { 'cache-control': 'no-store' } });
}
