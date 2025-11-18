"use client";

import { Row, MatrixFx, Button } from "@once-ui-system/core";
import React from "react";

export function MatrixFxExample() {
  const [on, setOn] = React.useState(false);
  
  return (
    <Row height={16} gap="8" fillWidth vertical="end" horizontal="center" padding="24">
      <MatrixFx position="absolute" left="0" top="0" trigger="manual" active={on} colors={["brand-solid-medium"]} />
      <Button rounded size="s" variant="secondary" onClick={() => setOn((v) => !v)}>
        {on ? "Stop" : "Start"}
      </Button>
    </Row>
  );
}
