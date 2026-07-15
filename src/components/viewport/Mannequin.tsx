// 무채색 placeholder 마네킹 (스탠드인 캐릭터), 단순 도형 조합으로 구성
"use client";

import { useMemo } from "react";
import * as THREE from "three";

const BODY_COLOR = "#d8d8d8";
const EYE_COLOR = "#1a1a1a";

export function Mannequin({
  position = [0, 0, 0],
  rotationY = 0,
}: {
  position?: [number, number, number];
  rotationY?: number;
}) {
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: BODY_COLOR, roughness: 0.6 }),
    [],
  );

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* 머리 */}
      <mesh position={[0, 1.55, 0]} material={material} castShadow>
        <sphereGeometry args={[0.16, 24, 24]} />
      </mesh>
      {/* 눈 */}
      <mesh position={[-0.06, 1.57, 0.15]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color={EYE_COLOR} />
      </mesh>
      <mesh position={[0.06, 1.57, 0.15]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color={EYE_COLOR} />
      </mesh>

      {/* 몸통 */}
      <mesh position={[0, 1.1, 0]} material={material} castShadow>
        <capsuleGeometry args={[0.19, 0.5, 6, 12]} />
      </mesh>

      {/* 골반 */}
      <mesh position={[0, 0.72, 0]} material={material} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
      </mesh>

      {/* 팔 (왼쪽) */}
      <mesh position={[-0.28, 1.05, 0]} rotation={[0, 0, 0.15]} material={material} castShadow>
        <capsuleGeometry args={[0.06, 0.5, 4, 8]} />
      </mesh>
      {/* 팔 (오른쪽) */}
      <mesh position={[0.28, 1.05, 0]} rotation={[0, 0, -0.15]} material={material} castShadow>
        <capsuleGeometry args={[0.06, 0.5, 4, 8]} />
      </mesh>

      {/* 다리 (왼쪽) */}
      <mesh position={[-0.11, 0.28, 0]} material={material} castShadow>
        <capsuleGeometry args={[0.075, 0.55, 4, 8]} />
      </mesh>
      {/* 다리 (오른쪽) */}
      <mesh position={[0.11, 0.28, 0]} material={material} castShadow>
        <capsuleGeometry args={[0.075, 0.55, 4, 8]} />
      </mesh>
    </group>
  );
}
