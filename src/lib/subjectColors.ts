// 인물 1 / 인물 2를 시각적으로 구분하기 위한 색상 정의.
// 3D 마네킹 색과 SUBJECT 패널의 슬라이더 색(accent-color)이 정확히 같은 값을 쓰도록
// 한 곳에서만 관리한다.
export const SUBJECT_COLORS = {
  primary: { body: "#cbb28f", joint: "#a88f6c" }, // 인물 1: 기존 우드톤 (기본값, 하위 호환)
  secondary: { body: "#6fb3d9", joint: "#4f8aab" }, // 인물 2: 구분되는 블루 톤
} as const;
