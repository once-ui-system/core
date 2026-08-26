"use client";

import { cva } from "class-variance-authority";
import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../classes/utils";
import { CountFx, type CountFxProps } from "./CountFx";
import { Row } from "./Row";
import { Text } from "./Text";

export const countdownFxVariants = cva("tabular-nums");
const COUNTDOWN_FX_BASE = countdownFxVariants();

export interface CountdownFxProps
  extends Omit<CountFxProps, "value" | "format" | "separator" | "effect"> {
  targetDate: Date | string;
  format?: "HH:MM:SS" | "DD:HH:MM:SS" | "MM:SS";
  effect?: CountFxProps["effect"];
  onComplete?: () => void;
}

const padZero = (num: number) => num.toString().padStart(2, "0");

const CountdownFx = forwardRef<HTMLDivElement, CountdownFxProps>(
  (
    {
      targetDate,
      format = "HH:MM:SS",
      effect = "wheel",
      onComplete,
      className,
      style,
      ...countFxProps
    },
    ref,
  ) => {
    const [timeRemaining, setTimeRemaining] = useState({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      total: 0,
    });

    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;
    const completedRef = useRef(false);

    useEffect(() => {
      completedRef.current = false;

      const calculateTimeRemaining = () => {
        const now = Date.now();
        const target =
          typeof targetDate === "string"
            ? new Date(targetDate).getTime()
            : (targetDate?.getTime?.() ?? 0);
        const difference = target - now;

        if (difference <= 0) {
          setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
          if (!completedRef.current) {
            completedRef.current = true;
            onCompleteRef.current?.();
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
    }, [targetDate]);

    const renderTimeUnit = (value: number, key: string) => {
      const paddedValue = padZero(value);
      const digits = paddedValue.split("");

      return (
        <Row key={key} gap="0" inline vertical="center">
          {digits.map((digit, index) => (
            <CountFx
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed digit position in time unit
              key={`${key}-${index}`}
              value={parseInt(digit, 10)}
              effect={effect}
              speed={400}
              {...countFxProps}
            />
          ))}
        </Row>
      );
    };

    const renderSeparator = (key: string) => (
      <Text key={key} className="w-[0.5em] text-center" {...countFxProps}>
        :
      </Text>
    );

    const isDaysFormat = format === "DD:HH:MM:SS";
    const isMinutesFormat = format === "MM:SS";

    const displayedDays = timeRemaining.days;
    const displayedHours = isDaysFormat
      ? timeRemaining.hours
      : timeRemaining.days * 24 + timeRemaining.hours;
    const displayedMinutes = isMinutesFormat
      ? timeRemaining.days * 24 * 60 + timeRemaining.hours * 60 + timeRemaining.minutes
      : timeRemaining.minutes;
    const displayedSeconds = timeRemaining.seconds;

    return (
      <Row
        ref={ref}
        gap="0"
        vertical="center"
        className={cn(COUNTDOWN_FX_BASE, className)}
        style={style}
      >
        {isDaysFormat && (
          <>
            {renderTimeUnit(displayedDays, "days")}
            {renderSeparator("sep-days")}
          </>
        )}
        {!isMinutesFormat && (
          <>
            {renderTimeUnit(displayedHours, "hours")}
            {renderSeparator("sep-hours")}
          </>
        )}
        {renderTimeUnit(displayedMinutes, "minutes")}
        {renderSeparator("sep-minutes")}
        {renderTimeUnit(displayedSeconds, "seconds")}
      </Row>
    );
  },
);

CountdownFx.displayName = "CountdownFx";

export { CountdownFx };
