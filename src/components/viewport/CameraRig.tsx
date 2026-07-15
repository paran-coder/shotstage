// 카메라 컨트롤러: 인물(피사체)을 중심으로 궤도 회전하는 방식.
// - 드래그: 피사체를 중심에 고정한 채 카메라가 주위를 도는 궤도 회전(orbit)
// - 스페이스바 + 드래그: 핸드 툴(화면 이동/팬)
// - 스크롤: 궤도 반지름 조절(줌/돌리)
// - WASD: 궤도 중심(피벗)을 수평으로 이동, Q/E: 피벗 높이 조절
// - Bird's-eye 뷰에서는 궤도 개념이 없으므로 드래그=평면 이동, 스크롤=고도 조절로 별도 동작
"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useShotStore } from "@/store/useShotStore";
import { SUBJECT_EYE_HEIGHT, SHOT_PRESETS } from "@/lib/shotPresets";

const PIVOT_PAN_SPEED = 2.4; // m/s (WASD로 피벗 이동)
const VERTICAL_SPEED = 1.6; // m/s (Q/E로 피벗 높이 조절)
const ORBIT_RADIUS_SPEED = 0.0016; // per wheel delta unit
const ORBIT_LOOK_SENSITIVITY = 0.0018; // 드래그 시 궤도 각도 변화 민감도 (기존보다 낮춤)
const HAND_PAN_SPEED = 0.003; // 스페이스+드래그 시 피벗 이동 민감도
const PITCH_LIMIT = Math.PI * 0.48;
const MIN_ORBIT_RADIUS = 0.3;
const BIRD_PAN_SPEED = 0.006; // per drag pixel
const BIRD_ZOOM_SPEED = 0.02; // per wheel delta unit
// 오버숄더 카메라가 두 번째 피사체를 지나 더 물러날 때, 완전히 일직선이 아니라
// 살짝 옆으로 비켜서게 하는 폭 (한 인물이 화면 전체를 가리지 않도록)
const OTS_LATERAL_NUDGE = 0.2;

function computeSubjectWorldPosition(leftRight: number, depth: number) {
  // 슬라이더 -1~1 범위를 실제 미터 오프셋으로 환산.
  // Scene.tsx의 computeOffset과 반드시 동일한 배율을 유지해야 카메라 스냅 위치와
  // 실제 렌더링된 피사체 위치가 어긋나지 않는다.
  return new THREE.Vector3(leftRight * 1.4, 0, depth * 2.4);
}

