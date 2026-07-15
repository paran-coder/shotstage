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
  return [leftRight * 1.4, 0, depth * 1.4];
}

export function Scene() {
  const subject = useShotStore((s) => s.subject);
  const showGrid = useShotStore((s) => s.showGrid);
  const [x, , z] = computeOffset(subject.leftRight, subject.depth);
  const rotationY = (subject.rotate * Math.PI) / 180;

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
        <Mannequin position={[x + 0.9, 0, z + 0.3]} rotationY={rotationY} />
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
