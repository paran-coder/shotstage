// Subject/Environment/Look-style 입력창 옆에 붙는 범용 프리셋 불러오기·저장 드롭다운
"use client";

import { useEffect, useRef, useState } from "react";

export interface PresetItem {
  id: string;
  name: string;
}

export function PresetDropdown<T extends PresetItem>({
  items,
  onRefresh,
  onSelect,
  onSaveCurrent,
  onDelete,
}: {
  items: T[];
  onRefresh: () => void;
  onSelect: (item: T) => void;
  onSaveCurrent: (name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) onRefresh();
  }, [open, onRefresh]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="라이브러리에서 불러오기 / 저장"
        className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-800 text-xs text-neutral-300 hover:bg-neutral-700"
      >
        ☆
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-20 w-56 rounded-md border border-neutral-800 bg-neutral-900 p-2 shadow-xl">
          <div className="mb-2 max-h-40 overflow-y-auto">
            {items.length === 0 && (
              <p className="px-1 py-1 text-xs text-neutral-500">저장된 프리셋이 없습니다.</p>
            )}
            {items.map((item) => (
              <div
                key={item.id}
                className="group flex items-center justify-between rounded px-1.5 py-1 text-xs text-neutral-200 hover:bg-neutral-800"
              >
                <button
                  type="button"
                  className="flex-1 truncate text-left"
                  onClick={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                >
                  {item.name}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="ml-1 hidden text-neutral-500 hover:text-red-400 group-hover:inline"
                  title="삭제"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-1 border-t border-neutral-800 pt-2">
            <input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="이름 (동일 이름은 덮어쓰기)"
              className="min-w-0 flex-1 rounded bg-neutral-950 px-2 py-1 text-xs text-neutral-200 placeholder:text-neutral-600"
            />
            <button
              type="button"
              disabled={!saveName.trim()}
              onClick={() => {
                onSaveCurrent(saveName.trim());
                setSaveName("");
              }}
              className="rounded bg-accent px-2 py-1 text-xs font-medium text-black disabled:opacity-40"
            >
              저장
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
