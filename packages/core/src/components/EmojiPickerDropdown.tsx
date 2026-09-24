"use client";

import type React from "react";
import { forwardRef } from "react";
import { DropdownWrapper } from "./DropdownWrapper";
import { EmojiPicker } from "./EmojiPicker";
import type { StyleProps } from "../interfaces";
import type { GridSize } from "../types";

export interface EmojiPickerDropdownProps
  extends Omit<React.ComponentProps<typeof DropdownWrapper>, "dropdown"> {
  onSelect: (emoji: string) => void;
  background?: StyleProps["background"];
  columns?: GridSize;
}

const EmojiPickerDropdown = forwardRef<HTMLDivElement, EmojiPickerDropdownProps>(({
  trigger,
  onSelect,
  closeAfterClick = true,
  background = "surface",
  columns = "8",
  ...dropdownProps
}, ref) => {
  const handleEmojiSelect = (emoji: string) => {
    onSelect(emoji);
    if (closeAfterClick) {
      dropdownProps.onOpenChange?.(false);
    }
  };

  return (
    <DropdownWrapper
      {...dropdownProps}
      trigger={trigger}
      handleArrowNavigation={false}
      dropdown={
        <EmojiPicker
          columns={columns}
          padding="8"
          onSelect={handleEmojiSelect}
          onClose={closeAfterClick ? () => dropdownProps.onOpenChange?.(false) : undefined}
          background={background}
        />
      }
    />
  );
})

EmojiPickerDropdown.displayName = "EmojiPickerDropdown";
export { EmojiPickerDropdown };
