"use client";

import React, {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Column } from "../../components/Column.js";
import { Flex } from "../../components/Flex.js";
import { Icon } from "../../components/Icon.js";
import { Input } from "../../components/Input.js";
import { Kbd } from "../../components/Kbd.js";
import { Option } from "../../components/Option.js";
import { Row } from "../../components/Row.js";
import { ScrollLock } from "../../components/ScrollLock.js";
import { Text } from "../../components/Text.js";
import { useAdapters } from "../../contexts/AdapterProvider.js";
import type { IconName } from "../../icons.js";
import { useControllableState } from "../../internal/useControllableState.js";
import type { TShirtSizes } from "../../types.js";
import styles from "./Kbar.module.scss";

export interface KbarItem {
  id: string;
  name: string;
  section: string;
  shortcut: string[];
  keywords: string;
  href?: string;
  perform?: () => void;
  icon?: IconName;
  description?: ReactNode;
  placeholder?: string;
}

interface KbarOption {
  value: string;
  label: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  description?: ReactNode;
  href?: string;
  onClick?: () => void;
}

const SectionHeader: React.FC<{ id: string; label: string }> = ({ id, label }) => (
  <Row
    id={id}
    paddingX="12"
    paddingBottom="8"
    paddingTop="12"
    textVariant="label-default-s"
    onBackground="neutral-weak"
  >
    {label}
  </Row>
);

/**
 * The search field is the combobox: focus stays in it while the arrow keys
 * move the active option, which `aria-activedescendant` points at, so typing
 * and choosing never fight over focus.
 */
const KbarSearchInput: React.FC<{
  placeholder: string;
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  size?: TShirtSizes;
  /** Set while there are results to show; the popup is collapsed otherwise. */
  listboxId?: string;
  activeOptionId?: string;
}> = ({
  placeholder,
  searchQuery,
  onSearchChange,
  onKeyDown,
  inputRef,
  size = "m",
  listboxId,
  activeOptionId,
}) => (
  <Input
    id="kbar-search"
    placeholder={placeholder}
    aria-label={placeholder}
    role="combobox"
    aria-autocomplete="list"
    aria-expanded={Boolean(listboxId)}
    aria-controls={listboxId}
    aria-activedescendant={activeOptionId}
    value={searchQuery}
    onChange={onSearchChange}
    onKeyDown={onKeyDown}
    ref={inputRef}
    height={size}
    prefix={<Icon marginLeft="4" onBackground="neutral-weak" name="search" size="xs" />}
    autoComplete="off"
  />
);

export interface KbarTriggerProps extends Omit<React.ComponentProps<typeof Row>, "onClick"> {
  onClick?: () => void;
}

export const KbarTrigger: React.FC<KbarTriggerProps> = ({ onClick, children, ...rest }) => {
  return (
    <Row onClick={onClick} {...rest}>
      {children}
    </Row>
  );
};

export interface KbarContentProps {
  open: boolean;
  onClose: () => void;
  items: KbarItem[];
  placeholder?: string;
  /** The search field's height. */
  size?: TShirtSizes;
}

