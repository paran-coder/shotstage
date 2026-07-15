// 앱 전역 상태(카메라, 샷 타입, 피사체, 화각비, 무빙샷, 프롬프트 입력) 관리 스토어
import { create } from "zustand";
import type {
  AspectRatioId,
  CameraMoveId,
  MoveIntensity,
  PromptFieldsState,
  SecondSubjectState,
  ShotTypeId,
  SubjectState,
  VideoMoveState,
} from "@/types";
import { SECOND_SUBJECT_DEFAULT, SHOT_PRESETS } from "@/lib/shotPresets";

export type ViewMode = "shot" | "bird";

export interface PendingSnap {
  shotType: ShotTypeId;
  distance: number;
  heightOffset: number;
  focalHeight: number;
  fov: number;
}

interface ShotStoreState {
  shotType: ShotTypeId;
  angleLabel: string;
  viewMode: ViewMode;
  showGrid: boolean;
  showLabels: boolean;
  fov: number;
  aspectRatio: AspectRatioId;
  subject: SubjectState;
  secondSubject: SecondSubjectState;
  videoMove: VideoMoveState;
  prompt: PromptFieldsState;
  /** 카메라를 특정 프리셋으로 스냅해달라는 일회성 요청 (컨트롤러가 소비 후 null로 되돌림) */
  pendingSnap: PendingSnap | null;
  /** HUD 표시를 위한 현재 카메라-피사체 거리(대략치) */
  currentDistance: number;
  /** HUD 표시를 위한 현재 뷰 방향("front" | "back" | "side") */
  currentViewDirection: "front" | "back" | "side";
  /** 프레임 캡처 요청 카운터, 증가할 때마다 캔버스를 다시 캡처 */
  frameCaptureRequestId: number;
  /** 캡처된 블로킹 프레임 이미지 (data URL) */
  capturedFrame: string | null;
  resultModalOpen: boolean;
  resultPromptText: string;

  setShotType: (id: ShotTypeId) => void;
  setFov: (fov: number) => void;
  setAspectRatio: (id: AspectRatioId) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleGrid: () => void;
  toggleLabels: () => void;
  setSubject: (patch: Partial<SubjectState>) => void;
  setSecondSubject: (patch: Partial<SecondSubjectState>) => void;
  setVideoMove: (patch: Partial<VideoMoveState>) => void;
  setPrompt: (patch: Partial<PromptFieldsState>) => void;
  requestRecenter: () => void;
  clearPendingSnap: () => void;
  setLiveCameraInfo: (distance: number, viewDirection: "front" | "back" | "side") => void;
  recenterRequestId: number;
  requestFrameCapture: () => void;
  setCapturedFrame: (dataUrl: string) => void;
  openResultModal: (promptText: string) => void;
  closeResultModal: () => void;
}

export const useShotStore = create<ShotStoreState>((set, get) => ({
  shotType: "medium",
  angleLabel: SHOT_PRESETS.medium.angleLabel,
  viewMode: "shot",
  showGrid: true,
  showLabels: true,
  fov: SHOT_PRESETS.medium.fov,
  aspectRatio: "16:9",
  subject: {
    leftRight: 0,
    depth: 0,
    rotate: 0,
    showSecondSubject: false,
  },
  secondSubject: { ...SECOND_SUBJECT_DEFAULT },
  videoMove: {
    moveType: "static",
    intensity: "normal",
    durationSeconds: 5,
  },
  prompt: {
    mode: "image",
    model: "GPT Image 2",
    hasCharacterSheet: false,
    characterSheetImage: null,
    hasEnvironmentSheet: false,
    environmentSheetImage: null,
    subject: "",
    environment: "",
    lookStyle: "",
  },
  pendingSnap: null,
  currentDistance: SHOT_PRESETS.medium.distance,
  currentViewDirection: "front",
  recenterRequestId: 0,
  frameCaptureRequestId: 0,
  capturedFrame: null,
  resultModalOpen: false,
  resultPromptText: "",

  setShotType: (id) => {
    const preset = SHOT_PRESETS[id];
    set({
      shotType: id,
      angleLabel: preset.angleLabel,
      fov: preset.fov,
      pendingSnap: {
        shotType: id,
        distance: preset.distance,
        heightOffset: preset.heightOffset,
        focalHeight: preset.focalHeight,
        fov: preset.fov,
      },
      subject: {
        ...get().subject,
        showSecondSubject: preset.showSecondSubjectByDefault,
      },
      // 샷 타입을 바꿀 때마다 두 번째 피사체 위치도 기본값으로 리셋한다.
      // (이후 SUBJECT 패널의 "인물 2" 슬라이더로 자유롭게 재조정 가능)
      secondSubject: { ...SECOND_SUBJECT_DEFAULT },
    });
  },
  setFov: (fov) => set({ fov }),
  setAspectRatio: (id) => set({ aspectRatio: id }),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  setSubject: (patch) => set((s) => ({ subject: { ...s.subject, ...patch } })),
  setSecondSubject: (patch) =>
    set((s) => ({ secondSubject: { ...s.secondSubject, ...patch } })),
  setVideoMove: (patch) => set((s) => ({ videoMove: { ...s.videoMove, ...patch } })),
  setPrompt: (patch) => set((s) => ({ prompt: { ...s.prompt, ...patch } })),
  requestRecenter: () => set((s) => ({ recenterRequestId: s.recenterRequestId + 1 })),
  clearPendingSnap: () => set({ pendingSnap: null }),
  setLiveCameraInfo: (distance, viewDirection) =>
    set({ currentDistance: distance, currentViewDirection: viewDirection }),
  requestFrameCapture: () =>
    set((s) => ({ frameCaptureRequestId: s.frameCaptureRequestId + 1 })),
  setCapturedFrame: (dataUrl) => set({ capturedFrame: dataUrl }),
  openResultModal: (promptText) =>
    set({ resultModalOpen: true, resultPromptText: promptText }),
  closeResultModal: () => set({ resultModalOpen: false }),
}));

export type { ShotTypeId, CameraMoveId, MoveIntensity };
