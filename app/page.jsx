'use client';
import Link from 'next/link';
import RadiusDiagram from '../components/RadiusDiagram';
import { useApp } from '../lib/store';
import { COMPANIES } from '../lib/data';

export default function Landing() {
  const { feed, state } = useApp();
  const started = !!state.setup.home;
  const n = feed.postings.length;
  return (
    <>
      <section className="hero dark">
        <div className="hero-text">
          <p className="pill">AI 취업 의사결정</p>
          <h1>공고를 하나씩 찾는 대신,<br />나한테 맞는 곳만<br />추려 볼게요</h1>
          <p className="lead">이력서와 출퇴근 거리, 그리고 실제로 고른 기준을 함께 보고 채용공고 중에서 지금 나한테 맞는 곳을 골라 드려요.</p>
          <div className="cta-row">
            <Link className="btn primary lg" href={started ? '/home' : '/setup'}>{started ? '내 결과 이어서 보기' : '내 취업 기준 찾기'}</Link>
            <Link className="btn ghost-dark lg" href="/jobs#map">지도로 공고 둘러보기</Link>
          </div>
          <p className="fine">검색으로는 알 수 없는 “왜 이 회사인지”까지 근거와 함께 보여 드려요.</p>
        </div>
        <div className="hero-art"><RadiusDiagram dark home={null} maxMin={60} /><p className="art-cap">예시 화면 · 실제 결과는 내 주소와 이력서로 계산돼요</p></div>
      </section>

      <section className="grid3">
        <article className="card"><h3>내 경력 읽기</h3><p>키워드만 훑지 않고 어떤 문제를 어떻게 풀었는지까지 읽어서, 내가 따로 적지 않은 커리어 방향도 짚어 줘요.</p></article>
        <article className="card"><h3>고르는 기준 찾기</h3><p>“뭐가 제일 중요해요?”라고 묻는 대신, 두 가지 중 하나를 고르게 하고 그 선택에서 우선순위를 찾아요.</p></article>
        <article className="card"><h3>결정까지 도와주기</h3><p>추천만 하지 않고, 왜 뺐는지와 조건을 바꾸면 결과가 어떻게 달라지는지도 보여 줘요.</p></article>
      </section>

      <section className="card pad-l split">
        <div>
          <h2>지금은 이런 공고를 읽고 있어요</h2>
          <p className="desc">회사마다 공식 채용 페이지에서 요건 원문을 가져와서 이력서와 비교해요. 언제, 어디서 가져왔는지는 카드마다 적어 뒀어요.</p>
        </div>
        <ul className="facts">
          <li><b>{COMPANIES.length}곳</b><span>지도에 표시한 회사</span></li>
          <li><b>{n}개</b><span>요건까지 읽은 공고</span></li>
          <li><b>{feed.live ? '실시간' : feed.fetchedAt}</b><span>{feed.live ? '실시간으로 가져오는 중' : '공고 수집일'}</span></li>
        </ul>
      </section>
    </>
  );
}
