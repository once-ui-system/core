"use client";

import classNames from "clsx";
import type React from "react";
import { forwardRef, useEffect } from "react";
import { useAdapters, useToast } from "../contexts";
import type { SpacingToken, TShirtSizes } from "../types";
import { Column, ContextMenu, Flex, Icon, Line, Option } from ".";

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

interface LogoProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  className?: string;
  size?: TShirtSizes;
  style?: React.CSSProperties;
  icon?: LogoSource;
  wordmark?: LogoSource;
  href?: string;
  dark?: boolean;
  light?: boolean;
  brand?: { copy?: boolean; url?: string };
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ size = "m", href, icon, wordmark, className, style, dark, light, brand, ...props }, ref) => {
    useEffect(() => {
      if (!icon && !wordmark) {
        console.warn(
          "Both 'icon' and 'wordmark' props are set to false. The logo will not render any content.",
        );
      }
    }, [icon, wordmark]);

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

    const renderSource = (source: LogoSource | undefined) => {
      if (!source) return null;
      const imgStyle = {
        height: `var(--static-space-${sizeMap[size]})`,
        width: "auto",
      };
      if (typeof source === "string") {
        return <img style={imgStyle} alt="Trademark" src={source} />;
      }
      return (
        <>
          <img className="light-flex" style={imgStyle} alt="Trademark" src={source.light} />
          <img className="dark-flex" style={imgStyle} alt="Trademark" src={source.dark} />
        </>
      );
    };

    const content = (
      <>
        {renderSource(icon)}
        {renderSource(wordmark)}
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
            aria-label="Trademark"
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
            aria-label="Trademark"
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
