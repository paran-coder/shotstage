// SUBJECT 패널: 피사체 좌우/깊이/회전 슬라이더, 두 번째 피사체 표시 토글 + 독립 위치 조정
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
  const secondSubject = useShotStore((s) => s.secondSubject);
  const setSecondSubject = useShotStore((s) => s.setSecondSubject);

  return (
    <PanelSection title="피사체">
      <p className="mb-2 text-[11px] font-medium text-neutral-500">인물 1</p>
      <SliderRow
        label="좌우"
        value={Math.round(subject.leftRight * 100)}
        min={-100}
        max={100}
        onChange={(v) => setSubject({ leftRight: v / 100 })}
      />
      <SliderRow
        label="깊이"
        value={Math.round(subject.depth * 100)}
        min={-100}
        max={100}
        onChange={(v) => setSubject({ depth: v / 100 })}
      />
      <SliderRow
        label="회전"
        value={subject.rotate}
        min={-180}
        max={180}
        suffix="°"
        onChange={(v) => setSubject({ rotate: v })}
      />
      <label className="mb-3 flex items-center gap-2 text-sm text-neutral-300">
        <input
          type="checkbox"
          checked={subject.showSecondSubject}
          onChange={(e) => setSubject({ showSecondSubject: e.target.checked })}
          className="h-3.5 w-3.5 accent-orange-500"
        />
        두 번째 피사체 표시
      </label>

      {subject.showSecondSubject && (
        <div className="border-t border-neutral-800 pt-3">
          <p className="mb-2 text-[11px] font-medium text-neutral-500">
            인물 2 (독립적으로 조정 가능)
          </p>
          <SliderRow
            label="좌우"
            value={Math.round(secondSubject.leftRight * 100)}
            min={-100}
            max={100}
            onChange={(v) => setSecondSubject({ leftRight: v / 100 })}
          />
          <SliderRow
            label="깊이"
            value={Math.round(secondSubject.depth * 100)}
            min={-100}
            max={100}
            onChange={(v) => setSecondSubject({ depth: v / 100 })}
          />
          <SliderRow
            label="회전"
            value={secondSubject.rotate}
            min={-180}
            max={180}
            suffix="°"
            onChange={(v) => setSecondSubject({ rotate: v })}
          />
        </div>
      )}
    </PanelSection>
  );
}