export const KbarContent: React.FC<KbarContentProps> = ({
  open,
  onClose,
  items,
  placeholder = "Search",
  size = "m",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { useNavigate } = useAdapters();
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const optionId = (index: number) => `${baseId}-option-${index}`;
  const sectionId = (index: number) => `${baseId}-section-${index}`;

  const handleClose = useCallback(() => {
    setIsClosing(true);
    // Add a small delay to allow animations to complete
    requestAnimationFrame(() => {
      onClose();
    });
  }, [onClose]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (!searchQuery) return true;

      const searchLower = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(searchLower) ||
        (item.keywords ? item.keywords.toLowerCase().includes(searchLower) : false) ||
        (item.section ? item.section.toLowerCase().includes(searchLower) : false)
      );
    });
  }, [items, searchQuery]);

  // Group items by section. `start` is the section's first index in the flat
  // list the arrow keys and `aria-activedescendant` count in.
  const sections = useMemo(() => {
    const names = Array.from(new Set(filteredItems.map((item) => item.section)));
    let start = 0;

    return names.map((section) => {
      const options = filteredItems
        .filter((item) => item.section === section)
        .map(
          (item): KbarOption => ({
            value: item.id,
            label: item.name,
            prefix: item.icon ? (
              <Icon name={item.icon} size="xs" onBackground="neutral-weak" />
            ) : undefined,
            suffix:
              item.shortcut && item.shortcut.length > 0 ? (
                <Row gap="2" style={{ transform: "scale(0.9)", transformOrigin: "right" }}>
                  {item.shortcut.map((key, i) => (
                    <Row gap="2" key={i}>
                      <Kbd minWidth="24" style={{ transform: "scale(0.8)" }}>
                        {key}
                      </Kbd>
                      {i < item.shortcut.length - 1 && <Text onBackground="neutral-weak">+</Text>}
                    </Row>
                  ))}
                </Row>
              ) : undefined,
            description: item.description,
            href: item.href,
            onClick: item.perform
              ? () => {
                  item.perform?.();
                  onClose();
                }
              : undefined,
          }),
        );
      const group = { section, start, options };
      start += options.length;
      return group;
    });
  }, [filteredItems, onClose]);

  const options = useMemo(() => sections.flatMap((group) => group.options), [sections]);
  const hasResults = options.length > 0;
  const active = hasResults ? Math.min(activeIndex, options.length - 1) : -1;

  // Handle item selection
  const handleSelect = useCallback(
    (index: number) => {
      const selectedOption = options[index];
      if (selectedOption) {
        const originalItem = items.find((item) => item.id === selectedOption.value);
        if (originalItem) {
          if (originalItem.href) {
            navigate(originalItem.href);
            handleClose();
          } else if (originalItem.perform) {
            originalItem.perform();
            handleClose();
          }
        }
      }
    },
    [options, items, navigate, handleClose],
  );

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const count = options.length;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (count > 0) setActiveIndex((active + 1) % count);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (count > 0) setActiveIndex((active - 1 + count) % count);
        break;
      case "Home":
      case "End":
        if (count === 0) return;
        e.preventDefault();
        setActiveIndex(e.key === "Home" ? 0 : count - 1);
        break;
      case "Enter":
        if (active < 0) return;
        e.preventDefault();
        handleSelect(active);
        break;
      case "Tab":
        // The search field is the dialog's only tab stop. Tab stays on it
        // rather than walking out to the page behind the modal overlay.
        e.preventDefault();
        break;
    }
  };

  // Keep the active option in view as the arrow keys move it. Focus no
  // longer goes to the option, so nothing else would scroll the list.
  useEffect(() => {
    if (active < 0) return;
    document.getElementById(`${baseId}-option-${active}`)?.scrollIntoView?.({ block: "nearest" });
  }, [active, baseId]);

  // Escape closes the palette, and only the palette: it is caught before
  // anything else sees it and marked handled, so a Drawer, Dialog or Modal the
  // palette was opened from stays open.
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscapeKey, true);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey, true);
    };
  }, [open, handleClose]);

  // Clear search query when kbar is closed
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  // Focus search input when kbar is opened
  useEffect(() => {
    if (open && inputRef.current) {
      // Use a small timeout to ensure the component is fully rendered
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [open]);

  // Hand focus back to whatever had it before the palette opened — usually
  // its trigger — when it closes or unmounts.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    return () => {
      opener?.focus();
    };
  }, [open]);

  // Handle search input change. A new query starts at the top of its results.
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setActiveIndex(0);
  };

  // Render nothing if not open
  if (!open) return null;

  // Create portal for the kbar
  return (
    <>
      {/* The whole panel, not just the results: the search field sits outside
          the list, and keys typed into it (Space among them) must not be
          swallowed as page-scroll keys. */}
      <ScrollLock enabled={open} allowScrollInElement={containerRef} />
      <Row
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        zIndex={10}
        center
        background="overlay"
        className={`${styles.overlay} ${isClosing ? styles.closing : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      >
        <Column
          ref={containerRef}
          fitHeight
          maxWidth="xs"
          background="surface"
          radius="l-4"
          border="neutral-alpha-medium"
          overflow="hidden"
          shadow="l"
          className={`${styles.content} ${isClosing ? styles.closing : ""}`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <Row fillWidth padding="8">
            <KbarSearchInput
              placeholder={placeholder}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onKeyDown={handleInputKeyDown}
              inputRef={inputRef}
              size={size}
              listboxId={hasResults ? listboxId : undefined}
              activeOptionId={hasResults ? optionId(active) : undefined}
            />
          </Row>
          <Column
            maxHeight="32rem"
            fillWidth
            padding="4"
            gap="2"
            overflowY="auto"
            radius="l"
            border
            role={hasResults ? "listbox" : undefined}
            id={hasResults ? listboxId : undefined}
            aria-label={hasResults ? "Results" : undefined}
          >
            {sections.map((group, sectionIndex) => (
              // A labelled group per section, so the section name is read as
              // the options' context instead of loose text inside the list.
              <Column
                key={group.section}
                role="group"
                aria-labelledby={sectionId(sectionIndex)}
                fillWidth
                gap="2"
              >
                <SectionHeader id={sectionId(sectionIndex)} label={group.section} />
                {group.options.map((option, i) => {
                  const index = group.start + i;
                  return (
                    <Option
                      key={option.value}
                      id={optionId(index)}
                      // Selection follows the active option, as in any
                      // single-select combobox; the look stays the keyboard
                      // highlight it always was.
                      aria-selected={index === active}
                      highlighted={index === active}
                      tabIndex={-1}
                      onMouseEnter={() => setActiveIndex(index)}
                      label={option.label}
                      value={option.value}
                      prefix={option.prefix}
                      suffix={option.suffix}
                      description={option.description}
                      {...(option.href
                        ? {
                            href: option.href,
                            onClick: undefined,
                            onLinkClick: handleClose,
                          }
                        : { onClick: option.onClick })}
                    />
                  );
                })}
              </Column>
            ))}
            {searchQuery && filteredItems.length === 0 && (
              <Flex
                fillWidth
                center
                paddingX="16"
                paddingY="64"
                textVariant="body-default-m"
                onBackground="neutral-weak"
              >
                No results found
              </Flex>
            )}
          </Column>
          <Row fillWidth paddingX="24" paddingY="8">
            <Row
              style={{ transform: "scale(0.8)", transformOrigin: "left" }}
              gap="8"
              onBackground="neutral-weak"
              textVariant="label-default-m"
              vertical="center"
            >
              <Kbd minWidth="20">
                <Row>
                  <Icon name="chevronUp" size="xs" />
                </Row>
              </Kbd>
              <Kbd minWidth="20">
                <Row>
                  <Icon name="chevronDown" size="xs" />
                </Row>
              </Kbd>
              <Text marginLeft="8" marginRight="24">
                Navigate
              </Text>
              <Kbd minWidth="20">
                <Row>
                  <Icon name="enter" size="xs" />
                </Row>
              </Kbd>
              <Text marginLeft="8">Go to</Text>
            </Row>
          </Row>
        </Column>
      </Row>
    </>
  );
};

export interface KbarProps {
  items: KbarItem[];
  children: React.ReactNode;
  /** The search field's height. */
  size?: TShirtSizes;
  /** Open or not, controlled. Leave it out to let Kbar keep its own state,
   *  starting from `defaultOpen`. */
  open?: boolean;
  /** The starting state of an uncontrolled Kbar (no `open`). */
  defaultOpen?: boolean;
  /** Called with the state Kbar moves to: on the trigger, ⌘K/Ctrl+K, a
   *  dismissal, and a route change. */
  onOpenChange?: (open: boolean) => void;
  [key: string]: any; // Allow any additional props
}

export const Kbar: React.FC<KbarProps> = ({
  items,
  children,
  size,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...rest
}) => {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const { usePathname } = useAdapters();
  const pathname = usePathname();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Close Kbar when pathname changes (not on mount, so defaultOpen holds).
  const lastPathname = useRef(pathname);
  useEffect(() => {
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;
    if (open) {
      handleClose();
    }
  }, [pathname]);

  // Add keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Command+K (Mac) or Control+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault(); // Prevent default browser behavior
        setOpen((prev) => !prev); // Toggle Kbar open/close
      }
    };

    // Add the event listener
    document.addEventListener("keydown", handleKeyDown);

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <KbarTrigger
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpen();
          }
        }}
        {...rest}
      >
        {children}
      </KbarTrigger>
      {open &&
        createPortal(
          <KbarContent open={open} onClose={handleClose} items={items} size={size} />,
          document.body,
        )}
    </>
  );
};
