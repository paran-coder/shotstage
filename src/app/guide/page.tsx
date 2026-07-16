// 이용 방법 안내 페이지. 정적 콘텐츠라 클라이언트 컴포넌트일 필요 없음.
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "이용 방법 — ShotStage",
  description: "ShotStage 사용법: 카메라 조작, 샷 타입, 프롬프트 생성까지 한 번에 안내합니다.",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-lg font-semibold text-neutral-100">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-neutral-300">{children}</div>
    </section>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded bg-neutral-800 px-1.5 py-0.5 text-xs text-neutral-200">{children}</kbd>
  );
}

export default function GuidePage() {
  return (
    <div className="mx-auto min-h-screen max-w-2xl px-6 py-12">
      <Link href="/" className="text-xs text-neutral-500 hover:text-neutral-300">
        ← 돌아가기
      </Link>

      <h1 className="mb-2 mt-4 text-2xl font-bold text-neutral-50">
        SHOT<span className="text-accent">STAGE</span> 이용 방법
      </h1>
      <p className="mb-10 text-sm text-neutral-500">
        3D 뷰포트에서 카메라 앵글·렌즈·샷 타입을 정확히 잡고, 그대로 AI 이미지/영상 생성
        프롬프트로 변환하는 도구입니다.
      </p>

      <Section title="1. 기본 흐름">
        <p>
          왼쪽 3D 뷰포트에서 마네킹(스탠드인 캐릭터)을 원하는 구도로 배치하고, 오른쪽 패널에서
          샷 타입·카메라·피사체·프롬프트 내용을 설정한 뒤 <b>생성하기</b> 버튼을 누르면 됩니다.
          결과 모달에서 블로킹 프레임 이미지와 완성된 프롬프트 문장을 확인하고 복사/다운로드할
          수 있습니다.
        </p>
      </Section>

      <Section title="2. 카메라 조작 (인물 중심 궤도 회전)">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <Kbd>드래그</Kbd> — 피사체를 중심에 고정한 채 카메라가 주위를 도는 궤도 회전
          </li>
          <li>
            <Kbd>space</Kbd> + <Kbd>드래그</Kbd> — 핸드 툴, 화면 자체를 이동(팬). 스페이스바를
            누르고 있으면 커서가 손 모양으로 바뀝니다
          </li>
          <li>
            <Kbd>scroll</Kbd> — 줌 인/아웃 (카메라와 피사체 사이 거리 조절)
          </li>
          <li>
            <Kbd>W</Kbd> <Kbd>A</Kbd> <Kbd>S</Kbd> <Kbd>D</Kbd> — 회전 중심점을 수평으로 미세
            이동
          </li>
          <li>
            <Kbd>Q</Kbd> / <Kbd>E</Kbd> — 회전 중심점의 높이 조절
          </li>
          <li>
            <b>피사체 중심으로 재정렬</b> 버튼 — 드래그로 회전했거나 중심점을 옮긴 것을 모두
            현재 샷 타입 기준 프레이밍으로 되돌립니다
          </li>
          <li>
            <b>Bird&apos;s-eye</b> 전환 — 위에서 내려다보는 시점. 이 모드에서는 드래그가 화면
            이동, 스크롤이 고도 조절로 동작합니다
          </li>
        </ul>
      </Section>

      <Section title="3. 샷 타입">
        <p>
          Medium·Wide·Close-Up·Low Angle·High Angle·Over Shoulder·Two Shot 중 하나를 클릭하면
          카메라가 그 샷에 맞는 위치/각도로 자동 스냅됩니다. Over Shoulder와 Two Shot은 두 번째
          피사체가 함께 나타납니다.
        </p>
      </Section>

      <Section title="4. 카메라 패널">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Lens(화각) 슬라이더 또는 24/35/50/85/135mm 프리셋 버튼으로 렌즈 화각 조절</li>
          <li>화각비(16:9, 9:16, 1:1, 4:5, 2.35:1) 선택 — 뷰포트에 크롭 가이드가 표시되고, 실제 생성되는 프레임 이미지도 그 비율로 잘려서 저장됩니다</li>
        </ul>
      </Section>

      <Section title="5. 피사체 패널">
        <p>
          인물 1(과 두 번째 피사체 표시를 켰을 때 인물 2)의 좌우/깊이/회전을 각각 독립적으로
          조절할 수 있습니다. 각 인물은 3D 모델과 패널 슬라이더가 같은 색으로 표시되어 어떤
          슬라이더가 어떤 인물을 조정하는지 바로 구분됩니다.
        </p>
      </Section>

      <Section title="6. 프롬프트 패널">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Image / Video 모드 전환, 대상 모델 선택 (모델에 따라 프롬프트 형식이 최적화되어 생성됩니다)</li>
          <li>캐릭터시트·환경시트 이미지를 업로드하면, 참고 이미지를 활용하라는 문구가 프롬프트에 자동으로 추가됩니다</li>
          <li>Subject / Environment / Look·style 입력창 — 옆의 별 아이콘으로 자주 쓰는 설정을 저장하고 불러올 수 있습니다 (브라우저에 로컬로 저장됨)</li>
          <li>Video 모드에서는 카메라 무브(Pan/Tilt/Dolly/Track/Arc/Handheld)와 강도, 지속 시간을 추가로 지정할 수 있습니다</li>
        </ul>
      </Section>

      <Section title="7. 결과 모달">
        <p>
          Generate를 누르면 현재 블로킹 프레임과 완성된 프롬프트가 함께 표시됩니다. 프롬프트
          복사, 프레임 이미지 다운로드가 가능하고, Higgsfield 같은 외부 AI 생성 도구에 프롬프트를
          붙여넣고 프레임을 참조 이미지로 첨부하면 원하는 샷을 그대로 재현할 수 있습니다.
        </p>
      </Section>

      <p className="mt-12 text-xs text-neutral-600">
        더 궁금한 점이 있으면 화면 우측 상단의 단축키 안내를 참고하거나, 각 패널의 항목에
        마우스를 올려 툴팁을 확인하세요.
      </p>
    </div>
  );
}
