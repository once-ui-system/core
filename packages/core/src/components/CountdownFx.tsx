"use client";

import React, { useEffect, useState } from "react";
import { Row, Text, CountFx, CountFxProps } from ".";

export interface CountdownFxProps extends Omit<CountFxProps, 'value' | 'format' | 'separator' | 'effect'> {
  targetDate: Date | string;
  format?: "HH:MM:SS" | "DD:HH:MM:SS" | "MM:SS";
  effect?: CountFxProps['effect'];
  onComplete?: () => void;
}

const CountdownFx: React.FC<CountdownFxProps> = ({
  targetDate,
  format = "HH:MM:SS",
  effect = "wheel",
  onComplete,
  ...countFxProps
}) => {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const target = typeof targetDate === 'string' ? new Date(targetDate).getTime() : targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        if (onComplete) {
          onComplete();
        }
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds, total: difference });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  const padZero = (num: number) => num.toString().padStart(2, '0');

  const renderTimeUnit = (value: number, key: string) => {
    const paddedValue = padZero(value);
    const digits = paddedValue.split('');
    
    return (
      <Row key={key} gap="0" inline>
        {digits.map((digit, index) => (
          <CountFx
            key={`${key}-${index}`}
            value={parseInt(digit)}
            effect={effect}
            speed={400}
            {...countFxProps}
          />
        ))}
      </Row>
    );
  };

  const renderSeparator = () => (
    <Text key={`sep-${Math.random()}`} {...countFxProps} style={{ width: '0.5em', textAlign: 'center' }}>
      :
    </Text>
  );

  if (timeRemaining.total === 0) {
    return (
      <Row gap="0" align="center" textVariant={countFxProps.variant} style={{ fontVariantNumeric: 'tabular-nums' }}>
        {format === "DD:HH:MM:SS" && (
          <>
            {renderTimeUnit(0, 'days')}
            {renderSeparator()}
          </>
        )}
        {renderTimeUnit(0, 'hours')}
        {renderSeparator()}
        {renderTimeUnit(0, 'minutes')}
        {format !== "MM:SS" && (
          <>
            {renderSeparator()}
            {renderTimeUnit(0, 'seconds')}
          </>
        )}
      </Row>
    );
  }

  return (
    <Row gap="0" align="center" style={{ fontVariantNumeric: 'tabular-nums' }}>
      {format === "DD:HH:MM:SS" && timeRemaining.days > 0 && (
        <>
          {renderTimeUnit(timeRemaining.days, 'days')}
          {renderSeparator()}
        </>
      )}
      {format !== "MM:SS" && (
        <>
          {renderTimeUnit(
            format === "DD:HH:MM:SS" ? timeRemaining.hours : timeRemaining.days * 24 + timeRemaining.hours,
            'hours'
          )}
          {renderSeparator()}
        </>
      )}
      {renderTimeUnit(timeRemaining.minutes, 'minutes')}
      {renderSeparator()}
      {renderTimeUnit(timeRemaining.seconds, 'seconds')}
    </Row>
  );
};

CountdownFx.displayName = "CountdownFx";
export { CountdownFx };
