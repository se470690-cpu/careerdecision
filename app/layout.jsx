import 'leaflet/dist/leaflet.css';
import './globals.css';
import { Providers } from '../lib/store';
import Shell from '../components/Shell';

export const metadata = {
  title: 'CareerDecision · 내 생활 반경에서 지원할 회사 고르기',
  description: '이력서와 출퇴근 거리, 고른 기준을 보고 공고 중에서 나한테 맞는 곳을 추려 주는 취업 서비스',
};

export const viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css" />
      </head>
      <body>
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
