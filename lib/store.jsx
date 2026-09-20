'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { POSTINGS } from './data';
import { analyzeResume, applyInterview, computeAll, DEFAULT_W } from './engine';

const KEY = 'careerdecision:v1';
export const INITIAL = {
  setup: { name: '', addr: '', home: null, geoSrc: '', years: 3, role: 'plan', inds: [], maxMin: 60, mode: 'hybrid', env: ['대중교통'], top: 'growth' },
  resume: '', fileName: '', iv: { answers: [] }, W: null, hidden: [], saved: [], visited: {},
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

  const ivResult = useMemo(() => applyInterview(state.iv.answers), [state.iv.answers]);
  const W = state.W || (state.iv.answers.length >= 3 ? ivResult.W : DEFAULT_W);
  const an = useMemo(() => analyzeResume(state.resume), [state.resume]);
  const results = useMemo(
    () => computeAll({ setup: state.setup, resume: state.resume, W, scope: ivResult.scope, workFlex: ivResult.workFlex, hidden: state.hidden }, feed.postings),
    [state.setup, state.resume, W, ivResult, state.hidden, feed.postings],
  );

  const value = { state, patch, setSetup, visit, reset, toggleList, hydrated, feed, ivResult, W, an, results };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
