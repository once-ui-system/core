"use client";

import { cva } from "class-variance-authority";
import Link from "next/link";
import { type CSSProperties, forwardRef, useContext, useEffect } from "react";
import { generateClasses } from "../classes/generator";
import { cn } from "../classes/utils";
import { ToastContext } from "../contexts/ToastProvider";
import type { TShirtSizes } from "../types";
import { Column } from "./Column";
import { ContextMenu } from "./ContextMenu";
import { Icon } from "./Icon";
import { Line } from "./Line";
import { Option } from "./Option";

export const logoVariants = cva("w-auto", {
  variants: {
    size: {
      xs: "h-20",
      s: "h-24",
      m: "h-32",
      l: "h-40",
      xl: "h-48",
    },
  },
  defaultVariants: {
    size: "m",
  },
});

export interface LogoProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  className?: string;
  size?: TShirtSizes;
  style?: CSSProperties;
  icon?: string;
  wordmark?: string;
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
      className,
      style,
      dark,
      light,
      brand,
      ...props
    },
    ref,
  ) => {
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
            className={logoVariants({ size })}
            alt="Trademark"
            src={icon}
          />
        )}
        {wordmark && (
          <img
            className={logoVariants({ size })}
            alt="Trademark"
            src={wordmark}
          />
        )}
      </>
    );

    const toast = useContext(ToastContext);

    const copyIconToClipboard = async () => {
      if (!icon) {
        toast?.addToast({
          variant: "danger",
          message: "No icon available to copy",
        });
        return;
      }

      try {
        const response = await fetch(icon);
        const svgText = await response.text();
        await navigator.clipboard.writeText(svgText);

        toast?.addToast({
          variant: "success",
          message: "Icon copied to clipboard as SVG",
        });
      } catch (error) {
        toast?.addToast({
          variant: "danger",
          message: "Failed to copy icon to clipboard",
        });
        console.error("Error copying icon:", error);
      }
    };

    const copyWordmarkToClipboard = async () => {
      if (!wordmark) {
        toast?.addToast({
          variant: "danger",
          message: "No wordmark available to copy",
        });
        return;
      }

      try {
        const response = await fetch(wordmark);
        const svgText = await response.text();
        await navigator.clipboard.writeText(svgText);

        toast?.addToast({
          variant: "success",
          message: "Wordmark copied to clipboard as SVG",
        });
      } catch (error) {
        toast?.addToast({
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
                hasPrefix={<Logo size="xs" icon={icon} style={{ opacity: 0.5 }} />}
                onClick={copyIconToClipboard}
              />
            )}
            {brand?.copy && wordmark && (
              <Option
                value="copy-wordmark"
                label="Copy wordmark as SVG"
                hasPrefix={<Icon size="xs" onBackground="neutral-weak" name="wordmark" />}
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
                  hasPrefix={<Icon size="xs" onBackground="neutral-weak" name="arrowUpRight" />}
                  href={brand.url}
                />
              </Column>
            </>
          )}
        </Column>
      );
    };

    const enableContext = Boolean(brand && ((brand.copy && (icon || wordmark)) || brand.url));

    const classes = cn(
      generateClasses({
        display: "flex",
        dark,
        light,
        radius: "l",
        fitHeight: true,
      }),
      className,
    );

    const renderLogo = () => {
      if (href) {
        return (
          <Link
            ref={ref as unknown as React.Ref<HTMLAnchorElement>}
            href={href}
            style={style}
            className={classes}
            aria-label="Trademark"
            {...props}
          >
            {content}
          </Link>
        );
      }

      return (
        <div
          ref={ref}
          style={style}
          className={classes}
          aria-label="Trademark"
          {...(props as React.HTMLAttributes<HTMLDivElement>)}
        >
          {content}
        </div>
      );
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
