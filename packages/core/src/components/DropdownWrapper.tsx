"use client";

import {
  autoUpdate,
  flip,
  offset,
  type Placement,
  shift,
  size,
  useFloating,
} from "@floating-ui/react-dom";
import {
  Children,
  cloneElement,
  type FocusEvent,
  forwardRef,
  isValidElement,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../classes/utils";
import type { NavigationLayout } from "../hooks/useArrowNavigation";
import { clearLastOpenedDropdown, getLastOpenedDropdown, setLastOpenedDropdown } from "../utils";
import { ArrowNavigation } from "./ArrowNavigationContext";
import { Column } from "./Column";
import { Dropdown } from "./Dropdown";
import { Flex } from "./Flex";
import { FocusTrap } from "./FocusTrap";
import { Row } from "./Row";
import { ScrollLock } from "./ScrollLock";

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
          if (getLastOpenedDropdown() && getLastOpenedDropdown() !== dropdownId.current) {
            // Dispatch event to close other dropdowns
            const closeEvent = new CustomEvent("close-other-dropdowns", {
              detail: { exceptId: dropdownId.current },
            });
            document.dispatchEvent(closeEvent);

            // Small delay to let the other dropdown close and restore scroll first
            setTimeout(() => {
              if (!isControlled) {
                setInternalIsOpen(true);
              }
              setLastOpenedDropdown(dropdownId.current);
              onOpenChange?.(true);
            }, 50);
            return;
          }

          setLastOpenedDropdown(dropdownId.current);
        } else {
          // Clear the last opened dropdown if this one is closing
          if (getLastOpenedDropdown() === dropdownId.current) {
            clearLastOpenedDropdown();
          }
        }

        if (!isControlled) {
          setInternalIsOpen(newIsOpen);
        }

        onOpenChange?.(newIsOpen);
      },
      [onOpenChange, isControlled],
    );

    // State to track if we're in a browser environment for portal rendering
    const [isBrowser, setIsBrowser] = useState(false);

    useEffect(() => {
      setIsBrowser(true);
    }, []);

    // Store the reference element's width for fillWidth calculation
    const [_referenceWidth, setReferenceWidth] = useState<number | null>(null);

    const { x, y, strategy, refs, update } = useFloating({
      placement: placement,
      open: isOpen,
      middleware: [
        offset(4),
        flip(),
        shift(),
        size({
          apply({ availableWidth, availableHeight, elements }) {
            const floatingStyle = elements.floating.style;

            if (fillWidth && triggerRef.current) {
              const triggerWidth = triggerRef.current.getBoundingClientRect().width;
              const w = `${Math.max(triggerWidth, 200)}px`;
              floatingStyle.width = w;
              floatingStyle.minWidth = minWidth ? `${minWidth}rem` : w;
            } else {
              // Let content determine width; only apply an explicit minWidth
              floatingStyle.width = "";
              floatingStyle.minWidth = minWidth ? `${minWidth}rem` : "";
            }

            floatingStyle.maxWidth = maxWidth ? `${maxWidth}rem` : `${availableWidth}px`;
            floatingStyle.minHeight = `${Math.min(minHeight || 0)}px`;
            floatingStyle.maxHeight = `${availableHeight}px`;
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
    }, [refs, fillWidth]);

    useEffect(() => {
      if (!mounted) {
        setMounted(true);
      }
    }, [mounted]);

    // Store the previously focused element to restore focus when dropdown closes
    const previouslyFocusedElement = useRef<Element | null>(null);

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
              for (const [i, el] of optionElements.entries()) {
                if (i === 0) {
                  (el as HTMLElement).classList.add("highlighted");
                } else {
                  (el as HTMLElement).classList.remove("highlighted");
                }
              }
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
        const isClickInDropdown = Boolean(dropdownRef.current?.contains(target));
        const isClickInWrapper = Boolean(wrapperRef.current?.contains(target));

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

            for (const portal of allPortals) {
              if (portal !== dropdownRef.current) {
                // Try to find the dropdown wrapper that contains this portal
                const wrapper = portal.closest('[data-role="dropdown-wrapper"]');
                if (wrapper) {
                  const triggerEl = wrapper.querySelector(".dropdown-trigger");
                  if (triggerEl) {
                    (triggerEl as HTMLElement).click();
                  }
                }
              }
            }
          }
        }
      },
      [handleOpenChange],
    );

    const handleFocusOut = useCallback(
      (event: FocusEvent) => {
        // Check if focus moved to the dropdown or stayed in the wrapper
        const isFocusInDropdown = Boolean(
          dropdownRef.current?.contains(event.relatedTarget as Node),
        );
        const isFocusInWrapper = Boolean(wrapperRef.current?.contains(event.relatedTarget as Node));

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
      document.addEventListener(
        "close-other-dropdowns",
        handleCloseOtherDropdowns as EventListener,
      );

      return () => {
        document.removeEventListener("click", handleClickOutside);
        currentWrapperRef?.removeEventListener(
          "focusout",
          handleFocusOut as unknown as EventListener,
        );
        document.removeEventListener("close-nested-dropdowns", handleCloseNestedDropdowns);
        document.removeEventListener(
          "close-other-dropdowns",
          handleCloseOtherDropdowns as EventListener,
        );
      };
    }, [handleClickOutside, handleFocusOut, isNested, isOpen, handleOpenChange]);

    // Handle global Escape key to close dropdown
    useEffect(() => {
      if (!isOpen) return;

      const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
        if (e.key === "Escape") {
          handleOpenChange(false);
          setFocusedIndex(-1);
        }
      };

      document.addEventListener("keydown", handleGlobalKeyDown);
      return () => document.removeEventListener("keydown", handleGlobalKeyDown);
    }, [isOpen, handleOpenChange]);

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

      const dropdownEl = dropdownRef.current;
      dropdownEl.addEventListener("mouseover", handleOptionHover);

      return () => {
        dropdownEl.removeEventListener("mouseover", handleOptionHover);
      };
    }, [isOpen, focusedIndex, getOptions]);

    // Determine the appropriate navigation layout
    const determineNavigationLayout = useCallback((): NavigationLayout => {
      if (propNavigationLayout) {
        return propNavigationLayout;
      }
      return "column";
    }, [propNavigationLayout]);

    const [navigationLayout, setNavigationLayout] = useState<NavigationLayout>(
      propNavigationLayout || "column",
    );
    const [optionsCount, setOptionsCount] = useState(propOptionsCount || 0);

    // Update options count when dropdown opens or content changes
    useEffect(() => {
      if (isOpen) {
        if (propOptionsCount !== undefined) {
          setOptionsCount(propOptionsCount);
        } else {
          const options = getOptions();
          setOptionsCount(options.length);
        }

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
          const option = options[index];
          const container = dropdownRef.current;
          const optionRect = option.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

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
          const focusableElements = Array.from(
            dropdownRef.current.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            ),
          ) as HTMLElement[];

          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      },
      [isOpen, handleOpenChange],
    );

    return (
      <>
        <ScrollLock enabled={isOpen} allowScrollInElement={dropdownRef} />
        <Column
          fillWidth={fillWidth}
          fitWidth={!fillWidth}
          transition="macro-medium"
          style={style}
          className={className}
          ref={wrapperRef}
          onClick={
            disableTriggerClick
              ? undefined
              : (e) => {
                  if (e.target === wrapperRef.current && !isOpen) {
                    handleOpenChange(true);
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
                    e.stopPropagation();
                    handleOpenChange(!isOpen);
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
                    columns={
                      typeof columns === "string" ? Number.parseInt(columns, 10) || 8 : columns
                    }
                    onSelect={handleOptionSelect}
                    onFocusChange={handleFocusChange}
                    wrap
                    autoFocus
                    initialFocusedIndex={focusedIndex}
                    itemSelector='.option, [role="option"], [data-value]'
                    role={navigationLayout === "grid" ? "grid" : "listbox"}
                    aria-label="Dropdown options"
                    disabled={getLastOpenedDropdown() !== dropdownId.current}
                  >
                    <Flex
                      zIndex={9}
                      className={cn("origin-top-right animate-fadeIn dropdown-portal")}
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
                      data-is-active={getLastOpenedDropdown() === dropdownId.current}
                      onKeyDown={(e) => {
                        if (!handleArrowNavigation) {
                          return;
                        }

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
                        const target = e.target as HTMLElement;
                        const isInteractive = target.closest(
                          'input, textarea, select, button, [role="button"], a',
                        );
                        if (!isInteractive) {
                          e.preventDefault();
                        }
                      }}
                      onPointerDown={(e) => {
                        const target = e.target as HTMLElement;
                        const isInteractive = target.closest(
                          'input, textarea, select, button, [role="button"], a',
                        );
                        if (!isInteractive) {
                          e.preventDefault();
                        }
                      }}
                      onTouchStart={(e) => {
                        const target = e.target as HTMLElement;
                        const isInteractive = target.closest(
                          'input, textarea, select, button, [role="button"], a',
                        );
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
                        {Children.map(dropdown, (child) => {
                          if (isValidElement(child)) {
                            const childElement = child as ReactElement<Record<string, unknown>>;
                            const props = childElement.props;
                            const hasDataValue =
                              props["data-value"] ||
                              props.value ||
                              childElement.type === "button" ||
                              props.role === "option";

                            if (hasDataValue) {
                              return cloneElement(childElement, {
                                onClick: (val: string) => {
                                  onSelect?.(val);
                                  if (closeAfterClick) {
                                    handleOpenChange(false);
                                    setFocusedIndex(-1);
                                  }
                                },
                              });
                            }
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
                    className={cn("origin-top-right animate-fadeIn dropdown-portal")}
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
                    data-is-active={getLastOpenedDropdown() === dropdownId.current}
                    onKeyDown={(e) => {
                      if (!handleArrowNavigation) {
                        return;
                      }

                      if (e.key !== "Tab") {
                        handleKeyDown(e);
                      }
                    }}
                    onMouseDown={(e) => {
                      const target = e.target as HTMLElement;
                      const isInteractive = target.closest(
                        'input, textarea, select, button, [role="button"], a',
                      );
                      if (!isInteractive) {
                        e.preventDefault();
                      }
                    }}
                    onPointerDown={(e) => {
                      const target = e.target as HTMLElement;
                      const isInteractive = target.closest(
                        'input, textarea, select, button, [role="button"], a',
                      );
                      if (!isInteractive) {
                        e.preventDefault();
                      }
                    }}
                    onTouchStart={(e) => {
                      const target = e.target as HTMLElement;
                      const isInteractive = target.closest(
                        'input, textarea, select, button, [role="button"], a',
                      );
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
      </>
    );
  },
);

DropdownWrapper.displayName = "DropdownWrapper";

export { DropdownWrapper };
