// SHOT TYPE 패널: 샷 타입 프리셋 버튼 목록
"use client";

import { PanelSection } from "./PanelSection";
import { useShotStore } from "@/store/useShotStore";
import { SHOT_PRESETS, SHOT_TYPE_ORDER } from "@/lib/shotPresets";

export function ShotTypePanel() {
  const shotType = useShotStore((s) => s.shotType);
  const setShotType = useShotStore((s) => s.setShotType);

  return (
    <PanelSection title="샷 타입">
      <div className="grid grid-cols-2 gap-2">
        {SHOT_TYPE_ORDER.map((id) => {
          const preset = SHOT_PRESETS[id];
          const active = shotType === id;
          return (
            <button
              key={id}
              onClick={() => setShotType(id)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-accent text-black"
                  : "bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
              } ${id === "twoShot" ? "col-span-2" : ""}`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </PanelSection>
  );
}
