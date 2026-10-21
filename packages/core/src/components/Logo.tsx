"use client";

import classNames from "clsx";
import type React from "react";
import { useEffect } from "react";
import { useAdapters } from "../contexts/AdapterProvider.js";
import { useToast } from "../contexts/ToastProvider.js";
import type { LeafProps } from "../interfaces.js";
import type { SpacingToken, TShirtSizes } from "../types.js";
import { leafLayout, takeLeafProps } from "../utils/leafLayout.js";
import { Column } from "./Column.js";
import { Dropdown } from "./Dropdown.js";
import { Flex } from "./Flex.js";
import { Icon } from "./Icon.js";
import { Line } from "./Line.js";
import { Option } from "./Option.js";

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

interface LogoProps
  extends LeafProps,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LeafProps> {
  size?: TShirtSizes;
  icon?: LogoSource;
  wordmark?: LogoSource;
  /**
   * A text wordmark, for a brand with no wordmark file: the name set in the
   * heading font at the logo's height, after the icon if there is one.
   * `wordmark` stays an image source.
   */
  text?: string;
  href?: string;
  /**
   * Show this logo only in one theme. For a logo that changes with the
   * theme, pass `{ light, dark }` sources instead. 2.x: `dark` / `light`.
   */
  showIn?: "dark" | "light";
  brand?: { copy?: boolean; url?: string };
}

const Logo = ({
  ref,
  size = "m",
  href,
  icon,
  wordmark,
  text,
  className,
  style,
  showIn,
  brand,
  fillWidth,
  ...rest
}: LogoProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const [leaf, props] = takeLeafProps(rest);
  const layout = leafLayout(leaf);
  useEffect(() => {
    if (!icon && !wordmark && !text) {
      console.warn(
        "Both 'icon' and 'wordmark' props are set to false. The logo will not render any content.",
      );
    }
  }, [icon, wordmark, text]);

  /**
   * One <img> for a plain source; for a per-theme source, both, each gated by
   * the same light-flex / dark-flex classes `showIn` uses.
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
          marginLeft: icon ? `calc(${height} / 4)` : undefined,
        }}
      >
        {text}
      </span>
    );
  };

  const content = (
    <>
      {renderSource(icon)}
      {renderSource(wordmark)}
      {renderText()}
    </>
  );

  const { addToast } = useToast();
  const { Link } = useAdapters();

  const copyIconToClipboard = async () => {
    if (!icon) {
      addToast({
        tone: "danger",
        message: "No icon available to copy",
      });
      return;
    }

    try {
      const response = await fetch(resolveSource(icon) as string);
      const svgText = await response.text();
      await navigator.clipboard.writeText(svgText);

      addToast({
        tone: "success",
        message: "Icon copied to clipboard as SVG",
      });
    } catch (error) {
      addToast({
        tone: "danger",
        message: "Failed to copy icon to clipboard",
      });
      console.error("Error copying icon:", error);
    }
  };

  const copyWordmarkToClipboard = async () => {
    if (!wordmark) {
      addToast({
        tone: "danger",
        message: "No wordmark available to copy",
      });
      return;
    }

    try {
      const response = await fetch(resolveSource(wordmark) as string);
      const svgText = await response.text();
      await navigator.clipboard.writeText(svgText);

      addToast({
        tone: "success",
        message: "Wordmark copied to clipboard as SVG",
      });
    } catch (error) {
      addToast({
        tone: "danger",
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
            showIn === "dark" && "dark-flex",
            showIn === "light" && "light-flex",
            fillWidth && "fill-width",
            ...layout.classes,
            className,
          )}
          style={{ ...layout.style, ...style }}
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
          className={classNames(...layout.classes, className)}
          showIn={showIn}
          radius="l"
          fitHeight
          fillWidth={fillWidth}
          style={{ ...layout.style, ...style }}
          aria-label={text ? undefined : "Trademark"}
        >
          {content}
        </Flex>
      );
    }
  };

  return enableContext ? (
    <Dropdown openOn="contextmenu" trigger={renderLogo()} placement="bottom-start">
      {renderDropdownContent()}
    </Dropdown>
  ) : (
    renderLogo()
  );
};

Logo.displayName = "Logo";

export { Logo };
