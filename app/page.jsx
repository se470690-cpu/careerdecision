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
          <h1>공고를 찾는 대신,<br />나에게 맞는 선택을<br />좁혀보세요</h1>
          <p className="lead">이력서와 생활반경, 그리고 실제로 고르는 순간의 선택을 분석해서 수많은 채용공고 중 지금의 나에게 맞는 곳을 가려드려요.</p>
          <div className="cta-row">
            <Link className="btn primary lg" href={started ? '/home' : '/setup'}>{started ? '내 결과 이어서 보기' : '내 취업 기준 찾기'}</Link>
            <Link className="btn ghost-dark lg" href="/jobs#map">지도로 공고 둘러보기</Link>
          </div>
          <p className="fine">검색만으로는 알 수 없는 “왜 이 회사를 선택해야 하는지”까지 근거와 함께 보여줘요.</p>
        </div>
        <div className="hero-art"><RadiusDiagram dark home={null} maxMin={60} /><p className="art-cap">예시 화면 · 실제 결과는 내 주소와 이력서로 계산돼요</p></div>
      </section>

      <section className="grid3">
        <article className="card"><h3>사용자 이해</h3><p>이력서에서 키워드가 아니라 경험의 맥락을 읽고, 직접 쓰지 않은 커리어 방향까지 짚어요.</p></article>
        <article className="card"><h3>선택 기준 발견</h3><p>“직무·통근·워라밸 중 뭐가 중요해요?” 대신 실제 선택 상황을 보여주고 고른 결과에서 우선순위를 찾아요.</p></article>
        <article className="card"><h3>의사결정 지원</h3><p>추천만이 아니라 제외한 이유(Why not)와 조건을 바꿨을 때의 결과(What if)까지 함께 보여줘요.</p></article>
      </section>

      <section className="card pad-l split">
        <div>
          <h2>지금은 이런 공고를 읽고 있어요</h2>
          <p className="desc">회사별 공식 채용 페이지에서 요건 원문을 수집해 이력서와 매칭해요. 수집일과 출처는 카드마다 표시돼요.</p>
        </div>
        <ul className="facts">
          <li><b>{COMPANIES.length}곳</b><span>지도에 표시된 회사 사무실</span></li>
          <li><b>{n}개</b><span>요건까지 수집한 공고</span></li>
          <li><b>{feed.live ? '실시간' : feed.fetchedAt}</b><span>{feed.live ? '당근 채용 페이지 수집 중' : '공고 수집일'}</span></li>
        </ul>
      </section>
    </>
  );
}
