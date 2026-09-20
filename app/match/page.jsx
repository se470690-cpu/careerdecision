'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useApp } from '../../lib/store';
import { Ring, PageHead, useRequireSetup } from '../../components/Bits';
import { Stepper } from '../../components/Shell';

const LV = { match: ['연결', 'ok'], bridge: ['보완', 'warn'], gap: ['근거 없음', 'no'] };

export default function Match() {
  const { state, results, an, patch, visit } = useApp();
  const ok = useRequireSetup();
  const [ai, setAi] = useState({ id: null, map: {}, msg: '', busy: false });
  const list = results.ok.slice(0, 6);
  const cur = list.find((o) => o.p.id === state.focus) || list[0];
  const rows = useMemo(() => {
    if (!cur) return [];
    const useAi = ai.id === cur.p.id;
    return cur.sc.rows.map((r, i) => {
      const a = useAi ? ai.map[i] : null;
      const level = a ? a.level : r.m.level;
      const au = a && a.s != null ? an.units[a.s] : null;
      const sent = a ? (au ? au.s : null) : r.m.sent && r.m.score >= 0.3 ? r.m.sent : null;
      const bk = a ? (au ? an.blocks[au.b] : null) : r.m.block;
      const block = bk ? { label: bk.label, period: bk.period, metrics: bk.metrics || [] } : null;
      const reason = a ? a.reason : [r.m.sharedLabels.length ? `공통 개념: ${r.m.sharedLabels.join(', ')}` : '', r.m.missingLabels.length ? `이력서에서 확인되지 않은 개념: ${r.m.missingLabels.join(', ')}` : ''].filter(Boolean).join(' · ');
      return { ...r, level, sent, reason, block: sent ? block : null, aiUsed: !!a };
    });
  }, [cur, ai, an.sents]);
  if (!ok) return <p className="loading">불러오는 중이에요…</p>;
  if (!cur) return (<><Stepper /><PageHead crumb="07 의미 기반 매칭" title="매칭할 후보가 아직 없어요" desc="후보 탐색에서 조건에 맞는 공고가 나오면 여기서 요건과 이력서 근거를 비교해요." /><Link className="btn primary" href="/jobs">후보 탐색으로</Link></>);
  const cnt = { match: rows.filter((r) => r.level === 'match').length, bridge: rows.filter((r) => r.level === 'bridge').length, gap: rows.filter((r) => r.level === 'gap').length };
  const mustRows = rows.filter((r) => r.kind === 'must');
  const rel = Math.round((rows.reduce((a, r) => a + r.w * (r.level === 'match' ? 1 : r.level === 'bridge' ? 0.5 : 0), 0) / Math.max(1, rows.reduce((a, r) => a + r.w, 0))) * 100);

  async function runAi() {
    setAi({ id: cur.p.id, map: {}, msg: 'AI가 요건과 이력서를 비교하는 중이에요…', busy: true });
    try {
      const r = await fetch('/api/match', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ requirements: cur.sc.rows.map((x) => x.t), sentences: an.units.map((u) => `[${u.label}] ${u.s}`) }) });
      const j = await r.json();
      if (!r.ok) return setAi({ id: null, map: {}, msg: r.status === 501 ? '서버에 AI 키가 설정되어 있지 않아요. 규칙 기반 결과를 그대로 보여드려요.' : (j.error || 'AI 매칭에 실패했어요.'), busy: false });
      const map = {};
      j.results.forEach((x) => { map[x.i] = x; });
      setAi({ id: cur.p.id, map, msg: 'AI 정밀 매칭 결과를 반영했어요.', busy: false });
    } catch (e) { setAi({ id: null, map: {}, msg: '네트워크 오류로 AI 매칭에 실패했어요.', busy: false }); }
  }

  return (
    <>
      <Stepper />
      <PageHead crumb="07 의미 기반 매칭" title="이력서의 경험이 JD에서 어떻게 연결되는지" desc="단어가 같은지가 아니라, 실제로 해결한 문제와 요구사항이 같은 방향인지 비교했어요." right={<span className="pill soft">{ai.id === cur.p.id && Object.keys(ai.map).length ? 'AI 정밀 매칭' : '규칙 기반 매칭'} · {rel}% 연결</span>} />
      <div className="tabs" role="tablist">
        {list.map((o, i) => <button key={o.p.id} role="tab" aria-selected={o.p.id === cur.p.id} className={o.p.id === cur.p.id ? 'on' : ''} onClick={() => patch({ focus: o.p.id })}>{i + 1}. {o.c.name} · {o.p.title.split(' - ')[0].replace('Product', 'P.').slice(0, 22)}</button>)}
      </div>
      <section className="card pad-l match-head">
        <div><p className="k">{cur.c.name} · {cur.p.team}</p><h2>{cur.p.title}</h2><a className="lnk" href={cur.p.url} target="_blank" rel="noopener noreferrer">공고 원문 보기</a>{cur.p.reqNote ? <p className="fine dim">{cur.p.reqNote}</p> : null}</div>
        <div className="ringbox"><Ring value={rel} size={112} label="RELEVANCE" dark={false} /></div>
        <div className="mcnt"><div><b>{cnt.match}</b><span>연결됨</span></div><div><b>{cnt.bridge}</b><span>보완 필요</span></div><div><b>{cnt.gap}</b><span>근거 없음</span></div><div><b>{mustRows.filter((r) => r.level === 'match').length}/{mustRows.length}</b><span>핵심 요건</span></div></div>
      </section>
      <section className="pairs">
        {rows.map((r, i) => (
          <article key={i} className={`pair ${LV[r.level][1]}`}>
            <div className="req"><span className={`tag ${r.kind === 'must' ? 'ok' : 'mute'}`}>{r.kind === 'must' ? '필수' : '우대'}</span><p>{r.t}</p></div>
            <div className="mid"><span className={`lv ${LV[r.level][1]}`}>{LV[r.level][0]}</span></div>
            <div className="evd">
              {r.block && r.block.label ? <p className="src-l">{r.block.label}{r.block.period ? ` · ${r.block.period}` : ''}</p> : null}
              {r.sent ? <p>{r.sent}</p> : <p className="dim">{r.m.gap ? `경력 ${r.m.gap.need}년 이상이 필요한 요건이에요.` : '이력서에서 이 요건과 연결되는 문장을 찾지 못했어요.'}</p>}
              {r.sent && r.block && r.block.metrics.length ? <div className="chips mt8">{r.block.metrics.slice(0, 2).map((m) => <span key={m} className="tag ok">{m}</span>)}</div> : null}
              {r.reason ? <small>{r.aiUsed ? 'AI 판단 · ' : ''}{r.reason}</small> : null}
              {r.level !== 'match' ? <small className="bridge">지원서에서 이 요건과 가까운 경험을 한 문장 더 구체적으로 적어 보세요.</small> : null}
            </div>
          </article>
        ))}
      </section>
      <section className="split2">
        <article className="card pad-l">
          <p className="k">AI 정밀 매칭 (선택)</p>
          <p className="sub">서버에 API 키가 설정된 경우, 이 공고의 요건과 이력서 문장이 Anthropic API로 전송돼 의미 단위로 다시 판단해요. 누르기 전에는 아무것도 전송되지 않아요.</p>
          <button type="button" className="btn ghost" disabled={ai.busy} onClick={runAi}>{ai.busy ? '비교 중이에요' : 'AI로 다시 매칭하기'}</button>
          <p className="fine" role="status">{ai.msg}</p>
        </article>
        <article className="card pad-l accent-soft">
          <p className="k">NEXT MOVE</p>
          <h2>최종 판단 보기</h2>
          <p className="sub">직무·생활·선호 적합도를 합쳐 지원 우선순위와 이유를 확인해요.</p>
          <Link className="action" href="/decision">지원 우선순위로 이동</Link>
        </article>
      </section>
    </>
  );
}
