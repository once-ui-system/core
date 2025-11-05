"use client";

import { useState, useEffect } from "react";
import { Row, CountFx } from "@once-ui-system/core";

export const CountFxExample = () => {
  const [value, setValue] = useState<number>(0);

  useEffect(() => {
    // Start with 0 and animate to a random value between 1000 and 9999
    const targetValue = Math.floor(Math.random() * 9000) + 1000;
    setValue(targetValue);
  }, []);

  return (
    <Row fillWidth m={{ direction: "column" }} gap="32">
      <Row fillWidth>
        <CountFx
          variant="display-strong-m"
          value={value}
          speed={5000}
          effect="wheel"
          easing="ease-out"
        />
      </Row>
      <Row fillWidth>
        <CountFx
          variant="display-strong-m"
          value={value}
          speed={5000}
          effect="smooth"
          easing="ease-out"
        />
      </Row>
      <Row fillWidth>
        <CountFx
          variant="display-strong-m"
          separator=","
          value={value}
          speed={5000}
          effect="simple"
          easing="ease-out"
        />
      </Row>
    </Row>
  );
};
