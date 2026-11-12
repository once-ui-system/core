/**
 * Open Graph images: one route that draws a card for every page, in your
 * product's skin.
 *
 *     // app/api/og/generate/route.tsx
 *     import { createOgImageRoute } from "@once-ui-system/core/next";
 *     import { ogSkin } from "@/resources/og";
 *     export const { GET } = createOgImageRoute({ skin: ogSkin });
 *
 * `Meta.generate` already points pages without an image at
 * `/api/og/generate?title=…`, so every page gets its own card. Pages can say
 * more with `ogImageUrl()`: an eyebrow, a description, a mood, a photo.
 *
 * Cards are 1200 × 630, dark, with the page's title set large in the skin's
 * heading font and the product's mascot looking at it. Words wrapped in
 * `*asterisks*` in the title are drawn in the brand color.
 */
import { ImageResponse } from "next/og";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { type MascotSvgOptions, mascotSvg } from "../modules/ai/mascotSvg.js";
import { luminance, mixColors, parseColor, withAlpha } from "../utils/colorMath.js";
import { OG_SCHEMES, type OgSchemeName } from "./ogSchemes.js";

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** The expressions a card's mascot can take. */
export type OgMood = NonNullable<MascotSvgOptions["mood"]>;

/** How a card is laid out. `photo` is picked for you when the card has an image. */
export type OgLayout = "page" | "hero" | "photo";

/** A font for the cards. Give `data`, a `path` read from disk, or a `google` family to fetch once. */
export interface OgFont {
  /** The family name the skin refers to. */
  name: string;
  weight?: 400 | 500 | 600 | 700 | 800 | 900;
  style?: "normal" | "italic";
  /** The font file itself (TTF, OTF or WOFF; not WOFF2). */
  data?: ArrayBuffer | Uint8Array;
  /** A TTF, OTF or WOFF file, relative to the app's working directory, e.g. `public/fonts/og/Geist-Bold.ttf`. */
  path?: string;
  /**
   * A Google Fonts family, fetched once per server and kept in memory, e.g.
   * `"Space Grotesk"`. If the fetch fails the card still draws, in the fallback face.
   */
  google?: string;
}

/** A mascot drawn from a look (as on `Mascot`), or your own SVG in a 200 × 200 box. */
export type OgMascot =
  | (Omit<MascotSvgOptions, "accessory" | "mood" | "lookAt" | "size" | "title"> & {
      /** SVG markup, or JSX that renders to SVG elements, drawn with the body. */
      accessory?: string | ReactElement;
    })
  | { svg: string };

/** Everything that makes one product's cards its own. */
export interface OgSkin {
  /** The product's name: the wordmark on every card, unless `logo` is set. */
  name: string;
  /** Shown at the bottom of every card, e.g. `once-ui.com`. */
  domain?: string;
  /** A scheme name (`emerald`, `violet`, …) or a CSS color. Emerald by default. */
  brand?: OgSchemeName | (string & {});
  /** A second color for a smaller glow. A scheme name or a CSS color. */
  accent?: OgSchemeName | (string & {});
  /** The card's ground. Near-black by default. */
  background?: string;
  /** SVG markup, or an image path or URL, drawn in place of the wordmark. */
  logo?: string;
  /** A small symbol (SVG markup, or an image path or URL) drawn before the name in the wordmark. */
  mark?: string;
  /** The product's mascot. `false` leaves it out. */
  mascot?: OgMascot | false;
  /** Fonts, read once per server. The first one is the heading face unless `headingFont` says otherwise. */
  fonts?: OgFont[];
  /** Family names from `fonts` for each role. */
  headingFont?: string;
  bodyFont?: string;
  monoFont?: string;
  /** A face for the `*emphasized*` words of a title, e.g. an italic serif. */
  emphasisFont?: string;
  /** The mascot's expression when a card doesn't ask for one. */
  mood?: OgMood;
  /** Hosts `image=` may load from, besides the app's own origin. */
  imageHosts?: string[];
}

