"use client";

import { forwardRef } from "react";
import { Animation, AnimationProps } from ".";

type HoverCardProps = Omit<AnimationProps, 'triggerType' | 'portal'>;

const HoverCard = forwardRef<HTMLDivElement, HoverCardProps>(
  ({ children, ...props }, ref) => {
    return (
      <Animation
        ref={ref}
        fade={0}
        slideUp={0.5}
        scale={0.9}
        duration={200}
        triggerType="hover"
        placement="top"
        portal
        {...props}
      >
        {children}
      </Animation>
    );
  },
);

HoverCard.displayName = "HoverCard";
export { HoverCard };
