"use client";

import { Button, Row } from "@once-ui-system/core";
import { WeatherFx } from "@once-ui-system/core";
import React from "react";

export function WeatherFxExample() {
  const [on, setOn] = React.useState(false);

  return (
    <Row height={16} gap="8" fillWidth vertical="end" horizontal="center" padding="24">
      <WeatherFx position="absolute" left="0" top="0" type="snow" trigger="manual" active={on} intensity={60} />
      <Button rounded size="s" variant="secondary" onClick={() => setOn((v) => !v)}>
        {on ? "Stop" : "Start"}
      </Button>
    </Row>
  );
}