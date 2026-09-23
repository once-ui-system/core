"use client";

import type React from "react";
import type { IconName } from "../../icons";
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
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

  return (
    <Flex fitHeight className={className} {...rest}>
      {menuGroups.map((group, index) => (
        <Row
          key={`menu-group-${index}`}
          ref={(el) => {
            buttonRefs.current[group.id] = el;
          }}
          paddingRight="8"
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
