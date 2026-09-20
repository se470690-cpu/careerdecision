'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../lib/store';
import { progressOf } from '../lib/engine';

export const STEPS = [
  { n: '01', t: '시작하기', s: '서비스 소개', href: '/' },
  { n: '02', t: '나를 설정하기', s: '주소 · 이력서', href: '/setup' },
  { n: '03', t: '개인화 홈', s: '오늘의 요약', href: '/home' },
  { n: '04', t: '나의 커리어', s: '이력서 분석', href: '/career' },
  { n: '05', t: '선택 질문', s: '질문 3개', href: '/interview' },
  { n: '06', t: '후보 탐색', s: '지도 · 후보 소거', href: '/jobs' },
  { n: '07', t: '의미 기반 매칭', s: '요건과 근거', href: '/match' },
  { n: '08', t: '지원 우선순위', s: '최종 판단', href: '/decision' },
  { n: '09', t: '나의 선택 기준', s: '내 기준 정리', href: '/preference' },
];
const FLOW = [
  { t: '나를 이해해요', s: '이력서 · 출퇴근', paths: ['/setup', '/career', '/home'] },
  { t: '내 기준을 찾아요', s: '질문에 답하기', paths: ['/interview'] },
  { t: '공고를 정리해요', s: '공고 · 근무조건', paths: ['/jobs'] },
  { t: '나와 비교해요', s: '요건 ↔ 근거', paths: ['/match'] },
  { t: '결정을 도와줘요', s: '적합도 종합', paths: ['/decision', '/preference'] },
];

export function Stepper() {
  const path = usePathname();
  const idx = FLOW.findIndex((f) => f.paths.includes(path));
  return (
    <ol className="stepper" aria-label="진행 단계">
      {FLOW.map((f, i) => (
        <li key={f.t} className={i < idx ? 'done' : i === idx ? 'now' : ''}>
          <span className="dot">{i < idx ? '✓' : i + 1}</span>
          <span><b>{f.t}</b><small>{f.s}</small></span>
        </li>
      ))}
    </ol>
  );
}

export default function Shell({ children }) {
  const path = usePathname();
  const { state, feed } = useApp();
  const pct = progressOf(state);
  const ready = !!(state.setup.home && state.resume.length > 20);
  const doneMap = { '/setup': ready, '/interview': state.iv.answers.length >= 3, '/jobs': !!state.visited.jobs, '/decision': !!state.visited.decision };
  const lockedMsg = '먼저 주소와 이력서를 입력하면 볼 수 있어요';
  const name = state.setup.name || '나';
  const nav = [['/home', '홈'], ['/jobs', '공고'], ['/jobs#map', '내 주변'], ['/decision', 'AI 판단'], ['/preference', '내 기준']];
  return (
    <div className="shell">
      <header className="top">
        <Link href="/" className="brand" aria-label="CareerDecision 홈">
          <span className="logo" aria-hidden="true"><i /></span>
          <span><b>CareerDecision</b><small>AI 취업 의사결정</small></span>
        </Link>
        <nav className="topnav" aria-label="주요 메뉴">
          {nav.map(([h, t]) => <Link key={t} href={h} className={path === h.split('#')[0] && t !== '내 주변' ? 'act' : ''}>{t}</Link>)}
        </nav>
        <div className="top-r">
          <span className="sync"><i />{feed.live ? '공고 실시간 수집 중' : '공고 스냅샷 ' + feed.fetchedAt.slice(5).replace('-', '.')}</span>
          <span className="avatar" title={name}>{name.slice(0, 1)}</span>
        </div>
      </header>
      <div className="body">
        <aside className="side" aria-label="단계">
          <p className="side-h">내 결정 지도<br /><span>다음 선택까지 가는 길</span></p>
          <ol>
            {STEPS.map((s) => {
              const locked = !ready && s.href !== '/' && s.href !== '/setup';
              const done = doneMap[s.href] && path !== s.href;
              return (
                <li key={s.href}>
                  <Link href={s.href} className={`${path === s.href ? 'act' : ''}${locked ? ' lock' : ''}`} title={locked ? lockedMsg : undefined}>
                    <span className={`num${done ? ' ok' : ''}`}>{done ? '✓' : s.n}</span>
                    <span><b>{s.t}</b><small>{locked ? '먼저 입력이 필요해요' : s.s}</small></span>
                  </Link>
                </li>
              );
            })}
          </ol>
          <div className="status">
            <p>진행 상황 <b>{pct}%</b></p>
            <div className="bar-t"><i className="accent" style={{ width: `${pct}%` }} /></div>
            <small>{!ready ? '02 나를 설정하기부터 하면 다른 단계가 열려요.' : pct >= 90 ? '선택 기준을 충분히 이해했어요.' : '단계를 마칠수록 추천이 정확해져요.'}</small>
          </div>
        </aside>
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
