"use client";

import classNames from "clsx";
import type React from "react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { DEFAULT_BREAKPOINTS } from "../contexts/LayoutProvider.js";
import { getFocusableElements } from "../internal/focusable.js";
import { useScopeAttributes } from "../internal/scopeAttributes.js";
import { useControllableState } from "../internal/useControllableState.js";
import { Column } from "./Column.js";
import styles from "./HeaderMenu.module.scss";
import { NavIcon } from "./NavIcon.js";
import { Row } from "./Row.js";
import { ScrollLock } from "./ScrollLock.js";

interface HeaderMenuProps {
  /** The menu: links, a `MegaMenu collapseBelow="always"`, sections. */
  children?: ReactNode;
  /** Pinned to the bottom of the panel: the page's main call to action. */
  footer?: ReactNode;
  /** Whether the menu is open (controlled). */
  open?: boolean;
  /** Whether it starts open. */
  defaultOpen?: boolean;
  /** Called when the menu opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * The menu button shows below this breakpoint and the menu closes above it,
   * where the header's own links take over. Default `"m"`; `false` always shows it.
   */
  below?: "xs" | "s" | "m" | "l" | false;
  /** The button's accessible name. Default "Menu"; set it for a non-English UI. */
  label?: string;
  /** The panel's background. Default `"page"`, so it reads as the header grown down. */
  background?: React.ComponentProps<typeof Column>["background"];
  className?: string;
  style?: React.CSSProperties;
}

/**
 * The phone menu of a landing page header.
 *
 * Put it where the menu button goes, inside the header, usually at the right
 * end of the bar. The header stays put: the button's lines fold into a cross
 * in the same spot, and the menu grows down out of the header as a panel
 * filling the rest of the screen, rows arriving one after another, with
 * `footer` (the main call to action) pinned at its foot. Closing folds it back
 * up into the header.
 * Following a link in it, Escape, or the button again closes it.
 *
 * It is a disclosure, not a dialog: the header stays reachable, page scroll is
 * locked while it is open, Tab moves from the button into the menu and back,
 * and focus returns to the button on Escape. The panel keeps the look of the
 * StyleScope the header sits in.
 */
const HeaderMenu = ({
  children,
  footer,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  below = "m",
  label = "Menu",
  background = "page",
  className,
  style,
}: HeaderMenuProps) => {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const id = useId();
  const panelId = `${id}-menu`;
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [top, setTop] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const scope = useScopeAttributes(triggerRef, open);
  // Kept on screen while it folds away after closing; reduced motion has no
  // fold, so it goes at once.
  const [rendered, setRendered] = useState(open);
  useEffect(() => {
    if (open) {
      setRendered(true);
      return;
    }
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setRendered(false);
      return;
    }
    // In case no animation end arrives (a hidden tab, a test DOM).
    const timer = setTimeout(() => setRendered(false), 400);
    return () => clearTimeout(timer);
  }, [open]);

  // The panel starts where the header ends: the nearest <header> (or the
  // button's row) holding the button, measured while open.
  useLayoutEffect(() => {
    if (!open) return;
    const measure = () => {
      const trigger = triggerRef.current;
      const header = trigger?.closest("header") ?? trigger?.parentElement;
      setTop(Math.max(0, Math.round(header?.getBoundingClientRect().bottom ?? 0)));
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, [open]);

  // Above the breakpoint the header shows its own links: close.
  useEffect(() => {
    if (!below || !open || typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia(`(max-width: ${DEFAULT_BREAKPOINTS[below]}px)`);
    const update = () => {
      if (!query.matches) setOpen(false);
    };
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, [below, open, setOpen]);

  // Into the menu on open, so a keyboard lands on its first link.
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (panel) getFocusableElements(panel)[0]?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const close = useCallback(
    (returnFocus: boolean) => {
      setOpen(false);
      if (returnFocus) triggerRef.current?.focus();
    },
    [setOpen],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) close(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  // The panel lives in a portal at the end of <body>: Tab off either end of
  // it goes back to the button, as if it sat right after it.
  const onPanelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !panelRef.current) return;
    const items = getFocusableElements(panelRef.current);
    const first = items[0];
    const last = items[items.length - 1];
    if (
      (event.shiftKey && document.activeElement === first) ||
      (!event.shiftKey && document.activeElement === last)
    ) {
      event.preventDefault();
      triggerRef.current?.focus();
    }
  };

  const onTriggerKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (open && event.key === "Tab" && !event.shiftKey && panelRef.current) {
      const first = getFocusableElements(panelRef.current)[0];
      if (first) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  const hidden = below ? { hide: true as const, [below]: { hide: false } } : {};

  return (
    <>
      <Row {...hidden} className={className} style={style}>
        <NavIcon
          ref={triggerRef}
          active={open}
          aria-label={label}
          aria-controls={open ? panelId : undefined}
          onClick={() => setOpen(!open)}
          onKeyDown={onTriggerKeyDown}
        />
      </Row>
      {mounted &&
        (open || rendered) &&
        createPortal(
          <>
            {open && <ScrollLock enabled allowScrollInElement={panelRef} />}
            <Column
              {...scope}
              ref={panelRef}
              id={panelId}
              aria-label={label}
              role="region"
              position="fixed"
              left="0"
              right="0"
              bottom="0"
              zIndex={8}
              background={background}
              className={classNames(styles.panel)}
              data-state={open ? "open" : "closed"}
              aria-hidden={open ? undefined : true}
              style={{ top }}
              onAnimationEnd={(event: React.AnimationEvent<HTMLDivElement>) => {
                if (!open && event.target === event.currentTarget) setRendered(false);
              }}
              onKeyDown={onPanelKeyDown}
              onClickCapture={(event: React.MouseEvent<HTMLDivElement>) => {
                if ((event.target as HTMLElement).closest?.("a[href]")) close(false);
              }}
            >
              <Column
                fillWidth
                flex={1}
                overflowY="auto"
                padding="12"
                gap="4"
                className={styles.body}
              >
                {children}
              </Column>
              {footer && (
                <Column as="footer" fillWidth padding="16" gap="8" className={styles.footer}>
                  {footer}
                </Column>
              )}
            </Column>
          </>,
          document.body,
        )}
    </>
  );
};

HeaderMenu.displayName = "HeaderMenu";

export type { HeaderMenuProps };
export { HeaderMenu };
