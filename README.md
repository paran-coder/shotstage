# ShotStage (고도화 버전)

AI 영상/이미지 제작을 위한 3D 카메라 블로킹 도구입니다. 3D 뷰포트에서 카메라 앵글·렌즈·샷 타입을 정확히 설정한 뒤, 그 설정을 그대로 프롬프트와 블로킹 프레임 이미지로 변환합니다.


- 화각비(Aspect Ratio) 선택 + 뷰포트 프레임 마스크
- 렌즈 mm 프리셋 (24/35/50/85/135mm)
- 무빙샷 / 비디오 카메라워크 (Pan/Tilt/Dolly/Track/Arc/Handheld + 강도 + 지속시간)
- 캐릭터·환경·스타일 프리셋 라이브러리 (브라우저 로컬 저장, IndexedDB)

자세한 배경과 설계 결정은 `PRD.md`, `checklist.md`, `context-notes.md`를 참고하세요.

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속.

## 빌드 확인

```bash
npm run build
npm run lint
```

## Vercel 배포

1. 이 저장소를 GitHub에 push
2. https://vercel.com 에서 "New Project" → 이 저장소 선택 → 별도 설정 없이 Deploy
   (Next.js 프로젝트는 Vercel이 자동으로 빌드 설정을 인식합니다)

## 조작법

- `WASD`: 카메라 이동
- 드래그: 시점 회전 (제자리 pan/tilt)
- 스크롤: 돌리(전후 이동)
- `Q` / `E`: 상하 이동

## 알려진 제한 사항

- 캐릭터·환경 프리셋은 브라우저 로컬(IndexedDB)에만 저장됩니다. 다른 기기/브라우저와 동기화되지 않습니다.
- 업로드한 참조 이미지는 리사이즈 없이 원본 그대로 저장됩니다. 매우 큰 이미지를 많이 저장하면 브라우저 저장 용량 제한에 걸릴 수 있습니다.
- AI 모델 드롭다운은 UI만 제공하며, 실제 생성 API 연동은 하지 않습니다 (프롬프트 텍스트 생성까지가 이 도구의 역할입니다).
