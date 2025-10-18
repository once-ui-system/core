"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, ReactNode } from "react";
import { Flex, Text, Icon, Column, Input, Option, Row, Kbd, ArrowNavigation, useArrowNavigationContext } from "../../";
import { createPortal } from "react-dom";
import { useRouter, usePathname } from "next/navigation";
import styles from "./Kbar.module.scss";

export interface KbarItem {
  id: string;
  name: string;
  section: string;
  shortcut: string[];
  keywords: string;
  href?: string;
  perform?: () => void;
  icon?: string;
  description?: ReactNode;
  placeholder?: string;
}

const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <Row
    paddingX="12"
    paddingBottom="8"
    paddingTop="12"
    textVariant="label-default-s"
    onBackground="neutral-weak"
  >
    {label}
  </Row>
);

// Search input that uses arrow navigation context
const KbarSearchInput: React.FC<{
  placeholder: string;
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}> = ({ placeholder, searchQuery, onSearchChange, inputRef }) => {
  const { handleKeyDown: navKeyDown } = useArrowNavigationContext();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Forward arrow keys and Enter to navigation
      if (["ArrowUp", "ArrowDown", "Enter", "Home", "End"].includes(e.key)) {
        navKeyDown(e as any);
      }
    },
    [navKeyDown],
  );

  return (
    <Input
      id="kbar-search"
      placeholder={placeholder}
      value={searchQuery}
      onChange={onSearchChange}
      onKeyDown={handleKeyDown}
      ref={inputRef}
      hasPrefix={<Icon marginLeft="4" onBackground="neutral-weak" name="search" size="xs" />}
      autoComplete="off"
    />
  );
};

interface KbarTriggerProps {
  onClick?: () => void;
  children: React.ReactNode;
  [key: string]: any; // Allow any additional props
}

export const KbarTrigger: React.FC<KbarTriggerProps> = ({ onClick, children, ...rest }) => {
  return (
    <Row onClick={onClick} {...rest}>
      {children}
    </Row>
  );
};

interface KbarContentProps {
  isOpen: boolean;
  onClose: () => void;
  items: KbarItem[];
  placeholder?: string;
}

export const KbarContent: React.FC<KbarContentProps> = ({
  isOpen,
  onClose,
  items,
  placeholder = "Search",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);

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

  // Group items by section
  const groupedItems = useMemo(() => {
    const sections = new Set(filteredItems.map((item) => item.section));
    const result = [];

    for (const section of sections) {
      // Add section header
      result.push({
        value: `section-${section}`,
        label: <SectionHeader label={section} />,
        isCustom: true,
      });

      // Add items for this section
      const sectionItems = filteredItems.filter((item) => item.section === section);

      for (const item of sectionItems) {
        result.push({
          value: item.id,
          label: item.name,
          hasPrefix: item.icon ? (
            <Icon name={item.icon} size="xs" onBackground="neutral-weak" />
          ) : undefined,
          hasSuffix:
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
        });
      }
    }

    return result;
  }, [filteredItems, onClose]);

  // Get non-custom options for highlighting
  const nonCustomOptions = useMemo(() => {
    return groupedItems.filter((item) => !item.isCustom);
  }, [groupedItems]);

  // Handle item selection
  const handleSelect = useCallback(
    (index: number) => {
      const selectedOption = nonCustomOptions[index];
      if (selectedOption) {
        const originalItem = items.find((item) => item.id === selectedOption.value);
        if (originalItem) {
          if (originalItem.href) {
            router.push(originalItem.href);
            handleClose();
          } else if (originalItem.perform) {
            originalItem.perform();
            handleClose();
          }
        }
      }
    },
    [nonCustomOptions, items, router, handleClose],
  );

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, handleClose]);

  // Lock body scroll when kbar is open
  useEffect(() => {
    if (isOpen) {
      // Prevent body scrolling when kbar is open
      document.body.style.overflow = "hidden";
    } else {
      // Restore body scrolling when kbar is closed
      document.body.style.overflow = "unset";
    }

    return () => {
      // Cleanup function to ensure body scroll is restored
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Clear search query when kbar is closed
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Focus search input when kbar is opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Use a small timeout to ensure the component is fully rendered
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Render nothing if not open
  if (!isOpen) return null;

  // Create portal for the kbar
  return (
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
      >
        <ArrowNavigation
          layout="column"
          itemCount={nonCustomOptions.length}
          onSelect={handleSelect}
          onEscape={handleClose}
          wrap={true}
          initialFocusedIndex={0}
          itemSelector='[role="option"]'
          autoFocus={false}
        >
          <Row fillWidth padding="8">
            <KbarSearchInput
              placeholder={placeholder}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              inputRef={inputRef}
            />
          </Row>
          <Column
            ref={scrollContainerRef}
            maxHeight={32}
            fillWidth
            padding="4"
            gap="2"
            overflowY="auto"
            radius="l"
            border="neutral-alpha-weak"
          >
            {groupedItems.map((option, index) => {
              if (option.isCustom) {
                return <React.Fragment key={option.value}>{option.label}</React.Fragment>;
              }

              return (
                <Option
                  key={option.value}
                  label={option.label}
                  value={option.value}
                  hasPrefix={option.hasPrefix}
                  hasSuffix={option.hasSuffix}
                  description={option.description}
                  {...(option.href
                    ? { href: option.href, onClick: undefined, onLinkClick: handleClose }
                    : { onClick: option.onClick })}
                />
              );
            })}
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
        </ArrowNavigation>
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
  );
};

export interface KbarProps {
  items: KbarItem[];
  children: React.ReactNode;
  [key: string]: any; // Allow any additional props
}

export const Kbar: React.FC<KbarProps> = ({ items, children, ...rest }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Close Kbar when pathname changes
  useEffect(() => {
    if (isOpen) {
      handleClose();
    }
  }, [pathname]);

  // Add keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Command+K (Mac) or Control+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault(); // Prevent default browser behavior
        setIsOpen((prev) => !prev); // Toggle Kbar open/close
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
      {isOpen &&
        createPortal(
          <KbarContent isOpen={isOpen} onClose={handleClose} items={items} />,
          document.body,
        )}
    </>
  );
};
