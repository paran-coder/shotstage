// OG(Open Graph) 이미지 자동 생성. Next.js가 이 파일을 발견하면 og:image / twitter:image
// 메타 태그를 자동으로 페이지 <head>에 삽입해주므로, 별도로 태그를 손으로 넣을 필요가 없다.
import { ImageResponse } from "next/og";

export const alt = "ShotStage — 원하는 샷을 정확하게, AI 영상 제작을 위한 카메라 블로킹 도구";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#06080d",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* 모서리 장식 (뷰포트 코너 브라켓과 통일감) */}
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 48,
            width: 46,
            height: 46,
            borderTop: "3px solid #3a4258",
            borderLeft: "3px solid #3a4258",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 48,
            right: 48,
            width: 46,
            height: 46,
            borderBottom: "3px solid #3a4258",
            borderRight: "3px solid #3a4258",
          }}
        />

        {/* 로고 마크 */}
        <div
          style={{
            display: "flex",
            width: 84,
            height: 84,
            borderRadius: 20,
            border: "4px solid #f97316",
            marginBottom: 36,
          }}
        />

        {/* 워드마크 */}
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 800,
            letterSpacing: -1,
            color: "#f5f5f5",
          }}
        >
          SHOT
          <span style={{ color: "#f97316" }}>STAGE</span>
        </div>

        {/* 태그라인 */}
        <div
          style={{
            display: "flex",
            marginTop: 26,
            fontSize: 32,
            color: "#9ca3af",
          }}
        >
          원하는 샷을 정확하게
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 10,
            fontSize: 24,
            color: "#6b7280",
          }}
        >
          AI 영상 제작을 위한 3D 카메라 블로킹 도구
        </div>
      </div>
    ),
    { ...size },
  );
}
