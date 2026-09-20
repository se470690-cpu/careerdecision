// 선택 기능: ANTHROPIC_API_KEY 가 설정된 경우에만 동작하는 "AI 정밀 매칭".
// 이력서 문장이 Anthropic API 로 전송되므로, 화면에서 사용자가 직접 동의(버튼 클릭)했을 때만 호출됩니다.

export const dynamic = 'force-dynamic';

const SYSTEM = `당신은 채용 공고 요건과 지원자 이력서 문장을 의미 단위로 연결하는 평가자입니다.
각 요건(index i)에 대해 이력서 문장 중 가장 근거가 되는 것을 골라 판단합니다.
level: "match"(실제 수행 경험이 요건 목적과 같은 방향), "bridge"(일부만 연결되거나 보완 설명 필요), "gap"(근거 없음).
반드시 JSON 배열만 출력하세요. 형식: [{"i":0,"level":"match","s":3,"reason":"한 문장 근거"}]
s는 근거가 된 이력서 문장의 index이며 gap이면 null입니다. 이력서에 없는 경험을 지어내지 마세요.`;

export async function POST(req) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: 'AI 정밀 매칭이 설정되지 않았어요.' }, { status: 501 });
  let body;
  try { body = await req.json(); } catch { return Response.json({ error: 'bad request' }, { status: 400 }); }
  const reqs = (body.requirements || []).slice(0, 20).map((s) => String(s).slice(0, 300));
  const sents = (body.sentences || []).slice(0, 60).map((s) => String(s).slice(0, 300));
  if (!reqs.length || !sents.length) return Response.json({ error: 'empty' }, { status: 400 });
  const user = `요건:\n${reqs.map((r, i) => `${i}. ${r}`).join('\n')}\n\n이력서 문장:\n${sents.map((s, i) => `${i}. ${s}`).join('\n')}`;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001', max_tokens: 2000, system: SYSTEM, messages: [{ role: 'user', content: user }] }),
    });
    if (!r.ok) {
      let msg = '';
      try { const e = await r.json(); msg = (e.error && e.error.message) || ''; } catch (e2) { /* 생략 */ }
      return Response.json({ error: `upstream ${r.status}${msg ? `: ${msg.slice(0, 160)}` : ''}` }, { status: 502 });
    }
    const j = await r.json();
    const text = (j.content || []).map((c) => c.text || '').join('');
    const m = text.match(/\[[\s\S]*\]/);
    const arr = m ? JSON.parse(m[0]) : [];
    const clean = arr.filter((x) => Number.isInteger(x.i) && ['match', 'bridge', 'gap'].includes(x.level)).map((x) => ({ i: x.i, level: x.level, s: Number.isInteger(x.s) ? x.s : null, reason: String(x.reason || '').slice(0, 200) }));
    return Response.json({ results: clean });
  } catch (e) {
    return Response.json({ error: 'AI 매칭에 실패했어요.' }, { status: 502 });
  }
}
