// Generate 클릭 후 뜨는 결과 모달: 블로킹 프레임 미리보기 + 최종 프롬프트 + 복사/다운로드/Higgsfield 연동
"use client";

import { useState } from "react";
import { useShotStore } from "@/store/useShotStore";

export function ResultModal() {
  const open = useShotStore((s) => s.resultModalOpen);
  const promptText = useShotStore((s) => s.resultPromptText);
  const capturedFrame = useShotStore((s) => s.capturedFrame);
  const closeResultModal = useShotStore((s) => s.closeResultModal);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 권한이 없는 환경에서는 조용히 무시
    }
  }

  function handleDownload() {
    if (!capturedFrame) return;
    const a = document.createElement("a");
    a.href = capturedFrame;
    a.download = "shotstage-blocking-frame.png";
    a.click();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-lg border border-neutral-800 bg-neutral-950 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-100">Your shot is ready</h2>
          <button
            onClick={closeResultModal}
            className="text-neutral-500 hover:text-neutral-200"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="mb-3 overflow-hidden rounded-md border border-neutral-800 bg-black">
          {capturedFrame ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={capturedFrame} alt="블로킹 프레임 미리보기" className="w-full" />
          ) : (
            <div className="flex h-40 items-center justify-center text-xs text-neutral-600">
              프레임 캡처 중...
            </div>
          )}
        </div>

        <div className="mb-1 flex items-center gap-2 text-xs">
          <span className="font-medium text-neutral-400">PROMPT</span>
          {copied && <span className="text-accent">copied</span>}
        </div>
        <div className="mb-3 max-h-40 overflow-y-auto rounded-md border border-neutral-800 bg-neutral-900 p-3 text-xs leading-relaxed text-neutral-300">
          {promptText}
        </div>

        <div className="mb-2 grid grid-cols-2 gap-2">
          <button
            onClick={handleCopy}
            className="rounded-md bg-neutral-900 px-3 py-2 text-xs font-medium text-neutral-200 hover:bg-neutral-800"
          >
            {copied ? "Copied ✓" : "Copy prompt"}
          </button>
          <button
            onClick={handleDownload}
            className="rounded-md bg-neutral-900 px-3 py-2 text-xs font-medium text-neutral-200 hover:bg-neutral-800"
          >
            Download frame
          </button>
        </div>

        <a
          href="https://higgsfield.ai"
          target="_blank"
          rel="noreferrer"
          className="mb-2 block rounded-md bg-gradient-to-b from-orange-400 to-accent px-4 py-2.5 text-center text-sm font-semibold text-black hover:opacity-90"
        >
          Create in Higgsfield →
        </a>
        <p className="text-center text-[11px] leading-relaxed text-neutral-600">
          Higgsfield에서 프롬프트를 붙여넣고 이 프레임을 레퍼런스 이미지로 추가하세요.
        </p>
      </div>
    </div>
  );
}
