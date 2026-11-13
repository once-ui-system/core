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
   * How the tag looks: `default`, `gradient` (2.x's `scheme="gradient"`),
   * `announce`, the pill with a beam round its edge (2.x's Badge), or
   * `solid`, filled in its tone (default `neutral`): a status that has to be
   * read across a room, a count on a tab, a label on a map or a photo.
   */
  variant?: "default" | "gradient" | "announce" | "solid";
  /**
   * Left out, the theme's `density` picks it: s when compact, m when normal
   * (the default), l when spacious. A size given here always wins.
   */
  size?: TShirtSizes;
  label?: string;
  prefixIcon?: IconName;
  suffixIcon?: IconName;
  /**
   * A small dot in the tone's colour before the label: the hairline tag's
   * way of showing its tone. Defaults to true on a default tag with a `tone`;
   * `false` hides it. Not drawn on `gradient` or `announce`.
   */
  dot?: boolean;
  /** Makes the tag a link. */
  href?: string;
  /** An arrow that slides in on hover. Defaults to true with `href`. */
  arrow?: boolean;
  /**
   * A short brand-to-accent beam that travels round the edge, faster on
   * hover and still under reduced motion. Defaults to true on `announce`.
   */
  effect?: boolean;
  /** Makes the tag a toggle, pressed when true. Defaults to false. */
  selected?: boolean;
  /** Called on a click; with `selected`, also on Enter and Space, as a toggle. */
  onClick?: MouseEventHandler<HTMLDivElement>;
  /** Adds a remove button. Removing is never a click on the tag. */
  onRemove?: () => void;
  /**
   * With `onRemove`, whether the label is a control of its own, a toggle
   * beside the remove button. Defaults to true when `selected` or `onClick`
   * is given. `false` makes it plain text in the selected look, for a tag
   * whose one action is its removal (TagInput's tags): no extra tab stop
   * that does nothing, and no "pressed" on every tag.
   */
  interactive?: boolean;
  /** Props for the remove button, such as its `aria-label`. 2.x's Chip `iconButtonProps`. */
  removeButtonProps?: Partial<IconButtonProps>;
  /**
   * `"span"` makes the whole tag phrasing content, so it can sit inside a
   * sentence (`<p>Status: <Tag as="span">Beta</Tag></p>`): every element is a
   * span and the tag flows inline. Defaults to `"div"`.
   */
  as?: "div" | "span";
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
  // A compact pill: m is 28px tall, with the padding beside an icon or arrow tightened.
  announce: {
    paddingX: { xs: "8", s: "8", m: "12", l: "16", xl: "20" },
    paddingY: { xs: "2", s: "2", m: "4", l: "8", xl: "12" },
    text: {
      xs: "label-default-xs",
      s: "label-default-s",
      m: "label-default-s",
      l: "label-default-m",
      xl: "label-default-l",
    },
  },
} as const;

const ICON = { xs: "xs", s: "xs", m: "xs", l: "xs", xl: "s" } as const;
const ANNOUNCE_ICON = { xs: "xs", s: "xs", m: "xs", l: "s", xl: "s" } as const;

const Tag = ({
  ref,
  tone,
  variant = "default",
  size: sizeProp,
  label = "",
  prefixIcon,
  suffixIcon,
  dot: dotProp,
  href,
  arrow: arrowProp,
  effect = variant === "announce",
  selected,
  onClick,
  onRemove,
  interactive,
  removeButtonProps,
  textVariant,
  className,
  style,
  children,
  as,
  inline,
  ...rest
}: TagProps) => {
  const arrowId = useId();
  // Left out, the size is m, restyled by the theme's `density` in CSS.
  const size = sizeProp ?? "m";
  const auto = sizeProp === undefined;
  const iconClass = auto ? styles.icon : undefined;
  const arrow = arrowProp ?? href !== undefined;

  if (!href && (selected !== undefined || onRemove)) {
    const toggle = { selected, onClick, onRemove, interactive, removeButtonProps };
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
        as={as}
        inline={inline}
        {...toggle}
        {...rest}
      >
        {children}
      </InteractiveTag>
    );
  }

  // `as="span"` makes the whole tag phrasing content, so it can sit inside a
  // sentence (`<p>Status: <Tag as="span">Beta</Tag></p>`): every element is a
  // span and the tag flows inline. Without it, the div renders as before.
  const phrasing = as === "span";
  const announce = variant === "announce";
  const gradient = variant === "gradient";
  const solidLook = variant === "solid";
  const look = LOOK[announce ? "announce" : "default"];
  const palette = tone ?? (announce ? "brand" : "neutral");
  // The default tag is a neutral hairline; its tone lives in the dot (and a
  // prefix icon), so a table full of statuses stays calm.
  const hairline = !announce && !gradient && !solidLook;
  const dot = hairline && (dotProp ?? tone !== undefined);
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
      // An announcement is a quiet pill on the surface; the icon and the beam
      // carry the colour. A `tone` still tints its edge and text.
      background={announce ? "surface" : undefined}
      border={
        announce
          ? tone
            ? `${tone}-alpha-medium`
            : "neutral-alpha-medium"
          : gradient
            ? "brand-medium"
            : solidLook
              ? "transparent"
              : "neutral-alpha-medium"
      }
      onBackground={
        announce
          ? tone
            ? `${tone}-strong`
            : "neutral-strong"
          : gradient || solidLook
            ? undefined
            : "neutral-strong"
      }
      paddingLeft={announce && prefixIcon ? "8" : look.paddingX[size]}
      paddingRight={announce && arrow ? "8" : look.paddingX[size]}
      paddingY={hairline || solidLook ? "0" : look.paddingY[size]}
      vertical="center"
      radius={announce ? "full" : "s"}
      gap={announce ? "8" : "4"}
      textVariant={announce ? (textVariant ?? look.text[size]) : undefined}
      ref={ref}
      as={as}
      inline={inline ?? (phrasing || undefined)}
      data-tag-arrow={arrow ? arrowId : undefined}
      className={classNames(
        styles.tag,
        auto && styles.auto,
        gradient ? styles.gradient : undefined,
        effect ? styles.beam : undefined,
        announce ? styles.announce : undefined,
        hairline ? styles.hairline : undefined,
        solidLook ? styles.solid : undefined,
        hairline || solidLook ? styles[`size-${size}`] : undefined,
        hairline || solidLook ? styles[`tone-${palette}`] : undefined,
        hairline && onClick ? styles.clickable : undefined,
        className,
      )}
      style={style}
      {...button}
      {...rest}
    >
      {prefixIcon &&
        (announce ? (
          <Icon
            size={ANNOUNCE_ICON[size]}
            className={iconClass}
            name={prefixIcon}
            onBackground={`${palette}-medium`}
          />
        ) : (
          <Icon
            name={prefixIcon}
            size={ICON[size]}
            className={classNames(iconClass, hairline && tone && styles.toneIcon)}
          />
        ))}
      {dot && !prefixIcon && <span aria-hidden="true" className={styles.dot} />}
      {announce ? (
        // As 2.x's Badge: the text sits in the pill itself, so children
        // lay out with the pill's own gap and padding.
        label || children
      ) : (
        <Row as={phrasing ? "span" : undefined} style={{ userSelect: "none" }} vertical="center">
          <Text
            textVariant={textVariant ?? look.text[size]}
            className={hairline || solidLook ? styles.label : undefined}
          >
            {label || children}
          </Text>
        </Row>
      )}
      {suffixIcon && <Icon name={suffixIcon} size={ICON[size]} className={iconClass} />}
      {/* The arrow follows hover on this tag only: each one has its own id. */}
      {arrow && (
        <Arrow trigger={`[data-tag-arrow="${arrowId}"]`} as={phrasing ? "span" : undefined} />
      )}
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
