import { askCoach } from '../../../lib/coach';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// 공개 배포에서 서버의 API 키를 아무나 쓰지 못하도록: 접근 코드(선택) + 크기 제한 + IP당 호출 제한(서버리스 인스턴스 단위의 최선 노력).
const hits = new Map();
const LIMIT = 20, WINDOW = 60 * 60 * 1000;
function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW);
  if (arr.length >= LIMIT) { hits.set(ip, arr); return true; }
  arr.push(now); hits.set(ip, arr);
  return false;
}

export async function POST(req) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: 'AI 코치가 설정되지 않았어요.' }, { status: 501 });
  const code = process.env.COACH_ACCESS_CODE;
  if (code && req.headers.get('x-coach-code') !== code) return Response.json({ error: '접근 코드가 필요해요.', needCode: true }, { status: 401 });
  const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  if (limited(ip)) return Response.json({ error: '잠시 후에 다시 시도해 주세요. (1시간에 20번까지 쓸 수 있어요)' }, { status: 429 });

  let body;
  try { body = await req.json(); } catch (e) { return Response.json({ error: 'bad request' }, { status: 400 }); }
  const facts = Array.isArray(body.facts) ? body.facts.slice(0, 30).filter((f) => f && /^[A-Z]\d{0,2}$/.test(f.id) && typeof f.t === 'string').map((f) => ({ id: f.id, t: f.t.slice(0, 200) })) : [];
  const question = typeof body.question === 'string' ? body.question.trim().slice(0, 200) : '';
  if (facts.length < 3) return Response.json({ error: 'not enough facts' }, { status: 400 });
  if (JSON.stringify(facts).length > 9000) return Response.json({ error: 'too large' }, { status: 413 });

  try {
    const out = await askCoach({ key, model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001', facts, question });
    if (!out) return Response.json({ error: 'AI 응답을 읽지 못했어요. 다시 시도해 주세요.' }, { status: 502 });
    return Response.json(out);
  } catch (e) {
    return Response.json({ error: 'AI 코치 호출에 실패했어요.' }, { status: 502 });
  }
}
