// 현재 카메라/피사체/프롬프트 설정을 바탕으로 HUD 라벨과 최종 AI 프롬프트 텍스트를 생성
import { SHOT_PRESETS } from "./shotPresets";
import { fovToMm } from "./lensPresets";
import { CAMERA_MOVE_PRESETS, MOVE_INTENSITY_OPTIONS } from "./cameraMoves";
import type {
  AspectRatioId,
  PromptFieldsState,
  ShotTypeId,
  VideoMoveState,
} from "@/types";

interface LabelInput {
  shotType: ShotTypeId;
  angleLabel: string;
  fov: number;
  viewDirection: "front" | "back" | "side";
}

/** 상단 오버레이용 소문자 라벨: 예) "medium shot · 28mm · eye level" */
export function buildTopLabel({ shotType, angleLabel, fov }: LabelInput): string {
  const preset = SHOT_PRESETS[shotType];
  const mm = fovToMm(fov);
  return `${preset.promptName} · ${mm}mm · ${angleLabel}`;
}

/** 하단 오버레이용 대문자 라벨: 예) "MEDIUM SHOT · FRONT · EYE LEVEL · 28MM" */
export function buildBottomLabel({
  shotType,
  angleLabel,
  fov,
  viewDirection,
}: LabelInput): string {
  const preset = SHOT_PRESETS[shotType];
  const mm = fovToMm(fov);
  return [
    preset.promptName.toUpperCase(),
    viewDirection.toUpperCase(),
    angleLabel.toUpperCase(),
    `${mm}MM`,
  ].join(" · ");
}

function faceDirectionPhrase(viewDirection: "front" | "back" | "side"): string {
  if (viewDirection === "front") return "the face toward the camera";
  if (viewDirection === "back") return "the back of the head toward the camera";
  return "the body in profile toward the camera";
}

export interface BuildPromptInput {
  shotType: ShotTypeId;
  angleLabel: string;
  fov: number;
  viewDirection: "front" | "back" | "side";
  aspectRatio: AspectRatioId;
  prompt: PromptFieldsState;
  videoMove: VideoMoveState;
}

export function buildFinalPrompt({
  shotType,
  angleLabel,
  fov,
  viewDirection,
  aspectRatio,
  prompt,
  videoMove,
}: BuildPromptInput): string {
  const preset = SHOT_PRESETS[shotType];
  const mm = fovToMm(fov);

  const sentences: string[] = [];

  sentences.push(
    `Photorealistic cinematic film still, ${preset.promptName} at ${angleLabel}, seen from the ${viewDirection}, ${faceDirectionPhrase(
      viewDirection,
    )}, ${mm}mm lens.`,
  );
  sentences.push(
    "Use the attached blocking frame only as the camera reference: match its exact framing, this camera angle, and the character's position and size within the room.",
  );
  sentences.push("Ignore its plain placeholder surfaces and colours.");

  if (prompt.subject.trim()) {
    sentences.push(`Subject: ${prompt.subject.trim()}.`);
  }
  if (prompt.hasCharacterSheet) {
    sentences.push("Use the attached character sheet to match the subject's appearance exactly.");
  }
  if (prompt.environment.trim()) {
    sentences.push(`Environment: ${prompt.environment.trim()}.`);
  }
  if (prompt.hasEnvironmentSheet) {
    sentences.push("Use the attached environment sheet to match the environment exactly.");
  }

  sentences.push(
    "Keep the character clearly grounded in the room with correct, consistent perspective and a believable floor and back wall.",
  );

  const styleTail = prompt.lookStyle.trim() ? `${prompt.lookStyle.trim()}, ` : "";
  sentences.push(
    `${styleTail}balanced detail on the subject and the surrounding space, natural light, ${aspectRatio}.`,
  );

  if (prompt.mode === "video") {
    const move = CAMERA_MOVE_PRESETS.find((m) => m.id === videoMove.moveType);
    const intensity = MOVE_INTENSITY_OPTIONS.find((i) => i.id === videoMove.intensity);
    if (move && intensity) {
      sentences.push(
        `Starting from this framing, ${move.promptPhrase} ${intensity.promptAdverb} over ${videoMove.durationSeconds} seconds.`,
      );
    }
  }

  return sentences.join(" ");
}
