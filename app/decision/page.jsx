'use client';
import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '../../lib/store';
import { computeAll, explainDecision, DEFAULT_W } from '../../lib/engine';
import { Ring, PageHead, useRequireSetup, NeedSetup } from '../../components/Bits';
import { Stepper } from '../../components/Shell';
import RouteCard from '../../components/RouteCard';

const PRESETS = [
  ['균형 있게', { career: 40, life: 30, pref: 30 }],
  ['성장 우선', { career: 60, life: 15, pref: 25 }],
  ['출퇴근 우선', { career: 25, life: 55, pref: 20 }],
  ['선호 우선', { career: 25, life: 20, pref: 55 }],
];
const same = (a, b) => a.career === b.career && a.life === b.life && a.pref === b.pref;

export default function Decision() {
  const { state, results, feed, W, ivResult, patch, setSetup, toggleList, visit } = useApp();
  const ok = useRequireSetup();
  useEffect(() => { if (ok) visit('decision'); }, [ok, visit]);
  const base = useMemo(() => {
    if (!ok) return null;
    const bw = state.iv.answers.length >= 3 ? ivResult.W : DEFAULT_W;
    return computeAll({ setup: state.setup, resume: state.resume, W: bw, scope: ivResult.scope, workFlex: ivResult.workFlex, hidden: state.hidden }, feed.postings).ok[0];
  }, [ok, state.setup, state.resume, state.iv.answers, ivResult, state.hidden, feed.postings]);
  if (!ok) return <NeedSetup />;
  const top = results.ok[0];
  const ex = top ? explainDecision(top, results.ok) : null;
  const saved = top && state.saved.includes(top.p.id);
  const changed = top && base && base.p.id !== top.p.id;
  return (
    <>
      <Stepper />
      <PageHead crumb="08 지원 우선순위" title="지금의 나한테 가장 잘 맞는 선택" desc="일이 맞는지, 생활이 편한지, 선호에 맞는지를 같이 보고, 왜 추천하는지와 보완할 점까지 알려 드려요." right={<Link className="btn ghost" href="/setup">조건 다시 설정</Link>} />
      {!top ? (
        <article className="card pad-l"><h2>추천할 후보가 없어요</h2><p className="sub">통근 허용시간을 늘리거나 희망 직무를 바꿔 보세요. 아래 슬라이더로 바로 바꿔볼 수 있어요.</p></article>
      ) : (
        <section className="split-dec">
          <article className="rec dark">
            <div className="rec-h"><span className="pill acc">#1 추천</span><Ring value={top.total * 100} size={132} stroke={11} label="FIT" /></div>
            <h2>{top.c.name}</h2>
            <p className="sub-d">{top.p.title}</p>
            <div className="fits">
              <div><small>직무 적합도</small><b>{Math.round(top.career * 100)}%</b></div>
              <div><small>생활 적합도</small><b>{Math.round(top.life * 100)}%</b></div>
              <div><small>선호 적합도</small><b>{Math.round(top.pref * 100)}%</b></div>
            </div>
            <div className="judge"><small>AI 판단</small><p>“{ex.judge}”</p></div>
            <div className="cta-row">
              <a className="btn primary" href={top.p.url} target="_blank" rel="noopener noreferrer">공고 원문에서 지원하기</a>
              <button type="button" className="btn ghost-dark" onClick={() => toggleList('saved', top.p.id)}>{saved ? '저장됨' : '저장하기'}</button>
            </div>
          </article>
          <div className="stack">
            <article className="card pad-l">
              <p className="k">추천하는 이유</p>
              <ul className="expl">{ex.items.map((it, i) => <li key={i} className={it.ok ? 'ok' : 'no'}><span>{it.ok ? '✓' : '✕'}</span>{it.t}</li>)}</ul>
            </article>
            <article className="card pad-l">
              <p className="k">출근 경로 (카카오 대중교통)</p>
              {top.route ? <RouteCard route={top.route} /> : <p className="sub">아직 추정 시간만 있어요. <Link className="lnk" href="/jobs">후보 탐색</Link>에서 “실제 대중교통 시간으로 계산하기”를 누르면 어떤 노선을 타는지 알려 드려요.</p>}
            </article>
            <article className="card pad-l">
              <p className="k">조건을 바꾸면?</p>
              <div className="chips">{PRESETS.map(([t, w]) => <button key={t} type="button" className={`chip${same(W, w) ? ' on' : ''}`} aria-pressed={same(W, w)} onClick={() => patch({ W: w })}>{t}</button>)}</div>
              <div className="range"><label htmlFor="mm">허용 통근시간</label><output>{state.setup.maxMin}분</output></div>
              <input id="mm" type="range" min="30" max="90" step="5" value={state.setup.maxMin} onChange={(e) => setSetup({ maxMin: +e.target.value })} />
              <div className="rng-l"><span>30분</span><span>90분</span></div>
              <p className="sub">{changed ? `조건을 바꾸니 1순위가 바뀌었어요. (${base.c.name} → ${top.c.name})` : `이 조건에서도 1순위는 그대로예요. (${top.c.name})`}</p>
            </article>
          </div>
        </section>
      )}
      {results.ok.length > 1 ? (
        <section className="card pad-l">
          <p className="k">지원 우선순위</p>
          <ol className="prio">
            {results.ok.slice(0, 5).map((o, i) => (
              <li key={o.p.id}>
                <span className="rk">{i + 1}</span>
                <div><b>{o.c.name}</b><small>{o.p.title.split(' - ')[0]} · {o.p.team}</small></div>
                <div className="mini3"><span>직무 {Math.round(o.career * 100)}</span><span>생활 {Math.round(o.life * 100)}</span><span>선호 {Math.round(o.pref * 100)}</span></div>
                <em>{Math.round(o.total * 100)}</em>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
      {results.ex.length ? (
        <section className="card pad-l">
          <p className="k">뺀 후보</p>
          <ul className="why">{results.ex.slice(0, 6).map((o) => <li key={o.p.id}><b>{o.c.name}</b> <span>{o.p.title.split(' - ')[0]}</span><em>{o.why}</em></li>)}</ul>
        </section>
      ) : null}
      <div className="cta-row"><Link className="btn ghost" href="/match">공고 요건과 내 경험 다시 보기</Link><Link className="btn primary" href="/preference">나의 선택 기준 보기</Link></div>
    </>
  );
}
