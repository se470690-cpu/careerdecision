'use client';
import { useMemo } from 'react';
import { COMPANIES } from '../lib/data';
import { bearing, commuteMin, hav } from '../lib/engine';

// 내 주소를 중심으로 통근시간 링(30·45·60·90분)을 그리고, 지역을 "반경 안/밖" 칩으로 보여주는 다이어그램.
const CX = 300, CY = 240, W = 600, H = 480;
const RINGS = [[30, 62], [45, 104], [60, 146], [90, 196]];

// 통근 분 → 중심에서의 거리(px). 링 사이는 선형 보간합니다.
export function rOf(min) {
  if (min <= 0) return 0;
  let prev = [0, 0];
  for (const ring of RINGS) {
    if (min <= ring[0]) return prev[1] + ((min - prev[0]) / (ring[0] - prev[0])) * (ring[1] - prev[1]);
    prev = ring;
  }
  return Math.min(RINGS[3][1] + (min - 90) * 1.2, 226);
}

// 랜딩용 예시. 실제 결과가 아니라는 표시는 화면 캡션에 있어요.
const SAMPLE = [
  { l: '동작구', min: 38, deg: -92, ok: 3 },
  { l: '강남', min: 52, deg: -6, ok: 5 },
  { l: '판교', min: 58, deg: 96, ok: 2 },
  { l: '송파', min: 74, deg: 186, ok: 0 },
];

const THEMES = {
  dark: { bg: '#0f2044', ring: 'rgba(255,255,255,.16)', label: 'rgba(255,255,255,.55)', text: '#fff', sub: 'rgba(255,255,255,.7)', inFill: 'rgba(79,155,255,.22)', inStroke: '#4f9bff', outFill: 'rgba(255,255,255,.05)', outStroke: 'rgba(255,255,255,.28)', outText: 'rgba(255,255,255,.55)', main: '#4f9bff', dot: 'rgba(255,255,255,.07)' },
  light: { bg: '#ffffff', ring: 'rgba(25,31,40,.14)', label: '#6b7684', text: '#191f28', sub: '#4e5968', inFill: 'rgba(49,130,246,.12)', inStroke: '#3182f6', outFill: '#f2f4f6', outStroke: '#c9cfd6', outText: '#8b95a1', main: '#3182f6', dot: 'rgba(25,31,40,.06)' },
};

function relax(nodes) {
  for (let it = 0; it < 90; it++) {
    const all = [{ x: CX, y: CY, w: 132, h: 96, fixed: true }, ...nodes];
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
      const a = all[i], b = all[j];
      const ox = (a.w + b.w) / 2 + 8 - Math.abs(b.x - a.x), oy = (a.h + b.h) / 2 + 8 - Math.abs(b.y - a.y);
      if (ox > 0 && oy > 0) {
        if (ox < oy) { const d = (b.x >= a.x ? 1 : -1) * ox; if (a.fixed) b.x += d; else { a.x -= d / 2; b.x += d / 2; } }
        else { const d = (b.y >= a.y ? 1 : -1) * oy; if (a.fixed) b.y += d; else { a.y -= d / 2; b.y += d / 2; } }
      }
    }
    nodes.forEach((n) => { n.x = Math.max(n.w / 2 + 8, Math.min(W - n.w / 2 - 8, n.x)); n.y = Math.max(n.h / 2 + 30, Math.min(H - n.h / 2 - 8, n.y)); });
  }
  return nodes;
}