/** What one card says. */
export interface OgCardProps {
  title: string;
  /** A short label above the title: the section, a date, a place. */
  eyebrow?: string;
  /** One line under the title. */
  description?: string;
  mood?: OgMood;
  layout?: OgLayout;
  /** A photo for the card, absolute and allowed by the skin. */
  image?: string;
}

/** Type-checks a skin. */
export function defineOgSkin(skin: OgSkin): OgSkin {
  return skin;
}

/**
 * The URL of a page's card, for `Meta.generate({ image })` or `openGraph.images`.
 * `v` changes the URL when the skin changes, since networks cache images by URL.
 */
export function ogImageUrl(
  route: string,
  card: Partial<OgCardProps> & { title: string; v?: string | number },
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(card)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return `${route}${route.includes("?") ? "&" : "?"}${params}`;
}

/* ---------- Colors ---------- */

function schemeColor(value: string | undefined, step: 200 | 500 | 700 | 900, fallback: string) {
  if (!value) return OG_SCHEMES.emerald[step] ?? fallback;
  if (value in OG_SCHEMES) return OG_SCHEMES[value as OgSchemeName][step];
  if (!parseColor(value)) return fallback;
  // A custom color: lighten or darken it toward the step it stands for.
  if (step === 900) return mixColors(value, "#ffffff", 0.45);
  if (step === 700) return luminance(value) < 0.25 ? mixColors(value, "#ffffff", 0.7) : value;
  if (step === 200) return mixColors(value, "#000000", 0.14);
  return value;
}

type Palette = {
  ground: string;
  brand: string;
  vivid: string;
  soft: string;
  deep: string;
  accent: string;
  ink: string;
};

function paletteFor(skin: OgSkin): Palette {
  return {
    ground: skin.background ?? "#060607",
    brand: schemeColor(skin.brand, 500, "#0a8466"),
    vivid: schemeColor(skin.brand, 700, "#01cb90"),
    soft: schemeColor(skin.brand, 900, "#84f6c3"),
    deep: schemeColor(skin.brand, 200, "#081816"),
    accent: schemeColor(skin.accent ?? skin.brand, 700, "#ff9964"),
    ink: "#f5f5f4",
  };
}

/* ---------- Fonts ---------- */

type LoadedFont = {
  name: string;
  data: ArrayBuffer;
  weight: OgFont["weight"];
  style: "normal" | "italic";
};

const fontCache = new Map<string, Promise<ArrayBuffer | null>>();

function toArrayBuffer(data: ArrayBuffer | Uint8Array): ArrayBuffer {
  if (data instanceof ArrayBuffer) return data;
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
}

async function readFontFile(path: string): Promise<ArrayBuffer | null> {
  try {
    const [{ readFile }, { join }] = await Promise.all([
      import("node:fs/promises"),
      import("node:path"),
    ]);
    return toArrayBuffer(await readFile(join(process.cwd(), path)));
  } catch (error) {
    console.warn(`[once-ui og] Could not read font ${path}:`, error);
    return null;
  }
}

