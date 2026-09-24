import {
  Button,
  Column,
  Flex,
  Heading,
  Icon,
  LetterFx,
  Media,
  SmartLink,
  Text,
  TiltFx,
} from "@once-ui-system/core";
import { clsx } from "clsx";
import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./DesignEngineersClub1.module.scss";

interface DesignEngineersClub1Props extends React.ComponentProps<typeof Flex> {
  children?: ReactNode;
}

export function DesignEngineersClub1({ children, ...flex }: DesignEngineersClub1Props) {
  return (
    <TiltFx fillWidth radius="xl" overflow="hidden" border {...flex}>
      <Column fillWidth aspectRatio="16 / 9">
        <Media
          priority
          sizes="(max-width: 1080px) 100vw, 1024px"
          aspectRatio="16 / 9"
          radius="xl"
          alt="Design Engineers Club Discord cover"
          src="/images/club/background.jpg"
        />
        <Flex fillWidth aspectRatio="16 / 9" position="absolute" zIndex={1}>
          <Image
            className={clsx(styles.rock, styles.rock1)}
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            src={"/images/club/layer-1.png"}
            alt="Design Engineers Club cover anime style background"
          />
          <Image
            className={clsx(styles.rock, styles.rock2)}
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            src={"/images/club/layer-2.png"}
            alt="Design Engineers Club cover anime style overlay"
          />
          <Image
            className={clsx(styles.rock, styles.rock3)}
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            src={"/images/club/layer-3.png"}
            alt="Design Engineers Club cover anime style overlay"
          />
          <Image
            className={clsx(styles.rock, styles.rock4)}
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            src={"/images/club/layer-4.png"}
            alt="Design Engineers Club cover anime style overlay"
          />
        </Flex>
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
              "linear-gradient(to right, var(--page-background) 0%, var(--static-transparent) 60%)",
          }}
          fill
          padding="xl"
        >
          {children ? (
            children
          ) : (
            <Column fill gap="40" vertical="center">
              <Flex gap="m" vertical="center">
                <Icon name="discord" />
                <Text variant="label-default-s">/</Text>
                <Text variant="label-default-s">Once UI</Text>
              </Flex>
              <Flex gap="8" fillWidth direction="column">
                <Heading as="h2" variant="display-strong-xs">
                  Design Engineers Club
                </Heading>
                <Text onBackground="neutral-medium" variant="heading-default-xs" wrap="balance">
                  It's time. The revolution begins.
                </Text>
              </Flex>
              <Flex gap="16" s={{ direction: "column" }} vertical="center">
                <Button
                  size="s"
                  href="https://discord.com/invite/5EyAQ4eNdS"
                  style={{
                    pointerEvents: "all",
                  }}
                >
                  <Text variant="code-default-s">
                    <LetterFx>Join 1k+ creators</LetterFx>
                  </Text>
                </Button>
                <SmartLink
                  href="https://lorant.one/invite?editor=true&from=Oncer&to=Oncer"
                  style={{
                    pointerEvents: "all",
                  }}
                >
                  <Flex textVariant="code-default-s" paddingY="12">
                    <LetterFx>Send an invite</LetterFx>
                  </Flex>
                </SmartLink>
              </Flex>
            </Column>
          )}
        </Column>
      </Column>
    </TiltFx>
  );
}
