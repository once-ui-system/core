"use client";

import {
  type KeyboardEvent,
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDebounce } from "../hooks/useDebounce.js";
import { useControllableState } from "../internal/useControllableState.js";
import { Column } from "./Column.js";
import { Dropdown, type DropdownProps } from "./Dropdown.js";
import styles from "./EmojiPicker.module.scss";
import type { Flex } from "./Flex.js";
import { Grid } from "./Grid.js";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
import { Input } from "./Input.js";
import { Row } from "./Row.js";
import { type ButtonOption, SegmentedControl } from "./SegmentedControl.js";
import { Text } from "./Text.js";

type EmojiItem = {
  char: string;
  description: string;
  aliases?: string[];
  tags?: string[];
};

type EmojiData = Record<string, EmojiItem[]>;

const fallbackEmojiData: EmojiData = {
  smileys: [
    { char: "😀", description: "grinning face" },
    { char: "😃", description: "grinning face with big eyes" },
    { char: "😄", description: "grinning face with smiling eyes" },
    { char: "😁", description: "beaming face with smiling eyes" },
    { char: "😆", description: "grinning squinting face" },
    { char: "😅", description: "grinning face with sweat" },
    { char: "🤣", description: "rolling on the floor laughing" },
    { char: "😂", description: "face with tears of joy" },
  ],
  animals: [
    { char: "🐶", description: "dog face" },
    { char: "🐱", description: "cat face" },
    { char: "🐭", description: "mouse face" },
    { char: "🦊", description: "fox face" },
  ],
  food: [
    { char: "🍎", description: "red apple" },
    { char: "🍐", description: "pear" },
    { char: "🍊", description: "tangerine" },
    { char: "🍋", description: "lemon" },
  ],
  activities: [
    { char: "⚽", description: "soccer ball" },
    { char: "🏀", description: "basketball" },
    { char: "🏈", description: "american football" },
    { char: "⚾", description: "baseball" },
  ],
  travel: [
    { char: "🚗", description: "car" },
    { char: "🚕", description: "taxi" },
    { char: "🚙", description: "sport utility vehicle" },
    { char: "🚌", description: "bus" },
  ],
  objects: [
    { char: "💻", description: "laptop" },
    { char: "📱", description: "mobile phone" },
    { char: "💡", description: "light bulb" },
    { char: "🔍", description: "magnifying glass" },
  ],
  symbols: [
    { char: "❤️", description: "red heart" },
    { char: "💔", description: "broken heart" },
    { char: "💯", description: "hundred points" },
    { char: "✨", description: "sparkles" },
  ],
  flags: [
    { char: "🏁", description: "chequered flag" },
    { char: "🚩", description: "triangular flag" },
    { char: "🎌", description: "crossed flags" },
    { char: "🏴", description: "black flag" },
  ],
};

import generatedEmojiData from "../data/emoji-data.json" with { type: "json" };
import type { IconName } from "../icons.js";
import type { StyleProps } from "../interfaces.js";
import type { GridSize, Placement } from "../types.js";

const emojiData: EmojiData =
  Object.keys(generatedEmojiData).length > 0
    ? (generatedEmojiData as EmojiData)
    : fallbackEmojiData;

export interface EmojiPickerProps extends Omit<React.ComponentProps<typeof Flex>, "onSelect"> {
  onSelect: (emoji: string) => void;
  /**
   * Open the picker from a trigger, in a Dropdown (2.x
   * `EmojiPickerDropdown`). Without one the picker renders inline.
   */
  trigger?: React.ReactNode;
  /** With `trigger`: whether the picker is open. Leave unset and it opens and closes itself. */
  open?: boolean;
  /** With `trigger`: open on first render, uncontrolled. */
  defaultOpen?: boolean;
  /** With `trigger`: called with the next open state. */
  onOpenChange?: (open: boolean) => void;
  /** With `trigger`: where the picker opens. */
  placement?: Placement;
  /** With `trigger`: close once an emoji is picked. On by default. */
  closeAfterClick?: boolean;
  /** With `trigger`: further Dropdown props (`minWidth`, `fillWidth`, `nested`…). */
  dropdownProps?: Omit<
    DropdownProps,
    "trigger" | "children" | "dropdown" | "open" | "onOpenChange"
  >;
  onClose?: () => void;
  className?: string;
  background?: StyleProps["background"];
  columns?: GridSize;
  style?: React.CSSProperties;
}

