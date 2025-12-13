'use client';

import { useState, useEffect } from 'react';
import { Row, CountFx } from "@once-ui-system/core";

export const CountFxDecimalExample = () => {
  const [value1, setValue1] = useState<number>(0);
  const [value2, setValue2] = useState<number>(0);
  
  useEffect(() => {
    // Animate to random decimal values
    const targetValue1 = parseFloat((Math.random() * 200 + 50).toFixed(2));
    const targetValue2 = parseFloat((Math.random() * 150 + 25).toFixed(2));
    
    setValue1(targetValue1);
    setValue2(targetValue2);
  }, []);

  return (
    <Row fillWidth m={{direction:"column"}} gap="32">
      <Row fillWidth>
        <CountFx 
          variant="display-strong-m" 
          value={value1} 
          decimals={2}
          speed={2000} 
          effect="simple" 
          easing="ease-out" 
        />
      </Row>
      <Row fillWidth>
        <CountFx 
          variant="display-strong-m" 
          value={value2} 
          decimals={2}
          speed={2000} 
          separator="," 
          effect="simple" 
          easing="ease-out"
        >
          {" USD"}
        </CountFx>
      </Row>
    </Row>
  );
};
