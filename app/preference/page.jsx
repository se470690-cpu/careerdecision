'use client';
import Link from 'next/link';
import { useApp } from '../../lib/store';
import { ROLES } from '../../lib/data';
import { CONCEPTS, conceptsOf, TOP_LABEL } from '../../lib/engine';
import { Bar, PageHead, useRequireSetup, NeedSetup } from '../../components/Bits';
import { Stepper } from '../../components/Shell';

const MODE = { office: '출근', hybrid: '하이브리드', remote: '원격' };

export default function Preference() {
  const { state, ivResult, feed, reset, toggleList } = useApp();
  const ok = useRequireSetup();
  if (!ok) return <NeedSetup />;
  const s = state.setup, rv = ivResult.revealed, done = state.iv.answers.length >= 3;
  const role = ROLES.find((r) => r.id === s.role)?.n;
  const bars = [['일이 맞는 정도', rv.jobFit], ['성장 기회', rv.growth], ['출퇴근 편의', rv.commute], ['워라밸', rv.worklife], ['도메인 관심', s.inds.length ? 75 : 50]];
  const preferred = [role, ivResult.scope === 'explore' ? '문제 정의부터 하는 역할' : ivResult.scope === 'stable' ? '기준이 분명한 역할' : null, ivResult.workFlex === 1 ? '주 2~3회 출근' : null, MODE[s.mode], ...s.inds].filter(Boolean);
  const excluded = [`${s.maxMin}분 초과 통근`, ivResult.scope === 'explore' ? '기준이 정해진 단순 반복 업무' : null, ivResult.workFlex === 1 ? '주 5일 상시 출근' : null].filter(Boolean);
  const savedPosts = feed.postings.filter((p) => state.saved.includes(p.id));
  const hiddenPosts = feed.postings.filter((p) => state.hidden.includes(p.id));
  const tally = {};
  savedPosts.forEach((p) => conceptsOf([...p.does, ...p.must].join(' ')).forEach((c) => { tally[c] = (tally[c] || 0) + 1; }));
  const topC = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
  return (
    <>
      <Stepper />
      <PageHead crumb="09 나의 선택 기준" title="내가 말한 기준과 실제 선택한 기준" desc="직접 적은 조건과, 질문에서 고른 것·저장한 것·뺀 것으로 AI가 읽은 기준을 나란히 보여 드려요." />
      <section className="split2">
        <article className="card pad-l">
          <p className="k">내가 입력한 조건</p>
          <dl className="kv2">
            <div><dt>희망 직무</dt><dd>{role}</dd></div>
            <div><dt>최대 통근</dt><dd>{s.maxMin}분 이내</dd></div>
            <div><dt>근무 형태</dt><dd>{MODE[s.mode]}</dd></div>
            <div><dt>지금 생각하는 1순위</dt><dd>{TOP_LABEL[s.top]}</dd></div>
          </dl>
        </article>
        <article className="card pad-l">
          <p className="k">AI가 읽은 기준</p>
          {done ? bars.map(([t, v]) => <Bar key={t} value={v} label={t} right={v >= 70 ? '높음' : v >= 50 ? '중간' : '낮음'} />) : <p className="sub">선택 질문에 답하면 여기에 기준이 나와요. <Link className="lnk" href="/interview">질문하러 가기</Link></p>}
        </article>
      </section>
      <section className="split2">
        <article className="card pad-l"><p className="k">선호하는 조건</p><div className="chips">{preferred.map((t) => <span key={t} className="tag ok">{t}</span>)}</div></article>
        <article className="card pad-l"><p className="k">제외하려는 조건</p><div className="chips">{excluded.map((t) => <span key={t} className="tag no">{t}</span>)}</div></article>
      </section>
      <section className="card pad-l">
        <p className="k">쓸수록 나를 더 잘 알게 돼요</p>
        <div className="grid3 tight">
          <div className="mini"><small>저장한 공고</small><b>{savedPosts.length}개</b></div>
          <div className="mini"><small>관심 없음</small><b>{hiddenPosts.length}개</b></div>
          <div className="mini"><small>질문 답변</small><b>{state.iv.answers.length}/3</b></div>
        </div>
        <p className="note">{topC ? `저장한 공고에 “${CONCEPTS[topC[0]].n}” 관련 업무가 자꾸 나와요. 다음 추천에 이 취향을 반영할 수 있어요.` : '공고를 저장하거나 관심 없음으로 숨기면, 반복되는 패턴을 여기에 요약해 드려요.'}</p>
        {savedPosts.map((p) => <button key={p.id} type="button" className="txtbtn" onClick={() => toggleList('saved', p.id)}>{p.title.split(' - ')[0]} 저장 해제</button>)}
      </section>
      <section className="card pad-l privacy">
        <p className="k">내 데이터</p>
        <p className="sub">입력한 주소·이력서·선택 기록은 이 브라우저 탭의 임시 저장소에만 있어요. 탭을 닫으면 사라지고, 서버로 전송되지 않아요. (AI 정밀 매칭을 직접 누른 경우에만 해당 공고와 이력서 문장이 전송돼요.)</p>
        <div className="cta-row"><Link className="btn primary" href="/home">개인화 홈으로 돌아가기</Link><button type="button" className="btn ghost" onClick={() => { reset(); location.href = '/'; }}>내 데이터 지우기</button></div>
      </section>
    </>
  );
}
