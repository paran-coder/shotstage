// Generate 클릭 시 요청 카운터가 증가하면 캔버스를 PNG로 캡처하고,
// 선택된 화각비(AspectRatioMask와 동일한 크롭 계산)로 잘라내 스토어에 저장
"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useShotStore } from "@/store/useShotStore";
import { ASPECT_RATIOS } from "@/lib/aspectRatios";

/** 캔버스 전체 렌더링 결과에서, 선택된 화각비에 맞는 중앙 영역만 잘라 새 캔버스에 그린다.
 *  AspectRatioMask.tsx의 레터박스/필러박스 계산과 반드시 동일한 로직을 써야
 *  화면에 보이던 크롭과 실제로 저장되는 프레임이 일치한다. */
function cropToAspectRatio(source: HTMLCanvasElement, targetRatio: number): string {
  const { width, height } = source;
  const sourceRatio = width / height;

  let sx = 0;
  let sy = 0;
  let sw = width;
  let sh = height;

  if (sourceRatio > targetRatio) {
    sw = height * targetRatio;
    sx = (width - sw) / 2;
  } else {
    sh = width / targetRatio;
    sy = (height - sh) / 2;
  }

  const cropped = document.createElement("canvas");
  cropped.width = Math.round(sw);
  cropped.height = Math.round(sh);
  const ctx = cropped.getContext("2d");
  if (!ctx) return source.toDataURL("image/png");
  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, cropped.width, cropped.height);
  return cropped.toDataURL("image/png");
}

export function FrameCapture() {
  const { gl, scene, camera } = useThree();
  const frameCaptureRequestId = useShotStore((s) => s.frameCaptureRequestId);
  const aspectRatio = useShotStore((s) => s.aspectRatio);
  const setCapturedFrame = useShotStore((s) => s.setCapturedFrame);

  useEffect(() => {
    if (frameCaptureRequestId === 0) return;
    // 캡처 직전 한 번 더 렌더링해 최신 프레임을 보장
    gl.render(scene, camera);
    const targetRatio = ASPECT_RATIOS[aspectRatio];
    const dataUrl = cropToAspectRatio(gl.domElement, targetRatio);
    setCapturedFrame(dataUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameCaptureRequestId]);

  return null;
}