export function CameraRig() {
  const { camera, gl } = useThree();

  // 궤도 회전 상태: 피벗(중심점) 오프셋 + 각도(yaw/pitch) + 반지름
  // pivotBaseRef: 마지막 스냅/재정렬 시점의 "피사체 기준 피벗 위치"를 고정해서 저장한다.
  // (SUBJECT 패널의 좌우/깊이 슬라이더를 계속 라이브로 추적하면, 슬라이더를 움직일 때마다
  //  카메라가 피사체를 쫓아가며 항상 중앙에 고정시켜버려서, 정작 화면 안에서는 피사체가
  //  안 움직이고 배경만 움직이는 것처럼 보이는 문제가 생긴다. 스냅 시점에만 갱신해서
  //  이후 슬라이더 조작은 프레임 안에서 피사체가 실제로 움직이는 걸로 보이게 한다.)
  const pivotBaseRef = useRef(new THREE.Vector3(0, SHOT_PRESETS.medium.focalHeight, 0));
  const pivotOffsetRef = useRef(new THREE.Vector3(0, 0, 0));
  const orbitYawRef = useRef(0); // 초기: 카메라가 -Z(피사체 쪽)를 바라보도록 시작
  const orbitPitchRef = useRef(0);
  const orbitRadiusRef = useRef(2.8);

  // Bird's-eye 전용 상태 (궤도 회전과 완전히 분리)
  // birdCenterBaseRef: pivotBaseRef와 동일한 이유로, 버드아이 중심의 "피사체 기준 위치"도
  // 스냅 시점에만 고정한다. (라이브로 추적하면 SUBJECT 슬라이더 조작 시 카메라가 쫓아가서
  // 배경이 움직이는 것처럼 보이는 동일한 문제가 생긴다.)
  const birdCenterBaseRef = useRef(new THREE.Vector2(0, 0));
  const birdPanRef = useRef(new THREE.Vector2(0, 0));
  const birdHeightRef = useRef(6);

  const keysRef = useRef<Set<string>>(new Set());
  const isDraggingRef = useRef(false);
  const isSpacePanningRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const frameCounterRef = useRef(0);
  const viewModeRef = useRef<"shot" | "bird">("shot");

  const fov = useShotStore((s) => s.fov);
  const viewMode = useShotStore((s) => s.viewMode);
  const shotType = useShotStore((s) => s.shotType);
  const subject = useShotStore((s) => s.subject);
  const secondSubject = useShotStore((s) => s.secondSubject);
  const pendingSnap = useShotStore((s) => s.pendingSnap);
  const clearPendingSnap = useShotStore((s) => s.clearPendingSnap);
  const recenterRequestId = useShotStore((s) => s.recenterRequestId);
  const setLiveCameraInfo = useShotStore((s) => s.setLiveCameraInfo);

  // 드래그/스크롤 핸들러는 마운트 시 한 번만 등록되므로, 최신 viewMode를 읽으려면
  // ref로 동기화해둬야 한다 (클로저 안의 값은 등록 시점 값으로 고정되기 때문).
  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

  function currentPivot(): THREE.Vector3 {
    return new THREE.Vector3(
      pivotBaseRef.current.x + pivotOffsetRef.current.x,
      pivotBaseRef.current.y + pivotOffsetRef.current.y,
      pivotBaseRef.current.z + pivotOffsetRef.current.z,
    );
  }

  // 키보드 입력 (스페이스바 = 핸드 툴 활성화, 커서도 손 모양으로 바꿔 구분되게 함)
  useEffect(() => {
    const el = gl.domElement;

    function isTypingTarget(target: EventTarget | null) {
      const targetEl = target as HTMLElement | null;
      if (!targetEl) return false;
      const tag = targetEl.tagName;
      return (
        tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || targetEl.isContentEditable
      );
    }

    const down = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return; // 입력창에 타이핑 중이면 단축키로 가로채지 않는다
      if (e.code === "Space") {
        e.preventDefault();
        isSpacePanningRef.current = true;
        el.style.cursor = isDraggingRef.current ? "grabbing" : "grab";
        return;
      }
      keysRef.current.add(e.key.toLowerCase());
    };
    const up = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.code === "Space") {
        isSpacePanningRef.current = false;
        el.style.cursor = "auto";
        return;
      }
      keysRef.current.delete(e.key.toLowerCase());
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [gl]);

  // 드래그로 궤도 회전(Shot view) 또는 화면 이동(Bird's-eye), 스크롤로 반지름/고도 조절
  useEffect(() => {
    const el = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      if (isSpacePanningRef.current) el.style.cursor = "grabbing";
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || !lastPointerRef.current) return;
      const dx = e.clientX - lastPointerRef.current.x;
      const dy = e.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };

      if (viewModeRef.current === "bird") {
        // Bird's-eye: 드래그는 항상 평면 이동(패닝)
        birdPanRef.current.x -= dx * BIRD_PAN_SPEED;
        birdPanRef.current.y -= dy * BIRD_PAN_SPEED;
        return;
      }

      if (isSpacePanningRef.current) {
        // 스페이스바 + 드래그 = 핸드 툴(팬): 피벗을 화면 기준 좌우/상하로 이동
        const right = new THREE.Vector3(1, 0, 0).applyEuler(
          new THREE.Euler(0, orbitYawRef.current, 0, "YXZ"),
        );
        pivotOffsetRef.current.addScaledVector(right, -dx * HAND_PAN_SPEED);
        pivotOffsetRef.current.y += dy * HAND_PAN_SPEED;
      } else {
        // 일반 드래그 = 피사체를 중심에 둔 궤도 회전
        orbitYawRef.current -= dx * ORBIT_LOOK_SENSITIVITY;
        orbitPitchRef.current = THREE.MathUtils.clamp(
          orbitPitchRef.current - dy * ORBIT_LOOK_SENSITIVITY,
          -PITCH_LIMIT,
          PITCH_LIMIT,
        );
      }
    };
    const onPointerUp = () => {
      isDraggingRef.current = false;
      lastPointerRef.current = null;
      if (isSpacePanningRef.current) el.style.cursor = "grab";
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (viewModeRef.current === "bird") {
        birdHeightRef.current = Math.max(0.5, birdHeightRef.current + e.deltaY * BIRD_ZOOM_SPEED);
      } else {
        orbitRadiusRef.current = Math.max(
          MIN_ORBIT_RADIUS,
          orbitRadiusRef.current + e.deltaY * ORBIT_RADIUS_SPEED,
        );
      }
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("wheel", onWheel);
    };
  }, [gl]);

  function applySnap(id: keyof typeof SHOT_PRESETS) {
    const preset = SHOT_PRESETS[id];
    const subjectPos = computeSubjectWorldPosition(subject.leftRight, subject.depth);

    let newPos: THREE.Vector3;
    let focal: THREE.Vector3;

    if (id === "overShoulder") {
      // 오버숄더: 두 번째 피사체(대화 상대) 어깨 너머에서, 첫 번째 피사체의 얼굴을 바라본다.
      const secondPos = computeSubjectWorldPosition(secondSubject.leftRight, secondSubject.depth);
      const dirAB = new THREE.Vector3().subVectors(secondPos, subjectPos).setY(0).normalize();
      const perp = new THREE.Vector3(dirAB.z, 0, -dirAB.x);
      newPos = new THREE.Vector3()
        .copy(secondPos)
        .addScaledVector(dirAB, preset.distance)
        .addScaledVector(perp, OTS_LATERAL_NUDGE);
      newPos.y = SUBJECT_EYE_HEIGHT + preset.heightOffset;
      focal = new THREE.Vector3(subjectPos.x, preset.focalHeight, subjectPos.z);
    } else {
      newPos = new THREE.Vector3(
        subjectPos.x,
        SUBJECT_EYE_HEIGHT + preset.heightOffset,
        subjectPos.z + preset.distance,
      );
      focal = new THREE.Vector3(subjectPos.x, preset.focalHeight, subjectPos.z);
    }

    // 새 샷을 고를 때마다(또는 재정렬 시) 피벗의 "피사체 기준 위치"를 이 순간의 값으로 고정한다.
    // 이후 SUBJECT 패널 슬라이더를 움직여도 이 값은 바뀌지 않으므로, 피사체가 실제로
    // 화면 안에서 움직이는 것으로 보인다 (카메라가 쫓아가며 항상 중앙에 고정하지 않음).
    pivotBaseRef.current.copy(focal);
    pivotOffsetRef.current.set(0, 0, 0);
    // Bird's-eye 중심 기준점도 이 순간의 피사체 위치로 고정한다 (샷을 바꾸면 항상 인물이 중심에서 시작).
    birdCenterBaseRef.current.set(subjectPos.x, subjectPos.z);
    birdPanRef.current.set(0, 0);

    // 일반 Object3D.lookAt()은 Camera.lookAt()과 방향 계산이 반대라, 카메라 계열
    // 더미 오브젝트를 써야 실제 카메라와 동일한 방향으로 바라보게 된다.
    const dummy = new THREE.PerspectiveCamera();
    dummy.position.copy(newPos);
    dummy.lookAt(focal);
    const euler = new THREE.Euler().setFromQuaternion(dummy.quaternion, "YXZ");
    orbitYawRef.current = euler.y;
    orbitPitchRef.current = euler.x;
    orbitRadiusRef.current = Math.max(MIN_ORBIT_RADIUS, newPos.distanceTo(focal));
  }

  // 샷 타입 프리셋 스냅 요청 처리
  useEffect(() => {
    if (!pendingSnap) return;
    applySnap(pendingSnap.shotType);
    clearPendingSnap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSnap]);

  // "Recenter on subject" 요청 처리: 현재 샷 타입 기준으로 다시 스냅한다.
  // (드래그로 회전했거나 WASD/스페이스+드래그로 피벗이 옮겨간 것을 모두 원래 프레이밍으로 되돌림)
  useEffect(() => {
    if (recenterRequestId === 0) return;
    applySnap(shotType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recenterRequestId]);

  useFrame((_, delta) => {
    const keys = keysRef.current;

    if (viewMode === "bird") {
      // Bird's-eye 뷰: WASD/드래그/스크롤로 조절한 birdPan/birdHeight를 그대로 사용.
      // (Shot view로 돌아가면 궤도 상태가 그대로 남아있어 원래 시점이 복원된다)
      const step = PIVOT_PAN_SPEED * delta;
      if (keys.has("w")) birdPanRef.current.y -= step;
      if (keys.has("s")) birdPanRef.current.y += step;
      if (keys.has("a")) birdPanRef.current.x -= step;
      if (keys.has("d")) birdPanRef.current.x += step;
      if (keys.has("q")) birdHeightRef.current = Math.max(0.5, birdHeightRef.current - VERTICAL_SPEED * delta);
      if (keys.has("e")) birdHeightRef.current += VERTICAL_SPEED * delta;

      const centerX = birdCenterBaseRef.current.x + birdPanRef.current.x;
      const centerZ = birdCenterBaseRef.current.y + birdPanRef.current.y;
      camera.position.set(centerX, birdHeightRef.current, centerZ);
      camera.lookAt(centerX, 0, centerZ);
    } else {
      // Shot view: WASD로 피벗을 수평 이동, Q/E로 피벗 높이 조절
      const forward = new THREE.Vector3(0, 0, -1).applyEuler(
        new THREE.Euler(0, orbitYawRef.current, 0, "YXZ"),
      );
      const right = new THREE.Vector3(1, 0, 0).applyEuler(
        new THREE.Euler(0, orbitYawRef.current, 0, "YXZ"),
      );
      const step = PIVOT_PAN_SPEED * delta;
      if (keys.has("w")) pivotOffsetRef.current.addScaledVector(forward, step);
      if (keys.has("s")) pivotOffsetRef.current.addScaledVector(forward, -step);
      if (keys.has("a")) pivotOffsetRef.current.addScaledVector(right, -step);
      if (keys.has("d")) pivotOffsetRef.current.addScaledVector(right, step);
      if (keys.has("q")) pivotOffsetRef.current.y -= VERTICAL_SPEED * delta;
      if (keys.has("e")) pivotOffsetRef.current.y += VERTICAL_SPEED * delta;

      const updatedPivot = currentPivot();
      const orbitForward = new THREE.Vector3(0, 0, -1).applyEuler(
        new THREE.Euler(orbitPitchRef.current, orbitYawRef.current, 0, "YXZ"),
      );
      const camPos = updatedPivot.clone().addScaledVector(orbitForward, -orbitRadiusRef.current);
      camera.position.copy(camPos);
      camera.quaternion.setFromEuler(
        new THREE.Euler(orbitPitchRef.current, orbitYawRef.current, 0, "YXZ"),
      );
    }

    if (camera instanceof THREE.PerspectiveCamera && camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    // HUD 정보는 매 프레임 갱신하지 않고 10프레임에 한 번만 갱신 (불필요한 리렌더 방지)
    frameCounterRef.current += 1;
    if (frameCounterRef.current % 10 === 0) {
      const subjectPos = computeSubjectWorldPosition(subject.leftRight, subject.depth);
      const distance = camera.position.distanceTo(subjectPos);

      const faceDir = new THREE.Vector3(0, 0, 1).applyEuler(
        new THREE.Euler(0, THREE.MathUtils.degToRad(subject.rotate), 0),
      );
      const toCamera = new THREE.Vector3()
        .subVectors(camera.position, subjectPos)
        .setY(0)
        .normalize();
      const dot = faceDir.dot(toCamera);
      const viewDirection = dot > 0.5 ? "front" : dot < -0.5 ? "back" : "side";
      setLiveCameraInfo(distance, viewDirection);
    }
  });

  return null;
}
