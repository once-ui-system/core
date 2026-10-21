import { ImageResponse } from "next/og";

export const runtime = "edge";

// Brand tokens (scheme-gray-100/300/600/1100, scheme-emerald-900, emerald-600-30).
const page = "#0a0a0a";
const line = "#3f3f3f";
const quiet = "#959595";
const text = "#f3f3f3";
const brandSoft = "#84f6c3";
const glow = "rgba(8, 169, 124, 0.3)";

// A link preview is read at thumbnail size, so it carries the title and at
// most a short tagline: the first clause of the summary, when it is short.
function tagline(description: string | null) {
  if (!description) return null;
  const clause = description
    .split(/[:.;]\s|\s[–—]\s/)[0]
    .trim()
    .replace(/[:.;]$/, "");
  return clause.length <= 52 ? clause : null;
}

function section(slug: string | null) {
  if (!slug) return "Docs";
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function titleSize(title: string) {
  if (title.length <= 12) return 168;
  if (title.length <= 22) return 128;
  if (title.length <= 36) return 100;
  return 80;
}

async function loadGoogleFont(family: string) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}`)).text();
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);
  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status === 200) return await response.arrayBuffer();
  }
  throw new Error("failed to load font data");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const title = url.searchParams.get("title") || "Documentation";
  const line2 = tagline(url.searchParams.get("description"));
  const eyebrow = section(url.searchParams.get("section"));
  const size = titleSize(title);

  const [regular, semibold, mono] = await Promise.all([
    loadGoogleFont("Geist:wght@400"),
    loadGoogleFont("Geist:wght@600"),
    loadGoogleFont("Geist+Mono:wght@500"),
  ]);

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "72px 80px",
        background: page,
        position: "relative",
        fontFamily: "Geist",
        color: text,
      }}
    >
      {/* Brand glow, kept off the type */}
      <div
        style={{
          position: "absolute",
          top: -360,
          right: -260,
          width: 900,
          height: 900,
          borderRadius: 900,
          background: `radial-gradient(circle, ${glow} 0%, rgba(8, 169, 124, 0.16) 30%, rgba(8, 169, 124, 0.06) 50%, rgba(8, 169, 124, 0) 70%)`,
        }}
      />
      {/* Hairline frame */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 0,
          right: 0,
          height: 1,
          background: line,
          opacity: 0.6,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 0,
          right: 0,
          height: 1,
          background: line,
          opacity: 0.6,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 40,
          top: 0,
          bottom: 0,
          width: 1,
          background: line,
          opacity: 0.6,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 40,
          top: 0,
          bottom: 0,
          width: 1,
          background: line,
          opacity: 0.6,
        }}
      />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <img alt="" src={`${url.origin}/trademarks/icon-dark.svg`} width={52} height={52} />
          <img
            alt="Once UI"
            src={`${url.origin}/trademarks/wordmark-dark.svg`}
            width={162}
            height={52}
          />
        </div>
        <span
          style={{
            fontFamily: "Geist Mono",
            fontSize: 22,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: brandSoft,
          }}
        >
          {eyebrow}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <span
          style={{
            fontSize: size,
            lineHeight: 1,
            fontWeight: 600,
            letterSpacing: "-0.045em",
            textWrap: "balance",
          }}
        >
          {title}
        </span>
        {line2 && <span style={{ fontSize: 40, lineHeight: 1.2, color: quiet }}>{line2}</span>}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Geist", data: regular, weight: 400, style: "normal" },
        { name: "Geist", data: semibold, weight: 600, style: "normal" },
        { name: "Geist Mono", data: mono, weight: 500, style: "normal" },
      ],
    },
  );
}
