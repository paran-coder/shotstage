// 메인 페이지: 헤더 + 3D 뷰포트(+오버레이) + 우측 패널 + 결과 모달을 조합
"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { Header } from "@/components/Header";
import { ViewportOverlay } from "@/components/viewport/ViewportOverlay";
import { AspectRatioMask } from "@/components/viewport/AspectRatioMask";
import { ShotTypePanel } from "@/components/panels/ShotTypePanel";
import { CameraPanel } from "@/components/panels/CameraPanel";
import { SubjectPanel } from "@/components/panels/SubjectPanel";
import { PromptPanel } from "@/components/panels/PromptPanel";
import { ResultModal } from "@/components/modals/ResultModal";

// three.js/R3F Canvas는 브라우저 전용이라 서버 사이드 렌더링을 비활성화
const Scene = dynamic(
  () => import("@/components/viewport/Scene").then((m) => m.Scene),
  { ssr: false },
);

export default function Home() {
  const viewportRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div ref={viewportRef} className="relative flex-1 bg-black">
          <Scene />
          <AspectRatioMask containerRef={viewportRef} />
          <ViewportOverlay />
        </div>
        <aside className="w-80 shrink-0 overflow-y-auto border-l border-neutral-800 bg-neutral-950">
          <ShotTypePanel />
          <CameraPanel />
          <SubjectPanel />
          <PromptPanel />
        </aside>
      </div>
      <ResultModal />
    </div>
  );
}
