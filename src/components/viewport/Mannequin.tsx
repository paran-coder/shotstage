// 관절 마네킹: 향후 "관절을 움직이는" 기능을 붙일 수 있도록, 각 관절이 부모-자식으로
// 이어지는 계층 구조(그룹 중첩)로 만들어졌다. 예) 어깨 그룹을 돌리면 팔꿈치·손까지 함께 따라간다.
// 외형은 사용자가 제공한 참고 이미지(둥근 어깨 캡, 허리 밴드, 무릎/팔꿈치 캡, 주먹손,
// 신발 형태의 발)를 참고해 구성했다. 색/자세는 참고하지 않고 실루엣만 반영.
// 지금은 모든 관절 회전값이 기본(0,0,0)으로 고정된 중립 자세지만, 각 관절 그룹은
// rotation prop을 그대로 받게 설계해서 나중에 값만 넣으면 바로 포즈를 바꿀 수 있다.
"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { SUBJECT_COLORS } from "@/lib/subjectColors";

const EYE_COLOR = "#3a3226";

type Vec3 = [number, number, number];
const ZERO: Vec3 = [0, 0, 0];

export interface MannequinPose {
  leftShoulder?: Vec3;
  leftElbow?: Vec3;
  rightShoulder?: Vec3;
  rightElbow?: Vec3;
  leftHip?: Vec3;
  leftKnee?: Vec3;
  rightHip?: Vec3;
  rightKnee?: Vec3;
  neck?: Vec3;
}

