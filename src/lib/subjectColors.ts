// 인물 1 / 인물 2를 시각적으로 구분하기 위한 색상 정의.
// 3D 마네킹 색과 SUBJECT 패널의 슬라이더 색(accent-color)이 정확히 같은 값을 쓰도록
// 한 곳에서만 관리한다.
//
// 관절 색(JOINT_ACCENT)은 참고 이미지처럼 몸통 색과 확실히 대비되는 진한 남색/보라색으로 통일한다.
// (이전 버전은 몸통과 같은 계열의 살짝 어두운 색이라 관절이 거의 안 보였음 — 색상환에서
// 완전히 다른 톤을 써야 참고 이미지처럼 관절이 또렷하게 도드라져 보인다.)
const JOINT_ACCENT = "#3d2f7d";

export const SUBJECT_COLORS = {
  primary: { body: "#cbb28f", joint: JOINT_ACCENT }, // 인물 1: 우드톤 몸통 + 남색 관절
  secondary: { body: "#6fb3d9", joint: JOINT_ACCENT }, // 인물 2: 블루 몸통 + 동일한 남색 관절
} as const;
