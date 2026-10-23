"use client";

import classNames from "clsx";
import type React from "react";
import { forwardRef, useEffect } from "react";
import { useAdapters } from "../contexts/AdapterProvider";
import { useToast } from "../contexts/ToastProvider";
import type { SpacingToken, TShirtSizes } from "../types";
import { Column } from "./Column";
import { ContextMenu } from "./ContextMenu";
import { Flex } from "./Flex";
import { Icon } from "./Icon";
import { Line } from "./Line";
import { Option } from "./Option";

const sizeMap: Record<string, SpacingToken> = {
  xs: "20",
  s: "24",
  m: "32",
  l: "40",
  xl: "48",
};

/**
 * A single asset, or one per theme.
 *
 * Passing `{ light, dark }` renders both and lets CSS pick, so one `<Logo>`
 * covers both themes. Before this you had to render the component twice —
 * once with `light`, once with `dark` — which meant eight elements for four
 * client logos in a row, and two places to keep in sync for every change.
 */
type LogoSource = string | { light: string; dark: string };

/**
 * The theme radius each logo size's monogram tile takes. Capped at 30% of the
 * tile in `monogramStyle`, so a `rounded` theme gives a soft square rather than
 * a circle (a circle reads as an avatar), and `sharp` gives a square.
 */
const monogramRadius: Record<string, string> = {
  xs: "s",
  s: "s",
  m: "m",
  l: "m",
  xl: "l",
};

/**
 * The letters a `monogram` shows: the string when one is given (as written),
 * otherwise the first letter or digit of `text`, upper-cased. One letter, not
 * the initials of the first two words: a single letter reads as a mark, two
 * read as a user's avatar.
 */
const monogramLetters = (monogram: boolean | string | undefined, text: string | undefined) => {
  if (typeof monogram === "string") return monogram.trim();
  if (!monogram || !text) return "";
  const first = text.match(/[\p{L}\p{N}]/u)?.[0] ?? Array.from(text.trim())[0] ?? "";
  return first.toLocaleUpperCase();
};

