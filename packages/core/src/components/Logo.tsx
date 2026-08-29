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

interface LogoProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  className?: string;
  size?: TShirtSizes;
  style?: React.CSSProperties;
  icon?: string;
  wordmark?: string;
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

    const content = (
      <>
        {icon && (
          <img
            style={{
              height: `var(--static-space-${sizeMap[size]})`,
              width: "auto",
            }}
            alt="Trademark"
            src={icon as string}
          />
        )}
        {wordmark && (
          <img
            style={{
              height: `var(--static-space-${sizeMap[size]})`,
              width: "auto",
            }}
            alt="Trademark"
            src={wordmark as string}
          />
        )}
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
        const response = await fetch(icon);
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
        const response = await fetch(wordmark);
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
