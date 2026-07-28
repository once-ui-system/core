"use client";

import { CountFx, Row } from "@once-ui-system/core";
import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(3000);

  return (
    <Row fill center>
      <CountFx variant="display-default-xl" value={count} speed={10000} separator=","/>
    </Row>
  );
}