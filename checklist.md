# Checklist — ShotStage 고도화 버전

참고 문서: `PRD_ShotStage_Advanced.md`
원본 소스코드는 없고 스크린샷만 있으므로, 기존 기능도 처음부터 재구현한다.

**진행 현황 (2026-07-16)**: Phase 0~8 완료. v1.0.0 최초 배포 이후 사용자 피드백을 반영해 v1.11.0까지 반복 수정함. 버전별 상세 내용은 `context-notes.md` 참고.

## Phase 0. 프로젝트 셋업
- [x] Next.js(App Router) 프로젝트 생성
- [x] Tailwind CSS 설정
- [x] React Three Fiber + drei 설치
- [x] Zustand 설치 (카메라/프롬프트 상태 관리)
- [x] idb(IndexedDB 래퍼) 설치
- [x] `npm run build` 통과 확인 → verify: 빌드 에러 없음

## Phase 1. 3D 뷰포트 (기존 기능 재구현)
- [x] 룸(벽/바닥/창문) 3D 씬 구성 → verify: 스크린샷과 레이아웃 비교
- [x] 마네킹 placeholder 모델 배치 → verify: 스크린샷과 형태 비교
- [x] 카메라 컨트롤: WASD 이동, 드래그 시점 회전, 스크롤 돌리, Q/E 상하 → verify: 각 입력이 카메라에 정확히 반영되는지 수동 테스트
- [x] Shot view / Bird's-eye 토글 → verify: 전환 시 카메라가 올바른 뷰로 전환

## Phase 2. 샷 타입 & 카메라 컨트롤 (기존 기능 재구현)
- [x] Shot Type 프리셋 버튼(Medium/Wide/Close-Up/Low Angle/High Angle/Over Shoulder/Two Shot) → verify: 각 버튼 클릭 시 카메라 위치·각도가 프리셋에 맞게 스냅
- [x] Lens(FOV) 슬라이더 + Recenter on subject 버튼 → verify: 슬라이더 조작 시 시야각 변화, Recenter 클릭 시 피사체 중앙 정렬
- [x] Subject 컨트롤: 좌우/깊이/회전 슬라이더, 두 번째 피사체 토글 → verify: 각 슬라이더가 마네킹 위치/회전에 반영, 두 번째 피사체 표시/숨김

## Phase 3. 프롬프트 패널 & 결과 모달 (기존 기능 재구현)
- [x] Image/Video 모드 토글, AI 모델 드롭다운 → verify: 상태 전환 확인
- [x] 캐릭터시트/환경시트 체크박스 → verify: 체크 상태 저장
- [x] Subject/Environment/Look-style 입력창 → verify: 입력값이 프롬프트 생성에 반영
- [x] 상단/하단 샷 설명 라벨(예: "MEDIUM SHOT · FRONT · EYE LEVEL · 28MM") 자동 생성 → verify: 현재 설정과 라벨 텍스트 일치
- [x] Generate → 블로킹 프레임 캡처 + 프롬프트 텍스트 생성 로직 → verify: 스크린샷 예시 프롬프트와 유사한 형식으로 출력
- [x] 결과 모달: 프레임 미리보기, 프롬프트 복사, 프레임 다운로드, "Create in Higgsfield" 링크 → verify: 각 버튼 동작 확인

## Phase 4. 신규 기능 — 화각비 & 렌즈 프리셋
- [x] 화각비 선택 UI(16:9/9:16/1:1/4:5/2.35:1) → verify: 선택 시 뷰포트 프레임 마스크 변경
- [x] 프롬프트 텍스트 말미 화각비 표기가 선택값 반영 → verify: 생성된 프롬프트 확인
- [x] 렌즈 mm 프리셋 버튼(24/35/50/85/135mm) + FOV 환산 → verify: 클릭 시 FOV 슬라이더 값과 라벨이 함께 갱신

## Phase 5. 신규 기능 — 무빙샷 / 비디오 카메라워크
- [x] Video 모드에서만 노출되는 무브 섹션 UI → verify: Image/Video 토글에 따라 표시/숨김
- [x] 무브 타입 프리셋(Static/Pan/Tilt/Dolly/Track/Arc/Handheld) 단일 선택 → verify: 선택 상태 표시
- [x] 무브 강도 3단계 버튼 + 각 버튼 설명 툴팁 → verify: 마우스 오버 시 툴팁 노출
- [x] 지속 시간 입력(초) → verify: 숫자 입력 검증
- [x] 프롬프트에 무브 설명 문장 추가 로직 → verify: 예시 문장("Starting from this medium shot, the camera slowly dollies in over 5 seconds...")과 비교