export default function RadiusDiagram({ home, maxMin = 60, ok = [], dark = false }) {
  const t = dark ? THEMES.dark : THEMES.light;
  const nodes = useMemo(() => {
    let base;
    if (!home) {
      base = SAMPLE.map((n) => ({ ...n }));
    } else {
      const g = {};
      COMPANIES.forEach((c) => { const a = (g[c.area] ??= { l: c.area, la: 0, ln: 0, n: 0, ok: 0 }); a.la += c.lat; a.ln += c.lng; a.n++; });
      ok.forEach((o) => { if (g[o.c.area]) g[o.c.area].ok++; });
      base = Object.values(g).map((a) => {
        const p = [a.la / a.n, a.ln / a.n];
        const min = commuteMin(hav(home, p));
        const br = bearing(home, p);
        return { l: a.l, min, deg: (br * 180) / Math.PI - 90, ok: a.ok };
      });
    }
    const list = base.map((n) => {
      const r = rOf(n.min), rad = (n.deg * Math.PI) / 180;
      const inside = n.min <= maxMin;
      const sub = inside ? `약 ${n.min}분${n.ok ? ` · 공고 ${n.ok}` : ''}` : `약 ${n.min}분 · 반경 밖`;
      return { ...n, sub, inside, w: Math.max(108, 38 + n.l.length * 16, 34 + sub.length * 8), h: 52, x: CX + Math.cos(rad) * r, y: CY + Math.sin(rad) * r };
    });
    return relax(list);
  }, [home, maxMin, ok]);

  return (
    <svg viewBox={`24 28 ${W - 48} ${H - 56}`} role="img" aria-label="내 주소를 중심으로 한 통근 반경 다이어그램" className="radius-svg">
      <defs>
        <radialGradient id="rd-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={t.main} stopOpacity={dark ? 0.34 : 0.2} />
          <stop offset="100%" stopColor={t.main} stopOpacity={dark ? 0.08 : 0.05} />
        </radialGradient>
        <pattern id="rd-dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill={t.dot} /></pattern>
        <filter id="rd-shadow" x="-20%" y="-30%" width="140%" height="180%"><feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity={dark ? 0.35 : 0.12} /></filter>
      </defs>
      <rect width={W} height={H} fill="url(#rd-dots)" />

      {RINGS.map(([m, r]) => (m === maxMin ? null : <circle key={m} cx={CX} cy={CY} r={r} fill="none" stroke={t.ring} strokeDasharray="2 7" strokeLinecap="round" />))}
      {(RINGS.find(([m]) => m === maxMin) || RINGS[2]) && (() => { const r = (RINGS.find(([m]) => m === maxMin) || RINGS[2])[1]; return <circle cx={CX} cy={CY} r={r} fill="url(#rd-glow)" stroke={t.main} strokeWidth="2" />; })()}
      {RINGS.map(([m, r]) => {
        const a = (-42 * Math.PI) / 180, x = CX + Math.cos(a) * r, y = CY + Math.sin(a) * r, main = m === maxMin;
        return (
          <g key={`l${m}`}>
            <rect x={x - 21} y={y - 12} width="42" height="24" rx="12" fill={main ? t.main : t.bg} stroke={main ? 'none' : t.ring} />
            <text x={x} y={y + 4.5} textAnchor="middle" fontSize="12.5" fontWeight="700" fill={main ? '#fff' : t.label}>{m}분</text>
          </g>
        );
      })}

      {nodes.filter((n) => n.inside).map((n) => <line key={`c${n.l}`} x1={CX} y1={CY} x2={n.x} y2={n.y} stroke={t.main} strokeOpacity=".45" strokeWidth="1.5" />)}

      {nodes.map((n) => (
        <g key={n.l} filter={n.inside ? 'url(#rd-shadow)' : undefined}>
          <rect x={n.x - n.w / 2} y={n.y - n.h / 2} width={n.w} height={n.h} rx="26" fill={n.inside ? (dark ? '#183a78' : '#fff') : t.outFill} stroke={n.inside ? t.inStroke : t.outStroke} strokeWidth={n.inside ? 1.5 : 1} strokeDasharray={n.inside ? undefined : '4 4'} />
          <circle cx={n.x - n.w / 2 + 20} cy={n.y} r="5" fill={n.inside ? t.main : t.outStroke} />
          <text x={n.x - n.w / 2 + 36} y={n.y - 2} fontSize="16" fontWeight="700" fill={n.inside ? t.text : t.outText}>{n.l}</text>
          <text x={n.x - n.w / 2 + 36} y={n.y + 15} fontSize="12.5" fill={n.inside ? t.sub : t.outText}>{n.sub}</text>
        </g>
      ))}

      <circle cx={CX} cy={CY} r="44" fill={t.main} fillOpacity="0.16" />
      <circle cx={CX} cy={CY} r="27" fill="#fff" filter="url(#rd-shadow)" />
      <path d="M-9 1.5 0-8l9 9.5V9a1.5 1.5 0 0 1-1.5 1.5H4.5V4h-9v6.5h-3A1.5 1.5 0 0 1-9 9z" transform={`translate(${CX} ${CY})`} fill="#0f2044" />
      <rect x={CX - 44} y={CY + 36} width="88" height="26" rx="13" fill="#0f2044" />
      <text x={CX} y={CY + 53} textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#fff">내 주소 지역</text>
    </svg>
  );
}
