// 관절 마네킹: 향후 "관절을 움직이는" 기능을 붙일 수 있도록, 각 관절이 부모-자식으로
// 이어지는 계층 구조(그룹 중첩)로 만들어졌다. 예) 어깨 그룹을 돌리면 팔꿈치·손까지 함께 따라간다.
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
    () => new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.7 }),
    [bodyColor],
  );
  const jointMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: jointColor, roughness: 0.6 }),
    [jointColor],
  );

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* ── 골반(hips) — 몸 전체의 뿌리 관절 ── */}
      <group position={[0, 0.92, 0]}>
        <mesh material={bodyMat} castShadow>
          <sphereGeometry args={[0.17, 18, 18]} />
        </mesh>

        {/* ── 척추(spine/chest) ── */}
        <group position={[0, 0.4, 0]}>
          <mesh material={bodyMat} castShadow>
            <capsuleGeometry args={[0.18, 0.26, 6, 14]} />
          </mesh>

          {/* 목 관절 */}
          <group position={[0, 0.21, 0]} rotation={pose.neck ?? ZERO}>
            <mesh material={bodyMat}>
              <cylinderGeometry args={[0.055, 0.06, 0.08, 12]} />
            </mesh>
            {/* 머리 */}
            <group position={[0, 0.13, 0]}>
              <mesh material={bodyMat} castShadow>
                <sphereGeometry args={[0.12, 24, 24]} />
              </mesh>
              <mesh position={[-0.045, 0.02, 0.1]}>
                <sphereGeometry args={[0.013, 8, 8]} />
                <meshBasicMaterial color={EYE_COLOR} />
              </mesh>
              <mesh position={[0.045, 0.02, 0.1]}>
                <sphereGeometry args={[0.013, 8, 8]} />
                <meshBasicMaterial color={EYE_COLOR} />
              </mesh>
            </group>
          </group>

          {/* ── 왼쪽 어깨 관절 → 팔꿈치 관절 → 손 ── */}
          <group position={[-0.22, 0.16, 0]} rotation={pose.leftShoulder ?? ZERO}>
            <mesh material={jointMat}>
              {/* 밴드처럼 보이도록 살짝 납작한 구 */}
              <sphereGeometry args={[0.065, 14, 14]} />
            </mesh>
            <mesh position={[-0.02, -0.13, 0.02]} rotation={[0, 0, 0.14]} material={bodyMat} castShadow>
              <capsuleGeometry args={[0.058, 0.24, 4, 10]} />
            </mesh>

            <group position={[-0.05, -0.27, 0.02]} rotation={pose.leftElbow ?? ZERO}>
              <mesh material={jointMat}>
                <sphereGeometry args={[0.052, 12, 12]} />
              </mesh>
              <mesh position={[0, -0.12, -0.01]} material={bodyMat} castShadow>
                <capsuleGeometry args={[0.048, 0.2, 4, 10]} />
              </mesh>
              {/* 손목 → 주먹 쥔 손 */}
              <group position={[-0.01, -0.25, -0.02]}>
                <mesh material={bodyMat} castShadow>
                  <sphereGeometry args={[0.062, 12, 12]} />
                </mesh>
              </group>
            </group>
          </group>

          {/* ── 오른쪽 어깨 관절 → 팔꿈치 관절 → 손 (왼쪽 미러) ── */}
          <group position={[0.22, 0.16, 0]} rotation={pose.rightShoulder ?? ZERO}>
            <mesh material={jointMat}>
              <sphereGeometry args={[0.065, 14, 14]} />
            </mesh>
            <mesh position={[0.02, -0.13, 0.02]} rotation={[0, 0, -0.14]} material={bodyMat} castShadow>
              <capsuleGeometry args={[0.058, 0.24, 4, 10]} />
            </mesh>

            <group position={[0.05, -0.27, 0.02]} rotation={pose.rightElbow ?? ZERO}>
              <mesh material={jointMat}>
                <sphereGeometry args={[0.052, 12, 12]} />
              </mesh>
              <mesh position={[0, -0.12, -0.01]} material={bodyMat} castShadow>
                <capsuleGeometry args={[0.048, 0.2, 4, 10]} />
              </mesh>
              <group position={[0.01, -0.25, -0.02]}>
                <mesh material={bodyMat} castShadow>
                  <sphereGeometry args={[0.062, 12, 12]} />
                </mesh>
              </group>
            </group>
          </group>
        </group>

        {/* ── 왼쪽 고관절 → 무릎 관절 → 발 ── */}
        <group position={[-0.11, -0.1, 0]} rotation={pose.leftHip ?? ZERO}>
          <mesh material={jointMat}>
            <sphereGeometry args={[0.075, 14, 14]} />
          </mesh>
          <mesh position={[0, -0.19, 0]} material={bodyMat} castShadow>
            <capsuleGeometry args={[0.095, 0.32, 4, 12]} />
          </mesh>

          <group position={[0, -0.38, 0]} rotation={pose.leftKnee ?? ZERO}>
            <mesh material={jointMat}>
              <sphereGeometry args={[0.075, 14, 14]} />
            </mesh>
            <mesh position={[0, -0.17, 0]} material={bodyMat} castShadow>
              <capsuleGeometry args={[0.075, 0.3, 4, 12]} />
            </mesh>
            {/* 발목 → 발 */}
            <group position={[0, -0.34, 0]}>
              <mesh material={jointMat}>
                <sphereGeometry args={[0.055, 10, 10]} />
              </mesh>
              <mesh position={[0, -0.055, 0.06]} rotation={[0.08, 0, 0]} material={bodyMat} castShadow>
                <boxGeometry args={[0.1, 0.07, 0.26]} />
              </mesh>
            </group>
          </group>
        </group>

        {/* ── 오른쪽 고관절 → 무릎 관절 → 발 (왼쪽 미러) ── */}
        <group position={[0.11, -0.1, 0]} rotation={pose.rightHip ?? ZERO}>
          <mesh material={jointMat}>
            <sphereGeometry args={[0.075, 14, 14]} />
          </mesh>
          <mesh position={[0, -0.19, 0]} material={bodyMat} castShadow>
            <capsuleGeometry args={[0.095, 0.32, 4, 12]} />
          </mesh>

          <group position={[0, -0.38, 0]} rotation={pose.rightKnee ?? ZERO}>
            <mesh material={jointMat}>
              <sphereGeometry args={[0.075, 14, 14]} />
            </mesh>
            <mesh position={[0, -0.17, 0]} material={bodyMat} castShadow>
              <capsuleGeometry args={[0.075, 0.3, 4, 12]} />
            </mesh>
            <group position={[0, -0.34, 0]}>
              <mesh material={jointMat}>
                <sphereGeometry args={[0.055, 10, 10]} />
              </mesh>
              <mesh position={[0, -0.055, 0.06]} rotation={[0.08, 0, 0]} material={bodyMat} castShadow>
                <boxGeometry args={[0.1, 0.07, 0.26]} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
