'use client';

import { useState, useEffect } from 'react';
import { Column, ProgressBar, Text } from "@once-ui-system/core";

export const ProgressBarExample = () => {
  const [value, setValue] = useState<number>(0);
  
  useEffect(() => {
    // Start with 0 and animate to 100 over time
    let currentValue = 0;
    const interval = setInterval(() => {
      currentValue += 1;
      setValue(currentValue);
      
      if (currentValue >= 100) {
        clearInterval(interval);
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Column gap="16" fillWidth>
      <ProgressBar value={value} />
    </Column>
  );
};
