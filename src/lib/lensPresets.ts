// 렌즈 mm 프리셋과 mm ↔ FOV(도) 환산 로직
// 35mm 풀프레임 센서(가로 36mm) 기준 수평 화각 공식을 사용한다.

const SENSOR_WIDTH_MM = 36;

/** 초점거리(mm) → 수평 화각(도) */
export function mmToFov(mm: number): number {
  const radians = 2 * Math.atan(SENSOR_WIDTH_MM / (2 * mm));
  return (radians * 180) / Math.PI;
}

/** 수평 화각(도) → 가장 가까운 초점거리(mm), 표시용 반올림 */
export function fovToMm(fovDeg: number): number {
  const radians = (fovDeg * Math.PI) / 180;
  const mm = SENSOR_WIDTH_MM / (2 * Math.tan(radians / 2));
  return Math.round(mm);
}

export const LENS_MM_PRESETS = [24, 35, 50, 85, 135] as const;
export type LensMmPreset = (typeof LENS_MM_PRESETS)[number];

export const FOV_MIN = 15;
export const FOV_MAX = 90;
