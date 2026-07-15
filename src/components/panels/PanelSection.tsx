// 우측 사이드 패널의 공용 섹션 래퍼 (● 라벨 헤더 + 구분선)
export function PanelSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-neutral-800 px-4 py-4">
      <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-neutral-400">
        <span className="text-accent">●</span> {title}
      </h3>
      {children}
    </section>
  );
}
