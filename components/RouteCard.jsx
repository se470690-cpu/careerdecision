'use client';

const BADGE = { BUS: '버스', SUBWAY: '지하철', WALKING: '도보', ETC: '이동' };

// 카카오 대중교통 경로를 "무엇을 타고, 어디서 어디까지, 몇 분" 순서로 보여 줍니다.
export default function RouteCard({ route }) {
  if (!route || !route.legs) return null;
  return (
    <div className="route">
      <ol className="legs">
        {route.legs.map((l, i) => (
          <li key={i} className={`leg ${String(l.type).toLowerCase()}`}>
            <span className="lg-b">{BADGE[l.type] || '이동'}</span>
            <div>
              <b>{l.label || BADGE[l.type]}</b>
              {l.from ? <small>{l.from} → {l.to}{l.n ? ` · ${l.n}정거장` : ''}</small> : null}
            </div>
            <em>{l.min ? `${l.min}분` : '1분 미만'}</em>
          </li>
        ))}
      </ol>
      <p className="route-sum">
        총 <b>{route.min}분</b> · 환승 {route.transfers ?? '-'}회{route.fare != null ? ` · 요금 ${route.fare.toLocaleString()}원` : ''}
        {route.landingURL ? <a className="lnk" href={route.landingURL} target="_blank" rel="noopener noreferrer">카카오맵에서 보기</a> : null}
      </p>
      {route.otherMin >= 2 ? <p className="fine dim">위 구간 외에 출발·도착 도보나 대기 등 약 {route.otherMin}분이 총 시간에 포함돼 있어요.</p> : null}
      {route.alts && route.alts.length ? <p className="fine dim">다른 경로: {route.alts.map((a) => `${a.kind} ${a.min}분${a.transfers != null ? `(환승 ${a.transfers}회)` : ''}`).join(' · ')}</p> : null}
    </div>
  );
}
