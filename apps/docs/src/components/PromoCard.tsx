"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import {
  Row,
  Button,
  Card,
  Animation,
  Hover,
  LetterFx,
  Media,
  Text,
  BlobFx
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

  const cardContent = useMemo(
    () => (
      <Card radius="l" fillWidth href={href} overflow="hidden" background="page">
        <BlobFx data-solid="color" fill position="absolute" translateY="50%" />
        <Animation fillWidth scale={1.05} reverse fade={1} triggerType="hover">
          <Media aspectRatio="3/4" src={image} priority sizes={400} />
        </Animation>
      </Card>
    ),
    [href, image],
  );

  const overlayContent = useMemo(
    () => (
      <Row fill padding="4">
        <Row fill border="neutral-alpha-medium" radius="l" vertical="end" overflow="hidden" padding="12" horizontal="center">
            <Button size="s">
              <Text variant="code-strong-s">
                <LetterFx
                  charset={["x", "y", "z", "0", "/", "!", "u", "o"]}
                  trigger="custom"
                  onTrigger={(triggerFn) => {
                    triggerLetterFxRef.current = triggerFn;
                  }}
                >
                  Explore
                </LetterFx>
              </Text>
            </Button>
        </Row>
      </Row>
    ),
    [],
  );

  return (
    <Row fillWidth
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Hover
        fillWidth
        trigger={cardContent}
        overlay={overlayContent}
      />
    </Row>
  );
}
