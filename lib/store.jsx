'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { COMPANY_BY_ID, POSTINGS } from './data';
import { analyzeResume, applyInterview, computeAll, DEFAULT_W } from './engine';

const KEY = 'careerdecision:v1';
export const INITIAL = {
  setup: { name: '', addr: '', home: null, geoSrc: '', years: 3, role: 'plan', inds: [], maxMin: 60, mode: 'hybrid', env: ['대중교통'], top: 'growth' },
  resume: '', fileName: '', iv: { answers: [] }, W: null, hidden: [], saved: [], visited: {},
  transit: { key: '', by: {}, status: 'idle', msg: '' },
  decisions: {},
};

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export function Providers({ children, initial }) {
  const [state, setState] = useState(initial || INITIAL);
  const [hydrated, setHydrated] = useState(!!initial);
  const [feed, setFeed] = useState({ postings: POSTINGS, live: false, fetchedAt: '2026-09-19' });

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) setState((s) => ({ ...s, ...JSON.parse(raw), setup: { ...s.setup, ...(JSON.parse(raw).setup || {}) } }));
    } catch (e) { /* 저장값이 없거나 깨졌으면 초기값 사용 */ }
    setHydrated(true);
    fetch('/api/postings').then((r) => (r.ok ? r.json() : null)).then((d) => { if (d && d.postings && d.postings.length) setFeed(d); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* 용량 초과 등은 무시 */ }
  }, [state, hydrated]);

  const patch = useCallback((p) => setState((s) => ({ ...s, ...p })), []);
  const setSetup = useCallback((p) => setState((s) => ({ ...s, setup: { ...s.setup, ...p } })), []);
  const visit = useCallback((k) => setState((s) => (s.visited[k] ? s : { ...s, visited: { ...s.visited, [k]: true } })), []);
  const reset = useCallback(() => { try { sessionStorage.removeItem(KEY); } catch (e) {} setState(INITIAL); }, []);
  const toggleList = useCallback((key, id) => setState((s) => ({ ...s, [key]: s[key].includes(id) ? s[key].filter((x) => x !== id) : [...s[key], id] })), []);

  // 카카오 대중교통 경로: 사용자가 버튼을 눌렀을 때만 조회하고, 출발지가 바뀌면 다시 조회해야 해요.
  const homeKey = state.setup.home ? `${state.setup.home[0].toFixed(4)},${state.setup.home[1].toFixed(4)}` : '';
  const transitOn = state.transit.status === 'ok' && state.transit.key === homeKey;
  const loadTransit = useCallback(async () => {
    const home = state.setup.home;
    if (!home) return;
    setState((s) => ({ ...s, transit: { ...s.transit, status: 'loading', msg: '' } }));
    const ids = [...new Set(feed.postings.map((p) => p.companyId))];
    const targets = ids.map((id) => COMPANY_BY_ID[id]).filter(Boolean).map((c) => ({ id: c.id, lat: c.lat, lng: c.lng }));
    const fail = (status, msg) => setState((s) => ({ ...s, transit: { key: '', by: {}, status, msg } }));
    try {
      const r = await fetch('/api/transit', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ from: home, targets }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) return fail(r.status === 501 ? 'off' : 'error', j.error || '대중교통 조회에 실패했어요.');
      const by = j.results || {};
      const okN = Object.values(by).filter((x) => x.status === 'OK').length;
      if (!okN) return fail('error', '대중교통 경로를 조회하지 못했어요. 출발지를 역 이름으로 바꿔 보세요.');
      setState((s) => ({ ...s, transit: { key: homeKey, by, status: 'ok', msg: `${targets.length}곳 중 ${okN}곳의 경로를 조회했어요. 나머지는 추정치예요.` } }));
    } catch (e) {
      fail('error', '네트워크 오류로 조회하지 못했어요.');
    }
  }, [state.setup.home, feed.postings, homeKey]);

  const decide = useCallback((id, choice, note) => setState((s) => ({ ...s, decisions: { ...(s.decisions || {}), [id]: { choice, note, at: Date.now() } } })), []);

  const ivResult = useMemo(() => applyInterview(state.iv.answers), [state.iv.answers]);
  const W = state.W || (state.iv.answers.length >= 3 ? ivResult.W : DEFAULT_W);
  const an = useMemo(() => analyzeResume(state.resume), [state.resume]);
  const results = useMemo(
    () => computeAll({ setup: state.setup, resume: state.resume, W, scope: ivResult.scope, workFlex: ivResult.workFlex, hidden: state.hidden, transit: transitOn ? state.transit.by : null }, feed.postings),
    [state.setup, state.resume, W, ivResult, state.hidden, feed.postings, transitOn, state.transit.by],
  );

  const value = { state, patch, setSetup, visit, reset, toggleList, hydrated, feed, ivResult, W, an, results, transitOn, loadTransit, decide };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
