"use client";

import React, {useState, useEffect, useCallback, JSX} from "react";
import {
  Button,
  Flex,
  Text,
  Heading,
  Column,
  Badge,
  Input,
  Card,
  Spinner,
  ProgressBar,
  Avatar,
  Chip,
  IconButton,
  Grid,
  Row,
} from "@once-ui-system/core";

interface BenchmarkResult {
  testName: string;
  renderTime: number;
  componentsCount: number;
  fps?: number;
}

interface PerformanceMetrics {
  memoryUsage?: number;
  renderTime: number;
  componentCount: number;
}

export const UIBenchmark: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string>("");
  const [componentsCount, setComponentsCount] = useState(100);

  // Function for measuring performance
  const measurePerformance = useCallback(
    (testName: string, renderFunction: () => JSX.Element, count: number): Promise<BenchmarkResult> => {
      return new Promise((resolve) => {
        const startTime = performance.now();
        let frameCount = 0;
        const fpsStart = performance.now();

        // Render components
        const renderStart = performance.now();
        renderFunction();
        const renderEnd = performance.now();

        // Measure FPS
        const measureFPS = () => {
          frameCount++;
          if (performance.now() - fpsStart < 1000) {
            requestAnimationFrame(measureFPS);
          } else {
            const fps = frameCount;
            const endTime = performance.now();

            resolve({
              testName,
              renderTime: renderEnd - renderStart,
              componentsCount: count,
              fps,
            });
          }
        };

        requestAnimationFrame(measureFPS);
      });
    },
    []
  );

  // Test simple components (Button, Badge, Text)
  const testSimpleComponents = useCallback(() => {
    const components = [];
    for (let i = 0; i < componentsCount; i++) {
      components.push(
        <Flex key={`simple-${i}`} gap="8" padding="4">
          <Button variant="primary" size="s">Button {i}</Button>
          <Badge arrow={false} onBackground="brand-medium" background="brand-medium" title={`Badge ${i}`}/>
          <Text variant="body-default-s">Text {i}</Text>
        </Flex>
      );
    }
    return <div>{components}</div>;
  }, [componentsCount]);

  // Test complex components (Card with multiple elements)
  const testComplexComponents = useCallback(() => {
    const components = [];
    for (let i = 0; i < Math.floor(componentsCount / 5); i++) {
      components.push(
        <Card key={`complex-${i}`} padding="16" style={{ margin: "8px" }}>
          <Flex direction="column" gap="8">
            <Heading variant="heading-default-xs">Card {i}</Heading>
            <Text variant="body-default-s">Description for card {i}</Text>
            <Flex gap="8">
              <Avatar size="s" src={`https://picsum.photos/32/32?random=${i}`} />
              <Chip label={`Chip ${i}`}/>
              <Button variant="secondary" size="s">Action</Button>
            </Flex>
            <ProgressBar value={(i % 10) * 10} />
          </Flex>
        </Card>
      );
    }
    return <div>{components}</div>;
  }, [componentsCount]);

  // Test Grid components
  const testGridComponents = useCallback(() => {
    const components = [];
    for (let i = 0; i < componentsCount; i++) {
      components.push(
        <Row key={`grid-${i}`}>
          <Card padding="12">
            <Text variant="body-default-s">Grid Item {i}</Text>
          </Card>
        </Row>
      );
    }
    return <Grid columns={4} xs={{ columns: 1 }} s={{ columns: 2 }} m={{ columns: 3 }}>{components}</Grid>;
  }, [componentsCount]);

  // Test interactive components
  const testInteractiveComponents = useCallback(() => {
    const components = [];
    for (let i = 0; i < Math.floor(componentsCount / 3); i++) {
      components.push(
        <Row key={`interactive-${i}`} gap="8" padding="4">
          <Input id={'input'} placeholder={`Input ${i}`} />
          <IconButton icon="chevronDown" variant="ghost" />
          <Button onClick={() => {}} variant="tertiary" size="s">
            Click {i}
          </Button>
        </Row>
      );
    }
    return <div>{components}</div>;
  }, [componentsCount]);

  // Function to run all tests
  const runBenchmark = useCallback(async () => {
    setIsRunning(true);
    setResults([]);

    const tests = [
      { name: "Simple Components", fn: testSimpleComponents, count: componentsCount },
      { name: "Complex Components", fn: testComplexComponents, count: Math.floor(componentsCount / 5) },
      { name: "Grid Layout", fn: testGridComponents, count: componentsCount },
      { name: "Interactive Components", fn: testInteractiveComponents, count: Math.floor(componentsCount / 3) },
    ];

    for (const test of tests) {
      setCurrentTest(test.name);

      // Small pause between tests
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        const result = await measurePerformance(test.name, test.fn, test.count);
        setResults(prev => [...prev, result]);
      } catch (error) {
        console.error(`Error in test ${test.name}:`, error);
      }
    }

    setCurrentTest("");
    setIsRunning(false);
  }, [componentsCount, measurePerformance, testSimpleComponents, testComplexComponents, testGridComponents, testInteractiveComponents]);

  // Function to get result color based on performance
  const getPerformanceColor = (renderTime: number): "success-strong" | "warning-strong" | "danger-strong" => {
    if (renderTime < 5) return "success-strong";
    if (renderTime < 15) return "warning-strong";
    return "danger-strong";
  };

  return (
    <Column gap="24">
      <Heading variant="heading-default-m">UI Kit Performance Benchmark</Heading>

      <Flex padding="20" background={'neutral-alpha-weak'} border={'neutral-alpha-medium'} radius={'m'}>
        <Flex direction="column" gap="16">
          <Text variant="body-default-m">
            This benchmark tests the performance of various UI kit components
          </Text>

          <Row gap="16" vertical="center" fillWidth>
              <Input
                  id={'componentsCount'}
                  label={'Number of components'}
                  value={componentsCount.toString()}
                  onChange={(e) => setComponentsCount(Number(e.target.value))}
                  min="10"
                  max="1000"
              />
            <Button
              onClick={runBenchmark}
              disabled={isRunning}
              variant="primary"
            >
              {isRunning ? "Running..." : "Start Benchmark"}
            </Button>
          </Row>

          {isRunning && (
            <Flex vertical="center" gap="8">
              <Spinner size="s" />
              <Text variant="body-default-s">
                Running: {currentTest || "Preparing..."}
              </Text>
            </Flex>
          )}
        </Flex>
      </Flex>

        <Flex padding="20" direction={'column'}>
            <Heading variant="heading-default-s" marginBottom="16">Test Results</Heading>

            <Flex direction={'row'} gap={'s'} s={{ direction: 'column' }}>
                <Column gap="12">
                    {results.map((result, index) => (
                        <Flex key={index} padding="16" background={'neutral-alpha-weak'} border={'neutral-alpha-medium'} radius={'m'} fillWidth>
                            <Row horizontal="between" vertical="center" fillWidth gap={'8'}>
                                <Column gap="4">
                                    <Text variant="body-strong-m">{result.testName}</Text>
                                    <Text variant="body-default-s">
                                        Components: {result.componentsCount}
                                    </Text>
                                </Column>

                                <Row gap="12" vertical="center">
                                    <Column gap="4" horizontal="center">
                                        <Badge paddingX="12" paddingY="8" background={getPerformanceColor(result.renderTime)}>
                                            {result.renderTime.toFixed(2)}ms
                                        </Badge>
                                        <Text variant="body-default-xs">Render Time</Text>
                                    </Column>

                                    {result.fps && (
                                        <Column gap="4" horizontal="center">
                                            <Badge paddingX="12" paddingY="8" background={result.fps > 55 ? "success-strong" : result.fps > 30 ? "warning-strong" : "danger-strong"}>
                                                {result.fps}fps
                                            </Badge>
                                            <Text variant="body-default-xs">FPS</Text>
                                        </Column>
                                    )}
                                </Row>
                            </Row>
                        </Flex>
                    ))}
                </Column>

                <Flex padding="16" marginTop="16" background="page" direction={'column'} gap={'8'}>
                    <Text variant="body-strong-s">Result Interpretation:</Text>
                    <Flex gap={'4'} direction={'column'}>
                        <Flex vertical={'center'} gap={'4'}><Badge paddingX="12" paddingY="8" background="success-strong">Green</Badge><Text variant={'body-default-s'}>- Excellent performance (&lt;5ms)</Text></Flex>
                        <Flex vertical={'center'} gap={'4'}><Badge paddingX="12" paddingY="8" background="warning-strong">Yellow</Badge><Text variant={'body-default-s'}>- Good performance (5-15ms)</Text></Flex>
                        <Flex vertical={'center'} gap={'4'}><Badge paddingX="12" paddingY="8" background="danger-strong">Red</Badge><Text variant={'body-default-s'}>- Needs optimization (&gt;15ms)</Text></Flex>
                        <Text variant={'body-default-s'}>• FPS shows animation smoothness (60fps is ideal)</Text>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    </Column>
  );
};
