// Video 모드에서 선택하는 카메라 무브 프리셋 정의
import type { CameraMoveId, MoveIntensity } from "@/types";

export interface CameraMovePreset {
  id: CameraMoveId;
  label: string; // 버튼에 표시할 한국어 이름
  promptPhrase: string; // 최종 AI 프롬프트(영문)에 들어갈 동작 표현
}

export const CAMERA_MOVE_PRESETS: CameraMovePreset[] = [
  { id: "static", label: "정지", promptPhrase: "the camera holds completely still" },
  { id: "panLeft", label: "팬 왼쪽", promptPhrase: "the camera pans left" },
  { id: "panRight", label: "팬 오른쪽", promptPhrase: "the camera pans right" },
  { id: "tiltUp", label: "틸트 업", promptPhrase: "the camera tilts upward" },
  { id: "tiltDown", label: "틸트 다운", promptPhrase: "the camera tilts downward" },
  { id: "dollyIn", label: "달리 인", promptPhrase: "the camera dollies in toward the subject" },
  { id: "dollyOut", label: "달리 아웃", promptPhrase: "the camera dollies out away from the subject" },
  { id: "trackLeft", label: "트랙 왼쪽", promptPhrase: "the camera tracks left alongside the subject" },
  { id: "trackRight", label: "트랙 오른쪽", promptPhrase: "the camera tracks right alongside the subject" },
  { id: "arc", label: "아크", promptPhrase: "the camera arcs around the subject" },
  { id: "handheld", label: "핸드헬드", promptPhrase: "the camera moves with subtle handheld drift" },
];

export const MOVE_INTENSITY_OPTIONS: {
  id: MoveIntensity;
  label: string;
  tooltip: string;
  promptAdverb: string;
}[] = [
  {
    id: "subtle",
    label: "약함",
    tooltip: "거의 느껴지지 않는 미세한 움직임",
    promptAdverb: "very subtly",
  },
  {
    id: "normal",
    label: "보통",
    tooltip: "자연스럽게 체감되는 표준적인 움직임",
    promptAdverb: "smoothly",
  },
  {
    id: "strong",
    label: "강함",
    tooltip: "뚜렷하고 극적인 움직임",
    promptAdverb: "dramatically",
  },
];
