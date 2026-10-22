"use client";

import type React from "react";
import { forwardRef, useState } from "react";
import type { StyleProps } from "../interfaces";
import type { GridSize } from "../types";
import { DropdownWrapper } from "./DropdownWrapper";
import { EmojiPicker } from "./EmojiPicker";

export interface EmojiPickerDropdownProps
  extends Omit<React.ComponentProps<typeof DropdownWrapper>, "dropdown"> {
  onSelect: (emoji: string) => void;
  background?: StyleProps["background"];
  columns?: GridSize;
}

const EmojiPickerDropdown = forwardRef<HTMLDivElement, EmojiPickerDropdownProps>(
  (
    {
      trigger,
      onSelect,
      closeAfterClick = true,
      background = "surface",
      columns = "8",
      open: controlledOpen,
      onOpenChange,
      ...dropdownProps
    },
    ref,
  ) => {
    // Closing after a pick used to go only through `onOpenChange`, so it
    // worked only when the caller controlled `open`. Uncontrolled, the
    // dropdown's open state lives here and the pick closes it.
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = (next: boolean) => {
      if (controlledOpen === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    };

    const handleEmojiSelect = (emoji: string) => {
      onSelect(emoji);
      if (closeAfterClick) setOpen(false);
    };

    return (
      <DropdownWrapper
        {...dropdownProps}
        ref={ref}
        open={open}
        onOpenChange={setOpen}
        trigger={trigger}
        handleArrowNavigation={false}
        dropdown={
          <EmojiPicker
            columns={columns}
            padding="8"
            // No `onClose`: the picker calls it right after `onSelect`, and
            // handleEmojiSelect already closes, so every pick reported the
            // close to onOpenChange twice.
            onSelect={handleEmojiSelect}
            background={background}
          />
        }
      />
    );
  },
);

EmojiPickerDropdown.displayName = "EmojiPickerDropdown";

export { EmojiPickerDropdown };
