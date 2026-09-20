import { geocodeKakao } from '../../../lib/kakao';

export const dynamic = 'force-dynamic';

// GET /api/geocode?q=사당역 → { ll:[lat,lng], label, src }
export async function GET(req) {
  const key = process.env.KAKAO_REST_API_KEY;
  if (!key) return Response.json({ error: 'not configured' }, { status: 501 });
  const q = (new URL(req.url).searchParams.get('q') || '').trim().slice(0, 80);
  if (q.length < 2) return Response.json({ error: 'empty' }, { status: 400 });
  try {
    const r = await geocodeKakao(key, q);
    if (!r) return Response.json({ error: 'not found' }, { status: 404 });
    if (r.error) return Response.json({ error: 'auth' }, { status: 502 });
    return Response.json(r);
  } catch (e) {
    return Response.json({ error: 'failed' }, { status: 502 });
  }
}
