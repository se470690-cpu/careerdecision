'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../lib/store';
import { INDUSTRIES, ROLES } from '../../lib/data';
import { geocode } from '../../lib/engine';
import { extractResumeText, SAMPLE_RESUME } from '../../lib/resume';
import { extractHints } from '../../lib/resumeParse';
import { Chip, PageHead } from '../../components/Bits';
import { Stepper } from '../../components/Shell';

const PLACES = ['동작구', '송파구', '강남구', '판교역', '강서구'];
const MINS = [30, 45, 60, 90];
const MODES = [['office', '출근'], ['hybrid', '하이브리드'], ['remote', '원격']];
const TOPS = [['growth', '직무 성장'], ['commute', '통근 편의'], ['worklife', '워라밸'], ['mode', '근무 방식']];
const ENVS = ['식당', '카페', '편의점', '대중교통'];

export default function Setup() {
  const { state, setSetup, patch } = useApp();
  const s = state.setup;
  const router = useRouter();
  const fileRef = useRef(null);
  const hintRef = useRef('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [fileMsg, setFileMsg] = useState('');

  const toggle = (key, v) => setSetup({ [key]: s[key].includes(v) ? s[key].filter((x) => x !== v) : [...s[key], v] });

  const progressText = (p) => (p.stage === 'read' ? '파일을 읽는 중이에요…'
    : p.stage === 'load' ? '글자 인식 엔진을 준비하는 중이에요. 처음에는 한글 데이터를 내려받느라 30초쯤 걸려요.'
      : p.stage === 'ocr' ? `글자를 인식하는 중이에요 (${p.page}/${p.pages}쪽 · ${p.pct}%)` : '');

  async function onFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setFileMsg('파일을 읽는 중이에요…');
    setBusy(true);
    let method = 'text';
    try {
      const text = await extractResumeText(f, (p) => { if (p.stage === 'done') method = p.method; else setFileMsg(progressText(p)); });
      patch({ resume: text, fileName: f.name });
      // 이력서 상단의 "경력 3년 5개월", "영등포구 거주" 같은 정보를 읽어 설정에 반영합니다.
      const hint = extractHints(text);
      const applied = [];
      if (hint.years) { setSetup({ years: hint.years.years }); applied.push(`경력 ${hint.years.label} → 경력 연차 ${hint.years.years}년`); }
      if (hint.addr && !s.addr.trim()) { setSetup({ addr: hint.addr }); applied.push(`거주지 → 주소 “${hint.addr}”`); }
      hintRef.current = applied.length ? ` 이력서에서 ${applied.join(', ')}로 채웠어요.` : '';
      setFileMsg(method === 'ocr'
        ? `${f.name} · 글자 인식(OCR)으로 ${text.length.toLocaleString()}자를 읽었어요. 오인식이 있을 수 있으니 아래 내용을 확인하고 고쳐 주세요.` + hintRef.current
        : `${f.name} · ${text.length.toLocaleString()}자를 읽었어요. 파일은 서버로 보내지 않았어요.` + hintRef.current);
    } catch (err) {
      console.error('[이력서 읽기 실패]', err);
      setFileMsg(err.message || '파일을 읽지 못했어요. 텍스트를 직접 붙여 넣어 주세요.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function submit(e) {
    e.preventDefault();
    setMsg('');
    if (!s.addr.trim()) return setMsg('주로 출근하시는 지역이나 역을 입력해 주세요. 예: 강남구, 사당역');
    if (state.resume.trim().length < 30) return setMsg('이력서를 올리거나 30자 이상 붙여 넣어 주세요. 샘플로 먼저 체험해 볼 수도 있어요.');
    setBusy(true);
    const g = await geocode(s.addr);
    setBusy(false);
    if (!g) return setMsg('위치를 찾지 못했어요. “역삼역”, “동작구”처럼 역 이름이나 구 이름으로 입력해 보세요.');
    setSetup({ home: g.ll, geoSrc: g.src });
    router.push('/home');
  }

  function demo() {
    patch({ resume: SAMPLE_RESUME, fileName: '샘플 이력서' });
    setSetup({ name: '김하린', addr: '강서구', years: 3, role: 'plan' });
    setFileMsg('가상 페르소나의 샘플 이력서를 채웠어요. 실제 개인정보가 아니에요.');
  }

  return (
    <>
      <Stepper />
      <PageHead crumb="02 나를 설정하기" title={`${s.name || '나'}의 취업 기준을 설정해볼게요`} desc="주소는 저장하지 않아요. 이력서 파일은 이 브라우저에서만 읽어요. (서버에 카카오 키가 설정돼 있으면 위치 검색과 대중교통 조회를 위해 입력한 지역이 카카오로 전송될 수 있어요.)" right={<button type="button" className="btn ghost" onClick={demo}>테스트 페르소나로 체험하기</button>} />
      <form className="form2" onSubmit={submit}>
        <section className="card pad-l">
          <div className="field">
            <label htmlFor="addr">주로 어디에서 출근하시나요?</label>
            <input id="addr" type="text" value={s.addr} onChange={(e) => setSetup({ addr: e.target.value })} placeholder="예: 강남구, 사당역, 서울 동작구" autoComplete="off" />
            <div className="chips mt8">{PLACES.map((p) => <Chip key={p} on={s.addr === p} onClick={() => setSetup({ addr: p })}>{p}</Chip>)}</div>
            <p className="hint">정확한 번지 대신 구·역 단위로 입력하면 돼요.</p>
          </div>
          <div className="field">
            <span className="lab">희망 직무</span>
            <div className="chips">{ROLES.map((r) => <Chip key={r.id} on={s.role === r.id} onClick={() => setSetup({ role: r.id })}>{r.n}</Chip>)}</div>
          </div>
          <div className="field">
            <label htmlFor="years">경력 연차</label>
            <div className="stepnum">
              <button type="button" aria-label="1년 줄이기" onClick={() => setSetup({ years: Math.max(0, s.years - 1) })}>−</button>
              <output id="years">{s.years}년</output>
              <button type="button" aria-label="1년 늘리기" onClick={() => setSetup({ years: Math.min(30, s.years + 1) })}>+</button>
            </div>
            <p className="hint">공고의 “N년 이상” 요건과 비교하는 데 써요.</p>
          </div>
          <div className="field">
            <span className="lab">희망 산업 (선택)</span>
            <div className="chips">{INDUSTRIES.map((i) => <Chip key={i} on={s.inds.includes(i)} onClick={() => toggle('inds', i)}>{i}</Chip>)}</div>
          </div>
        </section>

        <section className="card pad-l">
          <div className="field">
            <span className="lab">최대 통근시간 (편도)</span>
            <div className="chips">{MINS.map((m) => <Chip key={m} on={s.maxMin === m} onClick={() => setSetup({ maxMin: m })}>{m}분</Chip>)}</div>
          </div>
          <div className="field">
            <span className="lab">근무 형태</span>
            <div className="chips">{MODES.map(([k, t]) => <Chip key={k} on={s.mode === k} onClick={() => setSetup({ mode: k })}>{t}</Chip>)}</div>
          </div>
          <div className="field">
            <span className="lab">지금 생각하는 1순위</span>
            <div className="chips">{TOPS.map(([k, t]) => <Chip key={k} on={s.top === k} onClick={() => setSetup({ top: k })}>{t}</Chip>)}</div>
            <p className="hint">나중에 인터뷰에서 드러난 실제 선택과 비교해 볼게요.</p>
          </div>
          <div className="field">
            <span className="lab">주변에서 중요하게 보는 환경 <em className="soft">이후 버전에서 반영</em></span>
            <div className="chips">{ENVS.map((v) => <Chip key={v} on={s.env.includes(v)} onClick={() => toggle('env', v)} tone="sub">{v}</Chip>)}</div>
          </div>
        </section>

        <section className="card pad-l wide">
          <div className="field">
            <span className="lab">이력서</span>
            <div className="drop">
              <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.webp" onChange={onFile} hidden />
              <button type="button" className="btn ghost" disabled={busy} onClick={() => fileRef.current && fileRef.current.click()}>PDF · DOCX · 이미지 올리기</button>
              <span className="hint inl">{fileMsg || '스캔본·이미지도 글자를 인식해서 읽어요. 파일은 이 브라우저에서만 처리하고 서버로 보내지 않아요.'}</span>
            </div>
            <textarea value={state.resume} onChange={(e) => patch({ resume: e.target.value, fileName: '' })} placeholder="파일 대신 경력·프로젝트를 문장으로 붙여 넣어도 돼요. 문장 하나하나가 매칭 근거로 쓰여요." />
          </div>
          <div className="submit-row">
            <button className="btn primary lg" type="submit" disabled={busy}>{busy ? '위치를 찾는 중이에요' : 'AI가 나를 이해하기'}</button>
            <p className="msg" role="alert">{msg}</p>
          </div>
        </section>
      </form>
    </>
  );
}
