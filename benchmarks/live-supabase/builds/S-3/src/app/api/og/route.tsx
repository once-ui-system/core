import { ImageResponse } from "next/og";
import { brand } from "@/resources/once-ui.config";

export const runtime = "nodejs";

/** The Open Graph card: the product name and a title, on the brand color. */
export async function GET(request: Request) {
  const title = new URL(request.url).searchParams.get("title")?.slice(0, 120) || brand.tagline;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#052e22",
          color: "#ecfdf5",
        }}
      >
        <div style={{ fontSize: 36, color: "#34d399" }}>{brand.name}</div>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
