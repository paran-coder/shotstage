// SUBJECT 패널: 피사체 좌우/깊이/회전 슬라이더, 두 번째 피사체 표시 토글
"use client";

import { PanelSection } from "./PanelSection";
import { useShotStore } from "@/store/useShotStore";

function SliderRow({
  label,
  value,
  min,
  max,
  onChange,
  suffix = "",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div className="mb-3">
      <div className="mb-1.5 flex items-center justify-between text-xs text-neutral-400">
        <span>{label}</span>
        <span className="text-neutral-200">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-orange-500"
      />
    </div>
  );
}

export function SubjectPanel() {
  const subject = useShotStore((s) => s.subject);
  const setSubject = useShotStore((s) => s.setSubject);

  return (
    <PanelSection title="SUBJECT">
      <SliderRow
        label="Left / right"
        value={Math.round(subject.leftRight * 100)}
        min={-100}
        max={100}
        onChange={(v) => setSubject({ leftRight: v / 100 })}
      />
      <SliderRow
        label="Depth"
        value={Math.round(subject.depth * 100)}
        min={-100}
        max={100}
        onChange={(v) => setSubject({ depth: v / 100 })}
      />
      <SliderRow
        label="Rotate"
        value={subject.rotate}
        min={-180}
        max={180}
        suffix="°"
        onChange={(v) => setSubject({ rotate: v })}
      />
      <label className="flex items-center gap-2 text-sm text-neutral-300">
        <input
          type="checkbox"
          checked={subject.showSecondSubject}
          onChange={(e) => setSubject({ showSecondSubject: e.target.checked })}
          className="h-3.5 w-3.5 accent-orange-500"
        />
        Show second subject
      </label>
    </PanelSection>
  );
}
