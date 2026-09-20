'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../lib/store';

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

export function Ring({ value, size = 120, stroke = 10, label = 'FIT', dark = true }) {
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

// 설정이 끝나지 않았으면 설정 화면으로 보냅니다.
export function useRequireSetup() {
  const { state, hydrated } = useApp();
  const router = useRouter();
  const ready = !!(state.setup.home && state.resume.length > 20);
  useEffect(() => { if (hydrated && !ready) router.replace('/setup'); }, [hydrated, ready, router]);
  return hydrated && ready;
}

export const won = (n) => n;
export const fmtDate = (d) => (d ? `${d.slice(5, 7)}월 ${d.slice(8, 10)}일 마감` : '상시');
