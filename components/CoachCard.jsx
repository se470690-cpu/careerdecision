'use client';
import { useEffect, useState } from 'react';

const CHOICES = [['apply', '지원할래요'], ['hold', '더 볼게요'], ['skip', '안 갈래요']];
const CHOICE_L = Object.fromEntries(CHOICES);

// LLM은 "내 판단을 돕는" 역할이에요. 근거 목록만 보고 말하고, 결정은 아래에서 내가 내려요.
export default function CoachCard({ facts, decision, onDecide }) {
  const [st, setSt] = useState({ status: 'idle', data: null, msg: '' });
  const [q, setQ] = useState('');
  const [ans, setAns] = useState(null);
  const [code, setCode] = useState('');
  const [needCode, setNeedCode] = useState(false);
  const [choice, setChoice] = useState(decision ? decision.choice : null);
  const [note, setNote] = useState(decision ? decision.note : '');
  const byId = Object.fromEntries(facts.map((f) => [f.id, f.t]));

  useEffect(() => { try { setCode(sessionStorage.getItem('careerdecision:coach') || ''); } catch (e) { /* 저장소 사용 불가 */ } }, []);

  async function call(question) {
    setSt((s) => ({ ...s, status: 'loading', msg: '' }));
    try {
      const r = await fetch('/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', ...(code ? { 'x-coach-code': code } : {}) }, body: JSON.stringify({ facts, question }) });
      const j = await r.json().catch(() => ({}));
      if (r.status === 401) { setNeedCode(true); return setSt((s) => ({ ...s, status: 'idle', msg: code ? '접근 코드가 맞지 않아요.' : '접근 코드를 입력해 주세요.' })); }
      if (!r.ok) return setSt((s) => ({ ...s, status: 'error', msg: r.status === 501 ? '서버에 AI 키가 설정되지 않아서 아직 쓸 수 없어요. 위의 계산 결과는 그대로 볼 수 있어요.' : j.error || '잠시 후 다시 시도해 주세요.' }));
      try { sessionStorage.setItem('careerdecision:coach', code); } catch (e) { /* 무시 */ }
      if (question) setAns(j); else setSt({ status: 'ok', data: j, msg: '' });
      if (question) setSt((s) => ({ ...s, status: 'ok', msg: '' }));
    } catch (e) {
      setSt((s) => ({ ...s, status: 'error', msg: '네트워크 오류로 불러오지 못했어요.' }));
    }
  }

  const Refs = ({ refs }) => <span className="refs">{refs.map((r) => <i key={r} title={byId[r]}>{r}</i>)}</span>;
  const d = st.data;
  return (
    <section className="card pad-l coach">
      <p className="k">AI 코치와 같이 판단하기</p>
      <h2>결정은 내가 하고, 코치는 생각을 정리해 줘요</h2>
      <p className="sub">코치는 추천을 바꾸지 않아요. 위에서 계산한 결과를 풀어 주고, 스스로 물어볼 질문을 던져요.</p>

      {st.status !== 'ok' ? (
        <div className="coach-go">
          {needCode ? <input type="text" className="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="접근 코드" aria-label="접근 코드" autoComplete="off" /> : null}
          <button type="button" className="btn primary" disabled={st.status === 'loading'} onClick={() => call('')}>{st.status === 'loading' ? '생각을 정리하는 중이에요…' : '코치에게 물어보기'}</button>
          {st.msg ? <p className={st.status === 'error' ? 'msg' : 'fine'} role="status">{st.msg}</p> : null}
        </div>
      ) : (
        <div className="coach-out">
          {d.summary ? <p className="coach-sum">{d.summary}</p> : null}
          <ul className="coach-pts">{d.points.map((p, i) => <li key={i}>{p.text}<Refs refs={p.refs} /></li>)}</ul>
          {d.dropped ? <p className="fine dim">근거를 확인하지 못한 문장 {d.dropped}개는 보여주지 않았어요.</p> : null}
          {d.askYourself.length ? (
            <div className="aq"><b>스스로에게 물어보세요</b><ul>{d.askYourself.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
          ) : null}
          <div className="ask">
            <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="궁금한 걸 물어보세요. 예: 2순위는 왜 아니에요?" maxLength={120} aria-label="코치에게 질문" onKeyDown={(e) => { if (e.key === 'Enter' && q.trim()) call(q.trim()); }} />
            <button type="button" className="btn ghost" disabled={!q.trim() || st.status === 'loading'} onClick={() => call(q.trim())}>물어보기</button>
          </div>
          {ans && ans.answer ? <div className="coach-ans"><p>{ans.answer.text}<Refs refs={ans.answer.refs} /></p>{ans.askYourself && ans.askYourself[0] ? <small>{ans.askYourself[0]}</small> : null}</div> : ans ? <p className="fine dim">근거로 확인되는 답을 만들지 못했어요. 질문을 조금 바꿔 보세요.</p> : null}
        </div>
      )}

      <details className="fold-s">
        <summary>코치에게 전달되는 내용 보기</summary>
        <p className="fine dim">버튼을 누르면 아래 요약만 Anthropic API로 전송돼요. 이력서 원문 전체와 주소는 보내지 않아요.</p>
        <ul className="tlist">{facts.map((f) => <li key={f.id}><b>{f.id}</b> {f.t}</li>)}</ul>
      </details>

      <div className="journal">
        <h3>내 결정 남기기</h3>
        <div className="chips">{CHOICES.map(([k, t]) => <button key={k} type="button" className={`chip${choice === k ? ' on' : ''}`} aria-pressed={choice === k} onClick={() => setChoice(k)}>{t}</button>)}</div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={100} placeholder="이유를 한 줄로 적어 두면 나중에 다시 볼 때 도움이 돼요." aria-label="결정 이유" />
        <div className="cta-row"><button type="button" className="btn primary" disabled={!choice} onClick={() => onDecide(choice, note.trim())}>결정 저장하기</button>{decision ? <span className="fine">저장됨 · {CHOICE_L[decision.choice]}</span> : null}</div>
      </div>
    </section>
  );
}
