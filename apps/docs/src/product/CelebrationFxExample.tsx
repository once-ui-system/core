"use client";

import React, { useState } from "react";
import { CelebrationFx, Button, Column } from "@once-ui-system/core";

export function CelebrationFxExample() {
  const [active, setActive] = useState(false);

  return (
    <Column gap="16" fillWidth horizontal="center" padding="24">
      <CelebrationFx
        height={16}
        type="fireworks"
        trigger="manual"
        active={active}
      />
      <Button
        rounded
        size="s"
        weight="default"
        variant="secondary"
        onClick={() => {
          setActive(true);
          setTimeout(() => setActive(false), 3000);
        }}
      >
        Launch Fireworks
      </Button>
    </Column>
  );
}
