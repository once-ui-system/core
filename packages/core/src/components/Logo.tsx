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
 * The marks a boolean `monogram` draws from, on a 24-unit grid. Solid shapes
 * that read at favicon size: a bare first letter before the name reads as a
 * typo ("AAcme"), a shape reads as a mark. Every one stays inside 2–22, so
 * they share one optical size.
 */
const monogramShapes = [
  // orbit: a disc with an off-centre hole
  "M12 2a10 10 0 1 1 0 20a10 10 0 0 1 0-20Zm2.5 4.5a4.5 4.5 0 1 0 0 9a4.5 4.5 0 0 0 0-9Z",
  // drop: a disc with one square corner
  "M2 2H12A10 10 0 1 1 2 12Z",
  // clover: four overlapping lobes
  "M12 2a5 5 0 0 1 5 5a5 5 0 0 1 0 10a5 5 0 0 1-10 0a5 5 0 0 1 0-10a5 5 0 0 1 5-5Z",
  // halves: a disc split down the middle
  "M11 2v20A10 10 0 0 1 11 2ZM13 2a10 10 0 0 1 0 20Z",
  // arch
  "M2 22V12a10 10 0 0 1 20 0v10h-6V12a4 4 0 0 0-8 0v10Z",
];

/**
 * Which shape a name gets: a hash of the name, so one product always draws
 * the same mark and two products in the same family rarely share one.
 */
const monogramShape = (text: string | undefined) => {
  let hash = 0;
  for (const char of (text ?? "").trim().toLowerCase()) {
    hash = (hash * 31 + (char.codePointAt(0) ?? 0)) >>> 0;
  }
  return monogramShapes[hash % monogramShapes.length];
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
   * A built-in mark for a brand with no designed icon yet, favicon style: a
   * bare solid shape at the icon's height, in the strongest neutral text
   * colour (black in light mode, white in dark), with no tile behind it.
   * `true` picks one of a few geometric shapes from a hash of `text`, so a
   * name always gets the same mark. A string draws those characters instead,
   * as a heavy glyph in the heading font (one or two read best). Brand colour
   * and solid settings play no part. `icon` wins: with an icon set,
   * `monogram` is ignored. Beside `text` the mark is decorative
   * (`aria-hidden`), since the text names the logo.
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
    const mark = icon || !monogram ? undefined : monogram;
    const letters = typeof mark === "string" ? mark.trim() : "";
    const hasMark = mark === true || letters !== "";

    useEffect(() => {
      if (!icon && !wordmark && !text && !hasMark) {
        console.warn(
          "Both 'icon' and 'wordmark' props are set to false. The logo will not render any content.",
        );
      }
    }, [icon, wordmark, text, hasMark]);

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
     * Drawn inline (an SVG path, or text) in currentColor, so it follows the
     * theme with no asset and renders on the server.
     */
    const renderMonogram = () => {
      if (!hasMark) return null;
      const height = `var(--static-space-${sizeMap[size]})`;
      // Beside text the mark is decoration; alone it is the logo, named like
      // an image-only one.
      const a11y = text
        ? { "aria-hidden": true as const }
        : { role: "img", "aria-label": "Trademark" };
      const box: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        height,
        minWidth: height,
        color: "var(--neutral-on-background-strong)",
      };
      if (!letters) {
        return (
          <span {...a11y} data-monogram="shape" style={box}>
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              focusable="false"
              aria-hidden="true"
              style={{ width: height, height }}
            >
              <path fillRule="evenodd" d={monogramShape(text)} />
            </svg>
          </span>
        );
      }
      const count = Array.from(letters).length;
      // Cap height fills about three quarters of the slot for one character,
      // so the glyph reads as a mark set larger than the name beside it.
      const fontScale = count === 1 ? 1 : count === 2 ? 0.72 : 0.52;
      return (
        <span
          {...a11y}
          data-monogram="letters"
          className="font-heading"
          style={{
            ...box,
            fontSize: `calc(${height} * ${fontScale})`,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            whiteSpace: "nowrap",
            userSelect: "none",
            // Centre on the cap height, not the line box: a line box carries
            // descender room, which sits capitals visibly low.
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
            marginLeft: icon || hasMark ? `calc(${height} / 4)` : undefined,
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
