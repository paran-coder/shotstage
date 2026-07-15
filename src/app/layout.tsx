// 앱 전체를 감싸는 루트 레이아웃, 전역 폰트와 메타데이터를 정의
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShotStage — 원하는 샷을 정확하게",
  description: "AI 영상/이미지 제작을 위한 3D 카메라 블로킹 도구",
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
