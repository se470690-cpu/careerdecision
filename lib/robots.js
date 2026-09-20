// 수집 전에 사이트의 robots.txt 를 확인해 허용된 경로만 읽습니다. (사이트가 자동 접근을 막았다면 그 회사는 건너뜁니다.)
const UA = 'careerdecisionbot';
const cache = new Map();

function parse(txt) {
  const groups = [];
  let cur = null;
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim();
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const k = m[1].toLowerCase(), v = m[2].trim();
    if (k === 'user-agent') {
      if (!cur || cur.rules.length) { cur = { agents: [], rules: [] }; groups.push(cur); }
      cur.agents.push(v.toLowerCase());
    } else if ((k === 'disallow' || k === 'allow') && cur) cur.rules.push([k, v]);
  }
  const mine = groups.filter((g) => g.agents.includes(UA));
  const star = groups.filter((g) => g.agents.includes('*'));
  return (mine.length ? mine : star).flatMap((g) => g.rules);
}

const toRegex = (p) => new RegExp('^' + p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$/, '$'));

export function decide(rules, path) {
  let best = null;
  for (const [kind, pat] of rules) {
    if (!pat) continue;
    if (toRegex(pat).test(path) && (!best || pat.length >= best.pat.length)) best = { kind, pat };
  }
  return !best || best.kind === 'allow';
}

export async function isAllowed(url) {
  const u = new URL(url);
  if (!cache.has(u.origin)) {
    let rules = [];
    try {
      const r = await fetch(`${u.origin}/robots.txt`, { headers: { 'user-agent': 'CareerDecisionBot/0.1' } });
      if (r.ok) rules = parse(await r.text());
    } catch (e) { /* robots.txt 를 못 읽으면 규칙 없음으로 봅니다 */ }
    cache.set(u.origin, rules);
  }
  return decide(cache.get(u.origin), u.pathname);
}