// Memoized emoji button to prevent unnecessary re-renders
interface EmojiButtonProps {
  emoji: EmojiItem;
  index: number;
  isFocused: boolean;
  onSelect: (emoji: string) => void;
  onFocus: (index: number) => void;
}

const EmojiButton = memo(({ emoji, index, isFocused, onSelect, onFocus }: EmojiButtonProps) => {
  return (
    <IconButton
      key={index}
      tabIndex={index === 0 || isFocused ? 0 : -1}
      variant="tertiary"
      size="l"
      onClick={() => onSelect(emoji.char)}
      aria-label={emoji.description}
      title={emoji.description}
      className={styles.emojiButton}
      onFocus={() => onFocus(index)}
      ref={isFocused ? (el) => el?.focus() : undefined}
    >
      <Text textVariant="heading-default-xl">{emoji.char}</Text>
    </IconButton>
  );
});

EmojiButton.displayName = "EmojiButton";

const EmojiGrid = ({
  onSelect,
  onClose,
  className,
  background,
  columns = "8",
  style,
  ...flex
}: EmojiPickerProps) => {
  const searchInputId = useId();
  const [inputValue, setInputValue] = useState("");
  const searchQuery = useDebounce(inputValue, 300);
  const [activeCategory, setActiveCategory] = useState("smileys");
  const [focusedEmojiIndex, setFocusedEmojiIndex] = useState<number>(-1);
  const gridRef = useRef<HTMLDivElement>(null);

  const getCategoryIcon = (category: string): IconName => {
    switch (category) {
      case "smileys":
        return "smiley";
      case "animals":
        return "paw";
      case "food":
        return "food";
      case "activities":
        return "ball";
      case "travel":
        return "world";
      case "objects":
        return "gift";
      case "symbols":
        return "symbol";
      case "flags":
        return "flag";
      default:
        return "smiley";
    }
  };

  const categoryButtons: ButtonOption[] = Object.keys(emojiData).map((category) => ({
    value: category,
    children: <Icon name={getCategoryIcon(category)} size="s" />,
    "aria-label": `${category.charAt(0).toUpperCase()}${category.slice(1)}`,
  }));

  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      onSelect(emoji);
      if (onClose) {
        onClose();
      }
    },
    [onSelect, onClose],
  );

  const handleCategoryChange = useCallback((value: string) => {
    setActiveCategory(value);
  }, []);

  const filteredEmojis = useMemo(
    () =>
      searchQuery
        ? Object.values(emojiData)
            .flat()
            .filter((emoji: EmojiItem) => emoji.description.includes(searchQuery.toLowerCase()))
        : emojiData[activeCategory as keyof typeof emojiData] || [],
    [searchQuery, activeCategory],
  );

  // Reset focused index when filtered emojis change
  useEffect(() => {
    setFocusedEmojiIndex(-1);
  }, [filteredEmojis]);

  // Memoize the onFocus handler to prevent re-creating on every render
  const handleFocus = useCallback((index: number) => {
    setFocusedEmojiIndex(index);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (filteredEmojis.length === 0) return;

      // Use provided columns prop for grid navigation
      const emojisPerRow = Number(columns) || 6;

      let newIndex = focusedEmojiIndex;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          newIndex = focusedEmojiIndex < filteredEmojis.length - 1 ? focusedEmojiIndex + 1 : 0;
          break;
        case "ArrowLeft":
          e.preventDefault();
          newIndex = focusedEmojiIndex > 0 ? focusedEmojiIndex - 1 : filteredEmojis.length - 1;
          break;
        case "ArrowDown":
          e.preventDefault();
          newIndex = focusedEmojiIndex + emojisPerRow;
          if (newIndex >= filteredEmojis.length) {
            // Wrap to the beginning of the appropriate column
            newIndex = focusedEmojiIndex % emojisPerRow;
            if (newIndex >= filteredEmojis.length) newIndex = filteredEmojis.length - 1;
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          newIndex = focusedEmojiIndex - emojisPerRow;
          if (newIndex < 0) {
            // Wrap to the end of the appropriate column
            const rowsCount = Math.ceil(filteredEmojis.length / emojisPerRow);
            newIndex = (rowsCount - 1) * emojisPerRow + (focusedEmojiIndex % emojisPerRow);
            if (newIndex >= filteredEmojis.length) {
              newIndex = filteredEmojis.length - 1;
            }
          }
          break;
        case "Enter":
        case " ":
          if (focusedEmojiIndex >= 0 && focusedEmojiIndex < filteredEmojis.length) {
            e.preventDefault();
            handleEmojiSelect(filteredEmojis[focusedEmojiIndex].char);
          }
          break;
        default:
          return;
      }

      setFocusedEmojiIndex(newIndex);
    },
    [filteredEmojis, focusedEmojiIndex, handleEmojiSelect, columns],
  );

  return (
    <Column
      gap="16"
      background={background}
      className={className}
      style={style}
      data-testid="emoji-picker"
      height="24rem"
      {...flex}
    >
      <Input
        id={`emoji-search-${searchInputId}`}
        placeholder="Search emojis"
        value={inputValue}
        size="s"
        onChange={(e) => setInputValue(e.target.value)}
        prefix={<Icon size="s" onBackground="neutral-weak" name="search" />}
        aria-label="Search emojis"
      />

      <Column tabIndex={-1} fillHeight overflowY="auto" overflowX="hidden">
        {filteredEmojis.length > 0 ? (
          <Grid
            gap="2"
            fillWidth
            columns={columns}
            aria-label={searchQuery ? "Search results" : `${activeCategory} emojis`}
            ref={gridRef}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
            // A flat run of buttons with roving focus. role="grid" promised
            // rows and cells it never had (axe: aria-required-children).
            role="group"
          >
            {filteredEmojis.map((emoji: EmojiItem, index: number) => (
              <EmojiButton
                key={index}
                emoji={emoji}
                index={index}
                isFocused={index === focusedEmojiIndex}
                onSelect={handleEmojiSelect}
                onFocus={handleFocus}
              />
            ))}
          </Grid>
        ) : (
          <Row fill center align="center" onBackground="neutral-weak">
            No results found
          </Row>
        )}
      </Column>

      {!searchQuery && (
        <SegmentedControl
          buttons={categoryButtons}
          onValueChange={handleCategoryChange}
          defaultValue={activeCategory}
          fillWidth
        />
      )}
    </Column>
  );
};

