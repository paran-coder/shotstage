// 무채색 placeholder 마네킹: 실제 사진작가들이 쓰는 목재 관절 인체 모형(아트 마네킹)을 참고해
// 사람 비율에 가깝게 구성. 로봇처럼 보이지 않도록 얇은 팔다리 + 관절 구슬 형태로 설계.
"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { SUBJECT_COLORS } from "@/lib/subjectColors";

const EYE_COLOR = "#3a3226";

export function Mannequin({
  position = [0, 0, 0],
  rotationY = 0,
  bodyColor = SUBJECT_COLORS.primary.body,
  jointColor = SUBJECT_COLORS.primary.joint,
}: {
  position?: [number, number, number];
  rotationY?: number;
  /** 인물 1/2를 구분하기 위한 몸통 색. lib/subjectColors.ts의 값을 그대로 넘기면
   *  SUBJECT 패널의 슬라이더 색과 정확히 일치한다. */
  bodyColor?: string;
  jointColor?: string;
}) {
  const bodyMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.75 }),
    [bodyColor],
  );
  const jointMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: jointColor, roughness: 0.7 }),
    [jointColor],
  );

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* 머리 */}
      <mesh position={[0, 1.66, 0]} material={bodyMat} castShadow>
        <sphereGeometry args={[0.11, 24, 24]} />
      </mesh>
      {/* 눈(방향 인식용, 아주 작게) */}
      <mesh position={[-0.045, 1.68, 0.1]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshBasicMaterial color={EYE_COLOR} />
      </mesh>
      <mesh position={[0.045, 1.68, 0.1]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshBasicMaterial color={EYE_COLOR} />
      </mesh>

      {/* 목 */}
      <mesh position={[0, 1.53, 0]} material={bodyMat}>
        <cylinderGeometry args={[0.045, 0.05, 0.08, 12]} />
      </mesh>

      {/* 어깨 관절 */}
      <mesh position={[-0.19, 1.5, 0]} material={jointMat}>
        <sphereGeometry args={[0.05, 12, 12]} />
      </mesh>
      <mesh position={[0.19, 1.5, 0]} material={jointMat}>
        <sphereGeometry args={[0.05, 12, 12]} />
      </mesh>

      {/* 가슴(상체) */}
      <mesh position={[0, 1.32, 0]} material={bodyMat} castShadow>
        <capsuleGeometry args={[0.15, 0.28, 6, 12]} />
      </mesh>

      {/* 허리 */}
      <mesh position={[0, 1.05, 0]} material={bodyMat} castShadow>
        <capsuleGeometry args={[0.12, 0.14, 6, 12]} />
      </mesh>

      {/* 골반 */}
      <mesh position={[0, 0.92, 0]} material={bodyMat} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
      </mesh>

      {/* 왼팔: 위팔 + 팔꿈치 관절 + 아래팔 + 손 */}
      <mesh position={[-0.22, 1.36, 0.02]} rotation={[0, 0, 0.12]} material={bodyMat} castShadow>
        <capsuleGeometry args={[0.042, 0.26, 4, 8]} />
      </mesh>
      <mesh position={[-0.24, 1.22, 0.02]} material={jointMat}>
        <sphereGeometry args={[0.045, 10, 10]} />
      </mesh>
      <mesh position={[-0.245, 1.08, 0.01]} rotation={[0, 0, 0.05]} material={bodyMat} castShadow>
        <capsuleGeometry args={[0.036, 0.24, 4, 8]} />
      </mesh>
      <mesh position={[-0.25, 0.95, 0]} material={bodyMat}>
        <sphereGeometry args={[0.045, 10, 10]} />
      </mesh>

      {/* 오른팔: 위팔 + 팔꿈치 관절 + 아래팔 + 손 */}
      <mesh position={[0.22, 1.36, 0.02]} rotation={[0, 0, -0.12]} material={bodyMat} castShadow>
        <capsuleGeometry args={[0.042, 0.26, 4, 8]} />
      </mesh>
      <mesh position={[0.24, 1.22, 0.02]} material={jointMat}>
        <sphereGeometry args={[0.045, 10, 10]} />
      </mesh>
      <mesh position={[0.245, 1.08, 0.01]} rotation={[0, 0, -0.05]} material={bodyMat} castShadow>
        <capsuleGeometry args={[0.036, 0.24, 4, 8]} />
      </mesh>
      <mesh position={[0.25, 0.95, 0]} material={bodyMat}>
        <sphereGeometry args={[0.045, 10, 10]} />
      </mesh>

      {/* 고관절 */}
      <mesh position={[-0.1, 0.82, 0]} material={jointMat}>
        <sphereGeometry args={[0.055, 10, 10]} />
      </mesh>
      <mesh position={[0.1, 0.82, 0]} material={jointMat}>
        <sphereGeometry args={[0.055, 10, 10]} />
      </mesh>

      {/* 왼다리: 허벅지 + 무릎 관절 + 종아리 + 발 */}
      <mesh position={[-0.1, 0.63, 0]} material={bodyMat} castShadow>
        <capsuleGeometry args={[0.075, 0.34, 4, 10]} />
      </mesh>
      <mesh position={[-0.1, 0.44, 0]} material={jointMat}>
        <sphereGeometry args={[0.065, 10, 10]} />
      </mesh>
      <mesh position={[-0.1, 0.25, 0]} material={bodyMat} castShadow>
        <capsuleGeometry args={[0.06, 0.32, 4, 10]} />
      </mesh>
      <mesh position={[-0.1, 0.045, 0.05]} material={bodyMat} castShadow>
        <boxGeometry args={[0.09, 0.06, 0.22]} />
      </mesh>

      {/* 오른다리: 허벅지 + 무릎 관절 + 종아리 + 발 */}
      <mesh position={[0.1, 0.63, 0]} material={bodyMat} castShadow>
        <capsuleGeometry args={[0.075, 0.34, 4, 10]} />
      </mesh>
      <mesh position={[0.1, 0.44, 0]} material={jointMat}>
        <sphereGeometry args={[0.065, 10, 10]} />
      </mesh>
      <mesh position={[0.1, 0.25, 0]} material={bodyMat} castShadow>
        <capsuleGeometry args={[0.06, 0.32, 4, 10]} />
      </mesh>
      <mesh position={[0.1, 0.045, 0.05]} material={bodyMat} castShadow>
        <boxGeometry args={[0.09, 0.06, 0.22]} />
      </mesh>
    </group>
  );
}
