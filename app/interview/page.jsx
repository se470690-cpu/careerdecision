'use client';
import Link from 'next/link';
import { useApp } from '../../lib/store';
import { IV_QUESTIONS, nextQuestion, TOP_LABEL } from '../../lib/engine';
import { PageHead, useRequireSetup, NeedSetup } from '../../components/Bits';
import { Stepper } from '../../components/Shell';
import { useState } from 'react';

export default function Interview() {
  const { state, patch, ivResult, W } = useApp();
  const ok = useRequireSetup();
  const [pick, setPick] = useState(null);
  if (!ok) return <NeedSetup />;
  const answers = state.iv.answers;
  const qid = nextQuestion(answers);
  const q = qid && IV_QUESTIONS[qid];
  const done = !qid;
  const next = () => { if (!pick) return; patch({ iv: { answers: [...answers, pick] }, W: null }); setPick(null); };
  const reset = () => { patch({ iv: { answers: [] }, W: null }); setPick(null); };
  const rv = ivResult.revealed;
  const rows = [['일이 맞는 정도', rv.jobFit], ['성장 기회', rv.growth], ['출퇴근 편의', rv.commute], ['워라밸', rv.worklife]].sort((a, b) => b[1] - a[1]);
  return (
    <>
      <Stepper />
      <PageHead crumb="05 선택 질문" title="회사를 고르는 기준을 같이 찾아볼게요" right={<span className="pill soft"><i className="pulse" />답에 따라 다음 질문이 달라져요</span>} />
      <div className="prog"><div className="bar-t"><i className="accent" style={{ width: `${(done ? 1 : (answers.length + 1) / 3) * 100}%` }} /></div><span>{Math.min(answers.length + 1, 3)} / 3</span></div>
      {!done ? (
        <section className="qcard dark">
          <p className="lead-s">{q.lead}</p>
          <h2>{q.q}</h2>
          <div className="opts">
            {['a', 'b'].map((k) => (
              <button key={k} type="button" className={`opt${pick === k ? ' on' : ''}`} onClick={() => setPick(k)} aria-pressed={pick === k}>
                <span className="ab">{k.toUpperCase()}</span>
                <b>{q[k].t}</b>
                <small>{q[k].s}</small>
              </button>
            ))}
          </div>
          <div className="qfoot"><button type="button" className="btn primary" disabled={!pick} onClick={next}>{answers.length === 2 ? '결과 보기' : '다음 질문'}</button><span>답변에 따라 다음 질문이 달라져요</span></div>
        </section>
      ) : (
        <section className="split2">
          <article className="card pad-l">
            <p className="k">고른 걸 보니</p>
            <h2>실제로 고른 기준의 순서</h2>
            <ol className="rank-list">{rows.map(([t, v], i) => <li key={t}><span>{i + 1}</span><b>{t}</b><em>{Math.round(v)}</em></li>)}</ol>
            <p className="note"><b>점수에 반영하는 비율</b> 직무 {W.career}% · 생활 {W.life}% · 선호 {W.pref}%{ivResult.scope ? ` · ${ivResult.scope === 'explore' ? '문제 정의부터 하는 역할' : '기준이 분명한 역할'} 선호` : ''}</p>
            <p className="fine dim">처음에 적은 1순위: {TOP_LABEL[state.setup.top]}</p>
          </article>
          <article className="card pad-l accent-soft">
            <p className="k">다음 단계</p>
            <h2>이 기준으로 후보를 좁혀볼까요?</h2>
            <Link className="action" href="/jobs">후보 탐색하러 가기</Link>
            <Link className="action" href="/home">개인화 홈으로</Link>
            <button type="button" className="btn ghost mt8" onClick={reset}>질문 다시 하기</button>
          </article>
        </section>
      )}
      <section className="grid3 tight lab3">
        <div className="mini"><small>찾는 중</small><b>좋아하는 조건</b></div>
        <div className="mini"><small>비교하는 중</small><b>무엇을 더 중요하게 보는지</b></div>
        <div className="mini"><small>다듬는 중</small><b>싫어하는 조건</b></div>
      </section>
    </>
  );
}