interface LogoProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  className?: string;
  size?: TShirtSizes;
  style?: React.CSSProperties;
  icon?: LogoSource;
  wordmark?: LogoSource;
  /**
   * A text wordmark, for a brand with no wordmark file: the name set in the
   * heading font at the logo's height, after the icon if there is one.
   * `wordmark` stays an image source.
   */
  text?: string;
  /**
   * A built-in mark for a brand with no designed icon yet: a square tile at
   * the logo's height in the brand's solid colour, with the first letter of
   * `text` in the heading font. Pass a string to choose the letters instead
   * (one or two characters read best). The tile follows the theme's radius,
   * brand colour, solid style and light/dark mode, so it needs no asset.
   * `icon` wins: with an icon set, `monogram` is ignored. Beside `text` the
   * tile is decorative (`aria-hidden`), since the text names the logo.
   *
   * @example <Logo text="Acme" monogram href="/" />
   */
  monogram?: boolean | string;
  href?: string;
  dark?: boolean;
  light?: boolean;
  brand?: { copy?: boolean; url?: string };
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
  (
    {
      size = "m",
      href,
      icon,
      wordmark,
      text,
      monogram,
      className,
      style,
      dark,
      light,
      brand,
      ...props
    },
    ref,
  ) => {
    // An icon is the brand's real mark, so it replaces the monogram.
    const letters = icon ? "" : monogramLetters(monogram, text);

    useEffect(() => {
      if (!icon && !wordmark && !text && !letters) {
        console.warn(
          "Both 'icon' and 'wordmark' props are set to false. The logo will not render any content.",
        );
      }
    }, [icon, wordmark, text, letters]);

    /**
     * One <img> for a plain source; for a per-theme source, both, each gated by
     * the same light-flex / dark-flex classes the `light` and `dark` props use.
     * Rendering both rather than reading the theme at runtime keeps the
     * component server-renderable and avoids a flash on first paint.
     */
    /**
     * The copy-to-clipboard actions need one concrete file. A per-theme source
     * has two, so they take the light asset — the one a brand page shows by
     * default and the one someone pasting a logo almost always wants.
     */
    const resolveSource = (source: LogoSource | undefined): string | undefined =>
      typeof source === "string" ? source : source?.light;

    // With a text wordmark the text names the logo, so the images beside it
    // are decorative; an image-only logo keeps "Trademark".
    const alt = text ? "" : "Trademark";

    const renderSource = (source: LogoSource | undefined) => {
      if (!source) return null;
      const imgStyle = {
        height: `var(--static-space-${sizeMap[size]})`,
        width: "auto",
      };
      if (typeof source === "string") {
        return <img style={imgStyle} alt={alt} src={source} />;
      }
      return (
        <>
          <img className="light-flex" style={imgStyle} alt={alt} src={source.light} />
          <img className="dark-flex" style={imgStyle} alt={alt} src={source.dark} />
        </>
      );
    };

    /**
     * The tile is drawn in CSS rather than as an SVG so it takes the theme's
     * tokens: --brand-solid-strong flips with light/dark and the brand
     * colour, the radius with the border style, the border and inset with
     * solidStyle (flat or plastic) exactly as a primary Button does. On top
     * sit a faint top sheen and a 1px inner highlight, so a flat brand colour
     * still reads as a made mark rather than a placeholder.
     */
    const renderMonogram = () => {
      if (!letters) return null;
      const height = `var(--static-space-${sizeMap[size]})`;
      const count = Array.from(letters).length;
      const fontScale = count === 1 ? 0.58 : count === 2 ? 0.44 : 0.34;
      // Beside text the tile is decoration; alone it is the logo, named like
      // an image-only one.
      const a11y = text
        ? { "aria-hidden": true as const }
        : { role: "img", "aria-label": "Trademark" };
      return (
        <span
          {...a11y}
          className="font-heading"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxSizing: "border-box",
            width: height,
            height,
            borderRadius: `min(var(--radius-${monogramRadius[size]}), calc(${height} * 0.3))`,
            border: "var(--solid-border-width) solid var(--solid-border-color-brand)",
            backgroundColor: "var(--brand-solid-strong)",
            backgroundImage:
              "linear-gradient(180deg, rgb(255 255 255 / 0.16) 0%, rgb(255 255 255 / 0) 60%)",
            boxShadow: [
              "inset 0 var(--solid-inset-distance) var(--solid-inset-size) var(--solid-inset-color-brand)",
              "inset 0 1px 0 0 rgb(255 255 255 / 0.22)",
              "inset 0 0 0 1px rgb(0 0 0 / 0.06)",
            ].join(", "),
            color: "var(--brand-on-solid-strong)",
            fontSize: `calc(${height} * ${fontScale})`,
            fontWeight: "var(--font-weight-heading-strong)",
            lineHeight: 1,
            letterSpacing: count === 1 ? "-0.02em" : "-0.04em",
            whiteSpace: "nowrap",
            userSelect: "none",
            // Centre on the cap height, not the line box: a line box carries
            // descender room, which sits capitals visibly low in a tile.
            ...({ textBox: "trim-both cap alphabetic" } as React.CSSProperties),
          }}
        >
          {letters}
        </span>
      );
    };

    const renderText = () => {
      if (!text) return null;
      const height = `var(--static-space-${sizeMap[size]})`;
      return (
        <span
          className="font-heading neutral-on-background-strong"
          style={{
            fontSize: `calc(${height} * 0.75)`,
            lineHeight: height,
            fontWeight: "var(--font-weight-heading-strong)",
            letterSpacing: "-0.02em",
            whiteSpace: "nowrap",
            marginLeft: icon || letters ? `calc(${height} / 4)` : undefined,
          }}
        >
          {text}
        </span>
      );
    };

    const content = (
      <>
        {renderSource(icon)}
        {renderMonogram()}
        {renderSource(wordmark)}
        {renderText()}
      </>
    );

    const { addToast } = useToast();
    const { Link } = useAdapters();

    const copyIconToClipboard = async () => {
      if (!icon) {
        addToast({
          variant: "danger",
          message: "No icon available to copy",
        });
        return;
      }

      try {
        const response = await fetch(resolveSource(icon) as string);
        const svgText = await response.text();
        await navigator.clipboard.writeText(svgText);

        addToast({
          variant: "success",
          message: "Icon copied to clipboard as SVG",
        });
      } catch (error) {
        addToast({
          variant: "danger",
          message: "Failed to copy icon to clipboard",
        });
        console.error("Error copying icon:", error);
      }
    };

    const copyWordmarkToClipboard = async () => {
      if (!wordmark) {
        addToast({
          variant: "danger",
          message: "No wordmark available to copy",
        });
        return;
      }

      try {
        const response = await fetch(resolveSource(wordmark) as string);
        const svgText = await response.text();
        await navigator.clipboard.writeText(svgText);

        addToast({
          variant: "success",
          message: "Wordmark copied to clipboard as SVG",
        });
      } catch (error) {
        addToast({
          variant: "danger",
          message: "Failed to copy wordmark to clipboard",
        });
        console.error("Error copying wordmark:", error);
      }
    };

    const renderDropdownContent = () => {
      return (
        <Column fillWidth>
          <Column fillWidth padding="4" gap="4">
            {brand?.copy && icon && (
              <Option
                value="copy-icon"
                label="Copy icon as SVG"
                prefix={<Logo size="xs" icon={icon} style={{ opacity: 0.5 }} />}
                onClick={copyIconToClipboard}
              />
            )}
            {brand?.copy && wordmark && (
              <Option
                value="copy-wordmark"
                label="Copy wordmark as SVG"
                prefix={<Icon size="xs" onBackground="neutral-weak" name="wordmark" />}
                onClick={copyWordmarkToClipboard}
              />
            )}
          </Column>
          {brand?.url && (
            <>
              <Line />
              <Column fillWidth padding="4">
                <Option
                  value="brand-guidelines"
                  label="Visit brand guidelines"
                  prefix={<Icon size="xs" onBackground="neutral-weak" name="arrowUpRight" />}
                  href={brand.url}
                />
              </Column>
            </>
          )}
        </Column>
      );
    };

    const enableContext = brand && ((brand.copy && (icon || wordmark)) || brand.url);

    const renderLogo = () => {
      if (href) {
        return (
          <Link
            className={classNames(
              "radius-l",
              "display-flex",
              "fit-height",
              dark ? "dark-flex" : "",
              light ? "light-flex" : "",
              className,
            )}
            style={style}
            href={href}
            aria-label={text || "Trademark"}
            {...props}
          >
            {content}
          </Link>
        );
      } else {
        return (
          <Flex
            className={classNames(className)}
            dark={dark}
            light={light}
            radius="l"
            fitHeight
            style={style}
            aria-label={text ? undefined : "Trademark"}
          >
            {content}
          </Flex>
        );
      }
    };

    return enableContext ? (
      <ContextMenu dropdown={renderDropdownContent()} placement="bottom-start">
        {renderLogo()}
      </ContextMenu>
    ) : (
      renderLogo()
    );
  },
);

Logo.displayName = "Logo";

export { Logo };
