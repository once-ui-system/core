import { site } from "@/config/site";

// Builds the CSS variables for the theme from src/config/site.ts.
// Rendered once in the root layout; `.dark` is the default mode.
function block(selector: string, tokens: Record<string, string>) {
  const body = Object.entries(tokens)
    .map(([name, value]) => `--${name}: ${value};`)
    .join(" ");
  return `${selector} { ${body} }`;
}

export function themeCss(): string {
  return [
    block(":root", site.theme.light),
    block(".dark", site.theme.dark),
  ].join("\n");
}