EmojiGrid.displayName = "EmojiGrid";

/**
 * Search and pick an emoji. Inline by default; with a `trigger` it opens in a
 * Dropdown from that trigger, and closes itself after a pick.
 */
const EmojiPicker = ({
  trigger,
  open,
  defaultOpen = false,
  onOpenChange,
  placement,
  closeAfterClick = true,
  dropdownProps,
  ...picker
}: EmojiPickerProps) => {
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  if (trigger === undefined) return <EmojiGrid {...picker} />;
  const { onSelect, background = "surface", padding = "8", ...grid } = picker;
  return (
    <Dropdown
      {...dropdownProps}
      trigger={trigger}
      placement={placement}
      closeAfterClick={closeAfterClick}
      handleArrowNavigation={false}
      open={isOpen}
      onOpenChange={setOpen}
    >
      <EmojiGrid
        padding={padding}
        background={background}
        {...grid}
        onSelect={(emoji) => {
          onSelect(emoji);
          if (closeAfterClick) setOpen(false);
        }}
        // No `onClose`: the grid calls it right after `onSelect`, which
        // already closes, so every pick reported the close to onOpenChange
        // twice.
      />
    </Dropdown>
  );
};

EmojiPicker.displayName = "EmojiPicker";

export { EmojiPicker };
