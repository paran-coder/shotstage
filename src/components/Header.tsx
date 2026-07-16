// 앱 최상단 헤더: 로고, 태그라인, 키보드 단축키 안내, 이용 방법 링크
import Link from "next/link";

export function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-800 bg-neutral-950 px-5">
      <div className="flex items-center gap-3">
        <span className="rounded bg-accent/20 p-1 text-accent">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
          </svg>
        </span>
        <span className="text-sm font-bold tracking-wide">
          SHOT<span className="text-accent">STAGE</span>
        </span>
        <span className="hidden text-xs text-neutral-500 sm:inline">
          원하는 샷을 정확하게, AI 영상 제작을 위한 카메라 블로킹 도구
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2.5 text-[11px] text-neutral-500 lg:flex">
          <span>
            <kbd className="rounded bg-neutral-800 px-1.5 py-0.5 text-neutral-300">drag</kbd> 회전
          </span>
          <span>·</span>
          <span>
            <kbd className="rounded bg-neutral-800 px-1.5 py-0.5 text-neutral-300">space</kbd> 이동
          </span>
          <span>·</span>
          <span>
            <kbd className="rounded bg-neutral-800 px-1.5 py-0.5 text-neutral-300">scroll</kbd> 줌
          </span>
          <span>·</span>
          <span>
            <kbd className="rounded bg-neutral-800 px-1.5 py-0.5 text-neutral-300">WASD</kbd> 중심점
          </span>
        </div>
        <Link
          href="/guide"
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white"
        >
          이용 방법
        </Link>
      </div>
    </header>
  );
}
