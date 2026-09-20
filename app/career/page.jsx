'use client';
import { useApp } from '../../lib/store';
import { Bar, PageHead, useRequireSetup, NeedSetup } from '../../components/Bits';
import { Stepper } from '../../components/Shell';
import { CONCEPTS } from '../../lib/engine';

const Tags = ({ ids }) => (
  <div className="chips">{ids.length ? ids.slice(0, 6).map((c) => <span key={c} className="tag">{CONCEPTS[c].n}</span>) : <span className="tag mute">찾은 개념 없음</span>}</div>
);

function Par({ b }) {
  const rows = [['문제', b.problem], ['행동', b.action], ['성과', b.result]].filter((r) => r[1]);
  if (!rows.length) return null;
  return <dl className="par">{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>;
}

export default function Career() {
  const { state, an } = useApp();
  const ok = useRequireSetup();
  if (!ok) return <NeedSetup />;
  const max = Math.max(1, ...an.top.map((t) => t.n));
  const exp = an.blocks.filter((b) => b.kind === 'org' || b.kind === 'project');
  const summary = an.blocks.find((b) => b.kind === 'summary');
  const skills = an.blocks.find((b) => b.kind === 'skills');
  return (
    <>
      <Stepper />
      <PageHead crumb="04 나의 커리어" title="이력서에서 읽은 나" desc="줄마다 키워드를 뽑은 게 아니라, 어느 회사에서 어떤 문제를 어떻게 풀었고 결과가 어땠는지를 경험별로 정리했어요." />
      <section className="split2">
        <article className="card pad-l">
          <p className="k">AI가 본 내 유형</p>
          <h2 className="big">{an.persona}</h2>
          <p className="callout"><b>적지 않았지만 보이는 방향</b>{an.need}</p>
          {an.hints.years ? <p className="fine">이력서 상단에서 경력 {an.hints.years.label}을 읽었어요.</p> : null}
          <p className="fine dim">키워드 사전과 문장 구조를 보고 정리한 결과예요. 문맥까지 깊이 읽는 건 매칭 화면의 “AI로 다시 매칭하기”(선택)에서만 LLM이 해요.</p>
        </article>
        <article className="card pad-l">
          <p className="k">강점 <span className="soft">(경험 {exp.length}개 기준)</span></p>
          {an.top.length ? an.top.slice(0, 7).map((t) => <Bar key={t.id} value={(t.n / max) * 100} label={t.label} right={`${t.n}곳`} />) : <p className="sub">찾은 강점이 없어요. 이력서를 더 구체적으로 적어 주세요.</p>}
        </article>
      </section>

      <section className="card pad-l">
        <p className="k">경험 정리 <span className="soft">{state.fileName ? `· ${state.fileName}` : ''}</span></p>
        {exp.length === 0 ? <p className="sub">회사·프로젝트 구조를 찾지 못했어요. “회사명 | 직무” 줄과 기간을 함께 적으면 더 잘 읽어요.</p> : (
          <div className="exp">
            {exp.map((b) => (b.kind === 'org' ? (
              <article key={b.id} className="exp-org">
                <h3>{b.org}</h3>
                <p className="sub">{[b.role, b.period].filter(Boolean).join(' · ')}</p>
                {b.lines.length ? <ul className="ul-l">{b.lines.slice(0, 6).map((l, i) => <li key={i}>{l}</li>)}</ul> : null}
                {b.metrics.length ? <div className="chips mt8">{b.metrics.map((m) => <span key={m} className="tag ok">{m}</span>)}</div> : null}
                <Tags ids={b.cs} />
              </article>
            ) : (
              <article key={b.id} className="exp-proj">
                <h4>{b.title}</h4>
                <p className="fine dim">{b.org}{b.period ? ` · ${b.period}` : ''}</p>
                <Par b={b} />
                {b.metrics.length ? <div className="chips">{b.metrics.map((m) => <span key={m} className="tag ok">{m}</span>)}</div> : null}
                <Tags ids={b.cs} />
              </article>
            )))}
          </div>
        )}
      </section>

      <section className="split2">
        {summary ? (
          <article className="card pad-l"><p className="k">자기소개에서 찾은 것</p><Tags ids={summary.cs} /><p className="fine dim">자기소개 문장은 근거로 쓸 때 실제 프로젝트 경험보다 뒤에 둬요.</p></article>
        ) : null}
        {skills ? (
          <article className="card pad-l"><p className="k">스킬 섹션</p><ul className="ul-l">{skills.lines.map((l, i) => <li key={i}>{l}</li>)}</ul></article>
        ) : null}
      </section>

      <details className="card pad-l fold">
        <summary>원문을 문장별로 나눠 본 결과 보기 ({an.units.length}개)</summary>
        <ul className="ev-list">
          {an.units.map((u, i) => (
            <li key={i}>
              <p>{u.s}</p>
              <Tags ids={u.cs} />
            </li>
          ))}
        </ul>
      </details>
    </>
  );
}
