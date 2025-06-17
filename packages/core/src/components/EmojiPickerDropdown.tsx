"use client";

import React from "react";
import { DropdownWrapper, EmojiPicker } from ".";
import { StyleProps, gridColumns } from "..";

export interface EmojiPickerDropdownProps extends Omit<React.ComponentProps<typeof DropdownWrapper>, 'dropdown'> {
  onSelect: (emoji: string) => void;
  background?: StyleProps["background"];
  columns?: gridColumns;
}

const EmojiPickerDropdown: React.FC<EmojiPickerDropdownProps> = ({
  trigger,
  onSelect,
  closeAfterClick = true,
  background = "surface",
  columns = "8",
  ...dropdownProps
}) => {
  const handleEmojiSelect = (emoji: string) => {
    onSelect(emoji);
  };

  return (
    <DropdownWrapper
      {...dropdownProps}
      trigger={trigger}
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
};

export { EmojiPickerDropdown };