## Phase 6. 신규 기능 — 캐릭터·환경 에셋 라이브러리
- [x] IndexedDB 스키마 구현(characterPresets/environmentPresets/stylePresets) → verify: 저장/조회 단위 테스트
- [x] Subject/Environment/Look-style 입력창 옆 "불러오기" 드롭다운 → verify: 저장된 프리셋 목록이 표시되고 선택 시 자동 채움
- [x] "현재 값을 라이브러리에 저장" 버튼(동일 이름 시 덮어쓰기) → verify: 저장 후 재조회 시 갱신된 값 확인
- [x] 드롭다운 항목 hover 시 삭제(×) 아이콘 → verify: 클릭 시 해당 프리셋 삭제
- [x] 캐릭터시트/환경시트 체크박스 선택 시 이미지 업로드 영역 노출 → verify: 업로드 후 미리보기 표시
- [x] 업로드 이미지가 프리셋 저장/불러오기 시 함께 저장/복원 → verify: 저장 후 새로고침해도 이미지 유지
- [x] 참조 이미지 존재 시 프롬프트 안내 문구 자동 추가 → verify: 생성된 프롬프트 확인

## Phase 7. 배포
- [x] GitHub 저장소 생성 및 push (사용자가 직접 진행)
- [x] Vercel 프로젝트 연동 및 배포 → verify: 배포된 URL에서 전체 흐름(샷 설정 → Generate → 결과 모달) 정상 동작 확인됨

## Phase 8. 최종 점검
- [x] 전체 플로우 수동 테스트: 정지 샷 생성, 캐릭터 재사용 생성, 무빙샷 생성 각 1회 이상 (사용자가 배포본에서 반복 테스트하며 피드백 제공)
- [x] `npm run build` 최종 통과 확인 (버전마다 반복 확인)
- [x] PRD의 각 기능 항목과 실제 구현 1:1 대조 (아래 배포 후 수정 이력에서 세부 반영)

## Phase 9. 배포 후 반복 수정 (v1.1.0 ~ v1.11.0)
버전별 상세 내용과 원인 분석은 `context-notes.md`에 기록되어 있음. 아래는 요약.

- [x] v1.1.0 — 미드저니 모델 추가, 마네킹 재설계 1차, 투샷 토글 버그 수정, UI 전체 한국어화, 버드아이 이동 버그 수정
- [x] v1.2.0 — 클로즈업 얼굴 포커스, 오버숄더 프레이밍 1차, 화각비 시인성, 깊이 슬라이더 체감, 캐릭터/환경시트 툴팁, 모델별(미드저니/GPT Image2/나노바나나) 프롬프트 포맷 반영
- [x] v1.3.0 — 오버숄더 카메라 거리 재계산, 두 번째 피사체 독립 위치 슬라이더 추가, 버드아이 드래그/스크롤 수정
- [x] v1.4.0 — 카메라를 인물 중심 궤도 회전 방식으로 전면 개편, 스페이스+드래그 핸드 툴, 버드아이 재정렬 버그 수정, 화각비 크롭이 실제 캡처 프레임에도 반영되도록 수정
- [x] v1.5.0 — 인물1/인물2 색상 구분(3D 모델+패널 슬라이더 동일 색), 헤더/크롭 오버레이 시각 정리
- [x] v1.6.0 — 뷰포트 조작 힌트 복원, 재정렬 버튼을 현재 샷 기준 재스냅으로 개선, 마네킹을 관절 계층 구조(리깅 가능)로 재설계
- [x] v1.7.0 — 마네킹 외형을 참고 이미지에 맞춰 1차 개선, 스페이스바 시 커서를 손 모양으로 변경
- [x] v1.8.0 — 마네킹 관절을 완전한 구체로 변경, 카메라 피벗이 SUBJECT 슬라이더를 라이브로 쫓아가던 버그 수정(샷 뷰), 화각비 크롭 가이드라인 추가
- [x] v1.9.0 — 마네킹 실루엣 2차 개선(가슴-허리 테이퍼, 슬림 벨트 등), 버드아이 모드의 동일한 카메라 추적 버그 수정
- [x] v1.10.0 — 마네킹을 LatheGeometry 기반 매끈한 실루엣으로 전면 교체(캡슐 이어붙이기 방식의 근본 한계 해결), 팔다리 길이 조정
- [x] v1.11.0 — 이용 방법 페이지(`/guide`) 추가, OG 이미지 자동 생성 및 og/twitter 메타 태그 적용