async function fetchGoogleFont(family: string, weight: number, italic: boolean) {
  try {
    const axis = italic ? `ital,wght@1,${weight}` : `wght@${weight}`;
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, "+")}:${axis}`,
      )
    ).text();
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
    if (!src) return null;
    const response = await fetch(src[1]);
    return response.ok ? await response.arrayBuffer() : null;
  } catch (error) {
    console.warn(`[once-ui og] Could not fetch ${family} ${weight}:`, error);
    return null;
  }
}

function loadFont(font: OgFont): Promise<ArrayBuffer | null> {
  if (font.data) return Promise.resolve(toArrayBuffer(font.data));
  const weight = font.weight ?? 400;
  const key = `${font.path ?? font.google ?? font.name}|${weight}|${font.style ?? "normal"}`;
  let pending = fontCache.get(key);
  if (!pending) {
    pending = font.path
      ? readFontFile(font.path)
      : fetchGoogleFont(font.google ?? font.name, weight, font.style === "italic");
    // A failed fetch is retried on a later card, not cached.
    pending.then((data) => data === null && fontCache.delete(key));
    fontCache.set(key, pending);
  }
  return pending;
}

async function loadFonts(fonts: OgFont[] = []): Promise<LoadedFont[]> {
  const loaded = await Promise.all(fonts.map(loadFont));
  return fonts.flatMap((font, i) => {
    const data = loaded[i];
    return data
      ? [{ name: font.name, data, weight: font.weight ?? 400, style: font.style ?? "normal" }]
      : [];
  });
}

/* ---------- Mascot ---------- */

async function accessoryMarkup(accessory: string | ReactElement | undefined) {
  if (accessory === undefined || typeof accessory === "string") return accessory;
  const { renderToStaticMarkup } = await import("react-dom/server");
  return renderToStaticMarkup(accessory);
}

async function mascotImage(
  mascot: OgMascot,
  palette: Palette,
  mood: OgMood,
  lookAt: { x: number; y: number },
) {
  if ("svg" in mascot) return `data:image/svg+xml;utf8,${encodeURIComponent(mascot.svg)}`;
  const { accessory, ...look } = mascot;
  const svg = mascotSvg({
    ...look,
    color: look.color ?? "brand",
    schemes: { brand: palette.vivid, accent: palette.accent, neutral: "#9a9a9a", ...look.schemes },
    accessory: await accessoryMarkup(accessory),
    mood,
    lookAt,
    shadow: false,
    size: 400,
  });
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/* ---------- Text ---------- */

/** Splits `*emphasis*` out of a title, so it can be drawn in the brand color. */
export function parseOgTitle(title: string): { text: string; em: boolean }[] {
  const words: { text: string; em: boolean }[] = [];
  let em = false;
  for (const part of title.split(/(\*)/)) {
    if (part === "*") {
      em = !em;
      continue;
    }
    for (const word of part.split(/\s+/).filter(Boolean)) words.push({ text: word, em });
  }
  return words;
}

/** The title's size in pixels, so short titles land big and long ones still fit. */
export function ogTitleSize(title: string, layout: OgLayout): number {
  const length = title.replace(/\*/g, "").length;
  if (layout === "hero") {
    if (length <= 12) return 168;
    if (length <= 22) return 132;
    if (length <= 40) return 100;
    return 80;
  }
  if (layout === "photo") {
    if (length <= 16) return 96;
    if (length <= 34) return 76;
    if (length <= 60) return 60;
    return 50;
  }
  if (length <= 10) return 150;
  if (length <= 20) return 112;
  if (length <= 36) return 88;
  if (length <= 64) return 70;
  return 56;
}

function clip(value: string | null | undefined, max: number) {
  if (!value) return undefined;
  const text = value.trim();
  if (!text) return undefined;
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/* ---------- The card ---------- */

/* The image renderer has no `inset`, so full-bleed layers spell it out. */
const FILL = { top: 0, left: 0, width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT } as const;

type Faces = { heading?: string; body?: string; mono?: string; emphasis?: string };

function Title({
  title,
  size,
  palette,
  faces,
  align = "left",
  maxWidth,
}: {
  title: string;
  size: number;
  palette: Palette;
  faces: Faces;
  align?: "left" | "center";
  maxWidth: number;
}) {
  const words = parseOgTitle(title);
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        maxWidth,
        fontFamily: faces.heading,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 0.98,
        letterSpacing: `${-0.045 * size}px`,
        color: palette.ink,
      }}
    >
      {words.map((word, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: words repeat, and a title never reorders.
          key={`${word.text}-${i}`}
          style={{
            marginRight: i < words.length - 1 ? size * 0.24 : 0,
            ...(word.em
              ? { color: palette.vivid }
              : {
                  // Light falls from above: white at the top, tinted by the brand below.
                  backgroundImage: `linear-gradient(180deg, ${palette.ink} 38%, ${mixColors(palette.soft, palette.ink, 0.55)} 100%)`,
                  backgroundClip: "text",
                  color: "transparent",
                }),
            ...(word.em && faces.emphasis
              ? {
                  fontFamily: faces.emphasis,
                  fontStyle: "italic",
                  fontWeight: 400,
                  letterSpacing: `${-0.02 * size}px`,
                }
              : {}),
          }}
        >
          {word.text}
        </span>
      ))}
    </div>
  );
}

function Eyebrow({ text, palette, faces }: { text: string; palette: Palette; faces: Faces }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      {/* A tile of the Once UI mark, as a bullet. */}
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: 3,
          background: palette.vivid,
          transform: "rotate(45deg)",
          boxShadow: `0 0 18px ${withAlpha(palette.vivid, 0.9)}`,
        }}
      />
      <div
        style={{
          fontFamily: faces.mono,
          fontSize: 22,
          fontWeight: 500,
          letterSpacing: 4.4,
          textTransform: "uppercase",
          color: palette.soft,
        }}
      >
        {text}
      </div>
    </div>
  );
}

function Wordmark({
  skin,
  palette,
  faces,
  logo,
}: {
  skin: OgSkin;
  palette: Palette;
  faces: Faces;
  logo?: string;
}) {
  if (logo) {
    // biome-ignore lint/performance/noImgElement: ImageResponse draws plain img elements.
    return <img src={logo} alt="" height={44} style={{ height: 44, objectFit: "contain" }} />;
  }
  const mark = resolveLogo(skin.mark, "http://localhost");
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontFamily: faces.heading,
        fontSize: 34,
        fontWeight: 700,
        letterSpacing: -0.8,
        color: palette.ink,
      }}
    >
      {mark && (
        // biome-ignore lint/performance/noImgElement: ImageResponse draws plain img elements.
        <img src={mark} alt="" width={40} height={40} />
      )}
      {skin.name}
    </div>
  );
}

/** Concentric rings and a glow behind the mascot: the card's one bright spot. */
function Halo({ x, y, r, palette }: { x: number; y: number; r: number; palette: Palette }) {
  const ring = (scale: number, opacity: number): ReactNode => (
    <div
      key={scale}
      style={{
        position: "absolute",
        left: x - r * scale,
        top: y - r * scale,
        width: r * scale * 2,
        height: r * scale * 2,
        borderRadius: r * scale * 2,
        border: `1.5px solid ${withAlpha(palette.vivid, opacity)}`,
      }}
    />
  );
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x - r * 2.4,
          top: y - r * 2.4,
          width: r * 4.8,
          height: r * 4.8,
          backgroundImage: `radial-gradient(circle at center, ${withAlpha(palette.vivid, 0.42)} 0%, ${withAlpha(palette.brand, 0.2)} 24%, ${withAlpha(palette.brand, 0.06)} 44%, ${withAlpha(palette.brand, 0)} 64%)`,
        }}
      />
      {ring(0.9, 0.34)}
      {ring(1.32, 0.18)}
      {ring(1.86, 0.09)}
      {ring(2.5, 0.05)}
    </>
  );
}

/** Ground, a faint grid, the giant ghosted name and the accent glow. */
function Backdrop({
  skin,
  palette,
  faces,
  ghost,
}: {
  skin: OgSkin;
  palette: Palette;
  faces: Faces;
  ghost: boolean;
}) {
  const line = withAlpha("#ffffff", 0.045);
  return (
    <>
      <div
        style={{
          position: "absolute",
          ...FILL,
          backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          backgroundPosition: "-1px -1px",
        }}
      />
      {/* Fades the grid out toward the type. */}
      <div
        style={{
          position: "absolute",
          ...FILL,
          backgroundImage: `linear-gradient(90deg, ${palette.ground} 0%, ${withAlpha(palette.ground, 0.92)} 38%, ${withAlpha(palette.ground, 0.2)} 70%, ${withAlpha(palette.ground, 0.6)} 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -220,
          bottom: -320,
          width: 760,
          height: 760,
          backgroundImage: `radial-gradient(circle at center, ${withAlpha(palette.accent, 0.16)} 0%, ${withAlpha(palette.accent, 0)} 62%)`,
        }}
      />
      {ghost && (
        <div
          style={{
            position: "absolute",
            left: 470,
            bottom: -92,
            fontFamily: faces.heading,
            fontWeight: 800,
            fontSize: 340,
            lineHeight: 1,
            letterSpacing: -20,
            color: withAlpha(palette.vivid, 0.07),
            whiteSpace: "nowrap",
          }}
        >
          {skin.name}
        </div>
      )}
    </>
  );
}

