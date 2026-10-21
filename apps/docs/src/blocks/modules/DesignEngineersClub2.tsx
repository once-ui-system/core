import {
  Button,
  Column,
  type Flex,
  Heading,
  Icon,
  Mask,
  Media,
  Row,
  SmartLink,
  Text,
} from "@once-ui-system/core";
import { LetterFx, ParticleFx, TiltFx } from "@once-ui-system/fx";

import type { ReactNode } from "react";

interface DesignEngineersClub2Props extends React.ComponentProps<typeof Flex> {
  children?: ReactNode;
}

export function DesignEngineersClub2({ children, ...flex }: DesignEngineersClub2Props) {
  return (
    <TiltFx fillWidth radius="xl" overflow="hidden" border {...flex}>
      <Column fillWidth aspectRatio="16 / 9">
        <Media
          stretch
          priority
          aspectRatio="16 / 9"
          radius="xl"
          sizes="(max-width: 1080px) 100vw, 1024px"
          alt="Vibe coding dark theme"
          src="/images/blocks/vibe-coding-dark.jpg"
        />
        <Row fillWidth aspectRatio="16 / 9" position="absolute">
          <Mask cursor>
            <Media
              stretch
              priority
              radius="xl"
              sizes="(max-width: 1080px) 100vw, 1024px"
              alt="Vibe coding light theme"
              src="/images/blocks/vibe-coding-light.jpg"
            />
          </Mask>
        </Row>
        <ParticleFx
          style={{ height: "30%" }}
          opacity={50}
          position="absolute"
          top="0"
          left="0"
          fillWidth
          interactive
          speed={3.33}
          density={20}
          intensity={40}
          color="brand-on-background-strong"
          pointerEvents="none"
        />
        <ParticleFx
          style={{ height: "30%" }}
          opacity={50}
          position="absolute"
          top="0"
          left="0"
          fillWidth
          interactive
          speed={3.33}
          size="1"
          density={40}
          intensity={40}
          color="brand-on-background-strong"
          pointerEvents="none"
        />
        <Column
          zIndex={3}
          radius="xl"
          pointerEvents="none"
          position="absolute"
          m={{
            position: "relative",
          }}
          style={{
            background:
              "linear-gradient(to top, var(--page-background) 0%, var(--static-transparent) 60%)",
          }}
          fill
          padding="40"
        >
          {children ? (
            children
          ) : (
            <Column fill gap="40" horizontal="center" vertical="between">
              <Row gap="m" vertical="center">
                <Icon name="discord" />
                <Text textVariant="label-default-s">/</Text>
                <Text textVariant="label-default-s">Once UI</Text>
              </Row>
              <Column gap="4" fillWidth horizontal="center">
                <Heading align="center" as="h2" textVariant="display-strong-xs">
                  Design Engineers Club
                </Heading>
                <Text
                  align="center"
                  onBackground="neutral-medium"
                  textVariant="heading-default-xs"
                  wrap="balance"
                >
                  Break boundaries. Build with intention.
                </Text>
                <Row marginTop="20" gap="16" s={{ direction: "column" }} vertical="center">
                  <Button
                    size="s"
                    weight="default"
                    href="https://discord.com/invite/5EyAQ4eNdS"
                    style={{
                      pointerEvents: "all",
                    }}
                  >
                    <Text textVariant="code-default-s">
                      <LetterFx>Join 1k+ creators</LetterFx>
                    </Text>
                  </Button>
                  <SmartLink
                    href="https://lorant.one/invite?editor=true&from=Oncer&to=Oncer"
                    style={{
                      pointerEvents: "all",
                    }}
                  >
                    <Row textVariant="code-default-s" paddingY="12">
                      <LetterFx>Send invite</LetterFx>
                    </Row>
                  </SmartLink>
                </Row>
              </Column>
            </Column>
          )}
        </Column>
      </Column>
    </TiltFx>
  );
}
