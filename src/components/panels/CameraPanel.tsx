// CAMERA 패널: 렌즈 FOV 슬라이더, mm 프리셋 버튼, 화각비 선택, Recenter 버튼
"use client";

import { PanelSection } from "./PanelSection";
import { useShotStore } from "@/store/useShotStore";
import { LENS_MM_PRESETS, FOV_MIN, FOV_MAX, mmToFov, fovToMm } from "@/lib/lensPresets";
import { ASPECT_RATIO_ORDER } from "@/lib/aspectRatios";

export function CameraPanel() {
  const fov = useShotStore((s) => s.fov);
  const setFov = useShotStore((s) => s.setFov);
  const aspectRatio = useShotStore((s) => s.aspectRatio);
  const setAspectRatio = useShotStore((s) => s.setAspectRatio);
  const requestRecenter = useShotStore((s) => s.requestRecenter);

  const currentMm = fovToMm(fov);

  return (
    <PanelSection title="카메라">
      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between text-xs text-neutral-400">
          <span>렌즈 (화각)</span>
          <span className="text-neutral-200">{Math.round(fov)}°</span>
        </div>
        <input
          type="range"
          min={FOV_MIN}
          max={FOV_MAX}
          value={fov}
          onChange={(e) => setFov(Number(e.target.value))}
          className="w-full accent-orange-500"
        />
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {LENS_MM_PRESETS.map((mm) => {
          const active = currentMm === mm;
          return (
            <button
              key={mm}
              onClick={() => setFov(mmToFov(mm))}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                active
                  ? "bg-accent text-black"
                  : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
              }`}
            >
              {mm}mm
            </button>
          );
        })}
      </div>

      <div className="mb-3">
        <div className="mb-1.5 text-xs text-neutral-400">화각비</div>
        <div className="flex flex-wrap gap-1.5">
          {ASPECT_RATIO_ORDER.map((ratio) => {
            const active = aspectRatio === ratio;
            return (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "bg-accent text-black"
                    : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                {ratio}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mb-3 text-xs leading-relaxed text-neutral-500">
        <span className="font-medium text-neutral-300">WASD</span>로 이동하고, 드래그로 시점을
        회전하고(제자리 pan/tilt), 스크롤로 돌리하세요.
      </p>

      <button
        onClick={requestRecenter}
        className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm text-neutral-200 transition-colors hover:bg-neutral-800"
      >
        피사체 중심으로 재정렬
      </button>
    </PanelSection>
  );
}
