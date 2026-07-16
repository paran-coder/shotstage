// 관절 마네킹: 향후 "관절을 움직이는" 기능을 붙일 수 있도록, 각 관절이 부모-자식으로
// 이어지는 계층 구조(그룹 중첩)로 만들어졌다.
//
// v1.9.0까지는 몸통/팔다리를 캡슐+구체를 이어붙이는 방식으로 만들었는데, 캡슐은 길이 내내
// 반지름이 균일하고 캡슐끼리는 이어지는 부분에 눈에 띄는 이음매(둥근 혹)가 생겨서,
// 반지름을 아무리 조정해도 참고 이미지 같은 매끈하고 연속적인 테이퍼 실루엣이 나올 수 없었다.
// (이게 "왜 안 바뀌냐"는 질문에 대한 진짜 이유 — 부품을 쌓는 방식 자체의 한계였다.)
//
// 이번 버전은 몸통과 팔다리 각 부위를 THREE.LatheGeometry(반지름-높이 프로파일을 축 대칭으로
// 회전시켜 만드는 형상)로 다시 만들어서, 어깨→허리처럼 굵기가 이어지는 부분을 매끈한
// 곡선으로 테이퍼링한다. 관절(어깨/팔꿈치/손목/고관절/무릎/발목)은 여전히 별도의 구체로
// 두어 구체관절인형 특유의 "관절이 볼록한 구슬" 느낌은 그대로 유지했다.
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

