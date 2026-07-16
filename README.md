# ShotStage (고도화 버전)

AI 영상/이미지 제작을 위한 3D 카메라 블로킹 도구입니다. 3D 뷰포트에서 카메라 앵글·렌즈·샷 타입을 정확히 설정한 뒤, 그 설정을 그대로 프롬프트와 블로킹 프레임 이미지로 변환합니다.

원본(https://shotstage.vercel.app/) 대비 추가된 기능:
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

## OG 이미지 (카카오톡/트위터 공유 미리보기)

`public/og.png` 경로에 1200×630 크기의 PNG 파일을 넣으면 자동으로 공유 미리보기 이미지로 사용됩니다 (파일이 없어도 빌드는 정상적으로 됩니다. 다만 공유 시 이미지가 안 뜰 뿐입니다).

**공유 시 이미지가 안 보인다면**: `og:image` 태그가 실제로 어떤 주소를 가리키는지 먼저 확인하세요 (배포된 페이지에서 우클릭 → 페이지 소스 보기 → `og:image` 검색). 이 주소가 `vercel.app`으로 끝나는 배포별 고유 URL(예: `프로젝트명-해시-팀명.vercel.app`)이고, 그 주소로 직접 접속했을 때 Vercel 로그인 화면이 뜬다면 — 그 배포가 비공개(Deployment Protection)로 막혀 있어서 카카오톡/디스코드 같은 외부 크롤러가 이미지를 못 가져오는 것입니다. 이 경우:

1. Vercel 프로젝트 → Settings → Environment Variables에 `NEXT_PUBLIC_SITE_URL=https://실제-공개-도메인` 을 추가하고 재배포하세요 (가장 확실한 해결책).
2. 또는 Vercel 프로젝트 → Settings → Deployment Protection에서 프로덕션 배포는 보호가 걸려있지 않은지 확인하세요.

커스텀 도메인을 연결한 경우에도 위와 동일하게 `NEXT_PUBLIC_SITE_URL`을 설정해두면 안전합니다.

## 이용 방법 페이지

앱 상단 "이용 방법" 버튼(`/guide`)에서 조작법과 각 패널 설명을 확인할 수 있습니다.

## 조작법

- `WASD`: 카메라 이동
- 드래그: 시점 회전 (제자리 pan/tilt)
- 스크롤: 돌리(전후 이동)
- `Q` / `E`: 상하 이동

## 알려진 제한 사항

- 캐릭터·환경 프리셋은 브라우저 로컬(IndexedDB)에만 저장됩니다. 다른 기기/브라우저와 동기화되지 않습니다.
- 업로드한 참조 이미지는 리사이즈 없이 원본 그대로 저장됩니다. 매우 큰 이미지를 많이 저장하면 브라우저 저장 용량 제한에 걸릴 수 있습니다.
- AI 모델 드롭다운은 UI만 제공하며, 실제 생성 API 연동은 하지 않습니다 (프롬프트 텍스트 생성까지가 이 도구의 역할입니다).
