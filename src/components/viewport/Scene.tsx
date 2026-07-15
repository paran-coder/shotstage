// R3F Canvas, 조명, 룸, 마네킹, 카메라 컨트롤러를 묶는 메인 3D 뷰
"use client";

import { Canvas } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import { Room } from "./Room";
import { Mannequin } from "./Mannequin";
import { CameraRig } from "./CameraRig";
import { FrameCapture } from "./FrameCapture";
import { useShotStore } from "@/store/useShotStore";
import { SECOND_SUBJECT_OFFSET } from "@/lib/shotPresets";

function computeOffset(leftRight: number, depth: number): [number, number, number] {
  // 깊이(Z축)는 카메라 시선 방향과 같은 축이라 좌우 이동보다 변화가 덜 두드러진다.
  // 슬라이더를 움직였을 때 크기 변화가 뚜렷하게 느껴지도록 좌우(1.4)보다 넓은 범위(2.4)를 쓴다.
  return [leftRight * 1.4, 0, depth * 2.4];
}

export function Scene() {
  const subject = useShotStore((s) => s.subject);
  const showGrid = useShotStore((s) => s.showGrid);
  const [x, , z] = computeOffset(subject.leftRight, subject.depth);
  const rotationY = (subject.rotate * Math.PI) / 180;

  const secondX = x + SECOND_SUBJECT_OFFSET.x;
  const secondZ = z + SECOND_SUBJECT_OFFSET.z;
  // 두 번째 피사체는 첫 번째 피사체 쪽을 바라보도록 회전 (서로 마주보는 자연스러운 구도)
  const secondRotationY = Math.atan2(x - secondX, z - secondZ);

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