/** (반지름, 높이) 배열을 Y축 기준으로 회전시켜 매끈하게 테이퍼링된 형상을 만든다. */
function lathe(points: [number, number][], segments = 20) {
  return new THREE.LatheGeometry(
    points.map(([r, y]) => new THREE.Vector2(r, y)),
    segments,
  );
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
    () => new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.6 }),
    [bodyColor],
  );
  const jointMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: jointColor, roughness: 0.3 }),
    [jointColor],
  );

  // 몸통: 골반(y=0) → 허리(잘록) → 가슴(넓음) → 목(y=0.70)까지 한 번에 매끈하게 테이퍼링
  const torsoGeo = useMemo(
    () =>
      lathe([
        [0.15, 0],
        [0.16, 0.12],
        [0.125, 0.3],
        [0.14, 0.42],
        [0.175, 0.58],
        [0.07, 0.7],
      ]),
    [],
  );
  // 위팔: 어깨(y=0, 굵음) → 팔꿈치(y=-0.22, 가늚)
  const upperArmGeo = useMemo(
    () =>
      lathe([
        [0.075, 0],
        [0.06, -0.13],
        [0.048, -0.26],
      ]),
    [],
  );
  // 아래팔: 팔꿈치(y=0) → 손목(y=-0.18)
  const forearmGeo = useMemo(
    () =>
      lathe([
        [0.052, 0],
        [0.044, -0.11],
        [0.036, -0.22],
      ]),
    [],
  );
  // 허벅지: 고관절(y=0, 굵음) → 무릎(y=-0.32, 가늚)
  const thighGeo = useMemo(
    () =>
      lathe([
        [0.105, 0],
        [0.09, -0.19],
        [0.072, -0.38],
      ]),
    [],
  );
  // 종아리: 무릎(y=0) → 발목(y=-0.28)
  const shinGeo = useMemo(
    () =>
      lathe([
        [0.072, 0],
        [0.062, -0.17],
        [0.048, -0.34],
      ]),
    [],
  );

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* ── 골반(hips) — 몸 전체의 뿌리 관절이자 몸통 라테 형상의 시작점(y=0) ── */}
      <group position={[0, 0.9, 0]}>
        {/* 몸통: 골반부터 목 밑까지 매끈하게 이어지는 하나의 형상 (이음매 없음) */}
        <mesh geometry={torsoGeo} material={bodyMat} castShadow />

        {/* 허리 벨트 라인 (허리가 잘록해지는 지점, y≈0.30) */}
        <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]} material={jointMat}>
          <torusGeometry args={[0.128, 0.012, 8, 24]} />
        </mesh>

        {/* 어깨선을 가로지르는 칼라 밴드 */}
        <mesh position={[0, 0.56, 0.06]} rotation={[0, 0, Math.PI / 2]} material={jointMat}>
          <capsuleGeometry args={[0.038, 0.32, 4, 10]} />
        </mesh>

        {/* 목 관절 */}
        <group position={[0, 0.62, 0]} rotation={pose.neck ?? ZERO}>
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
        <group position={[-0.185, 0.56, 0]} rotation={pose.leftShoulder ?? ZERO}>
          <mesh material={bodyMat} castShadow>
            <sphereGeometry args={[0.085, 16, 16]} />
          </mesh>
          {/* 위팔 (라테 지오메트리는 로컬 y=0에서 시작해 -y로 뻗어나감) */}
          <mesh geometry={upperArmGeo} rotation={[0, 0, 0.12]} material={bodyMat} castShadow />

          <group position={[-0.05, -0.26, 0.015]} rotation={pose.leftElbow ?? ZERO}>
            <mesh material={jointMat}>
              <sphereGeometry args={[0.062, 16, 16]} />
            </mesh>
            <mesh geometry={forearmGeo} material={bodyMat} castShadow />
            <mesh position={[0, -0.22, 0]} material={jointMat}>
              <sphereGeometry args={[0.042, 12, 12]} />
            </mesh>
            {/* 주먹 */}
            <mesh position={[0, -0.28, 0]} material={bodyMat} castShadow>
              <sphereGeometry args={[0.058, 12, 12]} />
            </mesh>
          </group>
        </group>

        {/* ── 오른쪽 어깨 관절 → 팔꿈치 관절 → 손 (왼쪽 미러) ── */}
        <group position={[0.185, 0.56, 0]} rotation={pose.rightShoulder ?? ZERO}>
          <mesh material={bodyMat} castShadow>
            <sphereGeometry args={[0.085, 16, 16]} />
          </mesh>
          <mesh geometry={upperArmGeo} rotation={[0, 0, -0.12]} material={bodyMat} castShadow />

          <group position={[0.05, -0.26, 0.015]} rotation={pose.rightElbow ?? ZERO}>
            <mesh material={jointMat}>
              <sphereGeometry args={[0.062, 16, 16]} />
            </mesh>
            <mesh geometry={forearmGeo} material={bodyMat} castShadow />
            <mesh position={[0, -0.22, 0]} material={jointMat}>
              <sphereGeometry args={[0.042, 12, 12]} />
            </mesh>
            <mesh position={[0, -0.28, 0]} material={bodyMat} castShadow>
              <sphereGeometry args={[0.058, 12, 12]} />
            </mesh>
          </group>
        </group>

        {/* ── 왼쪽 고관절 → 무릎 관절 → 발 ── */}
        <group position={[-0.11, -0.08, 0]} rotation={pose.leftHip ?? ZERO}>
          <mesh material={bodyMat} castShadow>
            <sphereGeometry args={[0.095, 16, 16]} />
          </mesh>
          <mesh geometry={thighGeo} material={bodyMat} castShadow />

          <group position={[0, -0.38, 0]} rotation={pose.leftKnee ?? ZERO}>
            <mesh material={jointMat}>
              <sphereGeometry args={[0.088, 16, 16]} />
            </mesh>
            <mesh geometry={shinGeo} material={bodyMat} castShadow />
            <mesh position={[0, -0.34, 0]} material={jointMat}>
              <sphereGeometry args={[0.05, 12, 12]} />
            </mesh>
            {/* 발: 뒤꿈치 블록 + 길게 뻗은 발끝 블록 (신발 실루엣) */}
            <group position={[0, -0.36, 0.02]}>
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
          <mesh geometry={thighGeo} material={bodyMat} castShadow />

          <group position={[0, -0.38, 0]} rotation={pose.rightKnee ?? ZERO}>
            <mesh material={jointMat}>
              <sphereGeometry args={[0.088, 16, 16]} />
            </mesh>
            <mesh geometry={shinGeo} material={bodyMat} castShadow />
            <mesh position={[0, -0.34, 0]} material={jointMat}>
              <sphereGeometry args={[0.05, 12, 12]} />
            </mesh>
            <group position={[0, -0.36, 0.02]}>
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
