"use client";

import { cva } from "class-variance-authority";
import { forwardRef, useState } from "react";
import { cn } from "../classes/utils";
import type { DisplayProps } from "../interfaces";
import { Background } from "./Background";
import { Flex } from "./Flex";
import { IconButton, type IconButtonProps } from "./IconButton";
import { StylePanel } from "./StylePanel";

export interface StyleOverlayProps extends React.ComponentProps<typeof Flex> {
  iconButtonProps?: Partial<IconButtonProps>;
  children: React.ReactNode;
  zIndex?: DisplayProps["zIndex"];
}

export const styleOverlayPanelVariants = cva(
  "origin-top-right transition-all duration-macro-medium ease-out max-h-[calc(100%-var(--static-space-4))]",
  {
    variants: {
      open: {
        true: "visible opacity-100 z-[3] scale-100 blur-none",
        false: "invisible opacity-0 -z-[1] scale-[0.2] blur-[0.25rem] pointer-events-none",
      },
    },
    defaultVariants: {
      open: false,
    },
  },
);

export const StyleOverlay = forwardRef<HTMLDivElement, StyleOverlayProps>(
  ({ iconButtonProps, children, zIndex = 2, className, ...rest }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    const togglePanel = () => {
      setIsOpen(!isOpen);
    };

    return (
      <Flex ref={ref} position="static" zIndex={zIndex}>
        {!isOpen && (
          <Flex
            onClick={togglePanel}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                togglePanel();
              }
            }}
          >
            {children}
          </Flex>
        )}
        <Flex
          as="aside"
          zIndex={3}
          className={cn(styleOverlayPanelVariants({ open: isOpen }), className)}
          maxWidth={28}
          fillHeight
          position="absolute"
          shadow="xl"
          top="2"
          right="2"
          background="page"
          overflow="hidden"
          radius="xl"
          border="neutral-medium"
          {...rest}
        >
          <StylePanel fill overflowY="scroll" padding="8" />
          <Flex position="absolute" paddingTop="8" paddingRight="12" top="0" right="0">
            <Background
              position="absolute"
              top="0"
              right="8"
              left={undefined}
              width={8}
              height={4}
              mask={{ x: 100, y: 0, radius: 7 }}
              dots={{ display: true, size: "2", color: "page-background" }}
            />
            <IconButton
              variant="secondary"
              icon="close"
              aria-label="Close style panel"
              {...iconButtonProps}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                togglePanel();
                iconButtonProps?.onClick?.(e);
              }}
            />
          </Flex>
        </Flex>
      </Flex>
    );
  },
);

StyleOverlay.displayName = "StyleOverlay";
