'use client';
import Link from 'next/link';
import { useApp } from '../../lib/store';
import { Bar, useRequireSetup, NeedSetup } from '../../components/Bits';
import { Stepper } from '../../components/Shell';
import { TOP_LABEL } from '../../lib/engine';
import { josa } from '../../lib/ko';

const DIM_LABEL = { jobFit: ['직무 적합도', '문제를 찾아서 고친 경험이 있는지'], growth: ['성장 기회', '배울 점과 맡는 역할의 폭'], commute: ['출퇴근 편의', '출근 횟수와 이동 부담'], worklife: ['워라밸', '일하는 방식이 얼마나 유연한지'] };

export default function Home() {
  const { state, an, ivResult, results, W } = useApp();
  const ok = useRequireSetup();
  if (!ok) return <NeedSetup />;
  const done = state.iv.answers.length >= 3;
  const clarity = Math.min(100, 35 + 15 * state.iv.answers.length + Math.min(15, an.strengths * 2));
  const top1 = results.ok[0];
  const rv = ivResult.revealed;
  const ranked = Object.entries(DIM_LABEL).map(([k, v]) => ({ k, v, val: rv[k] })).sort((a, b) => b.val - a.val).slice(0, 3);
  const revealedTop = rv.growth >= rv.commute && rv.growth >= rv.worklife ? 'growth' : rv.commute >= rv.worklife ? 'commute' : 'worklife';
  const stated = state.setup.top;
  const insight = !done ? '선택 질문에 답하면, 처음에 적은 기준과 실제로 고른 기준이 어떻게 다른지 알려 드려요.'
    : stated === revealedTop || (stated === 'mode' && revealedTop === 'worklife') ? `처음에 적은 “${TOP_LABEL[stated]}”이 실제로 고를 때도 그대로 나타났어요.`
      : `처음에는 “${TOP_LABEL[stated]}”${josa(TOP_LABEL[stated], '을/를')} 1순위로 적었지만, 실제로 고를 때는 “${TOP_LABEL[revealedTop]}”${josa(TOP_LABEL[revealedTop], '을/를')} 더 자주 골랐어요.`;
  return (
    <>
      <Stepper />
      <section className="hero dark compact">
        <div className="hero-text">
          <p className="pill">오늘의 요약 · {new Date().toISOString().slice(0, 10).replace(/-/g, '.')}</p>
          <h1>공고를 하나씩 찾는 대신,<br />나한테 맞는 곳만 추려 볼게요</h1>
          <p className="lead">이력서와 출퇴근 거리, 그리고 실제로 고른 기준을 함께 보고 지금 나한테 가장 잘 맞는 곳을 추천해요.</p>
          <div className="cta-row"><Link className="btn primary" href={done ? '/decision' : '/interview'}>{done ? '추천 결과 보기' : '선택 질문 시작하기'}</Link></div>
        </div>
        <aside className="signal">
          <p>지금까지 보인 경향</p>
          <b>{done ? `${DIM_LABEL[ranked[0].k][0]} · ${DIM_LABEL[ranked[1].k][0]} 사이에서 균형을 찾는 중이에요.` : '아직 기준을 모으는 중이에요.'}</b>
          <div className="segs"><i className="on" /><i className={state.iv.answers.length >= 1 ? 'on' : ''} /><i className={state.iv.answers.length >= 2 ? 'on' : ''} /><i className={done ? 'on' : ''} /></div>
        </aside>
      </section>

      <section className="grid3">
        <article className="card pad-l">
          <p className="k">AI가 읽은 나 <span className="tag ok">준비됨</span></p>
          <h2 className="big">{an.persona.replace(' ', '\u00A0')}</h2>
          <p className="sub">이력서에서 경험 {an.blocks.filter((b) => b.kind === 'project' || b.kind === 'org').length}개, 강점 {an.strengths}개를 찾았어요.</p>
          <Link className="lnk" href="/career">이력서 분석 보러 가기</Link>
        </article>
        <article className="card pad-l">
          <p className="k">내 기준이 얼마나 또렷한지</p>
          <h2 className="big">{clarity}<small> / 100</small></h2>
          <Bar value={clarity} label="" right="" />
          <p className="sub">{done ? '성장 기회와 출퇴근 편의를 여러 번 골랐어요.' : '질문 3개에 답하면 더 또렷해져요.'}</p>
        </article>
        <article className="card pad-l">
          <p className="k">지금 1순위</p>
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
          <p className="k">AI가 본 것</p>
          <h2>고른 걸 보니 이런 사람이에요</h2>
          <p className="sub">처음 적은 희망 조건보다, 실제로 골랐을 때 드러난 우선순위를 더 크게 반영했어요.</p>
          <div className="grid3 tight">
            {ranked.map((r, i) => (
              <div key={r.k} className={`mini t${i}`}><small>{['가장 중요해요', '그다음이에요', '세 번째예요'][i]}</small><b>{r.v[0]}</b><span>{r.v[1]}</span></div>
            ))}
          </div>
          <p className="note"><b>AI 한마디</b> {insight}</p>
          <Link className="lnk" href="/interview">{done ? '질문 다시 보기' : '질문 시작하기'}</Link>
        </article>
        <article className="card pad-l accent-soft">
          <p className="k">다음에 할 일</p>
          <h2>결정하기 전에 확인해 보세요</h2>
          <p className="sub">{results.ok.length}개의 후보를 생활 적합도와 실제 경험 연결 근거로 비교해볼 수 있어요.</p>
          <Link className="action" href="/jobs">후보 {Math.min(3, results.ok.length)}개 비교하기</Link>
          <Link className="action" href="/match">공고 요건과 내 경험 비교</Link>
          <p className="fine dim">현재 반영 비중 · 직무 {W.career}% · 생활 {W.life}% · 선호 {W.pref}%</p>
        </article>
      </section>
    </>
  );
}
