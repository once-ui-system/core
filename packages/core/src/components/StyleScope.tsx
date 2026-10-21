import { forwardRef, useId } from "react";
import type { OnceUIStyleConfig } from "../contexts/ThemeProvider";
import { cssColor } from "../internal/cssColor";
import {
  type CustomScheme,
  type CustomSchemeSeeds,
  type CustomSchemeThemedScales,
  customSchemeThemeProperties,
  type ThemedSchemeScale,
} from "../utils/colorScheme";
import { type ThemeColor, themeCssValue } from "../utils/themeCss";
import { Flex } from "./Flex";

/** A font per role, as a CSS `font-family` value or a `var(--…)` from next/font. */
export type StyleScopeFonts = Partial<Record<"heading" | "body" | "label" | "code", string>>;

/**
 * The part of `once-ui.config`'s `style` that a subtree can take on its own:
 * colours, theme, solids, border and surface. Root-only settings (scaling,
 * device font sizes, transitions) stay with the page.
 */
export type StyleScopeConfig = Pick<
  OnceUIStyleConfig,
  | "brand"
  | "accent"
  | "neutral"
  | "solid"
  | "solidStyle"
  | "border"
  | "surface"
  | "brandSeed"
  | "accentSeed"
  | "neutralSeed"
  | "brandScale"
  | "accentScale"
  | "neutralScale"
  | "pageBackground"
  | "surfaceBackground"
> & {
  /** `"light"` or `"dark"` pins the subtree's theme; unset, it follows the page. */
  theme?: "light" | "dark" | "system";
};

export interface StyleScopeProps extends Omit<React.ComponentProps<typeof Flex>, "style"> {
  /** The subtree's style, in the shape of `once-ui.config`'s `style`. */
  config?: StyleScopeConfig;
  /** Fonts for this subtree; unset roles keep the page's. */
  fonts?: StyleScopeFonts;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const THEMES = ["light", "dark"] as const;
const SCHEMES = ["brand", "accent", "neutral"] as const;
const STEPS = [
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "1000",
  "1100",
  "1200",
  "600-15",
  "600-30",
  "600-50",
];

const ATTRIBUTES = [
  "brand",
  "accent",
  "neutral",
  "solid",
  "solidStyle",
  "border",
  "surface",
] as const;

const toKebab = (key: string) => key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

const block = (selector: string, properties: Record<string, string>) => {
  const body = Object.entries(properties)
    .map(([property, value]) => {
      const safe = themeCssValue(value);
      return safe ? `${property}:${safe};` : "";
    })
    .join("");
  return body ? `${selector}{${body}}` : "";
};

const colorFor = (color: ThemeColor | undefined, theme: "light" | "dark") => {
  const safe = themeCssValue(typeof color === "string" ? color : color?.[theme]);
  return safe ? cssColor(safe.replace(/^--/, "")) : null;
};

/**
 * One site's look inside another page: a site builder's preview, a tenant's
 * page on a shared app, a block that keeps its client's brand. Writes the
 * config's `data-*` attributes on its own element and generates any custom
 * scheme (a seed colour, exact scales) for that element only, so two scopes
 * with different brands sit side by side.
 *
 * Server-safe: the scheme is in the HTML, so the first paint is already right.
 *
 * ```tsx
 * <StyleScope config={{ brandSeed: "#0B6E4F", theme: "light", border: "playful" }}
 *   fonts={{ heading: "var(--font-serif)" }}>
 *   <HeroSection title="Fresh bread every morning" />
 * </StyleScope>
 * ```
 */
const StyleScope = forwardRef<HTMLDivElement, StyleScopeProps>(
  ({ config = {}, fonts, style, children, ...rest }, ref) => {
    const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const scope = `[data-style-scope="${id}"]`;

    const seeds: CustomSchemeSeeds = {
      brand: config.brandSeed,
      accent: config.accentSeed,
      neutral: config.neutralSeed,
    };
    const scales: CustomSchemeThemedScales = {
      brand: config.brandScale as ThemedSchemeScale | undefined,
      accent: config.accentScale as ThemedSchemeScale | undefined,
      neutral: config.neutralScale as ThemedSchemeScale | undefined,
    };
    const { root, light, dark, byTheme } = customSchemeThemeProperties(seeds, scales);
    const perTheme = { light, dark };

    const schemes: CustomScheme[] = SCHEMES.filter(
      (scheme) => root[`--scheme-${scheme}-600`] || byTheme.includes(scheme),
    );

    const attributes: Record<string, string> = {};
    for (const key of ATTRIBUTES) {
      const value = config[key];
      if (typeof value === "string" && value) attributes[`data-${toKebab(key)}`] = value;
    }
    // A seed or scale implies "custom" when the scheme is not named.
    for (const scheme of schemes) {
      if (!attributes[`data-${scheme}`]) attributes[`data-${scheme}`] = "custom";
    }
    if (config.theme === "light" || config.theme === "dark") {
      attributes["data-theme"] = config.theme;
    }

    // Flat schemes and fonts go on the scope's own rule rather than an inline
    // style, which would turn the Flex into a client component; foundations'
    // `[data-brand="custom"]` reads them on this element.
    const inline: Record<string, string> = {};
    for (const [property, value] of Object.entries(root)) {
      const safe = themeCssValue(value);
      if (safe) inline[property] = safe;
    }
    for (const [role, family] of Object.entries(fonts ?? {})) {
      const safe = themeCssValue(family);
      if (safe) inline[`--font-${role}`] = safe;
    }

    // Per-theme scales and backgrounds key off the theme the scope is in: its
    // own `data-theme`, or the page's when it has none.
    const rules: string[] = [block(scope, inline)];
    for (const theme of THEMES) {
      const properties: Record<string, string> = { ...perTheme[theme] };
      const page = colorFor(config.pageBackground, theme);
      if (page) properties["--page-background"] = page;
      const surface = colorFor(config.surfaceBackground, theme);
      if (surface) properties["--surface-background"] = surface;
      rules.push(
        block(
          `${scope}[data-theme="${theme}"],:root[data-theme="${theme}"] ${scope}:not([data-theme]),${scope} [data-theme="${theme}"]`,
          properties,
        ),
      );
    }
    // A nested `data-theme` re-resolves the function steps from foundations'
    // palette; point them back at this scope's custom ramp.
    for (const scheme of schemes) {
      const remap: Record<string, string> = {};
      for (const step of STEPS) {
        remap[`--function-${scheme}-${step}`] = `var(--scheme-${scheme}-${step})`;
      }
      rules.push(block(`${scope} [data-theme]`, remap));
    }
    const css = rules.join("");

    return (
      <Flex
        ref={ref}
        direction="column"
        data-style-scope={id}
        {...attributes}
        style={style}
        {...rest}
      >
        {css && (
          <style
            // biome-ignore lint/security/noDangerouslySetInnerHtml: generated scheme values and config colours that themeCssValue has checked
            dangerouslySetInnerHTML={{ __html: css }}
          />
        )}
        {children}
      </Flex>
    );
  },
);

StyleScope.displayName = "StyleScope";

export { StyleScope };
