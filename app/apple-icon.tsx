import { ImageResponse } from "next/og";

// Apple touch icon (180x180) drawn from the same mark as /favicon.svg.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          color: "#f7f3ea",
          fontFamily: "serif",
          fontSize: 82,
          letterSpacing: -8,
        }}
      >
        WR
      </div>
    ),
    size,
  );
}
