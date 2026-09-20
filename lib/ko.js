// 한국어 조사 붙이기: 받침이 있으면 앞 것, 없으면 뒤 것. josa('당근','이/가') → '이', josa('토스','으로/로') → '로'
export function hasBatchim(word) {
  const c = String(word).trim().replace(/[”"'’)\]\s]+$/, '').slice(-1);
  const n = c.charCodeAt(0) - 0xac00;
  if (n >= 0 && n <= 11171) return n % 28 !== 0;
  return /[013678]/.test(c);
}
export function josa(word, type) {
  const [withB, noB] = type.split('/');
  const c = String(word).trim().replace(/[”"'’)\]\s]+$/, '').slice(-1);
  const n = c.charCodeAt(0) - 0xac00;
  if (withB === '으로') return hasBatchim(word) && !(n >= 0 && n % 28 === 8) ? withB : noB; // ㄹ 받침은 '로'
  return hasBatchim(word) ? withB : noB;
}
export const withJosa = (word, type) => word + josa(word, type);
