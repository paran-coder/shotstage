// 선택된 화각비에 맞춰 뷰포트 위에 레터박스/필러박스 마스크를 그려주는 컴포넌트
"use client";

import { useEffect, useState } from "react";
import { useShotStore } from "@/store/useShotStore";
import { ASPECT_RATIOS } from "@/lib/aspectRatios";

export function AspectRatioMask({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const aspectRatio = useShotStore((s) => s.aspectRatio);
  const targetRatio = ASPECT_RATIOS[aspectRatio];
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef]);

  if (!size.width || !size.height) return null;

  const containerRatio = size.width / size.height;
  let barTop = 0;
  let barSide = 0;

  if (containerRatio > targetRatio) {
    // 컨테이너가 더 가로로 넓다 → 좌우에 필러박스
    const targetWidth = size.height * targetRatio;
    barSide = (size.width - targetWidth) / 2;
  } else {
    // 컨테이너가 더 세로로 길다 → 상하에 레터박스
    const targetHeight = size.width / targetRatio;
    barTop = (size.height - targetHeight) / 2;
  }

  return (
    <div className="pointer-events-none absolute inset-0">
      {barTop > 0 && (
        <>
          <div
            className="absolute inset-x-0 top-0 border-b-2 border-accent/70 bg-black"
            style={{ height: barTop }}
          />
          <div
            className="absolute inset-x-0 bottom-0 border-t-2 border-accent/70 bg-black"
            style={{ height: barTop }}
          />
        </>
      )}
      {barSide > 0 && (
        <>
          <div
            className="absolute inset-y-0 left-0 border-r-2 border-accent/70 bg-black"
            style={{ width: barSide }}
          />
          <div
            className="absolute inset-y-0 right-0 border-l-2 border-accent/70 bg-black"
            style={{ width: barSide }}
          />
        </>
      )}
      {(barTop > 0 || barSide > 0) && (
        <div className="absolute bottom-3 right-3 rounded bg-accent/90 px-2 py-0.5 text-[11px] font-medium text-black">
          {aspectRatio} 크롭 적용됨
        </div>
      )}
    </div>
  );
}
