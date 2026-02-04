"use client";

import React from "react";
import { Button, Column, LineChart, Row, useStreamingViewport } from "@once-ui-system/core";

type Point = {
  t: number;
  Value: number;
  Baseline: number;
};

const WINDOW_SIZE = 10;
const INTERVAL_MS = 1000;
const BASELINE = 50;
const AMPLITUDE = 128;
const NOISE = 10;

type LineChartStreamingExampleProps = {
  animation?: boolean;
};

function createInitialData(count: number): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < count; i++) {
    const baseline = BASELINE;
    const value =
      baseline + Math.sin(i / 2) * AMPLITUDE + (Math.random() - 0.5) * NOISE;
    points.push({ t: i, Value: Math.round(value * 10) / 10, Baseline: baseline });
  }
  return points;
}

export function LineChartStreamingExample({ animation = true }: LineChartStreamingExampleProps) {
  const { data, xDomain, running, setRunning, reset } = useStreamingViewport<Point>({
    initialData: createInitialData(WINDOW_SIZE),
    windowSize: WINDOW_SIZE,
    intervalMs: INTERVAL_MS,
    stepMs: 16,
    xKey: "t",
    numericKeys: ["Value", "Baseline"],
    getNextTarget: ({ nextX }) => {
      const baseline = BASELINE;
      const value = baseline + Math.sin(nextX / 2) * AMPLITUDE + (Math.random() - 0.5) * NOISE;
      return {
        Value: Math.round(value * 10) / 10,
        Baseline: baseline,
      };
    },
  });

  return (
    <Column fillWidth gap="12" marginTop="16" marginBottom="24">
      <Row fillWidth gap="8" horizontal="between" vertical="center">
        <Row gap="8">
          <Button
            size="s"
            variant="secondary"
            onClick={() => setRunning((v) => !v)}
          >
            {running ? "Pause" : "Resume"}
          </Button>
          <Button
            size="s"
            variant="tertiary"
            onClick={() => {
              reset();
            }}
          >
            Reset
          </Button>
        </Row>
      </Row>

      <LineChart
        variant="outline"
        title="Live streaming data"
        description={
          animation
            ? `Viewport streaming (smooth pan). New samples every ${INTERVAL_MS}ms.`
            : `Viewport streaming (smooth pan) with animation disabled. New samples every ${INTERVAL_MS}ms.`
        }
        axis="both"
        grid="both"
        tooltip
        legend={{ display: true, position: "top-left" }}
        animation={animation}
        animationBegin={0}
        animationDuration={INTERVAL_MS}
        animationEasing="linear"
        xAxisType="number"
        xDomain={xDomain}
        series={[
          { key: "Value" },
          { key: "Baseline" },
        ]}
        data={data}
      />
    </Column>
  );
}
