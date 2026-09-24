"use client";

import type React from "react";
import type { IconName } from "../../icons";
import { type ReactNode, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Column, Flex, Icon, Row, Text, ToggleButton } from "../../";
import { useAdapters } from "../../contexts/AdapterProvider";
import styles from "./MegaMenu.module.scss";

export interface MenuLink {
  label: ReactNode;
  href: string;
  icon?: IconName;
  description?: ReactNode;
  selected?: boolean;
}

export interface MenuSection {
  title?: ReactNode;
  links: MenuLink[];
}

export interface MenuGroup {
  id: string;
  label: ReactNode;
  suffixIcon?: IconName;
  href?: string;
  selected?: boolean;
  sections?: MenuSection[];
  content?: ReactNode;
}

export interface MegaMenuProps extends React.ComponentProps<typeof Flex> {
  menuGroups: MenuGroup[];
  className?: string;
}

/**
 * What the panel adds around its content: the surface wrapper's `padding="12"`
 * on each side and its 1px border on each side. The clipping box is exactly the
 * surface, so this is all of it — anything else that ends up between the two
 * belongs here too, or the panel will be short by that much.
 */
const DROPDOWN_CHROME = 26;

/** What a keyboard can land on inside a panel, custom `content` included. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const MegaMenu: React.FC<MegaMenuProps> = ({ menuGroups, className, ...rest }) => {
  const { usePathname } = useAdapters();
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, width: 0, height: 0 });
  const [isFirstAppearance, setIsFirstAppearance] = useState(true);
  const previousDropdownRef = useRef<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const measureTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const rootRef = useRef<HTMLDivElement>(null);
  /** A group whose first link should take focus once its panel has rendered. */
  const focusOnOpenRef = useRef<string | null>(null);
  const idBase = useId();
  const panelId = (groupId: string) => `${idBase}-panel-${groupId}`;

  useEffect(() => {
    if (activeDropdown && buttonRefs.current[activeDropdown]) {
      const buttonElement = buttonRefs.current[activeDropdown];
      if (buttonElement) {
        const rect = buttonElement.getBoundingClientRect();
        const parentRect = buttonElement.parentElement?.getBoundingClientRect() || { left: 0 };

        // Set initial position immediately
        setDropdownPosition({
          left: rect.left - parentRect.left,
          width: 300,
          height: 200, // Default height
        });

        // Measure content dimensions after render - use double RAF for layout completion
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (dropdownRef.current) {
              const dropdown = dropdownRef.current;

              // Find the active content row
              const activeContent = contentRefs.current[activeDropdown];

              if (activeContent) {
                /*
                 * Two passes, because the height depends on the width.
                 *
                 * This used to be one: everything was set to `max-content` and
                 * both dimensions were read together. At `max-content` nothing
                 * wraps, so the height that came back was the height of text
                 * laid out on one line — but the panel is then locked to the
                 * measured *width*, where that text does wrap. The content grew,
                 * the box did not, and `overflow: hidden` took the difference off
                 * the bottom. The last section of a tall panel disappeared.
                 *
                 * Restoring the fill-width children reaches the same failure by
                 * its own route. They are forced to `max-content` for the
                 * measurement and put back afterwards, so a button measured at
                 * its natural width can come back narrower, wrap its label, and
                 * add a line that the recorded height never included.
                 *
                 * So: measure the width with everything unconstrained, put the
                 * panel at that width with the children back as they were, let
                 * it reflow, and only then read the height. The second read sees
                 * the layout the panel will actually be displayed in.
                 */
                const fillWidthButtons = activeContent.querySelectorAll(
                  '[class*="fill-width"]',
                ) as NodeListOf<HTMLElement>;
                const originalWidths: string[] = [];

                fillWidthButtons.forEach((button, index) => {
                  originalWidths[index] = button.style.width;
                  button.style.width = "max-content";
                });

                // Temporarily remove constraints to measure natural size
                const originalHeight = dropdown.style.height;
                const originalWidth = dropdown.style.width;
                const originalOverflow = dropdown.style.overflow;
                const originalTransition = activeContent.style.transition;
                const originalTransform = activeContent.style.transform;

                /*
                 * Measure the panel's layout, not the frame of the open
                 * animation this happens to land on.
                 *
                 * A panel animates in from `scale(0.9)`, and this runs a couple
                 * of frames into that transition — so the box the panel draws
                 * right now is around nine tenths of the box it is going to
                 * settle at. Anything read from `getBoundingClientRect` is
                 * scaled with it, and which fraction you get depends on where
                 * the frame lands, which is not a thing to size a panel from.
                 * Switching the transform off for the measurement makes the
                 * numbers describe the layout; the transition goes off with it
                 * so putting the transform back does not re-run the animation.
                 */
                activeContent.style.transition = "none";
                activeContent.style.transform = "none";

                dropdown.style.height = "auto";
                dropdown.style.width = "max-content";
                dropdown.style.overflow = "visible";

                // Force reflow
                dropdown.offsetHeight;

                /*
                 * Pass one: width, with everything unconstrained.
                 *
                 * `scrollWidth` is rounded to an integer and a max-content width
                 * is rarely whole, so on its own it can hand the content a
                 * fraction of a pixel less than it asked for. Taking the larger
                 * of it and the ceiling of the real box rounds the panel up
                 * instead of down.
                 */
                const contentWidth = Math.max(
                  activeContent.scrollWidth,
                  Math.ceil(activeContent.getBoundingClientRect().width),
                );
                const width = contentWidth + DROPDOWN_CHROME;

                // Restore the children before the height is read rather than
                // after: their real widths are part of what the height is.
                fillWidthButtons.forEach((button, index) => {
                  button.style.width = originalWidths[index];
                });

                /*
                 * Pass two: height, at the width the panel is about to be given
                 * and with its children back as they were. `height` is still
                 * `auto`, so the content is free to be as tall as that makes it.
                 */
                dropdown.style.width = `${width}px`;

                // Force reflow
                dropdown.offsetHeight;

                const contentHeight = Math.max(
                  activeContent.offsetHeight,
                  Math.ceil(activeContent.getBoundingClientRect().height),
                );

                // Restore original dimensions
                dropdown.style.height = originalHeight;
                dropdown.style.width = originalWidth;
                dropdown.style.overflow = originalOverflow;

                // Put the transform back and flush it while the transition is
                // still off, so the panel does not animate a second time.
                activeContent.style.transform = originalTransform;
                activeContent.offsetHeight;
                activeContent.style.transition = originalTransition;

                setDropdownPosition({
                  left: rect.left - parentRect.left,
                  width,
                  height: contentHeight + DROPDOWN_CHROME,
                });
              }
            }
          });
        });
      }
    } else {
      // Reset first appearance flag when dropdown is closed
      setIsFirstAppearance(true);
    }

    return () => {
      if (measureTimeoutRef.current) {
        clearTimeout(measureTimeoutRef.current);
      }
    };
  }, [activeDropdown]);

  // Reset animation flag after animation completes
  useEffect(() => {
    if (activeDropdown !== null) {
      const timer = setTimeout(() => {
        setIsFirstAppearance(false);
      }, 300); // Match animation duration

      return () => clearTimeout(timer);
    }
  }, [activeDropdown]);

  // Close dropdown when pathname changes (navigation occurs)
  useEffect(() => {
    setActiveDropdown(null);
  }, [pathname]);

  // Check if a menu item should be selected based on the current path
  const isSelected = useCallback(
    (href?: string) => {
      if (!href || !pathname) return false;
      return pathname.startsWith(href);
    },
    [pathname],
  );

  // Filter groups to only show those with sections or custom content in the dropdown
  const dropdownGroups = useMemo(
    () => menuGroups.filter((group) => group.sections || group.content),
    [menuGroups],
  );

  // Add click handler to close dropdown when clicking on links
  const handleLinkClick = useCallback(() => {
    setActiveDropdown(null);
  }, []);

  /*
   * Keyboard access.
   *
   * The panel is one shared element rendered after every trigger, so it is
   * never next to the trigger that opened it in the tab order. The handlers
   * below stitch the two together, following the disclosure navigation
   * pattern: a trigger without an `href` is a real button that toggles its
   * panel; Tab from an open trigger goes into the panel, Shift+Tab from its
   * first item comes back, Tab from its last item moves on to the next
   * trigger, and Escape closes it and returns focus to the trigger. ArrowDown
   * opens a panel and focuses its first item; the arrows move within one.
   */
  const triggerOf = useCallback(
    (groupId: string) =>
      buttonRefs.current[groupId]?.querySelector<HTMLElement>("a[href], button") ?? null,
    [],
  );

  const panelItems = useCallback((groupId: string) => {
    const content = contentRefs.current[groupId];
    if (!content) return [];
    return Array.from(content.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (item) => item.getClientRects().length > 0 && getComputedStyle(item).visibility !== "hidden",
    );
  }, []);

  // Focus the first item once a panel opened from the keyboard has rendered.
  useEffect(() => {
    if (!activeDropdown || focusOnOpenRef.current !== activeDropdown) return;
    const frame = requestAnimationFrame(() => {
      focusOnOpenRef.current = null;
      panelItems(activeDropdown)[0]?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [activeDropdown, panelItems]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const inPanel = Boolean(dropdownRef.current?.contains(target));

    if (event.key === "Escape" && activeDropdown) {
      event.preventDefault();
      const groupId = activeDropdown;
      setActiveDropdown(null);
      if (inPanel) triggerOf(groupId)?.focus();
      return;
    }

    const group = menuGroups.find((g) => buttonRefs.current[g.id]?.contains(target));
    if (group) {
      if (!(group.sections || group.content)) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (activeDropdown === group.id) {
          panelItems(group.id)[0]?.focus();
        } else {
          focusOnOpenRef.current = group.id;
          setActiveDropdown(group.id);
        }
      } else if (event.key === "Tab" && !event.shiftKey && activeDropdown === group.id) {
        const first = panelItems(group.id)[0];
        if (first) {
          event.preventDefault();
          first.focus();
        }
      }
      return;
    }

    if (!inPanel || !activeDropdown) return;
    const items = panelItems(activeDropdown);
    const index = items.findIndex((item) => item === target || item.contains(target));

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      items[(index + step + items.length) % items.length]?.focus();
    } else if (event.key === "Tab") {
      if (event.shiftKey && index === 0) {
        event.preventDefault();
        triggerOf(activeDropdown)?.focus();
      } else if (!event.shiftKey && index === items.length - 1) {
        const position = menuGroups.findIndex((g) => g.id === activeDropdown);
        const next = menuGroups
          .slice(position + 1)
          .map((g) => triggerOf(g.id))
          .find(Boolean);
        setActiveDropdown(null);
        // The panel is last in the DOM, so with no trigger after this one the
        // browser's own Tab already leaves the menu for whatever follows it.
        if (next) {
          event.preventDefault();
          next.focus();
        }
      }
    }
  };

  // Close when focus moves somewhere else on the page. A null `relatedTarget`
  // is a click on something unfocusable, often inside the panel itself, and is
  // left to the pointer handlers.
  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (next && !rootRef.current?.contains(next)) setActiveDropdown(null);
  };

  return (
    <Flex
      ref={rootRef}
      fitHeight
      className={className}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      {...rest}
    >
      {menuGroups.map((group, index) => (
        <Row
          key={`menu-group-${index}`}
          ref={(el) => {
            buttonRefs.current[group.id] = el;
          }}
          paddingRight="8"
          onFocus={(event) => {
            const hasDropdown = Boolean(group.sections || group.content);
            // Moving to another trigger shuts the panel that is open.
            if (activeDropdown && activeDropdown !== group.id) setActiveDropdown(null);
            // A trigger that is also a link cannot toggle on Enter, which
            // navigates, so it opens its panel when the keyboard reaches it.
            if (
              hasDropdown &&
              group.href &&
              (event.target as HTMLElement).matches?.(":focus-visible")
            ) {
              setActiveDropdown(group.id);
            }
          }}
          onMouseEnter={() => {
            // Cancel any pending close
            if (closeTimeoutRef.current) {
              clearTimeout(closeTimeoutRef.current);
            }

            if (group.sections || group.content) {
              // Use requestAnimationFrame to ensure this runs after any pending close
              requestAnimationFrame(() => {
                setActiveDropdown(group.id);
              });
            } else {
              // Close dropdown if hovering over item without dropdown content
              setActiveDropdown(null);
            }
          }}
          onMouseLeave={() => {
            // Start a timer to close the dropdown
            closeTimeoutRef.current = setTimeout(() => {
              setActiveDropdown(null);
            }, 100);
          }}
        >
          <ToggleButton
            selected={group.selected !== undefined ? group.selected : isSelected(group.href)}
            href={group.href}
            {...(group.sections || group.content
              ? {
                  "aria-expanded": activeDropdown === group.id,
                  "aria-controls": activeDropdown === group.id ? panelId(group.id) : undefined,
                  /*
                   * Without an `href` the trigger has to be a button, or it
                   * renders as a div that no keyboard can reach. A click from
                   * the keyboard (`detail` 0) toggles; a pointer click only
                   * opens, because hovering has usually opened the panel
                   * already and a toggle would shut it again.
                   */
                  ...(group.href
                    ? {}
                    : {
                        type: "button" as const,
                        onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
                          if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
                          const open = activeDropdown === group.id;
                          setActiveDropdown(event.detail === 0 && open ? null : group.id);
                        },
                      }),
                }
              : {})}
          >
            {group.label}
            {(group.sections || group.content) && group.suffixIcon && (
              <Icon marginLeft="8" name={group.suffixIcon} size="xs" />
            )}
          </ToggleButton>
        </Row>
      ))}

      {/*
          This element both clips and casts the shadow, and that pairing is
          deliberate. `overflow: hidden` is what keeps the panel's contents
          inside the box while its width and height animate between two groups
          of different size; an element's own `box-shadow`, unlike its
          descendants, is not clipped by its own overflow. Put the shadow on
          the surface inside instead and this box cuts it off at the panel's
          edge, which is what it used to do.

          That is also why there is no `paddingTop` here any more and `top` is
          the full 40 instead: the clipping box has to be exactly the surface
          for their rounded corners to coincide.
      */}
      {activeDropdown && (
        <Row
          ref={dropdownRef}
          position="absolute"
          pointerEvents="auto"
          opacity={100}
          overflow="hidden"
          radius="l"
          shadow="xl"
          top="40"
          className={isFirstAppearance ? styles.dropdown : ""}
          style={{
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            height: `${dropdownPosition.height}px`,
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            visibility: "visible",
          }}
          onMouseEnter={() => {
            // Cancel the close timer if we re-enter
            if (closeTimeoutRef.current) {
              clearTimeout(closeTimeoutRef.current);
            }
          }}
          onMouseLeave={() => {
            // Start a timer to close the dropdown
            closeTimeoutRef.current = setTimeout(() => {
              setActiveDropdown(null);
            }, 100);
          }}
        >
          <Row
            background="surface"
            radius="l"
            border="neutral-alpha-weak"
            padding="12"
            gap="32"
            data-dropdown-wrapper
            style={{
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {/* Render all dropdown contents, but only show the active one */}
            {dropdownGroups.map((group, groupIndex) => {
              const isActive = activeDropdown === group.id;
              const wasActive = previousDropdownRef.current === group.id;
              // Exiting: was active previously but not active now
              const isExiting = wasActive && !isActive;
              // Animate only when switching between dropdowns (not when first opening or returning to same)
              const shouldAnimate = (isActive || isExiting) && previousDropdownRef.current !== null;

              // Update previous ref when active changes
              if (isActive && !wasActive) {
                previousDropdownRef.current = group.id;
              } else if (!activeDropdown) {
                previousDropdownRef.current = null;
              }

              return (
                <Row
                  key={`dropdown-content-${groupIndex}`}
                  id={panelId(group.id)}
                  gap="16"
                  position={isActive ? "relative" : "absolute"}
                  data-dropdown-content
                  ref={(el) => {
                    contentRefs.current[group.id] = el;
                  }}
                  style={{
                    zIndex: isExiting ? 3 : isActive ? 2 : 1,
                    transform: isActive ? "scale(1)" : "scale(0.9)",
                    opacity: isActive ? 1 : isExiting ? 0 : 0,
                    pointerEvents: isActive ? "auto" : "none",
                    transition: shouldAnimate
                      ? "opacity 240ms ease, transform 240ms cubic-bezier(0.4, 0, 0.2, 1)"
                      : "opacity 200ms ease",
                    transitionDelay: shouldAnimate ? (isActive ? "120ms" : "0ms") : "0ms",
                    visibility: isActive || isExiting ? "visible" : "hidden",
                  }}
                >
                  {/* Render custom content if provided, otherwise render sections */}
                  {group.content
                    ? group.content
                    : group.sections?.map((section, sectionIndex) => (
                        <Column key={`section-${sectionIndex}`} minWidth={12} gap="4">
                          {section.title && (
                            <Text
                              marginLeft="8"
                              marginBottom="12"
                              marginTop="12"
                              onBackground="neutral-weak"
                              variant="label-default-s"
                            >
                              {section.title}
                            </Text>
                          )}
                          {section.links.map((link, linkIndex) => (
                            <ToggleButton
                              key={`link-${linkIndex}`}
                              style={{
                                height: "auto",
                                minHeight: "fit-content",
                                paddingLeft: "var(--static-space-0)",
                                paddingTop: "var(--static-space-4)",
                                paddingBottom: "var(--static-space-4)",
                                paddingRight: "var(--static-space-12)",
                              }}
                              fillWidth
                              horizontal="start"
                              href={link.href}
                              onClick={handleLinkClick}
                            >
                              <Row gap="12">
                                {link.icon && (
                                  <Icon
                                    name={link.icon}
                                    size="s"
                                    padding="8"
                                    radius="s"
                                    border="neutral-alpha-weak"
                                  />
                                )}
                                <Column gap="4">
                                  {link.label && (
                                    <Text onBackground="neutral-strong" variant="label-strong-s">
                                      {link.label}
                                    </Text>
                                  )}
                                  {link.description && (
                                    <Text onBackground="neutral-weak" truncate>
                                      {link.description}
                                    </Text>
                                  )}
                                </Column>
                              </Row>
                            </ToggleButton>
                          ))}
                        </Column>
                      ))}
                </Row>
              );
            })}
          </Row>
        </Row>
      )}
    </Flex>
  );
};

MegaMenu.displayName = "MegaMenu";
