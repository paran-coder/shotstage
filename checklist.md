# Checklist — ShotStage 고도화 버전

참고 문서: `PRD_ShotStage_Advanced.md`
원본 소스코드는 없고 스크린샷만 있으므로, 기존 기능도 처음부터 재구현한다.

**진행 현황 (2026-07-15)**: Phase 0~6 코드 구현 및 `npm run build` / `npm run lint` 통과 완료.
단, 이 작업 환경에는 헤드리스 브라우저가 없어 **실제 화면을 스크린샷으로 찍어 원본과 비교하는 시각적 검증은 하지 못했다**. `npm run dev`로 로컬 실행 후 육안 확인이 필요하다. Phase 7(배포), Phase 8(최종 점검)은 아직 진행하지 않음.

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
- [ ] GitHub 저장소 생성 및 push
- [ ] Vercel 프로젝트 연동 및 배포 → verify: 배포된 URL에서 전체 흐름(샷 설정 → Generate → 결과 모달) 정상 동작

## Phase 8. 최종 점검
- [ ] 전체 플로우 수동 테스트: 정지 샷 생성, 캐릭터 재사용 생성, 무빙샷 생성 각 1회 이상
- [ ] `npm run build` 최종 통과 확인
- [ ] PRD의 각 기능 항목과 실제 구현 1:1 대조
