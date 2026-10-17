"use client";

import { useRef, useState } from "react";
import {
  Animation,
  Column,
  NavIcon,
  Dropdown,
  Option,
  useArrowNavigation,
} from "@once-ui-system/core";

export function AnimationNavIconExample() {
  const [isActive, setIsActive] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const navigation = useArrowNavigation({ layout: "column", itemCount: 3, containerRef: listRef });

  const handleToggle = () => {
    setIsActive(!isActive);
  };

  const handleOptionClick = () => {
    setIsActive(false);
  };

  return (
    <Animation
      trigger={
        <NavIcon onClick={handleToggle} active={isActive} />
      }
      slideDown="1rem"
      triggerType="manual"
      duration={300}
      active={isActive}
    >
      <Dropdown
        position="absolute"
        top="48"
        padding="4"
        gap="2"
        radius="l"
      >
        <Column ref={listRef} role="listbox" tabIndex={-1} onKeyDown={navigation.handleKeyDown}>
        <Option
          href="#"
          value="option-1"
          label="Option 1"
          onClick={handleOptionClick}
        />
        <Option
          href="#"
          value="option-2"
          label="Option 2"
          onClick={handleOptionClick}
        />
        <Option
          href="#"
          value="option-3"
          label="Option 3"
          onClick={handleOptionClick}
        />
        </Column>
      </Dropdown>
    </Animation>
  );
}
