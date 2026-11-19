"use client";

import { Row } from "@once-ui-system/core";
import { CountFx } from "@once-ui-system/fx";
import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(3000);

  return (
    <Row fill center>
      <CountFx textVariant="display-default-xl" value={count} duration={10000} separator=","/>
    </Row>
  );
}