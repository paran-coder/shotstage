// 화각비(aspect ratio) 프리셋 정의
import type { AspectRatioId } from "@/types";

export const ASPECT_RATIOS: Record<AspectRatioId, number> = {
  "16:9": 16 / 9,
  "9:16": 9 / 16,
  "1:1": 1,
  "4:5": 4 / 5,
  "2.35:1": 2.35 / 1,
};

export const ASPECT_RATIO_ORDER: AspectRatioId[] = [
  "16:9",
  "9:16",
  "1:1",
  "4:5",
  "2.35:1",
];
