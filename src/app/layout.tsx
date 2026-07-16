// 앱 전체를 감싸는 루트 레이아웃, 전역 폰트와 메타데이터를 정의
import type { Metadata } from "next";
import "./globals.css";

// Vercel의 VERCEL_URL은 배포할 때마다 바뀌는 고유 프리뷰 주소라, 팀/프로젝트 설정에 따라
// 외부(카카오톡·디스코드 등 링크 미리보기 크롤러)에서 접근이 막혀 있는 경우가 있다.
// 항상 공개인 "프로덕션 URL"을 우선 쓰고, 커스텀 도메인이 있으면 NEXT_PUBLIC_SITE_URL이 최우선이다.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined) ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ShotStage — 원하는 샷을 정확하게",
  description: "AI 영상/이미지 제작을 위한 3D 카메라 블로킹 도구",
  openGraph: {
    title: "ShotStage — 원하는 샷을 정확하게",
    description: "AI 영상/이미지 제작을 위한 3D 카메라 블로킹 도구",
    type: "website",
    // public/og.png 파일을 정적으로 참조한다 (파일이 없으면 공유 미리보기에 이미지가 안 뜰 뿐,
    // 빌드 에러는 나지 않는다). 1200x630 권장.
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShotStage — 원하는 샷을 정확하게",
    description: "AI 영상/이미지 제작을 위한 3D 카메라 블로킹 도구",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100 font-sans">
        {children}
      </body>
    </html>
  );
}