export function Mannequin({
  position = [0, 0, 0],
  rotationY = 0,
  bodyColor = SUBJECT_COLORS.primary.body,
  jointColor = SUBJECT_COLORS.primary.joint,
  pose = {},
}: {
  position?: [number, number, number];
  rotationY?: number;
  /** 인물 1/2를 구분하기 위한 몸통 색. lib/subjectColors.ts의 값을 그대로 넘기면
   *  SUBJECT 패널의 슬라이더 색과 정확히 일치한다. */
  bodyColor?: string;
  jointColor?: string;
  /** 관절별 회전(라디안). 나중에 "관절 움직이기" 기능에서 이 prop만 채워주면 된다. */
  pose?: MannequinPose;
}) {
  const bodyMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.65 }),
    [bodyColor],
  );
  const jointMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: jointColor, roughness: 0.55 }),
    [jointColor],
  );

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* ── 골반(hips) — 몸 전체의 뿌리 관절 ── */}
      <group position={[0, 0.9, 0]}>
        <mesh material={bodyMat} castShadow>
          <sphereGeometry args={[0.18, 18, 18]} />
        </mesh>
        {/* 사타구니 중앙 시접 느낌의 세로 밴드 */}
        <mesh position={[0, -0.02, 0.14]} material={jointMat}>
          <boxGeometry args={[0.025, 0.16, 0.02]} />
        </mesh>

        {/* ── 척추(spine/chest) ── */}
        <group position={[0, 0.4, 0]}>
          <mesh material={bodyMat} castShadow>
            <capsuleGeometry args={[0.19, 0.24, 6, 14]} />
          </mesh>

          {/* 허리 밴드 (가슴과 골반 경계) */}
          <mesh position={[0, -0.24, 0]} rotation={[Math.PI / 2, 0, 0]} material={jointMat}>
            <torusGeometry args={[0.19, 0.03, 10, 24]} />
          </mesh>

          {/* 어깨선을 가로지르는 칼라 밴드 */}
          <mesh position={[0, 0.17, 0.05]} rotation={[0, 0, Math.PI / 2]} material={jointMat}>
            <capsuleGeometry args={[0.045, 0.34, 4, 10]} />
          </mesh>

          {/* 목 관절 */}
          <group position={[0, 0.22, 0]} rotation={pose.neck ?? ZERO}>
            <mesh material={bodyMat}>
              <cylinderGeometry args={[0.06, 0.065, 0.08, 12]} />
            </mesh>
            {/* 머리 */}
            <group position={[0, 0.14, 0]}>
              <mesh material={bodyMat} castShadow>
                <sphereGeometry args={[0.13, 24, 24]} />
              </mesh>
              <mesh position={[-0.048, 0.02, 0.11]}>
                <sphereGeometry args={[0.014, 8, 8]} />
                <meshBasicMaterial color={EYE_COLOR} />
              </mesh>
              <mesh position={[0.048, 0.02, 0.11]}>
                <sphereGeometry args={[0.014, 8, 8]} />
                <meshBasicMaterial color={EYE_COLOR} />
              </mesh>
            </group>
          </group>

          {/* ── 왼쪽 어깨 관절 → 팔꿈치 관절 → 손 ── */}
          <group position={[-0.24, 0.15, 0]} rotation={pose.leftShoulder ?? ZERO}>
            {/* 둥근 어깨 캡 (참고 이미지처럼 팔과 자연스럽게 이어지도록 크게) */}
            <mesh material={bodyMat} castShadow>
              <sphereGeometry args={[0.1, 16, 16]} />
            </mesh>
            <mesh position={[-0.02, -0.14, 0.02]} rotation={[0, 0, 0.16]} material={bodyMat} castShadow>
              <capsuleGeometry args={[0.062, 0.24, 4, 10]} />
            </mesh>

            <group position={[-0.06, -0.29, 0.02]} rotation={pose.leftElbow ?? ZERO}>
              {/* 팔꿈치 캡 (살짝 납작하게) */}
              <mesh material={jointMat} scale={[1, 0.85, 1]}>
                <sphereGeometry args={[0.058, 14, 14]} />
              </mesh>
              <mesh position={[0, -0.12, -0.01]} material={bodyMat} castShadow>
                <capsuleGeometry args={[0.05, 0.2, 4, 10]} />
              </mesh>
              {/* 손목 밴드 + 주먹 쥔 손 */}
              <mesh position={[-0.005, -0.22, -0.02]} material={jointMat} scale={[1, 0.5, 1]}>
                <sphereGeometry args={[0.048, 10, 10]} />
              </mesh>
              <mesh position={[-0.01, -0.28, -0.02]} material={bodyMat} castShadow>
                <sphereGeometry args={[0.065, 12, 12]} />
              </mesh>
            </group>
          </group>

          {/* ── 오른쪽 어깨 관절 → 팔꿈치 관절 → 손 (왼쪽 미러) ── */}
          <group position={[0.24, 0.15, 0]} rotation={pose.rightShoulder ?? ZERO}>
            <mesh material={bodyMat} castShadow>
              <sphereGeometry args={[0.1, 16, 16]} />
            </mesh>
            <mesh position={[0.02, -0.14, 0.02]} rotation={[0, 0, -0.16]} material={bodyMat} castShadow>
              <capsuleGeometry args={[0.062, 0.24, 4, 10]} />
            </mesh>

            <group position={[0.06, -0.29, 0.02]} rotation={pose.rightElbow ?? ZERO}>
              <mesh material={jointMat} scale={[1, 0.85, 1]}>
                <sphereGeometry args={[0.058, 14, 14]} />
              </mesh>
              <mesh position={[0, -0.12, -0.01]} material={bodyMat} castShadow>
                <capsuleGeometry args={[0.05, 0.2, 4, 10]} />
              </mesh>
              <mesh position={[0.005, -0.22, -0.02]} material={jointMat} scale={[1, 0.5, 1]}>
                <sphereGeometry args={[0.048, 10, 10]} />
              </mesh>
              <mesh position={[0.01, -0.28, -0.02]} material={bodyMat} castShadow>
                <sphereGeometry args={[0.065, 12, 12]} />
              </mesh>
            </group>
          </group>
        </group>

        {/* ── 왼쪽 고관절 → 무릎 관절 → 발 ── */}
        <group position={[-0.12, -0.08, 0]} rotation={pose.leftHip ?? ZERO}>
          <mesh material={bodyMat} castShadow>
            <sphereGeometry args={[0.1, 16, 16]} />
          </mesh>
          <mesh position={[0, -0.2, 0]} material={bodyMat} castShadow>
            <capsuleGeometry args={[0.1, 0.3, 4, 12]} />
          </mesh>

          <group position={[0, -0.4, 0]} rotation={pose.leftKnee ?? ZERO}>
            {/* 무릎 캡 (앞으로 살짝 튀어나오게) */}
            <mesh position={[0, 0, 0.02]} material={jointMat} scale={[1.05, 0.8, 1]}>
              <sphereGeometry args={[0.085, 16, 16]} />
            </mesh>
            <mesh position={[0, -0.16, 0]} material={bodyMat} castShadow>
              <capsuleGeometry args={[0.078, 0.28, 4, 12]} />
            </mesh>
            {/* 발목 밴드 */}
            <mesh position={[0, -0.32, 0]} material={jointMat} scale={[1, 0.55, 1]}>
              <sphereGeometry args={[0.06, 10, 10]} />
            </mesh>
            {/* 발: 뒤꿈치 + 앞으로 갈수록 좁아지는 발끝 */}
            <group position={[0, -0.37, 0.03]}>
              <mesh position={[0, 0, 0]} material={bodyMat} castShadow>
                <boxGeometry args={[0.1, 0.075, 0.16]} />
              </mesh>
              <mesh position={[0, -0.01, 0.13]} rotation={[0.35, 0, 0]} material={bodyMat} castShadow>
                <boxGeometry args={[0.09, 0.06, 0.13]} />
              </mesh>
            </group>
          </group>
        </group>

        {/* ── 오른쪽 고관절 → 무릎 관절 → 발 (왼쪽 미러) ── */}
        <group position={[0.12, -0.08, 0]} rotation={pose.rightHip ?? ZERO}>
          <mesh material={bodyMat} castShadow>
            <sphereGeometry args={[0.1, 16, 16]} />
          </mesh>
          <mesh position={[0, -0.2, 0]} material={bodyMat} castShadow>
            <capsuleGeometry args={[0.1, 0.3, 4, 12]} />
          </mesh>

          <group position={[0, -0.4, 0]} rotation={pose.rightKnee ?? ZERO}>
            <mesh position={[0, 0, 0.02]} material={jointMat} scale={[1.05, 0.8, 1]}>
              <sphereGeometry args={[0.085, 16, 16]} />
            </mesh>
            <mesh position={[0, -0.16, 0]} material={bodyMat} castShadow>
              <capsuleGeometry args={[0.078, 0.28, 4, 12]} />
            </mesh>
            <mesh position={[0, -0.32, 0]} material={jointMat} scale={[1, 0.55, 1]}>
              <sphereGeometry args={[0.06, 10, 10]} />
            </mesh>
            <group position={[0, -0.37, 0.03]}>
              <mesh position={[0, 0, 0]} material={bodyMat} castShadow>
                <boxGeometry args={[0.1, 0.075, 0.16]} />
              </mesh>
              <mesh position={[0, -0.01, 0.13]} rotation={[0.35, 0, 0]} material={bodyMat} castShadow>
                <boxGeometry args={[0.09, 0.06, 0.13]} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
