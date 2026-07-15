// 샷 타입 버튼 클릭 시 카메라가 스냅할 위치/앵글/화각 프리셋 정의
import type { AngleLabel, ShotTypeId } from "@/types";

export interface ShotPreset {
  id: ShotTypeId;
  label: string; // UI 버튼/HUD 라벨에 표시할 한국어 이름
  promptName: string; // 최종 AI 프롬프트(영문)에 쓰일 이름
  distance: number; // 피사체로부터 카메라까지 거리 (m)
  heightOffset: number; // 눈높이(1.6m) 대비 카메라 높이 오프셋
  fov: number; // 기본 시야각 (degree)
  angleLabel: AngleLabel;
  showSecondSubjectByDefault: boolean;
}

export const SUBJECT_EYE_HEIGHT = 1.6;

export const ANGLE_LABEL_KO: Record<AngleLabel, string> = {
  "eye level": "아이레벨",
  "low angle": "로우 앵글",
  "high angle": "하이 앵글",
};

export const SHOT_PRESETS: Record<ShotTypeId, ShotPreset> = {
  medium: {
    id: "medium",
    label: "미디엄 샷",
    promptName: "medium shot",
    distance: 2.8,
    heightOffset: 0,
    fov: 45,
    angleLabel: "eye level",
    showSecondSubjectByDefault: false,
  },
  wide: {
    id: "wide",
    label: "와이드 샷",
    promptName: "wide shot",
    distance: 5.5,
    heightOffset: 0,
    fov: 55,
    angleLabel: "eye level",
    showSecondSubjectByDefault: false,
  },
  closeUp: {
    id: "closeUp",
    label: "클로즈업",
    promptName: "close-up shot",
    distance: 1.1,
    heightOffset: 0.5,
    fov: 35,
    angleLabel: "eye level",
    showSecondSubjectByDefault: false,
  },
  lowAngle: {
    id: "lowAngle",
    label: "로우 앵글",
    promptName: "low-angle shot",
    distance: 2.6,
    heightOffset: -1.0,
    fov: 45,
    angleLabel: "low angle",
    showSecondSubjectByDefault: false,
  },
  highAngle: {
    id: "highAngle",
    label: "하이 앵글",
    promptName: "high-angle shot",
    distance: 2.6,
    heightOffset: 1.6,
    fov: 45,
    angleLabel: "high angle",
    showSecondSubjectByDefault: false,
  },
  overShoulder: {
    id: "overShoulder",
    label: "오버 숄더",
    promptName: "over-the-shoulder shot",
    distance: 1.6,
    heightOffset: 0.1,
    fov: 40,
    angleLabel: "eye level",
    showSecondSubjectByDefault: true,
  },
  twoShot: {
    id: "twoShot",
    label: "투 샷",
    promptName: "two shot",
    distance: 3.6,
    heightOffset: 0,
    fov: 45,
    angleLabel: "eye level",
    showSecondSubjectByDefault: true,
  },
};

export const SHOT_TYPE_ORDER: ShotTypeId[] = [
  "medium",
  "wide",
  "closeUp",
  "lowAngle",
  "highAngle",
  "overShoulder",
  "twoShot",
];
