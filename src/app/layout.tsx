// 앱 전체를 감싸는 루트 레이아웃, 전역 폰트와 메타데이터를 정의
import type { Metadata } from "next";
import "./globals.css";

// Vercel 배포 시 자동으로 제공되는 VERCEL_URL을 활용해 OG 이미지 절대 경로를 올바르게 해석한다.
// 커스텀 도메인을 쓰는 경우 NEXT_PUBLIC_SITE_URL 환경변수를 설정하면 그 값을 우선 사용한다.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ShotStage — 원하는 샷을 정확하게",
  description: "AI 영상/이미지 제작을 위한 3D 카메라 블로킹 도구",
  openGraph: {
    title: "ShotStage — 원하는 샷을 정확하게",
    description: "AI 영상/이미지 제작을 위한 3D 카메라 블로킹 도구",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShotStage — 원하는 샷을 정확하게",
    description: "AI 영상/이미지 제작을 위한 3D 카메라 블로킹 도구",
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
