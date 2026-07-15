// Generate 클릭 시 요청 카운터가 증가하면 캔버스를 PNG 데이터 URL로 캡처해 스토어에 저장
"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useShotStore } from "@/store/useShotStore";

export function FrameCapture() {
  const { gl, scene, camera } = useThree();
  const frameCaptureRequestId = useShotStore((s) => s.frameCaptureRequestId);
  const setCapturedFrame = useShotStore((s) => s.setCapturedFrame);

  useEffect(() => {
    if (frameCaptureRequestId === 0) return;
    // 캡처 직전 한 번 더 렌더링해 최신 프레임을 보장
    gl.render(scene, camera);
    const dataUrl = gl.domElement.toDataURL("image/png");
    setCapturedFrame(dataUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameCaptureRequestId]);

  return null;
}
