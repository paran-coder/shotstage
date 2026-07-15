// WASD 이동, 드래그 시점 회전, 스크롤 돌리, Q/E 상하 이동을 처리하는 자유 비행 카메라 컨트롤러
"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useShotStore } from "@/store/useShotStore";
import { SUBJECT_EYE_HEIGHT } from "@/lib/shotPresets";

const MOVE_SPEED = 2.4; // m/s
const VERTICAL_SPEED = 1.6; // m/s
const DOLLY_SPEED = 0.0016; // per wheel delta unit
const LOOK_SENSITIVITY = 0.0025;
const PITCH_LIMIT = Math.PI * 0.48;

function computeSubjectWorldPosition(leftRight: number, depth: number) {
  // 슬라이더 -1~1 범위를 실제 미터 오프셋으로 환산
  return new THREE.Vector3(leftRight * 1.4, 0, depth * 1.4);
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

  const fov = useShotStore((s) => s.fov);
  const viewMode = useShotStore((s) => s.viewMode);
  const subject = useShotStore((s) => s.subject);
  const pendingSnap = useShotStore((s) => s.pendingSnap);
  const clearPendingSnap = useShotStore((s) => s.clearPendingSnap);
  const recenterRequestId = useShotStore((s) => s.recenterRequestId);
  const setLiveCameraInfo = useShotStore((s) => s.setLiveCameraInfo);

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

  // 드래그로 시점 회전 (제자리 pan/tilt), 스크롤로 돌리
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
      yawRef.current -= dx * LOOK_SENSITIVITY;
      pitchRef.current = THREE.MathUtils.clamp(
        pitchRef.current - dy * LOOK_SENSITIVITY,
        -PITCH_LIMIT,
        PITCH_LIMIT,
      );
    };
    const onPointerUp = () => {
      isDraggingRef.current = false;
      lastPointerRef.current = null;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const forward = new THREE.Vector3(0, 0, -1).applyEuler(
        new THREE.Euler(pitchRef.current, yawRef.current, 0, "YXZ"),
      );
      posRef.current.addScaledVector(forward, -e.deltaY * DOLLY_SPEED);
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
    const newPos = new THREE.Vector3(
      subjectPos.x,
      SUBJECT_EYE_HEIGHT + pendingSnap.heightOffset,
      subjectPos.z + pendingSnap.distance,
    );
    posRef.current.copy(newPos);
    const focal = new THREE.Vector3(subjectPos.x, 1.2, subjectPos.z);
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
    const focal = new THREE.Vector3(subjectPos.x, 1.2, subjectPos.z);
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
      // Bird's-eye 뷰: posRef/yaw/pitch는 건드리지 않고, 렌더링되는 카메라만 위에서 내려다보는 시점으로 오버라이드
      const subjectPos = computeSubjectWorldPosition(subject.leftRight, subject.depth);
      camera.position.set(subjectPos.x, 9, subjectPos.z + 0.001);
      camera.lookAt(subjectPos.x, 0, subjectPos.z);
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