function Frame({ palette }: { palette: Palette }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 24,
        left: 24,
        width: OG_IMAGE_WIDTH - 48,
        height: OG_IMAGE_HEIGHT - 48,
        borderRadius: 28,
        border: `1px solid ${withAlpha(palette.ink, 0.09)}`,
      }}
    />
  );
}

function Domain({ text, palette, faces }: { text?: string; palette: Palette; faces: Faces }) {
  if (!text) return <div style={{ display: "flex" }} />;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontFamily: faces.mono,
        fontSize: 21,
        color: withAlpha(palette.ink, 0.5),
        letterSpacing: 0.4,
      }}
    >
      <div
        style={{ width: 32, height: 2, flexShrink: 0, background: withAlpha(palette.ink, 0.35) }}
      />
      {text}
    </div>
  );
}

type CardInput = {
  skin: OgSkin;
  card: OgCardProps & { layout: OgLayout; mood: OgMood };
  palette: Palette;
  faces: Faces;
  mascot?: string;
  logo?: string;
};

function PageCard({ skin, card, palette, faces, mascot, logo }: CardInput) {
  const size = ogTitleSize(card.title, "page");
  const width = mascot ? 660 : 1000;
  return (
    <>
      <Backdrop skin={skin} palette={palette} faces={faces} ghost />
      {mascot && <Halo x={950} y={350} r={170} palette={palette} />}
      {mascot && (
        <div
          style={{
            position: "absolute",
            left: 700,
            top: 520,
            width: 500,
            height: 160,
            backgroundImage: `radial-gradient(ellipse at center, ${withAlpha(palette.vivid, 0.5)} 0%, ${withAlpha(palette.vivid, 0)} 65%)`,
          }}
        />
      )}
      {mascot && (
        // biome-ignore lint/performance/noImgElement: ImageResponse draws plain img elements.
        <img
          src={mascot}
          alt=""
          width={500}
          height={500}
          style={{ position: "absolute", left: 700, top: 110, transform: "rotate(-6deg)" }}
        />
      )}
      <Frame palette={palette} />
      <div
        style={{
          position: "absolute",
          ...FILL,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "68px 80px 64px",
        }}
      >
        <Wordmark skin={skin} palette={palette} faces={faces} logo={logo} />
        <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: width }}>
          {card.eyebrow && <Eyebrow text={card.eyebrow} palette={palette} faces={faces} />}
          <Title title={card.title} size={size} palette={palette} faces={faces} maxWidth={width} />
          {card.description && (
            <div
              style={{
                fontFamily: faces.body,
                fontSize: 28,
                lineHeight: 1.35,
                color: withAlpha(palette.ink, 0.62),
                maxWidth: Math.min(width, 640),
              }}
            >
              {card.description}
            </div>
          )}
        </div>
        <Domain text={skin.domain} palette={palette} faces={faces} />
      </div>
    </>
  );
}

