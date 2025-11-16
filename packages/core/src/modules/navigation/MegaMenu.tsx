"use client";

import React, { useState, useRef, useEffect, ReactNode, useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Flex, Row, Column, Text, Icon, ToggleButton } from "../../";
import styles from "./MegaMenu.module.scss";

export interface MenuLink {
  label: ReactNode;
  href: string;
  icon?: string;
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
  suffixIcon?: string;
  href?: string;
  selected?: boolean;
  sections?: MenuSection[];
  content?: ReactNode;
}

export interface MegaMenuProps extends React.ComponentProps<typeof Flex> {
  menuGroups: MenuGroup[];
  className?: string;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ menuGroups, className, ...rest }) => {
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
                // Find all fillWidth buttons and temporarily override their width
                const fillWidthButtons = activeContent.querySelectorAll('[class*="fill-width"]') as NodeListOf<HTMLElement>;
                const originalWidths: string[] = [];
                
                fillWidthButtons.forEach((button, index) => {
                  originalWidths[index] = button.style.width;
                  button.style.width = 'max-content';
                });
                
                // Temporarily remove constraints to measure natural size
                const originalHeight = dropdown.style.height;
                const originalWidth = dropdown.style.width;
                const originalOverflow = dropdown.style.overflow;
                
                dropdown.style.height = 'auto';
                dropdown.style.width = 'max-content';
                dropdown.style.overflow = 'visible';
                
                // Force reflow
                dropdown.offsetHeight;
                
                // Measure the active content
                const contentWidth = activeContent.scrollWidth; // Use scrollWidth for full content
                const contentHeight = activeContent.offsetHeight;
                
                // Restore button widths
                fillWidthButtons.forEach((button, index) => {
                  button.style.width = originalWidths[index];
                });
                
                // Restore original dimensions
                dropdown.style.height = originalHeight;
                dropdown.style.width = originalWidth;
                dropdown.style.overflow = originalOverflow;
                
                // Add padding for the wrapper (12px on each side) + paddingTop (8px) + border (1px each side)
                setDropdownPosition({
                  left: rect.left - parentRect.left,
                  width: contentWidth + 26, // Add wrapper padding (24) + border (2)
                  height: contentHeight + 34, // Add wrapper padding (24) + paddingTop (8) + border (2)
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
  const isSelected = useCallback((href?: string) => {
    if (!href || !pathname) return false;
    return pathname.startsWith(href);
  }, [pathname]);

  // Filter groups to only show those with sections or custom content in the dropdown
  const dropdownGroups = useMemo(
    () => menuGroups.filter((group) => group.sections || group.content),
    [menuGroups]
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

      {activeDropdown && (
        <Row
          paddingTop="8"
          ref={dropdownRef}
          position="absolute"
          pointerEvents="auto"
          opacity={100}
          overflow="hidden"
          top="32"
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
            shadow="xl"
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
                  {group.content ? (
                    group.content
                  ) : (
                    group.sections?.map((section, sectionIndex) => (
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
                          style={{ height: "auto", minHeight: "fit-content", paddingLeft: "var(--static-space-0)", paddingTop: "var(--static-space-4)", paddingBottom: "var(--static-space-4)", paddingRight: "var(--static-space-12)" }}
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
                                <Text onBackground="neutral-weak" truncate>{link.description}</Text>
                              )}
                            </Column>
                          </Row>
                        </ToggleButton>
                      ))}
                    </Column>
                  ))
                )}
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
