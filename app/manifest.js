// 홈 화면에 추가하면 주소창 없이 앱처럼 열려요.
export default function manifest() {
  return {
    name: 'CareerDecision',
    short_name: 'CareerDecision',
    description: '내 경험과 출퇴근으로 지원할 공고를 고르는 취업 코치',
    start_url: '/',
    display: 'standalone',
    background_color: '#f2f4f6',
    theme_color: '#3182f6',
    lang: 'ko',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
