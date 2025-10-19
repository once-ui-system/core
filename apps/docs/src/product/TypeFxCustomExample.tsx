'use client';

import { useRef } from 'react';
import { TypeFx, Button, Column } from "@once-ui-system/core";

export const TypeFxCustomExample = () => {
  const triggerFnRef = useRef<(() => void) | null>(null);

  return (
    <Column fillWidth horizontal="center" gap="16">
      <TypeFx
        words={["Click the button", "to start typing", "this animation"]}
        speed={60}
        hold={1500}
        trigger="custom"
        onTrigger={(fn) => {
          triggerFnRef.current = fn;
        }}
      />
      <Button onClick={() => triggerFnRef.current?.()} data-border="rounded" variant="secondary" size="s">
        Start typing
      </Button>
    </Column>
  );
};
