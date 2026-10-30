import classNames from "clsx";
import { forwardRef, type ReactNode } from "react";
import type { ColorScheme } from "../types";
import styles from "./Banner.module.scss";
import { BannerClose } from "./BannerClose";
import { Row } from "./Row";

interface BannerProps extends React.ComponentProps<typeof Row> {
  /** `solid` is a flat brand strip; `mesh` is a soft, blurred gradient wash
   *  from the theme's colour scales, for launch and announcement strips. */
  variant?: "solid" | "mesh";
  /** Up to three colour scales the mesh is drawn from. Default brand, accent, brand. */
  meshColors?: ColorScheme[];
  /** An inline, underlined call to action after the message. */
  link?: { label: ReactNode; href: string };
  /** Shows a dismiss button. Hides the banner until the next page load. */
  dismissible?: boolean;
  /** Remembers the dismissal in the browser under this key (implies
   *  `dismissible`). Change the key for a new announcement. */
  dismissKey?: string;
  /** The dismiss button's accessible name. Defaults to an English "dismiss announcement" label. */
  dismissLabel?: string;
}

const safeKey = (key: string) => key.replace(/[^\w-]/g, "-");

const Banner = forwardRef<HTMLDivElement, BannerProps>(
  (
    {
      children,
      variant = "solid",
      meshColors,
      link,
      dismissible,
      dismissKey,
      dismissLabel,
      className,
      style,
      ...flex
    },
    ref,
  ) => {
    const key = dismissKey ? safeKey(dismissKey) : undefined;
    const canDismiss = dismissible || !!key;
    const mesh = variant === "mesh";
    const [c1 = "brand", c2 = "accent", c3 = c1] = meshColors ?? [];

    return (
      <Row
        fillWidth
        paddingX={canDismiss ? "48" : "16"}
        paddingY={mesh ? "12" : "8"}
        {...(mesh
          ? { onBackground: "neutral-strong" as const }
          : // A caller's own background replaces the brand strip rather than fighting it.
            !flex.background &&
            !flex.onBackground && {
              solid: "brand-medium" as const,
              onSolid: "brand-strong" as const,
            })}
        textVariant="label-default-s"
        align="center"
        center
        gap="12"
        ref={ref}
        data-banner=""
        data-banner-key={key}
        className={classNames(mesh && styles.mesh, className)}
        style={
          mesh
            ? ({
                "--banner-mesh-1": `var(--function-${c1}-600)`,
                "--banner-mesh-2": `var(--function-${c2}-600)`,
                "--banner-mesh-3": `var(--function-${c3}-500)`,
                ...style,
              } as React.CSSProperties)
            : style
        }
        {...flex}
      >
        {key && (
          // Hides a remembered dismissal before paint: ThemeInit copies the
          // dismissed keys onto <html> from browser storage.
          <style>{`html[data-banner-dismissed~="${key}"] [data-banner-key="${key}"]{display:none!important}`}</style>
        )}
        {link ? (
          <span className={styles.content}>
            {children}{" "}
            <a className={styles.link} href={link.href}>
              {link.label}
            </a>
          </span>
        ) : (
          children
        )}
        {canDismiss && (
          <BannerClose dismissKey={key} label={dismissLabel ?? "Dismiss announcement"} />
        )}
      </Row>
    );
  },
);

Banner.displayName = "Banner";

export type { BannerProps };
export { Banner };
