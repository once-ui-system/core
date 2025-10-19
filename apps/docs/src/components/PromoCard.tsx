"use client";

import { useRef, useState, useEffect } from "react";
import {
  Row,
  Button,
  Card,
  Animation,
  Hover,
  LetterFx,
  Background,
  Media,
  Text
} from "@once-ui-system/core";

export interface PromoCardProps {
  href: string;
  image: string;
  buttonText?: string;
  showOverlay?: boolean;
}

export function PromoCard({ 
  href, 
  image,
}: PromoCardProps) {
  const triggerLetterFxRef = useRef<(() => void) | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Trigger animation when hovered and ref is available
  useEffect(() => {
    if (isHovered && triggerLetterFxRef.current) {
      // Small delay to ensure overlay is mounted
      const timer = setTimeout(() => {
        triggerLetterFxRef.current?.();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isHovered]);

  const cardContent = (
    <Card fillWidth href={href} overflow="hidden">
      <Animation scale={1.05} reverse fade={1} triggerType="hover">
        <Media src={image} priority sizes="400px"/>
      </Animation>
    </Card>
  );

  return (
    <Row fillWidth
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Hover
        trigger={cardContent}
        overlay={
          <Row fill padding="4">
            <Row fill border="neutral-alpha-medium" radius="l" vertical="end" overflow="hidden">
              <Row fillWidth height="32">
                <Background
                  fill
                  borderTop="neutral-alpha-medium"
                  lines={{
                    display: true,
                    color: "neutral-alpha-weak",
                    angle: -45,
                    size: "4"
                  }}/>
                <Button data-border="sharp" size="s" suffixIcon="chevronRight">
                  <Text variant="code-default-s">
                    <LetterFx
                      charset={["x", "y", "z", "0", "/", "!", "u", "o"]}
                      trigger="custom"
                      onTrigger={(triggerFn) => {
                        triggerLetterFxRef.current = triggerFn;
                      }}
                    >
                      Buy now
                    </LetterFx>
                  </Text>
                </Button>
                <Background
                  fill
                  borderTop="neutral-alpha-medium"
                  lines={{
                    display: true,
                    color: "neutral-alpha-weak",
                    angle: -45,
                    size: "4"
                  }}/>
              </Row>
            </Row>
          </Row>
        }
      />
    </Row>
  );
}
