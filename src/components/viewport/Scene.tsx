// R3F Canvas, 조명, 룸, 마네킹, 카메라 컨트롤러를 묶는 메인 3D 뷰
"use client";

import { Canvas } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import { Room } from "./Room";
import { Mannequin } from "./Mannequin";
import { CameraRig } from "./CameraRig";
import { FrameCapture } from "./FrameCapture";
import { useShotStore } from "@/store/useShotStore";

function computeOffset(leftRight: number, depth: number): [number, number, number] {
  // 깊이(Z축)는 카메라 시선 방향과 같은 축이라 좌우 이동보다 변화가 덜 두드러진다.
  // 슬라이더를 움직였을 때 크기 변화가 뚜렷하게 느껴지도록 좌우(1.4)보다 넓은 범위(2.4)를 쓴다.
  return [leftRight * 1.4, 0, depth * 2.4];
}

export function Scene() {
  const subject = useShotStore((s) => s.subject);
  const secondSubject = useShotStore((s) => s.secondSubject);
  const showGrid = useShotStore((s) => s.showGrid);
  const [x, , z] = computeOffset(subject.leftRight, subject.depth);
  const rotationY = (subject.rotate * Math.PI) / 180;

  // 두 번째 피사체는 첫 번째 피사체와 완전히 독립된 좌우/깊이/회전 슬라이더로 조정한다.
  const [secondX, , secondZ] = computeOffset(secondSubject.leftRight, secondSubject.depth);
  const secondRotationY = (secondSubject.rotate * Math.PI) / 180;

  return (
    <Canvas
      shadows
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      camera={{ fov: 45, near: 0.1, far: 100 }}
      className="!touch-none"
    >
      <color attach="background" args={["#05070c"]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 2]} intensity={0.8} castShadow />
      <hemisphereLight args={["#8fa8c9", "#0a0d13", 0.4]} />

      <Room />
      <Mannequin position={[x, 0, z]} rotationY={rotationY} />
      {subject.showSecondSubject && (
        <Mannequin position={[secondX, 0, secondZ]} rotationY={secondRotationY} />
      )}

      {showGrid && (
        <Grid
          args={[8, 8]}
          cellColor="#2a3040"
          sectionColor="#3a4258"
          fadeDistance={12}
          position={[0, 0.005, 0]}
        />
      )}

      <CameraRig />
      <FrameCapture />
    </Canvas>
  );
}
