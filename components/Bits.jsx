'use client';
import Link from 'next/link';
import { useApp } from '../lib/store';
import { GAZ } from '../lib/engine';
import { SAMPLE_RESUME } from '../lib/resume';

export function Chip({ on, onClick, children, tone }) {
  return (
    <button type="button" className={`chip${on ? ' on' : ''}${tone ? ' ' + tone : ''}`} aria-pressed={!!on} onClick={onClick}>{children}</button>
  );
}

export function Bar({ value, tone = 'accent', label, right }) {
  return (
    <div className="bar">
      {label ? <span className="bar-l">{label}</span> : null}
      <div className="bar-t"><i className={tone} style={{ width: `${Math.max(2, Math.min(100, Math.round(value)))}%` }} /></div>
      <b>{right ?? `${Math.round(value)}%`}</b>
    </div>
  );
}

export function Ring({ value, size = 120, stroke = 10, label = '점수', dark = true }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, v = Math.max(0, Math.min(100, value));
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={dark ? 'rgba(255,255,255,.14)' : '#e5e8eb'} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--accent-2)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="ring-c"><b>{Math.round(v)}</b><small>{label}</small></div>
    </div>
  );
}

export function PageHead({ crumb, title, desc, right }) {
  return (
    <header className="pagehead">
      <div>
        {crumb ? <p className="crumb">{crumb}</p> : null}
        <h1>{title}</h1>
        {desc ? <p className="desc">{desc}</p> : null}
      </div>
      {right}
    </header>
  );
}

// 주소와 이력서가 입력돼 있어야 결과를 계산할 수 있어요. (튕기지 않고 아래 NeedSetup 안내를 보여 줘요.)
export function useRequireSetup() {
  const { state, hydrated } = useApp();
  return hydrated && !!(state.setup.home && state.resume.length > 20);
}

export function NeedSetup() {
  const { hydrated, patch, setSetup } = useApp();
  if (!hydrated) return <p className="loading">불러오는 중이에요…</p>;
  const demo = () => {
    patch({ resume: SAMPLE_RESUME, fileName: '샘플 이력서' });
    setSetup({ name: '김하린', addr: '강남구', home: GAZ['강남구'], geoSrc: '내장 좌표', years: 3, role: 'plan' });
  };
  return (
    <section className="card pad-l gate">
      <p className="k">먼저 필요해요</p>
      <h2>주소와 이력서를 입력하면 볼 수 있어요</h2>
      <p className="sub">이 화면은 내 출퇴근 거리와 이력서를 기준으로 계산해요. 입력은 1분이면 끝나요. 먼저 둘러만 보고 싶다면 샘플로 바로 체험해 볼 수 있어요.</p>
      <div className="cta-row">
        <Link className="btn primary" href="/setup">내 정보 입력하러 가기</Link>
        <button type="button" className="btn ghost" onClick={demo}>샘플로 바로 체험하기</button>
      </div>
    </section>
  );
}

export const won = (n) => n;
export const fmtDate = (d) => (d ? `${d.slice(5, 7)}월 ${d.slice(8, 10)}일 마감` : '상시');
