// AI 코치에게 보낼 "근거 목록"을 만듭니다. 이미 계산이 끝난 값만 담고, 이력서 원문 전체는 보내지 않아요.
import { IV_QUESTIONS, nextQuestion, TOP_LABEL } from './engine';
import { ROLES } from './data';

const MODE_L = { office: '출근', hybrid: '하이브리드', remote: '원격' };

const cut = (t, n = 150) => String(t).replace(/\s+/g, ' ').trim().slice(0, n);

// 선택 질문 답을 읽을 수 있는 문장으로 바꿉니다.
export function ivReadable(answers) {
  const out = [], done = [];
  for (let i = 0; i < answers.length; i++) {
    const qid = nextQuestion(done);
    if (!qid) break;
    const q = IV_QUESTIONS[qid], a = q[answers[i]];
    out.push(`${cut(q.q, 60)} → ${a.t} (${a.s})`);
    done.push(answers[i]);
  }
  return out;
}

export function buildCoachFacts({ top, list, ex, setup, W, answers = [], stated, revealed }) {
  const f = [];
  const add = (id, t) => f.push({ id, t: cut(t) });
  const title = top.p.title;
  add('P1', `추천 공고: ${top.c.name} “${title}”. 총점 ${ex.total}점 = ${ex.parts.map((p) => `${p.label} ${p.points}점`).join(' + ')}`);
  add('P2', `내 조건: 희망 직무 ${(ROLES.find((r) => r.id === setup.role) || {}).n || setup.role}, 경력 ${setup.years}년, 통근 허용 ${setup.maxMin}분, 근무 형태 ${MODE_L[setup.mode] || setup.mode}. 비중은 직무 ${W.career}% · 생활 ${W.life}% · 선호 ${W.pref}%`);
  ivReadable(answers).forEach((t, i) => add(`Q${i + 1}`, `선택 질문 답변: ${t}`));
  if (stated && revealed) add('Q0', stated === revealed ? `처음에 적은 1순위(${TOP_LABEL[stated]})와 실제로 고른 경향이 같아요` : `처음에 적은 1순위는 ${TOP_LABEL[stated]}이었는데, 실제로 고른 경향은 ${TOP_LABEL[revealed]} 쪽이에요`);
  ex.strengths.forEach((s, i) => add(`E${i + 1}`, `요건 “${cut(s.req, 50)}” ↔ 경험 “${s.block ? s.block.label : '이력서'}”: ${cut(s.sent, 70)}${s.metrics[0] ? ` (성과: ${cut(s.metrics[0], 40)})` : ''}`));
  ex.risks.forEach((r, i) => add(`R${i + 1}`, r.text));
  if (ex.versus) add('V1', `2순위 ${ex.versus.name} “${ex.versus.title}”와 비교: 총점 ${ex.versus.total}점 앞섬 (직무 ${ex.versus.dims[0].diff} · 생활 ${ex.versus.dims[1].diff} · 선호 ${ex.versus.dims[2].diff})${ex.versus.minDiff ? `, 출퇴근 ${Math.abs(ex.versus.minDiff)}분 ${ex.versus.minDiff > 0 ? '짧음' : '김'}` : ''}`);
  if (ex.stability.length) add('S1', `기준을 바꿔 본 결과: ${ex.stability.map((x) => `${x.label}: ${x.same ? '1순위 유지' : `1순위가 ${x.name} “${x.title}”로 바뀜`}`).join(' / ')}`);
  add('C1', `확신도 ${ex.confidence.label}. ${ex.confidence.reasons.slice(0, 3).join(' ')}`);
  (list || []).slice(1, 3).forEach((o, i) => add(`O${i + 1}`, `${i + 2}순위 후보: ${o.c.name} “${o.p.title}”, 총점 ${Math.round(o.total * 100)}점, 통근 ${o.min}분`));
  return f;
}

// 인터뷰에서 실제로 고른 경향 (홈 화면과 같은 기준)
export const revealedTop = (rv) => (rv.growth >= rv.commute && rv.growth >= rv.worklife ? 'growth' : rv.commute >= rv.worklife ? 'commute' : 'worklife');
