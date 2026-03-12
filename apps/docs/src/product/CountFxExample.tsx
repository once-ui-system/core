'use client';

import { useState, useEffect, useRef } from 'react';
import { Row, CountFx, useInViewport } from "@once-ui-system/core";

export const CountFxExample = () => {
  const [value, setValue] = useState<number>(0);
  
  useEffect(() => {
    // Start with 0 and animate to a random value between 1000 and 9999
    const targetValue = Math.floor(Math.random() * 9000) + 1000;
    setValue(targetValue);
  }, []);

  return (
    <Row fillWidth m={{direction:"column"}} gap="32">
      <Row fillWidth><CountFx variant="display-strong-m" value={value} speed={5000} effect="wheel" easing="ease-out" /></Row>
      <Row fillWidth><CountFx variant="display-strong-m" value={value} speed={5000} effect="smooth" easing="ease-out" /></Row>
      <Row fillWidth><CountFx variant="display-strong-m" separator="," value={value} speed={5000} effect="simple" easing="ease-out" /></Row>
    </Row>
  );
};


export const ScrollCountExample = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState<number>(0);

  // Trigger when element reaches center of viewport
  const isInViewport = useInViewport(ref, { rootMargin: "-50% 0px" });
  
  useEffect(() => {
      if (isInViewport) {
          setValue(9876);
      }
  }, [isInViewport]);
  
  return (
    <CountFx
      ref={ref}
      variant="display-strong-l"
      value={value}
      speed={2000}
      effect="wheel"
      easing="ease-out"
    />
  );
}