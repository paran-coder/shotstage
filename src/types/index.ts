// 앱 전역에서 쓰는 공용 타입 정의

export type ShotTypeId =
  | "medium"
  | "wide"
  | "closeUp"
  | "lowAngle"
  | "highAngle"
  | "overShoulder"
  | "twoShot";

export type AngleLabel = "eye level" | "low angle" | "high angle";

export type AspectRatioId = "16:9" | "9:16" | "1:1" | "4:5" | "2.35:1";

export type PromptMode = "image" | "video";

export type CameraMoveId =
  | "static"
  | "panLeft"
  | "panRight"
  | "tiltUp"
  | "tiltDown"
  | "dollyIn"
  | "dollyOut"
  | "trackLeft"
  | "trackRight"
  | "arc"
  | "handheld";

export type MoveIntensity = "subtle" | "normal" | "strong";

export interface CameraState {
  /** 카메라 위치 (three.js 좌표계) */
  position: [number, number, number];
  /** 카메라가 바라보는 target 지점 */
  target: [number, number, number];
  /** 시야각 (degree) */
  fov: number;
}

export interface SubjectState {
  /** 좌우 위치 (-1 ~ 1) */
  leftRight: number;
  /** 앞뒤 깊이 위치 (-1 ~ 1) */
  depth: number;
  /** 회전 (degree, -180 ~ 180) */
  rotate: number;
  /** 두 번째 피사체 표시 여부 */
  showSecondSubject: boolean;
}

export interface VideoMoveState {
  moveType: CameraMoveId;
  intensity: MoveIntensity;
  durationSeconds: number;
}

export interface PromptFieldsState {
  mode: PromptMode;
  model: string;
  hasCharacterSheet: boolean;
  characterSheetImage: string | null; // data URL
  hasEnvironmentSheet: boolean;
  environmentSheetImage: string | null; // data URL
  subject: string;
  environment: string;
  lookStyle: string;
}

export interface CharacterPreset {
  id: string;
  name: string;
  subjectText: string;
  referenceImage: string | null; // data URL
  createdAt: number;
}

export interface EnvironmentPreset {
  id: string;
  name: string;
  environmentText: string;
  referenceImage: string | null; // data URL
  createdAt: number;
}

export interface StylePreset {
  id: string;
  name: string;
  styleText: string;
  createdAt: number;
}
