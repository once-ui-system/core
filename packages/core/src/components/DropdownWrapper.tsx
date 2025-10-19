"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  ReactNode,
  forwardRef,
  useImperativeHandle,
  useCallback,
  KeyboardEvent,
  FocusEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  useFloating,
  shift,
  offset,
  flip,
  size,
  autoUpdate,
  Placement,
} from "@floating-ui/react-dom";
import { Flex, Dropdown, Column, Row, FocusTrap, ArrowNavigation } from ".";
import styles from "./DropdownWrapper.module.scss";
import { NavigationLayout } from "../hooks/useArrowNavigation";

export interface DropdownWrapperProps {
  fillWidth?: boolean;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  placement?: Placement;
  trigger: ReactNode;
  dropdown: ReactNode;
  selectedOption?: string;
  style?: React.CSSProperties;
  className?: string;
  onSelect?: (value: string) => void;
  closeAfterClick?: boolean;
  handleArrowNavigation?: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  isNested?: boolean;
  navigationLayout?: NavigationLayout;
  columns?: number | string;
  optionsCount?: number;
  dropdownId?: string;
  disableTriggerClick?: boolean;
}

// Global state to track the last opened dropdown
let dropdownCounter = 0;

const DropdownWrapper = forwardRef<HTMLDivElement, DropdownWrapperProps>(
  (
    {
      trigger,
      dropdown,
      selectedOption,
      minHeight,
      onSelect,
      closeAfterClick = true,
      isOpen: controlledIsOpen,
      handleArrowNavigation = true,
      onOpenChange,
      minWidth,
      maxWidth,
      fillWidth = false,
      placement = "bottom-start",
      className,
      style,
      isNested = false,
      navigationLayout: propNavigationLayout,
      columns = 8,
      optionsCount: propOptionsCount,
      dropdownId: propDropdownId,
      disableTriggerClick = false,
    },
    ref,
  ) => {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);

    // Use provided dropdownId or generate a unique ID for this dropdown
    const dropdownId = useRef(propDropdownId || `dropdown-${dropdownCounter++}`);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isControlled = controlledIsOpen !== undefined;
    const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

    const handleOpenChange = useCallback(
      (newIsOpen: boolean) => {
        if (newIsOpen) {
          // Close any other open dropdown before opening this one
          if ((window as any).lastOpenedDropdown && (window as any).lastOpenedDropdown !== dropdownId.current) {
            // Dispatch event to close other dropdowns
            const closeEvent = new CustomEvent('close-other-dropdowns', {
              detail: { exceptId: dropdownId.current }
            });
            document.dispatchEvent(closeEvent);
            
            // Small delay to let the other dropdown close and restore scroll first
            setTimeout(() => {
              if (!isControlled) {
                setInternalIsOpen(true);
              }
              (window as any).lastOpenedDropdown = dropdownId.current;
              onOpenChange?.(true);
            }, 50);
            return;
          }
          
          // Set this as the last opened dropdown using global variable
          (window as any).lastOpenedDropdown = dropdownId.current;
        } else {
          // Clear the last opened dropdown if this one is closing
          if ((window as any).lastOpenedDropdown === dropdownId.current) {
            (window as any).lastOpenedDropdown = null;
          }
        }

        if (!isControlled) {
          setInternalIsOpen(newIsOpen);
        }

        onOpenChange?.(newIsOpen);
      },
      [onOpenChange, isControlled, isNested],
    );

    // State to track if we're in a browser environment for portal rendering
    const [isBrowser, setIsBrowser] = useState(false);

    useEffect(() => {
      setIsBrowser(true);
    }, []);

    // Store the reference element's width for fillWidth calculation
    const [referenceWidth, setReferenceWidth] = useState<number | null>(null);

    // We'll measure the width directly in the floating UI middleware

    const { x, y, strategy, refs, update } = useFloating({
      placement: placement,
      open: isOpen,
      middleware: [
        offset(4),
        minHeight ? undefined : flip(),
        shift(),
        size({
          apply({ availableWidth, availableHeight, elements }) {
            // Get the width directly from the trigger element when needed
            let width = "auto";

            if (fillWidth && triggerRef.current) {
              const triggerWidth = triggerRef.current.getBoundingClientRect().width;
              width = `${Math.max(triggerWidth, 200)}px`;
            }

            Object.assign(elements.floating.style, {
              width: width,
              minWidth: minWidth ? `${minWidth}rem` : fillWidth ? width : undefined,
              maxWidth: maxWidth ? `${maxWidth}rem` : `${availableWidth}px`,
              minHeight: `${Math.min(minHeight || 0)}px`,
              maxHeight: `${availableHeight}px`,
            });
          },
        }),
      ],
      whileElementsMounted: autoUpdate,
    });

    useImperativeHandle(ref, () => wrapperRef.current as HTMLDivElement);

    useEffect(() => {
      if (wrapperRef.current) {
        refs.setReference(wrapperRef.current);

        // Store the reference element's width for fillWidth calculation
        if (fillWidth) {
          setReferenceWidth(wrapperRef.current.getBoundingClientRect().width);
        }
      }
    }, [refs, mounted, fillWidth]);

    useEffect(() => {
      if (!mounted) {
        setMounted(true);
      }
    }, [mounted]);

    // Store the previously focused element to restore focus when dropdown closes
    const previouslyFocusedElement = useRef<Element | null>(null);

    // Lock/unlock body scroll when dropdown opens/closes
    useLayoutEffect(() => {
      if (isOpen) {
        // Store current scroll position
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;
        
        // Calculate scrollbar width to prevent layout shift
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        
        // Store original styles
        const originalPosition = document.body.style.position;
        const originalTop = document.body.style.top;
        const originalLeft = document.body.style.left;
        const originalWidth = document.body.style.width;
        const originalOverflow = document.body.style.overflow;
        const originalPaddingRight = document.body.style.paddingRight;
        const originalScrollBehavior = document.documentElement.style.scrollBehavior;
        
        // Disable smooth scrolling completely
        document.documentElement.style.scrollBehavior = 'auto';
        
        // Lock scroll by fixing body position at current scroll offset
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = `-${scrollX}px`;
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        
        return () => {
          // Restore body position first (so it becomes scrollable again)
          document.body.style.position = originalPosition;
          document.body.style.top = originalTop;
          document.body.style.left = originalLeft;
          document.body.style.width = originalWidth;
          document.body.style.overflow = originalOverflow;
          document.body.style.paddingRight = originalPaddingRight;
          
          // Restore scroll position while scroll-behavior is still 'auto'
          window.scrollTo(scrollX, scrollY);
          
          // Finally restore smooth scrolling
          document.documentElement.style.scrollBehavior = originalScrollBehavior;
        };
      }
    }, [isOpen]);

    // Force update when dropdown opens
    useEffect(() => {
      if (isOpen && mounted) {
        // Small delay to ensure DOM is ready
        const timeoutId = setTimeout(() => {
          update();
        }, 0);
        return () => clearTimeout(timeoutId);
      }
    }, [isOpen, mounted, update]);

    useEffect(() => {
      if (isOpen && mounted) {
        // Store the currently focused element before focusing the dropdown
        previouslyFocusedElement.current = document.activeElement;

        requestAnimationFrame(() => {
          if (dropdownRef.current) {
            refs.setFloating(dropdownRef.current);
            update();
            // Reset focus index when opening
            setFocusedIndex(-1);

            const focusableElements = dropdownRef.current.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            );

            if (focusableElements.length > 0) {
              (focusableElements[0] as HTMLElement).focus({ preventScroll: true });
            }

            const optionElements = dropdownRef.current
              ? Array.from(
                  dropdownRef.current.querySelectorAll('.option, [role="option"], [data-value]'),
                )
              : [];

            if (optionElements.length > 0) {
              setFocusedIndex(0);
              optionElements.forEach((el, i) => {
                if (i === 0) {
                  (el as HTMLElement).classList.add("highlighted");
                } else {
                  (el as HTMLElement).classList.remove("highlighted");
                }
              });
            }
          }
        });
      } else if (!isOpen && previouslyFocusedElement.current) {
        // Only try to focus if the element is still in the document
        if (document.contains(previouslyFocusedElement.current)) {
          (previouslyFocusedElement.current as HTMLElement).focus({ preventScroll: true });
        }
      }
    }, [isOpen, mounted, refs, update]);

    const handleClickOutside = useCallback(
      (event: MouseEvent) => {
        const target = event.target as HTMLElement;

        // Check if the click is inside the dropdown or the wrapper
        const isClickInDropdown = dropdownRef.current && dropdownRef.current.contains(target);
        const isClickInWrapper = wrapperRef.current && wrapperRef.current.contains(target);

        // Check if the click is on a dropdown trigger (for nested dropdowns)
        const isClickOnDropdownTrigger = target.closest(".dropdown-trigger") !== null;

        // Check if the click is on the dropdown portal itself
        const isClickOnDropdownPortal = target.closest(".dropdown-portal") !== null;

        // Check if the click is on any dropdown-related element
        const isClickOnDropdownElement =
          target.closest('[data-role="dropdown-wrapper"]') !== null ||
          target.closest('[data-role="dropdown-portal"]') !== null ||
          target.closest('[data-is-dropdown="true"]') !== null;

        // Only close if the click is outside both the dropdown and the wrapper
        // and not on a nested dropdown trigger or dropdown portal
        if (
          !isClickInDropdown &&
          !isClickInWrapper &&
          !isClickOnDropdownTrigger &&
          !isClickOnDropdownPortal &&
          !isClickOnDropdownElement
        ) {
          handleOpenChange(false);
          setFocusedIndex(-1);
        } else {
          // If click is inside dropdown but not on an option, try to close nested dropdowns
          if (isClickInDropdown || isClickOnDropdownPortal) {
            // Try to close all other dropdown portals
            const allPortals = document.querySelectorAll('[data-role="dropdown-portal"]');

            allPortals.forEach((portal, index) => {
              if (portal !== dropdownRef.current) {
                // Try to find the dropdown wrapper that contains this portal
                const wrapper = portal.closest('[data-role="dropdown-wrapper"]');
                if (wrapper) {
                  const trigger = wrapper.querySelector(".dropdown-trigger");
                  if (trigger) {
                    (trigger as HTMLElement).click();
                  }
                }
              }
            });
          }
        }
      },
      [handleOpenChange],
    );

    const handleFocusOut = useCallback(
      (event: FocusEvent) => {
        // Check if focus moved to the dropdown or stayed in the wrapper
        const isFocusInDropdown =
          dropdownRef.current && dropdownRef.current.contains(event.relatedTarget as Node);
        const isFocusInWrapper =
          wrapperRef.current && wrapperRef.current.contains(event.relatedTarget as Node);

        // Only close if focus moved outside both the dropdown and the wrapper
        if (!isFocusInDropdown && !isFocusInWrapper) {
          handleOpenChange(false);
          setFocusedIndex(-1);
        }
      },
      [handleOpenChange],
    );

    useEffect(() => {
      const currentWrapperRef = wrapperRef.current;

      document.addEventListener("click", handleClickOutside);
      currentWrapperRef?.addEventListener("focusout", handleFocusOut as unknown as EventListener);

      // Listen for close-nested-dropdowns events if this is a nested dropdown
      const handleCloseNestedDropdowns = () => {
        if (isNested && isOpen) {
          handleOpenChange(false);
          setFocusedIndex(-1);
        }
      };

      // Listen for close-other-dropdowns event to close this dropdown when another opens
      const handleCloseOtherDropdowns = (e: Event) => {
        const customEvent = e as CustomEvent;
        const exceptId = customEvent.detail?.exceptId;
        
        // Close this dropdown if it's not the one being excepted
        if (isOpen && dropdownId.current !== exceptId) {
          handleOpenChange(false);
          setFocusedIndex(-1);
        }
      };

      document.addEventListener("close-nested-dropdowns", handleCloseNestedDropdowns);
      document.addEventListener("close-other-dropdowns", handleCloseOtherDropdowns as EventListener);

      return () => {
        document.removeEventListener("click", handleClickOutside);
        currentWrapperRef?.removeEventListener(
          "focusout",
          handleFocusOut as unknown as EventListener,
        );
        document.removeEventListener("close-nested-dropdowns", handleCloseNestedDropdowns);
        document.removeEventListener("close-other-dropdowns", handleCloseOtherDropdowns as EventListener);
      };
    }, [handleClickOutside, handleFocusOut, isNested, isOpen, handleOpenChange]);

    // Get options from the dropdown
    const getOptions = useCallback(() => {
      if (!dropdownRef.current) return [];

      return Array.from(
        dropdownRef.current.querySelectorAll('.option, [role="option"], [data-value]'),
      ) as HTMLElement[];
    }, []);

    // Track hover on options to sync with keyboard navigation
    useEffect(() => {
      if (!isOpen || !dropdownRef.current) return;

      const handleOptionHover = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const option = target.closest('[role="option"], [data-value]') as HTMLElement;
        
        if (option && dropdownRef.current?.contains(option)) {
          const options = getOptions();
          const index = options.indexOf(option);
          if (index >= 0 && index !== focusedIndex) {
            setFocusedIndex(index);
          }
        }
      };

      const dropdown = dropdownRef.current;
      dropdown.addEventListener('mouseover', handleOptionHover);

      return () => {
        dropdown.removeEventListener('mouseover', handleOptionHover);
      };
    }, [isOpen, focusedIndex, getOptions]);

    // Determine the appropriate navigation layout
    const determineNavigationLayout = useCallback((): NavigationLayout => {
      // Use the prop if provided, otherwise default to column
      if (propNavigationLayout) {
        return propNavigationLayout;
      }
      // Default to column layout for most dropdowns
      return "column";
    }, [propNavigationLayout]);

    const [navigationLayout, setNavigationLayout] = useState<NavigationLayout>(
      propNavigationLayout || "column",
    );
    const [optionsCount, setOptionsCount] = useState(propOptionsCount || 0);

    // Update options count when dropdown opens or content changes
    useEffect(() => {
      if (isOpen) {
        // If optionsCount is provided as a prop, use it
        if (propOptionsCount !== undefined) {
          setOptionsCount(propOptionsCount);
        } else {
          const options = getOptions();
          setOptionsCount(options.length);
        }

        // Try to determine the layout based on the dropdown content or props
        setNavigationLayout(determineNavigationLayout());
      }
    }, [isOpen, getOptions, determineNavigationLayout, propOptionsCount]);

    // Handle option selection
    const handleOptionSelect = useCallback(
      (index: number) => {
        const options = getOptions();
        if (index >= 0 && index < options.length) {
          options[index].click();

          if (closeAfterClick) {
            handleOpenChange(false);
            setFocusedIndex(-1);
          }
        }
      },
      [getOptions, closeAfterClick, handleOpenChange],
    );

    // Handle focus change
    const handleFocusChange = useCallback(
      (index: number) => {
        setFocusedIndex(index);
        const options = getOptions();
        if (index >= 0 && index < options.length && dropdownRef.current) {
          // Scroll within the dropdown container only, not the page
          const option = options[index];
          const container = dropdownRef.current;
          const optionRect = option.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          
          // Check if option is outside visible area of container
          if (optionRect.bottom > containerRect.bottom) {
            option.scrollIntoView({ block: "nearest", behavior: "auto" });
          } else if (optionRect.top < containerRect.top) {
            option.scrollIntoView({ block: "nearest", behavior: "auto" });
          }
        }
      },
      [getOptions],
    );

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        if (!isOpen) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpenChange(true);
          }
          return;
        }

        if (e.key === "Escape") {
          e.preventDefault();
          handleOpenChange(false);
          setFocusedIndex(-1);
          return;
        }

        // Handle tab key for focus trapping
        if (e.key === "Tab" && dropdownRef.current) {
          // Find all focusable elements in the dropdown
          const focusableElements = Array.from(
            dropdownRef.current.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            ),
          ) as HTMLElement[];

          if (focusableElements.length === 0) return;

          // Get the first and last focusable elements
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          // Handle tab and shift+tab to cycle through focusable elements
          if (e.shiftKey) {
            // Shift+Tab
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }

          return;
        }

        // If handleArrowNavigation is false, forward keyboard events to the dropdown content
        if (!handleArrowNavigation && dropdownRef.current) {
          // Let the dropdown content handle arrow keys, enter, space, etc.
          return;
        }

        // Arrow key navigation will be handled by ArrowNavigation component
        // Enter/Space key selection will be handled by ArrowNavigation component
      },
      [isOpen, handleOpenChange, handleArrowNavigation],
    );

    return (
      <Column
        fillWidth={fillWidth}
        fitWidth={!fillWidth}
        transition="macro-medium"
        style={{
          ...style,
        }}
        className={className}
        ref={wrapperRef}
        onClick={
          disableTriggerClick
            ? undefined
            : (e) => {
                if (!isOpen) {
                  handleOpenChange(true);
                  return;
                }
              }
        }
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        data-role="dropdown-wrapper"
      >
        <Row
          ref={triggerRef}
          fillWidth={fillWidth}
          fitWidth={!fillWidth}
          onClick={
            disableTriggerClick
              ? undefined
              : (e) => {
                  // If already open, close on trigger click
                  if (isOpen) {
                    handleOpenChange(false);
                    return;
                  }
                  handleOpenChange(true);
                }
          }
          onKeyDown={(e) => {
            handleKeyDown(e);
          }}
          role="button"
          data-is-dropdown="true"
          aria-haspopup="true"
          aria-expanded={isOpen}
          className="dropdown-trigger"
        >
          {trigger}
        </Row>
        {isOpen &&
          dropdown &&
          isBrowser &&
          createPortal(
            <FocusTrap
              active={isOpen}
              onEscape={() => handleOpenChange(false)}
              autoFocus
              restoreFocus
            >
              {handleArrowNavigation ? (
                <ArrowNavigation
                  layout={navigationLayout}
                  itemCount={optionsCount}
                  columns={typeof columns === "string" ? parseInt(columns, 10) || 8 : columns}
                  onSelect={handleOptionSelect}
                  onFocusChange={handleFocusChange}
                  wrap
                  autoFocus
                  initialFocusedIndex={focusedIndex}
                  itemSelector='.option, [role="option"], [data-value]'
                  role={navigationLayout === "grid" ? "grid" : "listbox"}
                  aria-label="Dropdown options"
                  disabled={(window as any).lastOpenedDropdown !== dropdownId.current}
                >
                  <Flex
                    zIndex={9}
                    className={`${styles.fadeIn} dropdown-portal`}
                    minWidth={minWidth}
                    ref={dropdownRef}
                    style={{
                      position: strategy,
                      top: y ?? 0,
                      left: x ?? 0,
                    }}
                    data-role="dropdown-portal"
                    data-is-dropdown="true"
                    data-dropdown-id={dropdownId.current}
                    data-is-active={(window as any).lastOpenedDropdown === dropdownId.current}
                    onKeyDown={(e) => {
                      // If handleArrowNavigation is false, let all keyboard events pass through
                      if (!handleArrowNavigation) {
                        return;
                      }

                      // Let FocusTrap handle Tab key
                      // Let ArrowNavigation handle arrow keys
                      if (
                        e.key !== "Tab" &&
                        e.key !== "ArrowUp" &&
                        e.key !== "ArrowDown" &&
                        e.key !== "ArrowLeft" &&
                        e.key !== "ArrowRight"
                      ) {
                        handleKeyDown(e);
                      }
                    }}
                    onMouseDown={(e) => {
                      // Allow interactive elements (inputs, buttons, etc.) to work normally
                      const target = e.target as HTMLElement;
                      const isInteractive = target.closest('input, textarea, select, button, [role="button"], a');
                      if (!isInteractive) {
                        e.preventDefault();
                      }
                    }}
                    onPointerDown={(e) => {
                      // Allow interactive elements (inputs, buttons, etc.) to work normally
                      const target = e.target as HTMLElement;
                      const isInteractive = target.closest('input, textarea, select, button, [role="button"], a');
                      if (!isInteractive) {
                        e.preventDefault();
                      }
                    }}
                    onTouchStart={(e) => {
                      // Allow interactive elements (inputs, buttons, etc.) to work normally
                      const target = e.target as HTMLElement;
                      const isInteractive = target.closest('input, textarea, select, button, [role="button"], a');
                      if (!isInteractive) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <Dropdown
                      minWidth={minWidth}
                      radius="l"
                      padding="0"
                      selectedOption={selectedOption}
                      onSelect={(value) => {
                        onSelect?.(value);
                        if (closeAfterClick) {
                          handleOpenChange(false);
                          setFocusedIndex(-1);
                        }
                      }}
                    >
                      {React.Children.map(dropdown, (child) => {
                        if (React.isValidElement(child)) {
                          // Only add onClick handler to elements that have data-value or are interactive
                          const childElement = child as React.ReactElement<any>;
                          const hasDataValue =
                            childElement.props["data-value"] ||
                            childElement.props.value ||
                            childElement.type === "button" ||
                            childElement.props.role === "option";

                          if (hasDataValue) {
                            // Cast the child element to any to avoid TypeScript errors with unknown props
                            return React.cloneElement(childElement, {
                              onClick: (val: string) => {
                                onSelect?.(val);
                                if (closeAfterClick) {
                                  handleOpenChange(false);
                                  setFocusedIndex(-1);
                                }
                              },
                            });
                          }
                          // Return the child unchanged if it doesn't need an onClick handler
                          return child;
                        }
                        return child;
                      })}
                    </Dropdown>
                  </Flex>
                </ArrowNavigation>
              ) : (
                <Flex
                  zIndex={9}
                  className={`${styles.fadeIn} dropdown-portal`}
                  minWidth={minWidth}
                  ref={dropdownRef}
                  style={{
                    position: strategy,
                    top: y ?? 0,
                    left: x ?? 0,
                  }}
                  data-role="dropdown-portal"
                  data-is-dropdown="true"
                  data-dropdown-id={dropdownId.current}
                  data-is-active={(window as any).lastOpenedDropdown === dropdownId.current}
                  onKeyDown={(e) => {
                    // If handleArrowNavigation is false, let all keyboard events pass through
                    if (!handleArrowNavigation) {
                      return;
                    }

                    // Let FocusTrap handle Tab key
                    if (e.key !== "Tab") {
                      handleKeyDown(e);
                    }
                  }}
                  onMouseDown={(e) => {
                    // Allow interactive elements (inputs, buttons, etc.) to work normally
                    const target = e.target as HTMLElement;
                    const isInteractive = target.closest('input, textarea, select, button, [role="button"], a');
                    if (!isInteractive) {
                      e.preventDefault();
                    }
                  }}
                  onPointerDown={(e) => {
                    // Allow interactive elements (inputs, buttons, etc.) to work normally
                    const target = e.target as HTMLElement;
                    const isInteractive = target.closest('input, textarea, select, button, [role="button"], a');
                    if (!isInteractive) {
                      e.preventDefault();
                    }
                  }}
                  onTouchStart={(e) => {
                    // Allow interactive elements (inputs, buttons, etc.) to work normally
                    const target = e.target as HTMLElement;
                    const isInteractive = target.closest('input, textarea, select, button, [role="button"], a');
                    if (!isInteractive) {
                      e.preventDefault();
                    }
                  }}
                >
                  <Dropdown
                    minWidth={minWidth}
                    radius="l"
                    padding="0"
                    selectedOption={selectedOption}
                    onSelect={(value) => {
                      onSelect?.(value);
                      if (closeAfterClick) {
                        handleOpenChange(false);
                        setFocusedIndex(-1);
                      }
                    }}
                  >
                    {dropdown}
                  </Dropdown>
                </Flex>
              )}
            </FocusTrap>,
            document.body,
          )}
      </Column>
    );
  },
);

DropdownWrapper.displayName = "DropdownWrapper";
export { DropdownWrapper };
