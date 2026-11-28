import { ImageResponse } from "next/og";

// 96x96 PNG favicon (a multiple of 48px, which Google Search uses), drawn from /favicon.svg.
export const size = { width: 96, height: 96 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#555c3d",
          borderRadius: 20,
          color: "#f7f3ea",
          fontFamily: "serif",
          fontSize: 44,
          letterSpacing: -4,
        }}
      >
        WR
      </div>
    ),
    size,
  );
}
