'use client';
import Link from 'next/link';
import { useApp } from '../../lib/store';
import { Bar, useRequireSetup } from '../../components/Bits';
import { Stepper } from '../../components/Shell';
import { TOP_LABEL } from '../../lib/engine';

const DIM_LABEL = { jobFit: ['직무 적합성', '문제를 정의하고 개선하는 경험'], growth: ['직무 성장성', '배울 점과 역할의 범위'], commute: ['통근 편의성', '출근 빈도와 이동 부담'], worklife: ['워라밸', '일하는 방식의 유연함'] };

export default function Home() {
  const { state, an, ivResult, results, W } = useApp();
  const ok = useRequireSetup();
  if (!ok) return <p className="loading">불러오는 중이에요…</p>;
  const done = state.iv.answers.length >= 3;
  const clarity = Math.min(100, 35 + 15 * state.iv.answers.length + Math.min(15, an.strengths * 2));
  const top1 = results.ok[0];
  const rv = ivResult.revealed;
  const ranked = Object.entries(DIM_LABEL).map(([k, v]) => ({ k, v, val: rv[k] })).sort((a, b) => b.val - a.val).slice(0, 3);
  const revealedTop = rv.growth >= rv.commute && rv.growth >= rv.worklife ? 'growth' : rv.commute >= rv.worklife ? 'commute' : 'worklife';
  const stated = state.setup.top;
  const insight = !done ? '선택 인터뷰를 마치면 처음 말한 기준과 실제 선택의 차이를 설명해 드려요.'
    : stated === revealedTop || (stated === 'mode' && revealedTop === 'worklife') ? `처음 말씀하신 “${TOP_LABEL[stated]}”이 실제 선택에서도 일관되게 나타났어요.`
      : `처음에는 “${TOP_LABEL[stated]}”을 1순위라고 말했지만, 실제 선택에서는 “${TOP_LABEL[revealedTop]}”을 더 일관되게 골랐어요.`;
  return (
    <>
      <Stepper />
      <section className="hero dark compact">
        <div className="hero-text">
          <p className="pill">오늘의 결정 브리프 · {new Date().toISOString().slice(0, 10).replace(/-/g, '.')}</p>
          <h1>채용공고를 찾는 대신,<br />나에게 맞는 선택을 좁혀보세요</h1>
          <p className="lead">이력서, 생활반경, 그리고 실제 선택 패턴을 함께 분석해서 지금의 나에게 가장 설득력 있는 커리어 선택을 제안해요.</p>
          <div className="cta-row"><Link className="btn primary" href={done ? '/decision' : '/interview'}>{done ? 'AI 추천 결과 보기' : '선택 인터뷰 시작하기'}</Link></div>
        </div>
        <aside className="signal">
          <p>지금 읽힌 신호</p>
          <b>{done ? `${DIM_LABEL[ranked[0].k][0]}과 ${DIM_LABEL[ranked[1].k][0]}의 균형점을 찾고 있어요.` : '아직 선택 기준을 모으는 중이에요.'}</b>
          <div className="segs"><i className="on" /><i className={state.iv.answers.length >= 1 ? 'on' : ''} /><i className={state.iv.answers.length >= 2 ? 'on' : ''} /><i className={done ? 'on' : ''} /></div>
        </aside>
      </section>

      <section className="grid3">
        <article className="card pad-l">
          <p className="k">AI가 이해한 나 <span className="tag ok">READY</span></p>
          <h2 className="big">{an.persona.replace(' ', '\u00A0')}</h2>
          <p className="sub">이력서에서 경험 {an.blocks.filter((b) => b.kind === 'project' || b.kind === 'org').length}개, 강점 {an.strengths}개를 구조화했어요.</p>
          <Link className="lnk" href="/career">이력서 분석 보기</Link>
        </article>
        <article className="card pad-l">
          <p className="k">선택 기준 선명도</p>
          <h2 className="big">{clarity}<small> / 100</small></h2>
          <Bar value={clarity} label="" right="" />
          <p className="sub">{done ? '직무 성장성과 출퇴근 편의성이 반복적으로 선택됐어요.' : '인터뷰 3문항으로 선명도를 높일 수 있어요.'}</p>
        </article>
        <article className="card pad-l">
          <p className="k">현재 1순위 후보</p>
          {top1 ? (
            <>
              <h2 className="big">{top1.c.name}</h2>
              <p className="sub">{top1.p.title.split(' - ')[0]} · {top1.p.team}</p>
              <p className="fit">종합 적합도 <b>{Math.round(top1.total * 100)}%</b></p>
            </>
          ) : <p className="sub">조건에 맞는 후보가 아직 없어요. 통근 허용시간이나 직무를 넓혀 보세요.</p>}
        </article>
      </section>

      <section className="split2">
        <article className="card pad-l">
          <p className="k">AI 인사이트</p>
          <h2>당신의 선택 패턴이 말해주는 것</h2>
          <p className="sub">처음 입력한 희망조건보다, 실제로 선택한 순간에 드러난 우선순위를 반영했어요.</p>
          <div className="grid3 tight">
            {ranked.map((r, i) => (
              <div key={r.k} className={`mini t${i}`}><small>{['TOP PRIORITY', 'CONSISTENT', 'REFINED'][i]}</small><b>{r.v[0]}</b><span>{r.v[1]}</span></div>
            ))}
          </div>
          <p className="note"><b>AI 해석</b> {insight}</p>
          <Link className="lnk" href="/interview">{done ? '인터뷰 다시 보기' : '인터뷰 시작하기'}</Link>
        </article>
        <article className="card pad-l accent-soft">
          <p className="k">NEXT BEST ACTION</p>
          <h2>결정을 더 선명하게</h2>
          <p className="sub">{results.ok.length}개의 후보를 생활 적합도와 실제 경험 연결 근거로 비교해볼 수 있어요.</p>
          <Link className="action" href="/jobs">후보 {Math.min(3, results.ok.length)}개 비교하기</Link>
          <Link className="action" href="/match">JD 매칭 근거 보기</Link>
          <p className="fine dim">현재 반영 비중 · 직무 {W.career}% · 생활 {W.life}% · 선호 {W.pref}%</p>
        </article>
      </section>
    </>
  );
}
