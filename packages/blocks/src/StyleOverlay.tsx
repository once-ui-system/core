"use client";

import { Background, type DisplayProps, Flex, IconButton } from "@once-ui-system/core";
import { useState } from "react";
import styles from "./StyleOverlay.module.scss";
import { StylePanel } from "./StylePanel.js";

interface StyleOverlayProps extends React.ComponentProps<typeof Flex> {
  iconButtonProps?: Partial<React.ComponentProps<typeof IconButton>>;
  children: React.ReactNode;
  zIndex?: DisplayProps["zIndex"];
}

const StyleOverlay = ({
  ref,
  iconButtonProps,
  children,
  zIndex = 2,
  ...rest
}: StyleOverlayProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Flex ref={ref} position="static" zIndex={zIndex}>
      {!isOpen && <Flex onClick={togglePanel}>{children}</Flex>}
      <Flex
        as="aside"
        zIndex={3}
        className={`${styles.panel} ${isOpen && styles.open}`}
        maxWidth="28rem"
        style={{
          maxHeight: "calc(100% - var(--static-space-4))",
        }}
        fillHeight
        position="absolute"
        shadow="xl"
        top="2"
        right="2"
        transition="macro-medium"
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
            width="8rem"
            height="4rem"
            mask={{ x: "100%", y: 0, radius: "7vh" }}
            dots={{ display: true, size: "2", color: "page-background" }}
          />
          <IconButton
            variant="secondary"
            onClick={togglePanel}
            icon="close"
            aria-label="Close style panel"
            {...iconButtonProps}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

StyleOverlay.displayName = "StyleOverlay";

export { StyleOverlay };
