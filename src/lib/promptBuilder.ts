// 현재 카메라/피사체/프롬프트 설정을 바탕으로 HUD 라벨과 최종 AI 프롬프트 텍스트를 생성
// 모델별 프롬프트 스타일은 사용자가 제공한 3개 참고 문서(미드저니 v8.1 가이드,
// GPT Image 2 한국어 Knowledge 문서, 나노바나나 프로 AI 필름메이킹 템플릿)의
// 구조와 표현 방식을 반영했다.
import { ANGLE_LABEL_KO, SHOT_PRESETS } from "./shotPresets";
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

const VIEW_DIRECTION_KO: Record<"front" | "back" | "side", string> = {
  front: "정면",
  back: "후면",
  side: "측면",
};

/** 상단 오버레이용 한국어 라벨: 예) "미디엄 샷 · 28mm · 아이레벨" */
export function buildTopLabel({ shotType, angleLabel, fov }: LabelInput): string {
  const preset = SHOT_PRESETS[shotType];
  const mm = fovToMm(fov);
  const angleKo = ANGLE_LABEL_KO[angleLabel as keyof typeof ANGLE_LABEL_KO] ?? angleLabel;
  return `${preset.label} · ${mm}mm · ${angleKo}`;
}

/** 하단 오버레이용 한국어 라벨: 예) "투 샷 · 정면 · 아이레벨 · 43mm" */
export function buildBottomLabel({
  shotType,
  angleLabel,
  fov,
  viewDirection,
}: LabelInput): string {
  const preset = SHOT_PRESETS[shotType];
  const mm = fovToMm(fov);
  const angleKo = ANGLE_LABEL_KO[angleLabel as keyof typeof ANGLE_LABEL_KO] ?? angleLabel;
  return [preset.label, VIEW_DIRECTION_KO[viewDirection], angleKo, `${mm}mm`].join(" · ");
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

function buildVideoMoveSentence(videoMove: VideoMoveState): string | null {
  const move = CAMERA_MOVE_PRESETS.find((m) => m.id === videoMove.moveType);
  const intensity = MOVE_INTENSITY_OPTIONS.find((i) => i.id === videoMove.intensity);
  if (!move || !intensity) return null;
  return `Starting from this framing, ${move.promptPhrase} ${intensity.promptAdverb} over ${videoMove.durationSeconds} seconds.`;
}

/** 기본 템플릿: Flux, Higgsfield/Runway/Kling(비디오)에 사용 */
function buildGenericPrompt(input: BuildPromptInput): string {
  const { shotType, angleLabel, fov, viewDirection, aspectRatio, prompt, videoMove } = input;
  const preset = SHOT_PRESETS[shotType];
  const mm = fovToMm(fov);
  const sentences: string[] = [];

  sentences.push(
    `Photorealistic cinematic film still, ${preset.promptName} at ${angleLabel}, seen from the ${viewDirection}, ${faceDirectionPhrase(viewDirection)}, ${mm}mm lens.`,
  );
  sentences.push(
    "Use the attached blocking frame only as the camera reference: match its exact framing, this camera angle, and the character's position and size within the room.",
  );
  sentences.push("Ignore its plain placeholder surfaces and colours.");

  if (prompt.subject.trim()) sentences.push(`Subject: ${prompt.subject.trim()}.`);
  if (prompt.hasCharacterSheet)
    sentences.push("Use the attached character sheet to match the subject's appearance exactly.");
  if (prompt.environment.trim()) sentences.push(`Environment: ${prompt.environment.trim()}.`);
  if (prompt.hasEnvironmentSheet)
    sentences.push("Use the attached environment sheet to match the environment exactly.");

  sentences.push(
    "Keep the character clearly grounded in the room with correct, consistent perspective and a believable floor and back wall.",
  );

  const styleTail = prompt.lookStyle.trim() ? `${prompt.lookStyle.trim()}, ` : "";
  sentences.push(
    `${styleTail}balanced detail on the subject and the surrounding space, natural light, ${aspectRatio}.`,
  );

  if (prompt.mode === "video") {
    const moveSentence = buildVideoMoveSentence(videoMove);
    if (moveSentence) sentences.push(moveSentence);
  }

  return sentences.join(" ");
}

/** 미드저니 v8.1 가이드 반영: 짧고 직접적인 문장, 주 피사체 먼저, 명령형 금지, 파라미터는 끝에 */
const MIDJOURNEY_ASPECT_MAP: Record<AspectRatioId, string> = {
  "16:9": "16:9",
  "9:16": "9:16",
  "1:1": "1:1",
  "4:5": "4:5",
  "2.35:1": "21:9", // 미드저니 --ar는 정수비만 지원하므로 시네마틱 비율의 표준 근사치 사용
};

function articleFor(word: string): string {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

function buildMidjourneyPrompt(input: BuildPromptInput): string {
  const { shotType, angleLabel, viewDirection, aspectRatio, prompt } = input;
  const preset = SHOT_PRESETS[shotType];
  const sentences: string[] = [];

  const subjectClause = prompt.subject.trim() || "A person";
  sentences.push(
    `${subjectClause}, shown in ${articleFor(preset.promptName)} ${preset.promptName} at ${angleLabel}, viewed from the ${viewDirection}.`,
  );
  if (prompt.environment.trim()) sentences.push(`${prompt.environment.trim()}.`);
  if (prompt.lookStyle.trim()) sentences.push(`${prompt.lookStyle.trim()}.`);

  // 미드저니는 지시문이 아닌 묘사로 쓰는 것이 원칙이라, "use the attached..." 대신 서술형으로 표현
  sentences.push("The composition matches the attached reference frame exactly, same camera angle and subject scale.");
  if (prompt.hasCharacterSheet)
    sentences.push("The subject's face and outfit match the attached character reference exactly.");
  if (prompt.hasEnvironmentSheet)
    sentences.push("The environment matches the attached environment reference exactly.");

  const mjRatio = MIDJOURNEY_ASPECT_MAP[aspectRatio];
  return `${sentences.join(" ")} --ar ${mjRatio} --v 8.1`;
}

/** GPT Image 2 Knowledge 문서 반영: [스타일/매체] 먼저, 그다음 피사체/구도/배경/색/조명/분위기, 마지막 제외 요소 */
function buildGptImagePrompt(input: BuildPromptInput): string {
  const { shotType, angleLabel, fov, viewDirection, aspectRatio, prompt } = input;
  const preset = SHOT_PRESETS[shotType];
  const mm = fovToMm(fov);
  const sentences: string[] = [];

  sentences.push(
    `Photorealistic cinematic film still, ${preset.promptName} at ${angleLabel}, seen from the ${viewDirection}, ${faceDirectionPhrase(viewDirection)}, ${mm}mm lens, ${aspectRatio}.`,
  );
  sentences.push(
    "Use the attached blocking frame only as the camera reference: match its exact framing, this camera angle, and the character's position and size within the room. Ignore its plain placeholder surfaces and colours.",
  );
  if (prompt.subject.trim()) sentences.push(`Subject: ${prompt.subject.trim()}.`);
  if (prompt.hasCharacterSheet)
    sentences.push("Use the attached character sheet to match the subject's appearance exactly.");
  if (prompt.environment.trim()) sentences.push(`Background: ${prompt.environment.trim()}.`);
  if (prompt.hasEnvironmentSheet)
    sentences.push("Use the attached environment sheet to match the environment exactly.");
  if (prompt.lookStyle.trim()) sentences.push(`Lighting and mood: ${prompt.lookStyle.trim()}.`);
  sentences.push("no extra text, no logo, no watermark.");

  return sentences.join(" ");
}

/** 나노바나나 프로 템플릿 반영: Composition/Lighting 구조 + 오버숄더 전용 문구 + Consistency Core */
function buildNanoBananaPrompt(input: BuildPromptInput): string {
  const { shotType, angleLabel, fov, viewDirection, aspectRatio, prompt } = input;
  const preset = SHOT_PRESETS[shotType];
  const mm = fovToMm(fov);
  const sentences: string[] = [];
  const subjectText = prompt.subject.trim() || "the subject";

  if (shotType === "overShoulder" || shotType === "twoShot") {
    const relation = shotType === "overShoulder" ? "framed from the second person's shoulder" : "both people visible in frame";
    sentences.push(
      `Over-the-shoulder two-shot of ${subjectText} and a second person${prompt.environment.trim() ? ` at ${prompt.environment.trim()}` : ""}, ${relation}. Composition: ${mm}mm lens, eye-line match, rule-of-thirds.`,
    );
  } else {
    sentences.push(
      `${capitalize(preset.promptName)} of ${subjectText}. Composition: ${mm}mm lens, ${angleLabel}, viewed from the ${viewDirection}.`,
    );
    if (prompt.environment.trim()) sentences.push(`Environment: ${prompt.environment.trim()}.`);
  }

  sentences.push(`Lighting: ${prompt.lookStyle.trim() || "soft natural light"}.`);
  sentences.push(`Match the exact framing and camera angle of the attached blocking frame, ${aspectRatio}.`);

  if (prompt.hasCharacterSheet || prompt.hasEnvironmentSheet) {
    const parts: string[] = [];
    if (prompt.hasCharacterSheet)
      parts.push("force-match the subject's facial bone structure, skin tone, and outfit to the attached character reference sheet");
    if (prompt.hasEnvironmentSheet)
      parts.push("force-match the set design and materials to the attached environment reference sheet");
    sentences.push(`[Consistency Core]: Do not allow identity drift; ${parts.join("; ")}.`);
  }

  return sentences.join(" ");
}

/** Seedance 2.0 가이드(soylab.ai/seedance20) 반영:
 *  1) "누가 어떤 행동을 하는지"를 논리적 기반으로 먼저 명시
 *  2) 참조 자료는 "어떤 자료의 무엇을 참조하라"는 자연어로 명확히 지정
 *     (예: "이미지 1의 구도를 사용하라", "비디오 2의 움직임과 일치시켜라")
 *  3) 오디오·비디오 동시 생성이 특징이라 분위기에 맞는 앰비언트 사운드도 함께 명시 */
function buildSeedancePrompt(input: BuildPromptInput): string {
  const { shotType, angleLabel, viewDirection, aspectRatio, prompt, videoMove } = input;
  const preset = SHOT_PRESETS[shotType];
  const sentences: string[] = [];
  const subjectText = prompt.subject.trim() || "The subject";

  sentences.push(
    `${capitalize(subjectText)} is in ${prompt.environment.trim() || "the scene"}, framed in ${preset.promptName} at ${angleLabel}, seen from the ${viewDirection}.`,
  );

  const move = CAMERA_MOVE_PRESETS.find((m) => m.id === videoMove.moveType);
  const intensity = MOVE_INTENSITY_OPTIONS.find((i) => i.id === videoMove.intensity);
  const moveDesc = move && intensity ? `${move.promptPhrase} ${intensity.promptAdverb}` : "the camera holds a static frame";
  sentences.push(
    `Using the attached blocking frame to match the camera angle and framing, ${moveDesc} over ${videoMove.durationSeconds} seconds.`,
  );

  if (prompt.hasCharacterSheet)
    sentences.push(
      "Reference the attached character sheet and keep the subject's face, outfit, and identity consistent throughout the shot.",
    );
  if (prompt.hasEnvironmentSheet)
    sentences.push(
      "Reference the attached environment sheet and keep the set, materials, and lighting consistent throughout the shot.",
    );
  if (prompt.lookStyle.trim()) sentences.push(`${prompt.lookStyle.trim()}.`);

  sentences.push(`Natural ambient sound matching the scene, ${aspectRatio}.`);

  return sentences.join(" ");
}

/** Kling 가이드 반영: Subject+Action / Camera(명시적 움직임+끝맺음) / Style(조명·분위기) / 기술사양
 *  4단 구조. 카메라 움직임을 명시하지 않으면 정지 샷이 되고, 움직임에 끝맺음이 없으면
 *  생성이 자주 멈춘다는 점, 상반된 카메라 지시를 동시에 넣지 않는 점, 키워드 나열 대신
 *  구체적 문장으로 쓰는 점을 반영했다. */
function buildKlingPrompt(input: BuildPromptInput): string {
  const { shotType, angleLabel, viewDirection, aspectRatio, prompt, videoMove } = input;
  const preset = SHOT_PRESETS[shotType];
  const sentences: string[] = [];
  const subjectText = prompt.subject.trim() || "The subject";

  // 1) Subject + Action/Context
  sentences.push(
    `${capitalize(subjectText)} in ${prompt.environment.trim() || "the scene"}, framed in ${preset.promptName} at ${angleLabel}, seen from the ${viewDirection}.`,
  );

  // 2) Camera — 명시적으로 지정하지 않으면 정지 샷이 되므로 항상 문장으로 못박고, 끝맺음을 붙여
  //    "언제까지, 어떻게 끝나는지"를 명확히 해서 생성이 멈추는 것을 방지한다.
  const move = CAMERA_MOVE_PRESETS.find((m) => m.id === videoMove.moveType);
  const intensity = MOVE_INTENSITY_OPTIONS.find((i) => i.id === videoMove.intensity);
  const cameraSentence =
    move && intensity
      ? `Camera: ${move.promptPhrase}, ${intensity.promptAdverb}, then holds a steady frame for the last moment.`
      : "Camera: static frame, matching the attached blocking frame exactly, holding steady throughout.";
  sentences.push(cameraSentence);

  if (prompt.hasCharacterSheet)
    sentences.push("Match the subject's face and outfit to the attached character sheet.");
  if (prompt.hasEnvironmentSheet)
    sentences.push("Match the environment to the attached environment sheet.");

  // 3) Style — 형용사 나열 대신 조명/분위기를 문장으로
  sentences.push(`Lighting and mood: ${prompt.lookStyle.trim() || "natural light, cinematic tone"}.`);

  // 4) 기술 사양은 마지막에만
  sentences.push(`${videoMove.durationSeconds}s, ${aspectRatio}.`);

  return sentences.join(" ");
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function buildFinalPrompt(input: BuildPromptInput): string {
  const baseText =
    input.prompt.mode === "video"
      ? (() => {
          switch (input.prompt.model) {
            case "Seedance 2.0":
              return buildSeedancePrompt(input);
            case "Kling":
              return buildKlingPrompt(input);
            default:
              return buildGenericPrompt(input); // Higgsfield/Runway: 참고 문서가 없어 기존 범용 템플릿 사용
          }
        })()
      : (() => {
          switch (input.prompt.model) {
            case "Midjourney":
              return buildMidjourneyPrompt(input);
            case "Nano Banana Pro":
              return buildNanoBananaPrompt(input);
            case "GPT Image 2":
              return buildGptImagePrompt(input);
            default:
              return buildGenericPrompt(input); // Flux 등
          }
        })();

  return baseText;
}
