'use client';
import { PRESETS } from '../lib/engine';

const DOT = { no: 'no', warn: 'warn', info: 'info' };
const sign = (n) => (n > 0 ? `+${n}` : `${n}`);

// 최종 추천이 "왜" 나왔는지를, 계산에 실제로 쓴 값으로만 설명합니다.
export default function WhyCard({ ex }) {
  const c = ex.confidence;
  const v = ex.versus;
  return (
    <section className="card pad-l why" id="why">
      <p className="k">왜 이 공고를 추천했나요?</p>
      <h2>{ex.headline}</h2>
      <p className={`conf ${c.level}`}><b>확신도</b> {c.label}</p>

      <div className="why-sec">
        <h3>점수는 이렇게 나왔어요</h3>
        <p className="fine">항목별 점수에 내가 정한 비중을 곱해서 더했어요. 총점 <b>{ex.total}점</b>이에요.</p>
        <ul className="pts">
          {ex.parts.map((p) => (
            <li key={p.key}>
              <span>{p.label}<small>내 비중 {p.weight}%</small></span>
              <div className="bar-t"><i className={p.key === 'life' ? 'gray' : 'accent'} style={{ width: `${Math.max(2, p.value)}%` }} /></div>
              <b>{p.value}점<small>총점에 +{p.points}</small></b>
            </li>
          ))}
        </ul>
      </div>

      <div className="why-sec">
        <h3>내 경험과 이어지는 부분</h3>
        {ex.strengths.length ? (
          <ul className="rs">
            {ex.strengths.map((s, i) => (
              <li key={i}>
                <p className="rq">{s.kind === 'must' ? '필수 요건' : '우대 요건'} · {s.req}</p>
                <p className="ev">{s.block && s.block.label ? <b>{s.block.label}{s.block.period ? ` (${s.block.period})` : ''}</b> : null}{s.sent}</p>
                {s.metrics.length ? <div className="chips">{s.metrics.map((m) => <span key={m} className="tag ok">{m}</span>)}</div> : null}
              </li>
            ))}
          </ul>
        ) : <p className="sub">이력서에서 뚜렷하게 이어지는 경험을 찾지 못했어요.</p>}
      </div>

      <div className="why-sec">
        <h3>걸리는 점</h3>
        {ex.risks.length ? (
          <ul className="rk">{ex.risks.map((r, i) => <li key={i}><i className={`dot2 ${DOT[r.level]}`} />{r.text}</li>)}</ul>
        ) : <p className="sub">크게 걸리는 점은 보이지 않아요.</p>}
      </div>

      {v ? (
        <div className="why-sec">
          <h3>2순위와 비교하면</h3>
          <p className="sub">2순위인 {v.name}의 “{v.title}”보다 총점이 <b>{v.total}점</b> 높아요. 직무 {sign(v.dims[0].diff)} · 생활 {sign(v.dims[1].diff)} · 선호 {sign(v.dims[2].diff)}점 차이예요.{v.minDiff !== 0 ? ` 출퇴근은 ${Math.abs(v.minDiff)}분 ${v.minDiff > 0 ? '짧아요' : '길어요'}.` : ''}</p>
        </div>
      ) : null}

      {ex.stability.length ? (
        <div className="why-sec">
          <h3>다른 기준으로 봐도 1순위일까요?</h3>
          <ul className="stab">
            {ex.stability.map((x, i) => (
              <li key={i} className={x.same ? 'same' : 'diff'}><b>{PRESETS[i][0]}</b><span>{x.same ? '그대로 1순위예요' : `1순위가 ${x.name}의 “${x.title}”로 바뀌어요`}</span></li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="why-sec">
        <h3>얼마나 믿어도 될까요?</h3>
        <p className={`conf big ${c.level}`}>{c.label}</p>
        <ul className="ul-l">{c.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
      </div>

      {ex.tips.length ? (
        <div className="why-sec">
          <h3>지원서에 이렇게 써 보세요</h3>
          <ul className="ul-l">{[...new Set(ex.tips)].map((t, i) => <li key={i}>{t}</li>)}</ul>
        </div>
      ) : null}
    </section>
  );
}
