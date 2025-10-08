"use client";

import { useState } from "react";
import { Animation, NavIcon, Dropdown, Option, ArrowNavigation } from "@once-ui-system/core";

export function AnimationNavIconExample() {
  const [isActive, setIsActive] = useState(false);

  const handleToggle = () => {
    setIsActive(!isActive);
  };

  const handleOptionClick = () => {
    setIsActive(false);
  };

  return (
    <Animation
      trigger={
        <NavIcon onClick={handleToggle} isActive={isActive} />
      }
      slideDown={1}
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
        <ArrowNavigation layout="column" itemCount={3}>
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
        </ArrowNavigation>
      </Dropdown>
    </Animation>
  );
}
