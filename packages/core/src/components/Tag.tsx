import classNames from "clsx";
import type React from "react";
import { type MouseEventHandler, type ReactNode, useId } from "react";
import type { IconName } from "../icons.js";
import { InteractiveTag } from "../internal/InteractiveTag.js";
import type { TextVariant, Tone, TShirtSizes } from "../types.js";
import { Arrow } from "./Arrow.js";
import type { Flex } from "./Flex.js";
import { Icon } from "./Icon.js";
import type { IconButtonProps } from "./IconButton.js";
import { Row } from "./Row.js";
import { SmartLink } from "./SmartLink.js";
import styles from "./Tag.module.scss";
import { Text } from "./Text.js";

/**
 * A compact label. 3.0 folds 2.x's Badge and Chip into it:
 *
 * - a static label, the 2.x Tag;
 * - `variant="announce"`, with `href`, `arrow` and `effect`: the pill that
 *   announces something, usually as a link (2.x's Badge);
 * - `selected` or `onRemove`: a toggle with `aria-pressed` and an optional
 *   remove button (2.x's Chip). An `onClick` without `selected` keeps the
 *   static look, as on 2.x's Tag.
 */
export interface TagProps extends Omit<React.ComponentProps<typeof Flex>, "onClick"> {
  /**
   * The palette. Defaults to `neutral` on a static tag and to `brand` on an
   * announcement and on a selected toggle. 2.x called this `scheme`.
   */
  tone?: Tone;
  /**
   * How the tag looks: `default`, `gradient` (2.x's `scheme="gradient"`) or
   * `announce`, the pill with a shine (2.x's Badge).
   */
  variant?: "default" | "gradient" | "announce";
  /**
   * Left out, the theme's `density` picks it: s when compact, m when normal
   * (the default), l when spacious. A size given here always wins.
   */
  size?: TShirtSizes;
  label?: string;
  prefixIcon?: IconName;
  suffixIcon?: IconName;
  /** Makes the tag a link. */
  href?: string;
  /** An arrow that slides in on hover. Defaults to true with `href`. */
  arrow?: boolean;
  /** A shine that sweeps across now and then. Defaults to true on `announce`. */
  effect?: boolean;
  /** Makes the tag a toggle, pressed when true. Defaults to false. */
  selected?: boolean;
  /** Called on a click; with `selected`, also on Enter and Space, as a toggle. */
  onClick?: MouseEventHandler<HTMLDivElement>;
  /** Adds a remove button. Removing is never a click on the tag. */
  onRemove?: () => void;
  /** Props for the remove button, such as its `aria-label`. 2.x's Chip `iconButtonProps`. */
  removeButtonProps?: Partial<IconButtonProps>;
  children?: ReactNode;
}

/** Padding, text and icon per size and look. s, m and l are 2.x's Tag; announce m is 2.x's Badge. */
const LOOK = {
  default: {
    paddingX: { xs: "4", s: "8", m: "8", l: "12", xl: "16" },
    paddingY: { xs: "0", s: "1", m: "2", l: "4", xl: "8" },
    text: {
      xs: "label-default-xs",
      s: "label-default-s",
      m: "label-default-s",
      l: "label-default-s",
      xl: "label-default-m",
    },
  },
  announce: {
    paddingX: { xs: "8", s: "12", m: "20", l: "24", xl: "32" },
    paddingY: { xs: "4", s: "8", m: "12", l: "16", xl: "20" },
    text: {
      xs: "label-strong-xs",
      s: "label-strong-s",
      m: "label-strong-s",
      l: "label-strong-m",
      xl: "label-strong-l",
    },
  },
} as const;

const ICON = { xs: "xs", s: "xs", m: "xs", l: "xs", xl: "s" } as const;
const ANNOUNCE_ICON = { xs: "xs", s: "xs", m: "s", l: "s", xl: "m" } as const;

