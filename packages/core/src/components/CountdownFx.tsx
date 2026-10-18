"use client";

import React, { forwardRef, useEffect, useRef, useState } from "react";
import { CountFx, CountFxProps } from "./CountFx";
import { Row } from "./Row";
import { Text } from "./Text";

export interface CountdownFxProps
  extends Omit<CountFxProps, "value" | "format" | "separator" | "effect"> {
  targetDate: Date | string;
  format?: "HH:MM:SS" | "DD:HH:MM:SS" | "MM:SS";
  effect?: CountFxProps["effect"];
  onComplete?: () => void;
}

const CountdownFx = forwardRef<HTMLDivElement, CountdownFxProps>(
  ({ targetDate, format = "HH:MM:SS", effect = "wheel", onComplete, ...countFxProps }, ref) => {
    const [timeRemaining, setTimeRemaining] = useState({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      total: 0,
    });

    // The target as a number, so a fresh Date for the same moment (a parent
    // re-rendering `new Date(...)`) does not restart the countdown.
    const target =
      typeof targetDate === "string" ? new Date(targetDate).getTime() : targetDate.getTime();
    // Read through a ref: an inline callback is a new function on every render,
    // and must not restart the countdown or fire again.
    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;

    useEffect(() => {
      let interval: ReturnType<typeof setInterval> | undefined;

      const calculateTimeRemaining = () => {
        const now = new Date().getTime();
        const difference = target - now;

        if (difference <= 0) {
          setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
          // Done: stop ticking, so onComplete fires once rather than every second.
          if (interval !== undefined) clearInterval(interval);
          interval = undefined;
          onCompleteRef.current?.();
          return false;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeRemaining({ days, hours, minutes, seconds, total: difference });
        return true;
      };

      if (calculateTimeRemaining()) {
        interval = setInterval(calculateTimeRemaining, 1000);
      }

      return () => {
        if (interval !== undefined) clearInterval(interval);
      };
    }, [target]);

    const padZero = (num: number) => num.toString().padStart(2, "0");

    const renderTimeUnit = (value: number, key: string) => {
      const paddedValue = padZero(value);
      const digits = paddedValue.split("");

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
      <Text key="separator" {...countFxProps} style={{ width: "0.5em", textAlign: "center" }}>
        :
      </Text>
    );

    if (timeRemaining.total === 0) {
      return (
        <Row
          ref={ref}
          gap="0"
          align="center"
          textVariant={countFxProps.variant}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {format === "DD:HH:MM:SS" && (
            <>
              {renderTimeUnit(0, "days")}
              {renderSeparator()}
            </>
          )}
          {renderTimeUnit(0, "hours")}
          {renderSeparator()}
          {renderTimeUnit(0, "minutes")}
          {format !== "MM:SS" && (
            <>
              {renderSeparator()}
              {renderTimeUnit(0, "seconds")}
            </>
          )}
        </Row>
      );
    }

    return (
      <Row ref={ref} gap="0" align="center" style={{ fontVariantNumeric: "tabular-nums" }}>
        {format === "DD:HH:MM:SS" && timeRemaining.days > 0 && (
          <>
            {renderTimeUnit(timeRemaining.days, "days")}
            {renderSeparator()}
          </>
        )}
        {format !== "MM:SS" && (
          <>
            {renderTimeUnit(
              format === "DD:HH:MM:SS"
                ? timeRemaining.hours
                : timeRemaining.days * 24 + timeRemaining.hours,
              "hours",
            )}
            {renderSeparator()}
          </>
        )}
        {renderTimeUnit(timeRemaining.minutes, "minutes")}
        {renderSeparator()}
        {renderTimeUnit(timeRemaining.seconds, "seconds")}
      </Row>
    );
  },
);

CountdownFx.displayName = "CountdownFx";

export { CountdownFx };
