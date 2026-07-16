// 3D 뷰포트 위에 겹치는 2D 오버레이: 샷 라벨, Shot view/Bird's-eye 전환, 그리드·라벨 토글
"use client";

import { useShotStore } from "@/store/useShotStore";
import { buildTopLabel, buildBottomLabel } from "@/lib/promptBuilder";

export function ViewportOverlay() {
  const shotType = useShotStore((s) => s.shotType);
  const angleLabel = useShotStore((s) => s.angleLabel);
  const fov = useShotStore((s) => s.fov);
  const viewMode = useShotStore((s) => s.viewMode);
  const setViewMode = useShotStore((s) => s.setViewMode);
  const showGrid = useShotStore((s) => s.showGrid);
  const toggleGrid = useShotStore((s) => s.toggleGrid);
  const showLabels = useShotStore((s) => s.showLabels);
  const toggleLabels = useShotStore((s) => s.toggleLabels);
  const currentViewDirection = useShotStore((s) => s.currentViewDirection);

  const topLabel = buildTopLabel({ shotType, angleLabel, fov, viewDirection: currentViewDirection });
  const bottomLabel = buildBottomLabel({
    shotType,
    angleLabel,
    fov,
    viewDirection: currentViewDirection,
  });

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* 상단 왼쪽: 현재 샷 요약 라벨 + 조작 힌트 */}
      {showLabels && (
        <div className="pointer-events-auto absolute left-4 top-4 flex items-center gap-2">
          <div className="rounded-md bg-black/70 px-3 py-1.5 text-xs text-neutral-100">
            {topLabel}
          </div>
          <div className="hidden rounded-md bg-black/50 px-2.5 py-1.5 text-[11px] text-neutral-400 sm:block">
            <kbd className="rounded bg-neutral-800 px-1 py-0.5 text-neutral-300">drag</kbd> 회전
            {" · "}
            <kbd className="rounded bg-neutral-800 px-1 py-0.5 text-neutral-300">space</kbd> 이동
            {" · "}
            <kbd className="rounded bg-neutral-800 px-1 py-0.5 text-neutral-300">scroll</kbd> 줌
            {" · "}
            <kbd className="rounded bg-neutral-800 px-1 py-0.5 text-neutral-300">WASD</kbd> 중심점
          </div>
        </div>
      )}

      {/* 상단 중앙: Shot view / Bird's-eye 전환 */}
      <div className="pointer-events-auto absolute left-1/2 top-4 flex -translate-x-1/2 gap-1 rounded-md bg-black/70 p-1 text-xs">
        <button
          onClick={() => setViewMode("shot")}
          className={`rounded px-3 py-1.5 transition-colors ${
            viewMode === "shot"
              ? "bg-accent text-black font-medium"
              : "text-neutral-300 hover:text-white"
          }`}
        >
          샷 뷰
        </button>
        <button
          onClick={() => setViewMode("bird")}
          className={`rounded px-3 py-1.5 transition-colors ${
            viewMode === "bird"
              ? "bg-accent text-black font-medium"
              : "text-neutral-300 hover:text-white"
          }`}
        >
          버드아이
        </button>
      </div>

      {/* 상단 오른쪽: 그리드 / 라벨 토글 */}
      <div className="pointer-events-auto absolute right-4 top-4 flex gap-2">
        <button
          onClick={toggleGrid}
          title="그리드 표시"
          className={`flex h-8 w-8 items-center justify-center rounded-md text-sm ${
            showGrid ? "bg-accent text-black" : "bg-black/70 text-neutral-300 hover:text-white"
          }`}
        >
          ▦
        </button>
        <button
          onClick={toggleLabels}
          title="라벨 표시"
          className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium ${
            showLabels ? "bg-accent text-black" : "bg-black/70 text-neutral-300 hover:text-white"
          }`}
        >
          Aa
        </button>
      </div>

      {/* 하단 중앙: 샷 상세 라벨 */}
      {showLabels && (
        <div className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2 rounded-md bg-black/70 px-4 py-1.5 text-xs font-medium tracking-wide text-neutral-100">
          {bottomLabel}
        </div>
      )}

      {/* 모서리 장식 브라켓: 상단은 라벨/버튼이 이미 차지하고 있어 겹치지 않는 하단 양쪽으로 배치 */}
      <CornerBracket className="bottom-3 left-3" rotation={-90} />
      <CornerBracket className="bottom-3 right-3" rotation={180} />
    </div>
  );
}

function CornerBracket({
  className,
  rotation,
}: {
  className: string;
  rotation: number;
}) {
  return (
    <svg
      className={`absolute h-4 w-4 text-neutral-600 ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
      viewBox="0 0 16 16"
      fill="none"
    >
      <path d="M1 1 V7 M1 1 H7" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
