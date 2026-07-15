// 관절 마네킹: 향후 "관절을 움직이는" 기능을 붙일 수 있도록, 각 관절이 부모-자식으로
// 이어지는 계층 구조(그룹 중첩)로 만들어졌다. 예) 어깨 그룹을 돌리면 팔꿈치·손까지 함께 따라간다.
//
// 외형(실루엣)은 사용자가 제공한 참고 이미지(구체관절인형 스타일)를 기준으로 잡았다.
// 이전 버전은 몸통이 위아래로 굵기가 똑같은 "알약(캡슐)" 한 덩어리라 뭉툭해 보였는데,
// 이번엔 가슴(넓음) → 허리(좁음)로 이어지는 두 단계 테이퍼, 얇은 벨트 라인, 팔/다리의
// 위(굵음)-아래(가늚) 테이퍼, 길쭉한 신발 모양 발로 실루엣 자체를 다시 잡았다.
// 색/자세는 참고하지 않음(사용자 요청). 각 관절 y좌표는 기존 카메라 프리셋과 어긋나지
// 않도록 이전 버전과 동일하게 유지했고, 반지름/비율만 조정했다.
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
  bodyColor?: string;
  jointColor?: string;
  pose?: MannequinPose;
}) {
  const bodyMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.65 }),
    [bodyColor],
  );
  const jointMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: jointColor, roughness: 0.3 }),
    [jointColor],
  );

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* ── 골반(hips) — 몸 전체의 뿌리 관절 ── */}
      <group position={[0, 0.9, 0]}>
        <mesh material={bodyMat} castShadow>
          <sphereGeometry args={[0.16, 18, 18]} />
        </mesh>

        {/* ── 척추(spine) — 가슴(넓음) → 허리(좁음) 2단 테이퍼 ── */}
        <group position={[0, 0.4, 0]}>
          {/* 가슴 (위쪽, 넓게) */}
          <mesh position={[0, 0.08, 0]} material={bodyMat} castShadow>
            <capsuleGeometry args={[0.18, 0.12, 6, 14]} />
          </mesh>
          {/* 허리 (아래쪽, 좁게 — 가슴과 골반을 자연스럽게 잇는 테이퍼) */}
          <mesh position={[0, -0.19, 0]} material={bodyMat} castShadow>
            <capsuleGeometry args={[0.13, 0.08, 6, 14]} />
          </mesh>
          {/* 허리 벨트 라인 (얇게 — 굵은 도넛이 아니라 슬림한 띠) */}
          <mesh position={[0, -0.11, 0]} rotation={[Math.PI / 2, 0, 0]} material={jointMat}>
            <torusGeometry args={[0.145, 0.013, 8, 24]} />
          </mesh>

          {/* 어깨선을 가로지르는 칼라 밴드 */}
          <mesh position={[0, 0.17, 0.05]} rotation={[0, 0, Math.PI / 2]} material={jointMat}>
            <capsuleGeometry args={[0.04, 0.32, 4, 10]} />
          </mesh>

          {/* 목 관절 */}
          <group position={[0, 0.22, 0]} rotation={pose.neck ?? ZERO}>
            <mesh material={bodyMat}>
              <sphereGeometry args={[0.058, 16, 16]} />
            </mesh>
            {/* 머리 — 완전한 구 대신 살짝 갸름한 타원형 */}
            <group position={[0, 0.14, 0]}>
              <mesh material={bodyMat} castShadow scale={[1, 1.18, 0.95]}>
                <sphereGeometry args={[0.115, 24, 24]} />
              </mesh>
              <mesh position={[-0.045, 0.03, 0.105]}>
                <sphereGeometry args={[0.013, 8, 8]} />
                <meshBasicMaterial color={EYE_COLOR} />
              </mesh>
              <mesh position={[0.045, 0.03, 0.105]}>
                <sphereGeometry args={[0.013, 8, 8]} />
                <meshBasicMaterial color={EYE_COLOR} />
              </mesh>
            </group>
          </group>

          {/* ── 왼쪽 어깨 관절 → 팔꿈치 관절 → 손 ── */}
          <group position={[-0.23, 0.16, 0]} rotation={pose.leftShoulder ?? ZERO}>
            <mesh material={bodyMat} castShadow>
              <sphereGeometry args={[0.09, 16, 16]} />
            </mesh>
            {/* 위팔 (굵게) */}
            <mesh position={[-0.02, -0.13, 0.02]} rotation={[0, 0, 0.15]} material={bodyMat} castShadow>
              <capsuleGeometry args={[0.06, 0.22, 4, 10]} />
            </mesh>

            <group position={[-0.05, -0.27, 0.02]} rotation={pose.leftElbow ?? ZERO}>
              <mesh material={jointMat}>
                <sphereGeometry args={[0.068, 16, 16]} />
              </mesh>
              {/* 아래팔 (위팔보다 확실히 가늘게) */}
              <mesh position={[0, -0.11, -0.01]} material={bodyMat} castShadow>
                <capsuleGeometry args={[0.042, 0.18, 4, 10]} />
              </mesh>
              <mesh position={[-0.005, -0.21, -0.02]} material={jointMat}>
                <sphereGeometry args={[0.046, 12, 12]} />
              </mesh>
              {/* 주먹 */}
              <mesh position={[-0.01, -0.27, -0.02]} material={bodyMat} castShadow>
                <sphereGeometry args={[0.06, 12, 12]} />
              </mesh>
            </group>
          </group>

          {/* ── 오른쪽 어깨 관절 → 팔꿈치 관절 → 손 (왼쪽 미러) ── */}
          <group position={[0.23, 0.16, 0]} rotation={pose.rightShoulder ?? ZERO}>
            <mesh material={bodyMat} castShadow>
              <sphereGeometry args={[0.09, 16, 16]} />
            </mesh>
            <mesh position={[0.02, -0.13, 0.02]} rotation={[0, 0, -0.15]} material={bodyMat} castShadow>
              <capsuleGeometry args={[0.06, 0.22, 4, 10]} />
            </mesh>

            <group position={[0.05, -0.27, 0.02]} rotation={pose.rightElbow ?? ZERO}>
              <mesh material={jointMat}>
                <sphereGeometry args={[0.068, 16, 16]} />
              </mesh>
              <mesh position={[0, -0.11, -0.01]} material={bodyMat} castShadow>
                <capsuleGeometry args={[0.042, 0.18, 4, 10]} />
              </mesh>
              <mesh position={[0.005, -0.21, -0.02]} material={jointMat}>
                <sphereGeometry args={[0.046, 12, 12]} />
              </mesh>
              <mesh position={[0.01, -0.27, -0.02]} material={bodyMat} castShadow>
                <sphereGeometry args={[0.06, 12, 12]} />
              </mesh>
            </group>
          </group>
        </group>

        {/* ── 왼쪽 고관절 → 무릎 관절 → 발 ── */}
        <group position={[-0.11, -0.08, 0]} rotation={pose.leftHip ?? ZERO}>
          <mesh material={bodyMat} castShadow>
            <sphereGeometry args={[0.095, 16, 16]} />
          </mesh>
          {/* 허벅지 (굵게) */}
          <mesh position={[0, -0.2, 0]} material={bodyMat} castShadow>
            <capsuleGeometry args={[0.098, 0.3, 4, 12]} />
          </mesh>

          <group position={[0, -0.4, 0]} rotation={pose.leftKnee ?? ZERO}>
            <mesh material={jointMat}>
              <sphereGeometry args={[0.09, 16, 16]} />
            </mesh>
            {/* 종아리 (허벅지보다 확실히 가늘게) */}
            <mesh position={[0, -0.16, 0]} material={bodyMat} castShadow>
              <capsuleGeometry args={[0.062, 0.28, 4, 12]} />
            </mesh>
            <mesh position={[0, -0.32, 0]} material={jointMat}>
              <sphereGeometry args={[0.05, 12, 12]} />
            </mesh>
            {/* 발: 뒤꿈치 블록 + 길게 뻗은 발끝 블록 (신발 실루엣) */}
            <group position={[0, -0.37, 0.02]}>
              <mesh position={[0, 0, -0.02]} material={bodyMat} castShadow>
                <boxGeometry args={[0.09, 0.07, 0.11]} />
              </mesh>
              <mesh position={[0, -0.015, 0.11]} rotation={[0.18, 0, 0]} material={bodyMat} castShadow>
                <boxGeometry args={[0.08, 0.05, 0.19]} />
              </mesh>
            </group>
          </group>
        </group>

        {/* ── 오른쪽 고관절 → 무릎 관절 → 발 (왼쪽 미러) ── */}
        <group position={[0.11, -0.08, 0]} rotation={pose.rightHip ?? ZERO}>
          <mesh material={bodyMat} castShadow>
            <sphereGeometry args={[0.095, 16, 16]} />
          </mesh>
          <mesh position={[0, -0.2, 0]} material={bodyMat} castShadow>
            <capsuleGeometry args={[0.098, 0.3, 4, 12]} />
          </mesh>

          <group position={[0, -0.4, 0]} rotation={pose.rightKnee ?? ZERO}>
            <mesh material={jointMat}>
              <sphereGeometry args={[0.09, 16, 16]} />
            </mesh>
            <mesh position={[0, -0.16, 0]} material={bodyMat} castShadow>
              <capsuleGeometry args={[0.062, 0.28, 4, 12]} />
            </mesh>
            <mesh position={[0, -0.32, 0]} material={jointMat}>
              <sphereGeometry args={[0.05, 12, 12]} />
            </mesh>
            <group position={[0, -0.37, 0.02]}>
              <mesh position={[0, 0, -0.02]} material={bodyMat} castShadow>
                <boxGeometry args={[0.09, 0.07, 0.11]} />
              </mesh>
              <mesh position={[0, -0.015, 0.11]} rotation={[0.18, 0, 0]} material={bodyMat} castShadow>
                <boxGeometry args={[0.08, 0.05, 0.19]} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
