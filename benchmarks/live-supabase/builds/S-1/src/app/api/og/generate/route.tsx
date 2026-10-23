import { ImageResponse } from "next/og";
import { brand } from "@/resources";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const title = (url.searchParams.get("title") || brand.tagline).slice(0, 140);

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "3rem",
        width: "100%",
        height: "100%",
        padding: "6rem",
        background: "#0b1210",
        color: "white",
      }}
    >
      <span style={{ fontSize: "5.5rem", lineHeight: "7rem", letterSpacing: "-0.04em" }}>{title}</span>
      <span style={{ fontSize: "3rem", color: "#34d399" }}>{brand.name}</span>
    </div>,
    { width: 1200, height: 630 },
  );
}
