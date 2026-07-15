// WASD 이동, 드래그 시점 회전, 스크롤 돌리, Q/E 상하 이동을 처리하는 자유 비행 카메라 컨트롤러
"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useShotStore } from "@/store/useShotStore";
import { SUBJECT_EYE_HEIGHT, SHOT_PRESETS } from "@/lib/shotPresets";

const MOVE_SPEED = 2.4; // m/s
const VERTICAL_SPEED = 1.6; // m/s
const DOLLY_SPEED = 0.0016; // per wheel delta unit
const LOOK_SENSITIVITY = 0.0025;
const PITCH_LIMIT = Math.PI * 0.48;
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
  const posRef = useRef(new THREE.Vector3(0, SUBJECT_EYE_HEIGHT, 2.8));
  const yawRef = useRef(0); // 초기: 카메라가 -Z(피사체 쪽)를 바라보도록 시작
  const pitchRef = useRef(0);
  const keysRef = useRef<Set<string>>(new Set());
  const isDraggingRef = useRef(false);
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

  // 키보드 입력
  useEffect(() => {
    const down = (e: KeyboardEvent) => keysRef.current.add(e.key.toLowerCase());
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // 드래그로 시점 회전(Shot view) 또는 화면 이동(Bird's-eye), 스크롤로 돌리 또는 고도 조절
  useEffect(() => {
    const el = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || !lastPointerRef.current) return;
      const dx = e.clientX - lastPointerRef.current.x;
      const dy = e.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };

      if (viewModeRef.current === "bird") {
        // Bird's-eye: 드래그는 시점 회전이 아니라 평면 이동(패닝)으로 동작해야 한다.
        posRef.current.x -= dx * BIRD_PAN_SPEED;
        posRef.current.z -= dy * BIRD_PAN_SPEED;
      } else {
        yawRef.current -= dx * LOOK_SENSITIVITY;
        pitchRef.current = THREE.MathUtils.clamp(
          pitchRef.current - dy * LOOK_SENSITIVITY,
          -PITCH_LIMIT,
          PITCH_LIMIT,
        );
      }
    };
    const onPointerUp = () => {
      isDraggingRef.current = false;
      lastPointerRef.current = null;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (viewModeRef.current === "bird") {
        // Bird's-eye: 스크롤은 고도(줌)를 조절한다.
        posRef.current.y = Math.max(0.5, posRef.current.y + e.deltaY * BIRD_ZOOM_SPEED);
      } else {
        const forward = new THREE.Vector3(0, 0, -1).applyEuler(
          new THREE.Euler(pitchRef.current, yawRef.current, 0, "YXZ"),
        );
        posRef.current.addScaledVector(forward, -e.deltaY * DOLLY_SPEED);
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

  // 샷 타입 프리셋 스냅 요청 처리
  useEffect(() => {
    if (!pendingSnap) return;
    const subjectPos = computeSubjectWorldPosition(subject.leftRight, subject.depth);

    let newPos: THREE.Vector3;
    let focal: THREE.Vector3;

    if (pendingSnap.shotType === "overShoulder") {
      // 오버숄더: 두 번째 피사체(대화 상대) 어깨 너머에서, 첫 번째 피사체의 얼굴을 바라본다.
      // 카메라를 두 번째 피사체 위치에서 "더 뒤로" 밀어내고(두 번째 피사체가 인물 몸속에
      // 파묻히지 않을 만큼 충분히), 완전히 일직선이 아니라 살짝 옆으로 비켜서게 한다.
      const secondPos = computeSubjectWorldPosition(secondSubject.leftRight, secondSubject.depth);
      const dirAB = new THREE.Vector3().subVectors(secondPos, subjectPos).setY(0).normalize();
      const perp = new THREE.Vector3(dirAB.z, 0, -dirAB.x);
      newPos = new THREE.Vector3()
        .copy(secondPos)
        .addScaledVector(dirAB, pendingSnap.distance)
        .addScaledVector(perp, OTS_LATERAL_NUDGE);
      newPos.y = SUBJECT_EYE_HEIGHT + pendingSnap.heightOffset;
      focal = new THREE.Vector3(subjectPos.x, pendingSnap.focalHeight, subjectPos.z);
    } else {
      newPos = new THREE.Vector3(
        subjectPos.x,
        SUBJECT_EYE_HEIGHT + pendingSnap.heightOffset,
        subjectPos.z + pendingSnap.distance,
      );
      focal = new THREE.Vector3(subjectPos.x, pendingSnap.focalHeight, subjectPos.z);
    }

    posRef.current.copy(newPos);
    // 일반 Object3D.lookAt()은 Camera.lookAt()과 방향 계산이 반대라, 카메라 계열
    // 더미 오브젝트를 써야 실제 카메라와 동일한 방향으로 바라보게 된다.
    const dummy = new THREE.PerspectiveCamera();
    dummy.position.copy(newPos);
    dummy.lookAt(focal);
    const euler = new THREE.Euler().setFromQuaternion(dummy.quaternion, "YXZ");
    yawRef.current = euler.y;
    pitchRef.current = euler.x;
    clearPendingSnap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSnap]);

  // "Recenter on subject" 요청 처리 (위치는 그대로, 시선만 피사체로)
  useEffect(() => {
    if (recenterRequestId === 0) return;
    const subjectPos = computeSubjectWorldPosition(subject.leftRight, subject.depth);
    const focalHeight = SHOT_PRESETS[shotType].focalHeight;
    const focal = new THREE.Vector3(subjectPos.x, focalHeight, subjectPos.z);
    const dummy = new THREE.PerspectiveCamera();
    dummy.position.copy(posRef.current);
    dummy.lookAt(focal);
    const euler = new THREE.Euler().setFromQuaternion(dummy.quaternion, "YXZ");
    yawRef.current = euler.y;
    pitchRef.current = euler.x;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recenterRequestId]);

  useFrame((_, delta) => {
    const keys = keysRef.current;
    const forward = new THREE.Vector3(0, 0, -1).applyEuler(
      new THREE.Euler(0, yawRef.current, 0, "YXZ"),
    );
    const right = new THREE.Vector3(1, 0, 0).applyEuler(
      new THREE.Euler(0, yawRef.current, 0, "YXZ"),
    );
    const step = MOVE_SPEED * delta;

    if (keys.has("w")) posRef.current.addScaledVector(forward, step);
    if (keys.has("s")) posRef.current.addScaledVector(forward, -step);
    if (keys.has("a")) posRef.current.addScaledVector(right, -step);
    if (keys.has("d")) posRef.current.addScaledVector(right, step);
    if (keys.has("q")) posRef.current.y -= VERTICAL_SPEED * delta;
    if (keys.has("e")) posRef.current.y += VERTICAL_SPEED * delta;

    if (viewMode === "bird") {
      // Bird's-eye 뷰: WASD/드래그/스크롤로 움직인 posRef.x/z를 평면 이동으로,
      // posRef.y를 고도(줌)로 그대로 활용한다.
      // (Shot view로 돌아가면 posRef/yaw/pitch가 그대로 남아있어 원래 시점이 복원된다)
      const birdHeight = Math.max(3, posRef.current.y + 6);
      camera.position.set(posRef.current.x, birdHeight, posRef.current.z);
      camera.lookAt(posRef.current.x, 0, posRef.current.z);
    } else {
      camera.position.copy(posRef.current);
      camera.quaternion.setFromEuler(
        new THREE.Euler(pitchRef.current, yawRef.current, 0, "YXZ"),
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
      const distance = posRef.current.distanceTo(subjectPos);

      const faceDir = new THREE.Vector3(0, 0, 1).applyEuler(
        new THREE.Euler(0, THREE.MathUtils.degToRad(subject.rotate), 0),
      );
      const toCamera = new THREE.Vector3()
        .subVectors(posRef.current, subjectPos)
        .setY(0)
        .normalize();
      const dot = faceDir.dot(toCamera);
      const viewDirection = dot > 0.5 ? "front" : dot < -0.5 ? "back" : "side";
      setLiveCameraInfo(distance, viewDirection);
    }
  });

  return null;
}
