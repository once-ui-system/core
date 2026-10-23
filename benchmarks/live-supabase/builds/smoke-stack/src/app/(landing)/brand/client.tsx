"use client";

import { schema } from "@/resources";
import { Background, Button, Column, Grid, Heading, IconButton, Logo, Mask, Media, Particle, Row, Text } from "@once-ui-system/core";
import { downloadPNG, downloadImage } from "@/utils/download";
import { brand, explanation, assets } from "@/content";
import { useState } from "react";

export function BrandClient() {
  const [copiedSummary, setCopiedSummary] = useState(false);

  const handleCopySummary = () => {
    navigator.clipboard.writeText(explanation.summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <Column fillWidth horizontal="center">
      <Column fillWidth horizontal="center" paddingX="l">
        <Column maxWidth="l" radius="xl" border="neutral-alpha-medium" overflow="hidden" gap="-1">
          <Column fillWidth paddingX="l" paddingY="128">
            <Background
              position="absolute"
              top="0"
              left="0"
              gradient={{
                display: true,
                x: 50,
                y: 100,
                width: 75,
                height: 50,
                colorStart: "brand-background-strong",
              }}
            />
            <Column fillWidth horizontal="center" align="center" gap="16">
              <Heading variant="display-strong-l">
                {brand.title}
              </Heading>
              <Text variant="heading-default-xl" marginBottom="32">
                {brand.description}
              </Text>
              <Button href={`mailto:${schema.email}`} size="s" prefixIcon="email" data-border="rounded">
                {schema.email}
              </Button>
            </Column>
          </Column>
          <Row fillWidth s={{direction: "column"}} gap="-1" borderTop="neutral-alpha-weak">
            <Column fillWidth background="page" data-theme="dark">
              <Column fillWidth padding="xl" horizontal="center">
                <Logo icon="/trademarks/icon-dark.svg" size="l" brand={{copy: true}} />
              </Column>
              <Row fillWidth gap="8" padding="12" borderTop="neutral-alpha-weak">
                <Button 
                  fillWidth 
                  variant="secondary" 
                  size="s" 
                  prefixIcon="download" 
                  weight="default" 
                  data-border="rounded"
                  onClick={() => downloadImage('/trademarks/icon-dark.svg', 'magic-icon-dark.svg')}
                >
                  SVG
                </Button>
                <Button 
                  fillWidth 
                  variant="secondary" 
                  size="s" 
                  prefixIcon="download" 
                  weight="default" 
                  data-border="rounded"
                  onClick={() => downloadPNG('/trademarks/icon-dark.svg', 'magic-icon-dark.png')}
                >
                  PNG
                </Button>
              </Row>
            </Column>
            <Column fillWidth background="page" data-theme="light">
              <Column fillWidth padding="xl" horizontal="center">
                <Logo icon="/trademarks/icon-light.svg" size="l" brand={{copy: true}} />
              </Column>
              <Row fillWidth gap="8" padding="12" borderTop="neutral-alpha-weak">
                <Button 
                  fillWidth 
                  variant="secondary" 
                  size="s" 
                  prefixIcon="download" 
                  weight="default" 
                  data-border="rounded"
                  onClick={() => downloadImage('/trademarks/icon-light.svg', 'magic-icon-light.svg')}
                >
                  SVG
                </Button>
                <Button 
                  fillWidth 
                  variant="secondary" 
                  size="s" 
                  prefixIcon="download" 
                  weight="default" 
                  data-border="rounded"
                  onClick={() => downloadPNG('/trademarks/icon-light.svg', 'magic-icon-light.png')}
                >
                  PNG
                </Button>
              </Row>
            </Column>
          </Row>
          <Row fillWidth s={{direction: "column"}} gap="-1" borderTop="neutral-alpha-weak">
            <Column fillWidth background="page" data-theme="dark">
              <Column fillWidth padding="xl" horizontal="center">
                <Logo wordmark="/trademarks/wordmark-dark.svg" size="l" brand={{copy: true}} />
              </Column>
              <Row fillWidth gap="8" padding="12" borderTop="neutral-alpha-weak">
                <Button 
                  fillWidth 
                  variant="secondary" 
                  size="s" 
                  prefixIcon="download" 
                  weight="default" 
                  data-border="rounded"
                  onClick={() => downloadImage('/trademarks/wordmark-dark.svg', 'magic-wordmark-dark.svg')}
                >
                  SVG
                </Button>
                <Button 
                  fillWidth 
                  variant="secondary" 
                  size="s" 
                  prefixIcon="download" 
                  weight="default" 
                  data-border="rounded"
                  onClick={() => downloadPNG('/trademarks/wordmark-dark.svg', 'magic-wordmark-dark.png')}
                >
                  PNG
                </Button>
              </Row>
            </Column>
            <Column fillWidth background="page" data-theme="light">
              <Column fillWidth padding="xl" horizontal="center">
                <Logo wordmark="/trademarks/wordmark-light.svg" size="l" brand={{copy: true}} />
              </Column>
              <Row fillWidth gap="8" padding="12" borderTop="neutral-alpha-weak">
                <Button 
                  fillWidth 
                  variant="secondary" 
                  size="s" 
                  prefixIcon="download" 
                  weight="default" 
                  data-border="rounded"
                  onClick={() => downloadImage('/trademarks/wordmark-light.svg', 'magic-wordmark-light.svg')}
                >
                  SVG
                </Button>
                <Button 
                  fillWidth 
                  variant="secondary" 
                  size="s" 
                  prefixIcon="download" 
                  weight="default" 
                  data-border="rounded"
                  onClick={() => downloadPNG('/trademarks/wordmark-light.svg', 'magic-wordmark-light.png')}
                >
                  PNG
                </Button>
              </Row>
            </Column>
          </Row>
        </Column>
      </Column>
      <Column fillWidth horizontal="center" marginTop="xl">
        <Background
          fill
          position="absolute"
          data-solid="color"
          top="0"
          left="0"
          style={{filter: "blur(3rem)"}}
          gradient={{
            display: true,
            x: 60,
            y: 30,
            tilt: 10,
            height: 40,
            width: 30,
            colorStart: "brand-solid-strong",
            colorEnd: "static-transparent", 
          }}
        />
        <Background
          fill
          position="absolute"
          top="0"
          left="0"
          style={{filter: "blur(3rem)", transform: "rotateY(40deg)", perspective: "1000px"}}
          gradient={{
            display: true,
            x: 60,
            y: 25,
            tilt: 20,
            height: 25,
            width: 20,
            colorStart: "brand-on-background-medium",
            colorEnd: "static-transparent", 
          }}
        />
        <Mask position="absolute" x={60} y={25} radius={50} fill>
          <Particle speed={0.5} size="2" opacity={50} color="brand-on-background-strong" density={200} pointerEvents="none"/>
        </Mask>
        <Column maxWidth="m" align="center" fillWidth gap="20" paddingY="64" paddingX="20" marginTop="xl">
          <Heading as="h2" variant="display-strong-m">
            {explanation.title}
          </Heading>
          <Text wrap="balance" variant="heading-default-xl" onBackground="neutral-medium" marginBottom="12">
            {explanation.description}
          </Text>
        </Column>
        <Column maxWidth="l" paddingTop="l" gap="xl" topRadius="xl" borderTop="neutral-alpha-medium" borderLeft="neutral-alpha-medium" borderRight="neutral-alpha-medium" background="neutral-alpha-weak">
          <Background
            fill
            position="absolute"
            data-solid="inverse"
            style={{filter: "blur(3rem)", mixBlendMode: "color-dodge"}}
            top="0"
            left="0"
            gradient={{
              display: true,
              x: 75,
              y: 10,
              height: 25,
              width: 20,
              colorStart: "brand-solid-strong",
              colorEnd: "static-transparent", 
            }}
          />
          <Row fillWidth s={{direction: "column-reverse"}} gap="40" paddingX="l" vertical="center">
            <Row fillWidth aspectRatio="16 / 9" padding="8" topRadius="l" borderTop="neutral-alpha-medium" borderLeft="neutral-alpha-medium" borderRight="neutral-alpha-medium" background="neutral-alpha-weak">
              <Row fill overflow="hidden" radius="l" background="overlay" border>
                <Media
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  src={explanation.image}
                  alt="Product mockup"
                  fill
                />
              </Row>
            </Row>
          </Row>
          <Background
            data-solid="color"
            fill
            position="absolute"
            top="0"
            left="0"
            gradient={{
              display: true,
              x: 50,
              y: 130,
              height: 70,
              colorStart: "brand-solid-strong",
              colorEnd: "static-transparent", 
            }}
          />
        </Column>
        <Row paddingX="l" fillWidth borderTop="neutral-alpha-weak" borderBottom="neutral-alpha-weak" horizontal="center">
          <Row maxWidth="l" gap="-1" s={{direction: "column"}}>
            <Row fillWidth gap="12" padding="l" borderLeft="neutral-alpha-weak" borderRight="neutral-alpha-weak" horizontal="between">
              <Column maxWidth={40} gap="12">
                <Text variant="heading-default-xl">
                  In {Math.round(explanation.summary.length / 10) * 10} characters:
                </Text>
                <Text wrap="balance" variant="heading-default-m" onBackground="neutral-weak">{explanation.summary}</Text>
              </Column>
              <IconButton size="l" icon={copiedSummary ? "check" : "copy"} variant="secondary" onClick={handleCopySummary}/>
            </Row>
          </Row>
        </Row>
      </Column>
      <Row fillWidth horizontal="center" borderBottom="neutral-alpha-weak">
        <Row maxWidth="l" padding="l">
          <Grid columns={2} s={{columns: 1}} fillWidth gap="16">
            {assets.horizontal.map((image, index) => (
              <Row 
                aspectRatio="16 / 9"
                fill
                key={index}
              >
                <Media
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 560px"
                  src={image}
                  alt="Product mockup"
                  border
                  radius="l"
                  fill
                />
                <Row position="absolute" right="12" top="12">
                  <IconButton icon="download" tooltip="Download" tooltipPosition="left" onClick={() => downloadImage(image, `magic-home-${index}.jpg`)}/>
                </Row>
              </Row>
            ))}
          </Grid>
        </Row>
      </Row>
      <Row fillWidth horizontal="center" borderBottom="neutral-alpha-weak">
        <Row maxWidth="l" padding="l">
          <Grid columns={4} m={{columns: 2}} s={{columns: 1}} fillWidth gap="16">
            {assets.vertical.map((image, index) => (
              <Row
                aspectRatio="3 / 4"
                fill
                key={index}
              >
                <Media
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 320px"
                  src={image}
                  alt="Product mockup"
                  border
                  radius="l"
                  fill
                />
                <Row position="absolute" right="12" top="12">
                  <IconButton icon="download" tooltip="Download" tooltipPosition="left" onClick={() => downloadImage(image, `magic-home-${index}.jpg`)}/>
                </Row>
              </Row>
            ))}
          </Grid>
        </Row>
      </Row>
    </Column>
  )
}