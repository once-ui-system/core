import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  let url = new URL(request.url);
  let title = url.searchParams.get("title") || "Documentation";
  let description = url.searchParams.get("description");
  const font = fetch(new URL("../../../../../public/fonts/Inter.ttf", import.meta.url)).then((res) =>
    res.arrayBuffer(),
  );
  const fontData = await font;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        padding: "8rem",
        background: "#151515",
        position: "relative",
        alignItems: "center",
      }}
    >
      {/* Horizontal lines */}
      <div style={{ 
        position: "absolute", 
        top: "6rem", 
        left: "0", 
        right: "0", 
        height: "1px", 
        background: "#333333" 
      }} />
      <div style={{ 
        position: "absolute", 
        bottom: "6rem", 
        left: "0", 
        right: "0", 
        height: "1px", 
        background: "#333333" 
      }} />
      
      {/* Vertical lines */}
      <div style={{ 
        position: "absolute", 
        left: "6rem", 
        top: "0", 
        bottom: "0", 
        width: "1px", 
        background: "#333333" 
      }} />
      <div style={{ 
        position: "absolute", 
        right: "6rem", 
        top: "0", 
        bottom: "0", 
        width: "1px", 
        background: "#333333" 
      }} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4rem",
          fontFamily: "Inter",
          fontStyle: "normal",
          color: "white",
          width: "100%",
          marginLeft: "8rem",
          alignItems: "flex-start",
        }}
      >
        <span
          style={{
            fontSize: "8rem",
            lineHeight: "8rem",
            letterSpacing: "-0.05em",
            whiteSpace: "pre-wrap",
            textWrap: "balance",
            textAlign: "left",
          }}
        >
          {title}
        </span>
        {description && (
          <span
            style={{
              fontSize: "3rem",
              lineHeight: "3.5rem",
              color: "#9ca3af",
              fontWeight: "medium",
              whiteSpace: "pre-wrap",
              textWrap: "balance",
              marginTop: "-2rem",
              textAlign: "left",
            }}
          >
            {description}
          </span>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
          </div>
        </div>
      </div>
    </div>,
    {
      width: 1920,
      height: 1080,
      fonts: [
        {
          name: "Inter",
          data: fontData,
          style: "normal",
        },
      ],
    },
  );
}
