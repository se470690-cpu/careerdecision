'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useApp } from '../../lib/store';
import { COMPANIES } from '../../lib/data';
import { kmForMin, CONCEPTS } from '../../lib/engine';
import { Bar, PageHead, fmtDate, useRequireSetup } from '../../components/Bits';
import { Stepper } from '../../components/Shell';

const MapView = dynamic(() => import('../../components/MapView'), { ssr: false, loading: () => <div className="mapwrap"><div className="map skeleton" /></div> });
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export default function Jobs() {
  const { state, results, feed, visit, toggleList, setSetup, transitOn, loadTransit } = useApp();
  const ok = useRequireSetup();
  const [active, setActive] = useState(null);
  useEffect(() => { if (ok) visit('jobs'); }, [ok, visit]);
  const home = state.setup.home;
  const items = useMemo(() => {
    if (!home) return [];
    return COMPANIES.map((c) => {
      const idx = results.ok.findIndex((o) => o.c.id === c.id);
      if (idx >= 0) {
        const o = results.ok[idx];
        return { id: c.id, lat: c.lat, lng: c.lng, kind: 'rank', rank: idx + 1, html: `<b>${esc(c.name)}</b><br>${esc(o.p.title)}<br>JD 매칭 ${Math.round(o.career * 100)}% · 통근 약 ${o.min}분(추정)<br><span style="color:#6b7684">${esc(c.addr)}</span>` };
      }
      const ex = results.ex.find((o) => o.c.id === c.id);
      if (ex) return { id: c.id, lat: c.lat, lng: c.lng, kind: 'ex', html: `<b>${esc(c.name)}</b> (제외)<br>${esc(ex.why)}` };
      return { id: c.id, lat: c.lat, lng: c.lng, kind: 'nodata', html: `<b>${esc(c.name)}</b><br>아직 요건까지 수집한 공고가 없어요.<br><span style="color:#6b7684">${esc(c.addr)}</span>` };
    });
  }, [home, results]);
  if (!ok) return <p className="loading">불러오는 중이에요…</p>;
  const f = results.funnel;
  const hiddenPosts = feed.postings.filter((p) => state.hidden.includes(p.id));
  const withStatus = COMPANIES.filter((c) => c.collect);
  const rest = COMPANIES.length - withStatus.length;
  return (
    <>
      <Stepper />
      <PageHead crumb="06 후보 탐색" title="내 생활 반경 안의 후보를 좁혀볼게요" desc={`통근 ${state.setup.maxMin}분(추정) 반경 안에서 요건까지 수집한 공고 ${f.initial}개를 살펴봤어요.`} />
      <section className="card pad-l transit-bar">
        <div>
          <p className="k">통근시간 기준</p>
          <p className="sub">{transitOn ? `카카오 대중교통 경로 기준이에요. ${state.transit.msg}` : '지금은 직선거리로 추정한 시간이에요. 실제 대중교통 경로로 바꿀 수 있어요.'}</p>
          {state.transit.status === 'off' || state.transit.status === 'error' ? <p className="msg" role="alert">{state.transit.msg}</p> : null}
          <p className="fine dim">누르면 출발지 좌표와 회사 위치가 카카오 API로 전송돼요. 서버에 저장하지 않아요.</p>
        </div>
        <button type="button" className="btn primary" disabled={state.transit.status === 'loading'} onClick={loadTransit}>
          {state.transit.status === 'loading' ? '조회 중이에요…' : transitOn ? '다시 조회하기' : '실제 대중교통 시간으로 계산하기'}
        </button>
      </section>
      <section className="split-map" id="map">
        <MapView home={home} reachKm={kmForMin(state.setup.maxMin)} items={items} activeId={active} onSelect={setActive} label={`통근 ${state.setup.maxMin}분 반경 (추정)`} />
        <aside className="card pad-l">
          <p className="k">공고 출처와 위치를 함께</p>
          <p className="sub">기업 주소를 지도 위에 표시해요. 파란 점선 원은 설정한 통근시간의 직선거리 환산 반경이에요. 회사별 실제 대중교통 시간은 위에서 조회하면 카드에 나타나요.</p>
          <ul className="src">
            {withStatus.map((c) => (
              <li key={c.id}>
                <span className={`dot${c.collect === 'none' ? '' : ' ok'}`} />
                <span><b>{c.name}</b> {c.collect === 'live' ? ((feed.liveCompanies || []).includes(c.id) ? '공식 채용 페이지 실시간 수집 중' : '공식 채용 페이지 스냅샷') : c.collect === 'snapshot' ? '공식 채용 페이지 개별 공고 스냅샷' : '수집 못 함'}<small>{c.collectNote}</small></span>
              </li>
            ))}
            <li><span className="dot" /><span>나머지 {rest}곳은 수집기를 아직 만들지 않아 지도에만 표시돼요.<small>위치: OpenStreetMap (© contributors)</small></span></li>
          </ul>
          <p className="fine dim">{feed.live ? '회사 공식 채용 페이지에서 실시간으로 수집한 공고를 포함해요.' : `공고는 ${feed.fetchedAt} 기준 스냅샷이에요. 서버에서 LIVE_COLLECT=1을 켜면 당근·캐치테이블 공고를 실시간으로 수집해요.`}</p>
          <div className="legend"><span><i className="pin first">1</i>추천 후보</span><span><i className="pin ex">×</i>제외</span><span><i className="pin nodata">·</i>공고 미수집</span></div>
        </aside>
      </section>

      <section className="cards">
        {results.ok.length === 0 ? (
          <article className="card pad-l wide"><h3>조건에 맞는 후보가 없어요</h3><p className="sub">통근 허용시간을 늘리거나 희망 직무를 바꿔 보세요. AI 판단 화면에서 조건을 바꿔볼 수 있어요.</p></article>
        ) : results.ok.map((o, i) => {
          const tags = o.sc.rows.filter((r) => r.m.level === 'match').flatMap((r) => r.m.sharedLabels).filter((v, k, a) => a.indexOf(v) === k).slice(0, 3);
          const saved = state.saved.includes(o.p.id);
          return (
            <article key={o.p.id} className={`card co${i === 0 ? ' first' : ''}${active === o.c.id ? ' active' : ''}`} onClick={() => setActive(o.c.id)}>
              <div className="co-h">
                <span className="logoch">{o.c.name.slice(0, 1)}</span>
                <div><h3>{o.c.name}</h3><p className="sub">{o.p.title.split(' - ')[0]} · {o.p.team}</p></div>
                <span className={`tag ${i === 0 ? 'ok' : i < 3 ? 'warn' : 'mute'}`}>{i === 0 ? 'PRIORITY' : i < 3 ? 'WATCH' : 'HOLD'}</span>
              </div>
              <div className="fitrow"><span>TOTAL FIT</span><b>{Math.round(o.total * 100)}<small>%</small></b></div>
              <Bar value={o.career * 100} label="JD 매칭" />
              <Bar value={o.life * 100} label="생활" tone="gray" />
              <dl className="kv">
                <div><dt>통근·출근</dt><dd>{o.min}분 {o.minSrc === 'transit' ? `(대중교통${o.transfers != null ? ` · 환승 ${o.transfers}회` : ''})` : '(추정)'} · {o.unknownDays ? '정책 미확인' : `주 ${o.days}회`}</dd></div>
                <div><dt>마감</dt><dd>{fmtDate(o.p.deadline)}</dd></div>
              </dl>
              <div className="chips">{o.adjacent ? <span className="tag mute">인접 직무</span> : null}{tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
              <p className="fine dim">{o.c.v ? '주소 확인' : '지역 기준 위치'} · {o.p.source} · {o.p.fetchedAt} 수집</p>
              {o.p.locNote ? <p className="fine dim">{o.p.locNote}</p> : null}
              <div className="co-f">
                <a className="lnk" href={o.p.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>공고 원문 확인</a>
                <button type="button" className="txtbtn" onClick={(e) => { e.stopPropagation(); toggleList('saved', o.p.id); }}>{saved ? '저장됨' : '저장'}</button>
                <button type="button" className="txtbtn" onClick={(e) => { e.stopPropagation(); toggleList('hidden', o.p.id); }}>관심 없음</button>
              </div>
            </article>
          );
        })}
      </section>

      <section className="split2">
        <article className="card pad-l">
          <p className="k">후보를 줄인 과정</p>
          <ol className="funnel">
            <li><span className="bub">{f.initial}</span><em>초기 후보</em></li>
            <li className="neg"><span className="bub">−{f.life}</span><em>생활반경 부적합</em></li>
            <li className="neg"><span className="bub">−{f.role}</span><em>직무·경력 불일치</em></li>
            <li className="neg"><span className="bub">−{f.evidence}</span><em>요건 근거 부족</em></li>
            <li className="pos"><span className="bub">{f.left}</span><em>비교할 후보</em></li>
          </ol>
        </article>
        <article className="card pad-l blue-soft">
          <p className="k">생활 적합도 노트</p>
          <h2>단순 통근시간보다<br />출근 빈도가 더 중요해요</h2>
          <p className="sub">주 5일 출근에 대한 부담을 반복해서 표현했다면, 편도 70분이어도 주 2회 출근인 후보가 편도 45분·주 5회 출근보다 생활 적합도가 높을 수 있어요. 환승 횟수는 대중교통 경로를 조회하면 반영돼요(환승 1회마다 생활 적합도를 5%씩 낮춰요).</p>
        </article>
      </section>

      <section className="card pad-l">
        <p className="k">제외한 후보와 이유 (Why not)</p>
        {results.ex.length === 0 ? <p className="sub">제외된 공고가 없어요.</p> : (
          <ul className="why">
            {results.ex.map((o) => <li key={o.p.id}><b>{o.c.name}</b> <span>{o.p.title.split(' - ')[0]}</span><em>{o.why}</em></li>)}
          </ul>
        )}
        {hiddenPosts.length ? (
          <div className="hid"><p className="fine dim">관심 없음으로 숨긴 공고 {hiddenPosts.length}개</p>{hiddenPosts.map((p) => <button key={p.id} type="button" className="txtbtn" onClick={() => toggleList('hidden', p.id)}>{p.title.split(' - ')[0]} 되돌리기</button>)}</div>
        ) : null}
        <div className="cta-row mt16"><Link className="btn primary" href="/match">JD 매칭 근거 보기</Link><Link className="btn ghost" href="/decision">최종 판단 보기</Link></div>
      </section>
    </>
  );
}
