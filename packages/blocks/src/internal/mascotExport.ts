import type { MascotDesign } from "@once-ui-system/core";

/*
 * MascotPanel's free exports: the design as JSON and as JSX, and the flat
 * mascot as an SVG or PNG file. All in the browser, no server.
 */

/** The design as pretty JSON, ready to store or paste. */
export const designJson = (design: MascotDesign) => JSON.stringify(design, null, 2);

const jsxValue = (value: unknown) =>
  typeof value === "string" ? JSON.stringify(value) : `{${JSON.stringify(value)}}`;

/** `<Mascot … />` with the design's props, one per line past three. */
export function designJsx(design: MascotDesign): string {
  const { v: _v, ...props } = design;
  const attrs = Object.entries(props)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => (value === true ? key : `${key}=${jsxValue(value)}`));
  if (attrs.length === 0) return "<Mascot />";
  if (attrs.length <= 3) return `<Mascot ${attrs.join(" ")} />`;
  return `<Mascot\n${attrs.map((attr) => `  ${attr}`).join("\n")}\n/>`;
}

/** What each drawn element keeps of its computed style. Motion is left out, so the file holds the rest pose. */
const PAINT = [
  "fill",
  "fill-opacity",
  "fill-rule",
  "stroke",
  "stroke-width",
  "stroke-opacity",
  "stroke-linecap",
  "stroke-linejoin",
  "opacity",
  "display",
  "visibility",
  "font-family",
  "font-size",
  "font-weight",
] as const;

/**
 * A standalone SVG of a rendered flat mascot: every class and CSS variable
 * resolved into inline paint, so the file looks the same anywhere.
 */
export function standaloneSvg(svg: SVGSVGElement, size = 512): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const from = [svg, ...svg.querySelectorAll("*")];
  const to = [clone, ...clone.querySelectorAll("*")];
  from.forEach((node, index) => {
    const target = to[index];
    if (!target) return;
    const computed = getComputedStyle(node);
    const text = node.tagName.toLowerCase() === "text";
    const style = PAINT.filter((prop) => text || !prop.startsWith("font-"))
      .map((prop) => {
        const value = computed.getPropertyValue(prop);
        return value ? `${prop}:${value}` : "";
      })
      .filter(Boolean)
      .join(";");
    target.removeAttribute("class");
    if (style) target.setAttribute("style", style);
    else target.removeAttribute("style");
  });
  clone.removeAttribute("aria-hidden");
  clone.removeAttribute("focusable");
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(size));
  clone.setAttribute("height", String(Math.round((size * 230) / 220)));
  // The mascot draws a little past its box (the floor shadow, a tall hat).
  clone.setAttribute("viewBox", "-10 -24 220 230");
  clone.style.overflow = "visible";
  return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`;
}

/** The SVG drawn onto a canvas at `scale`, as a PNG. */
export async function svgToPng(svgText: string, size = 512, scale = 2): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svgText], { type: "image/svg+xml" }));
  try {
    const image = new Image();
    image.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("The mascot could not be drawn"));
      image.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = size * scale;
    canvas.height = Math.round(size * (230 / 220)) * scale;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No 2D canvas");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("No PNG"))), "image/png"),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Hands the visitor a file. */
export function download(data: Blob | string, filename: string, type = "text/plain") {
  const blob = typeof data === "string" ? new Blob([data], { type }) : data;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