const Tag = ({
  ref,
  tone,
  variant = "default",
  size: sizeProp,
  label = "",
  prefixIcon,
  suffixIcon,
  href,
  arrow: arrowProp,
  effect = variant === "announce",
  selected,
  onClick,
  onRemove,
  removeButtonProps,
  textVariant,
  className,
  style,
  children,
  ...rest
}: TagProps) => {
  const arrowId = useId();
  // Left out, the size is m, restyled by the theme's `density` in CSS.
  const size = sizeProp ?? "m";
  const auto = sizeProp === undefined;
  const iconClass = auto ? styles.icon : undefined;
  const arrow = arrowProp ?? href !== undefined;

  if (!href && (selected !== undefined || onRemove)) {
    const toggle = { selected, onClick, onRemove, removeButtonProps };
    return (
      <InteractiveTag
        ref={ref}
        tone={tone}
        size={sizeProp}
        label={label}
        prefixIcon={prefixIcon}
        suffixIcon={suffixIcon}
        textVariant={textVariant}
        className={className}
        style={style}
        {...toggle}
        {...rest}
      >
        {children}
      </InteractiveTag>
    );
  }

  const announce = variant === "announce";
  const gradient = variant === "gradient";
  const look = LOOK[announce ? "announce" : "default"];
  const palette = tone ?? (announce ? "brand" : "neutral");
  // A link tag's pointer handler, passed through for the caller.
  const pointer = onClick
    ? { onClick: onClick as unknown as React.MouseEventHandler<HTMLAnchorElement> }
    : {};

  // A static tag with onClick is a button in the tag's own look (2.x's
  // clickable Tag): focusable, pressed by Enter and Space, not a toggle.
  const button =
    onClick && !href
      ? {
          onClick,
          role: "button",
          tabIndex: 0,
          cursor: "interactive" as const,
          onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            e.preventDefault();
            onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
          },
        }
      : {};

  const box = (
    <Row
      fitWidth
      background={announce ? "neutral-weak" : gradient ? undefined : `${palette}-weak`}
      border={
        announce ? `${palette}-alpha-medium` : gradient ? "brand-medium" : `${palette}-alpha-medium`
      }
      onBackground={announce ? `${palette}-strong` : gradient ? undefined : `${palette}-medium`}
      paddingX={look.paddingX[size]}
      paddingY={look.paddingY[size]}
      vertical="center"
      radius={announce ? "full" : "s"}
      gap={announce ? undefined : "4"}
      textVariant={announce ? (textVariant ?? look.text[size]) : undefined}
      ref={ref}
      data-tag-arrow={arrow ? arrowId : undefined}
      className={classNames(
        styles.tag,
        auto && styles.auto,
        gradient ? styles.gradient : undefined,
        effect ? styles.shine : undefined,
        announce ? styles.announce : undefined,
        className,
      )}
      style={style}
      {...button}
      {...rest}
    >
      {prefixIcon &&
        (announce ? (
          <Icon
            marginRight="8"
            size={ANNOUNCE_ICON[size]}
            className={iconClass}
            name={prefixIcon}
            onBackground={`${palette}-medium`}
          />
        ) : (
          <Icon name={prefixIcon} size={ICON[size]} className={iconClass} />
        ))}
      {announce ? (
        // As 2.x's Badge: the text sits in the pill itself, so children
        // lay out with the pill's own gap and padding.
        label || children
      ) : (
        <Row style={{ userSelect: "none" }} vertical="center">
          <Text textVariant={textVariant ?? look.text[size]}>{label || children}</Text>
        </Row>
      )}
      {suffixIcon && <Icon name={suffixIcon} size={ICON[size]} className={iconClass} />}
      {/* The arrow follows hover on this tag only: each one has its own id. */}
      {arrow && <Arrow trigger={`[data-tag-arrow="${arrowId}"]`} />}
    </Row>
  );

  if (!href) return box;

  return (
    <SmartLink
      unstyled
      href={href}
      style={{ borderRadius: announce ? "var(--radius-full)" : "var(--radius-s)" }}
      {...pointer}
    >
      {box}
    </SmartLink>
  );
};

Tag.displayName = "Tag";

export { Tag };