function HeroCard({ skin, card, palette, faces, mascot, logo }: CardInput) {
  const size = ogTitleSize(card.title, "hero");
  return (
    <>
      <div
        style={{
          position: "absolute",
          ...FILL,
          backgroundImage: `radial-gradient(ellipse 70% 60% at 50% 0%, ${withAlpha(palette.vivid, 0.34)} 0%, ${withAlpha(palette.brand, 0.12)} 40%, ${withAlpha(palette.brand, 0)} 75%)`,
        }}
      />
      <Backdrop skin={skin} palette={palette} faces={faces} ghost={false} />
      <div
        style={{
          position: "absolute",
          ...FILL,
          backgroundImage: `radial-gradient(ellipse 60% 70% at 50% 18%, ${withAlpha(palette.vivid, 0.3)} 0%, ${withAlpha(palette.brand, 0)} 60%)`,
        }}
      />
      {mascot && <Halo x={600} y={196} r={110} palette={palette} />}
      <Frame palette={palette} />
      <div
        style={{
          position: "absolute",
          top: 64,
          left: 80,
          width: OG_IMAGE_WIDTH - 160,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Wordmark skin={skin} palette={palette} faces={faces} logo={logo} />
        <Domain text={skin.domain} palette={palette} faces={faces} />
      </div>
      <div
        style={{
          position: "absolute",
          ...FILL,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "40px 80px 70px",
          gap: 20,
        }}
      >
        {mascot && (
          // biome-ignore lint/performance/noImgElement: ImageResponse draws plain img elements.
          <img src={mascot} alt="" width={250} height={250} style={{ marginBottom: -4 }} />
        )}
        {card.eyebrow && <Eyebrow text={card.eyebrow} palette={palette} faces={faces} />}
        <Title
          title={card.title}
          size={size}
          palette={palette}
          faces={faces}
          align="center"
          maxWidth={1040}
        />
        {card.description && (
          <div
            style={{
              fontFamily: faces.body,
              fontSize: 30,
              color: withAlpha(palette.ink, 0.64),
              textAlign: "center",
              maxWidth: 820,
            }}
          >
            {card.description}
          </div>
        )}
      </div>
    </>
  );
}

function PhotoCard({ skin, card, palette, faces, mascot, logo }: CardInput) {
  const size = ogTitleSize(card.title, "photo");
  return (
    <>
      <Backdrop skin={skin} palette={palette} faces={faces} ghost={false} />
      <div
        style={{
          position: "absolute",
          left: 560,
          top: -120,
          width: 900,
          height: 900,
          backgroundImage: `radial-gradient(circle at center, ${withAlpha(palette.vivid, 0.3)} 0%, ${withAlpha(palette.brand, 0)} 60%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 690,
          top: 70,
          width: 440,
          height: 490,
          display: "flex",
          borderRadius: 30,
          overflow: "hidden",
          transform: "rotate(3deg)",
          border: `1px solid ${withAlpha(palette.ink, 0.16)}`,
          boxShadow: `0 40px 80px ${withAlpha("#000000", 0.6)}, 0 0 0 10px ${withAlpha(palette.ink, 0.04)}`,
          background: palette.deep,
        }}
      >
        {card.image && (
          // biome-ignore lint/performance/noImgElement: ImageResponse draws plain img elements.
          <img
            src={card.image}
            alt=""
            width={440}
            height={490}
            style={{ width: 440, height: 490, objectFit: "cover" }}
          />
        )}
      </div>
      {mascot && (
        // biome-ignore lint/performance/noImgElement: ImageResponse draws plain img elements.
        <img
          src={mascot}
          alt=""
          width={190}
          height={190}
          style={{ position: "absolute", left: 600, top: 400, transform: "rotate(-8deg)" }}
        />
      )}
      <Frame palette={palette} />
      <div
        style={{
          position: "absolute",
          ...FILL,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "68px 80px 64px",
        }}
      >
        <Wordmark skin={skin} palette={palette} faces={faces} logo={logo} />
        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 560 }}>
          {card.eyebrow && <Eyebrow text={card.eyebrow} palette={palette} faces={faces} />}
          <Title title={card.title} size={size} palette={palette} faces={faces} maxWidth={560} />
          {card.description && (
            <div
              style={{
                fontFamily: faces.mono,
                fontSize: 24,
                color: palette.soft,
                letterSpacing: 0.2,
              }}
            >
              {card.description}
            </div>
          )}
        </div>
        <Domain text={skin.domain} palette={palette} faces={faces} />
      </div>
    </>
  );
}

/* ---------- Requests ---------- */

const MOODS = new Set<OgMood>([
  "neutral",
  "happy",
  "surprised",
  "sad",
  "skeptical",
  "wink",
  "focused",
  "determined",
  "love",
  "excited",
  "laughing",
  "embarrassed",
  "crying",
  "angry",
  "confused",
]);

/** Only images from the app's own origin, or a host the skin allows, end up on a card. */
function allowedImage(raw: string | null, origin: string, hosts: string[] = []) {
  if (!raw) return undefined;
  try {
    if (raw.startsWith("//")) return undefined;
    const url = new URL(raw, origin);
    if (url.protocol !== "https:" && url.origin !== origin) return undefined;
    if (url.origin === origin || hosts.includes(url.hostname)) return url.toString();
  } catch {}
  return undefined;
}

function resolveLogo(logo: string | undefined, origin: string) {
  if (!logo) return undefined;
  if (logo.trim().startsWith("<")) return `data:image/svg+xml;utf8,${encodeURIComponent(logo)}`;
  try {
    return new URL(logo, origin).toString();
  } catch {
    return undefined;
  }
}

/** Reads a card from the query string: `title`, `eyebrow`, `description`, `mood`, `layout`, `image`. */
export function readOgCard(url: URL, skin: OgSkin, fallbackTitle = skin.name) {
  const params = url.searchParams;
  const image = allowedImage(params.get("image"), url.origin, skin.imageHosts);
  const requestedLayout = params.get("layout");
  const layout: OgLayout =
    requestedLayout === "hero" || requestedLayout === "page" || requestedLayout === "photo"
      ? requestedLayout
      : image
        ? "photo"
        : "page";
  const mood = params.get("mood");
  return {
    title: clip(params.get("title"), 90) ?? fallbackTitle,
    eyebrow: clip(params.get("eyebrow") ?? params.get("section"), 40),
    description: clip(params.get("description"), 120),
    mood: mood && MOODS.has(mood as OgMood) ? (mood as OgMood) : (skin.mood ?? "neutral"),
    layout: layout === "photo" && !image ? "page" : layout,
    image,
  } satisfies OgCardProps & { layout: OgLayout; mood: OgMood };
}

/** The card as an element, for your own `ImageResponse` or a test. */
export async function renderOgCard(
  skin: OgSkin,
  card: OgCardProps,
  options: { origin?: string } = {},
): Promise<ReactElement> {
  const palette = paletteFor(skin);
  const layout = card.layout ?? (card.image ? "photo" : "page");
  const mood = card.mood ?? skin.mood ?? "neutral";
  const first = skin.fonts?.[0]?.name;
  const faces: Faces = {
    heading: skin.headingFont ?? first,
    body: skin.bodyFont ?? skin.headingFont ?? first,
    mono: skin.monoFont ?? skin.bodyFont ?? first,
    emphasis: skin.emphasisFont,
  };
  // The mascot looks at the title.
  const lookAt =
    layout === "hero"
      ? { x: 0, y: 0.6 }
      : layout === "photo"
        ? { x: -0.7, y: -0.4 }
        : { x: -0.75, y: -0.15 };
  const mascot = skin.mascot ? await mascotImage(skin.mascot, palette, mood, lookAt) : undefined;
  const logo = resolveLogo(skin.logo, options.origin ?? "http://localhost");
  const input: CardInput = {
    skin,
    card: { ...card, layout, mood },
    palette,
    faces,
    mascot,
    logo,
  };
  const body =
    layout === "hero" ? (
      <HeroCard {...input} />
    ) : layout === "photo" ? (
      <PhotoCard {...input} />
    ) : (
      <PageCard {...input} />
    );
  const style: CSSProperties = {
    position: "relative",
    display: "flex",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    background: palette.ground,
    color: palette.ink,
    fontFamily: faces.body,
  };
  return <div style={style}>{body}</div>;
}

export interface OgImageRouteOptions {
  skin: OgSkin;
  /** The title when a request names none. The skin's name by default. */
  fallbackTitle?: string;
  /** Response headers. Cards are cached for a year by default; change `v=` to refresh one. */
  headers?: Record<string, string>;
}

/**
 * `GET /api/og/generate?title=…&eyebrow=…&description=…&mood=…&layout=…&image=…`
 * → a 1200 × 630 PNG in the skin's look. Needs the Node.js runtime when the
 * skin reads fonts from disk.
 */
export function createOgImageRoute(options: OgImageRouteOptions): {
  GET: (request: Request) => Promise<Response>;
} {
  const { skin } = options;
  return {
    GET: async (request: Request) => {
      const url = new URL(request.url);
      const card = readOgCard(url, skin, options.fallbackTitle);
      const [element, fonts] = await Promise.all([
        renderOgCard(skin, card, { origin: url.origin }),
        loadFonts(skin.fonts),
      ]);
      return new ImageResponse(element, {
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        fonts: fonts.length ? fonts : undefined,
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
          ...options.headers,
        },
      });
    },
  };
}
