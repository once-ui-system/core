"use client";

import { CountFx, Row } from "@once-ui-system/core";
import { useEffect, useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(3000);
  }, []);

  return (
    <Row fill center>
      <CountFx variant="display-default-xl" value={count} speed={10000} separator=","/>
    </Row>
  );
}