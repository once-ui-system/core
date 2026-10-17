import {
  AutoScroll,
  Background,
  Column,
  Fade,
  type Flex,
  ParticleFx,
  SmartLink,
  Text,
  User,
  Row,
} from "@once-ui-system/core";
import type { ReactNode } from "react";

interface Testimonial {
  content: ReactNode;
  avatar?: string;
  name?: string;
  role?: string;
  link?: string;
  company?: string;
}

interface Props extends Omit<React.ComponentProps<typeof Flex>, "content"> {
  testimonials: Testimonial[];
}

export const Testimonial5: React.FC<Props> = ({ testimonials, ...flex }) => (
  <Column fillWidth {...flex}>
    <Column fillWidth horizontal="center" gap="12" paddingY="32">
      <Column
        top="0"
        position="absolute"
        maxWidth="xl"
        maxHeight="56rem"
        border="neutral-medium"
        fill
        radius="xl"
        overflow="hidden"
      >
        <ParticleFx
          opacity={70}
          position="absolute"
          top="0"
          left="0"
          fill
          interactive
          speed={13.33}
          intensity={40}
          pointerEvents="none"
        />
        <Background
          position="absolute"
          top="0"
          left="0"
          gradient={{
            display: true,
            x: 0,
            y: "125%",
            colorStart: "accent-solid-strong",
            colorEnd: "static-transparent",
          }}
        />
        <Background
          gradient={{
            display: true,
            x: "125%",
            y: "100%",
            width: "150%",
            height: "150%",
            colorStart: "brand-background-strong",
            colorEnd: "static-transparent",
          }}
        />
      </Column>
      <AutoScroll fillWidth speed="slow">
        {testimonials.slice(0, Math.ceil(testimonials.length / 2)).map((testimonial, index) => (
          <Column
            key={index}
            background="surface"
            radius="l"
            border
            vertical="between"
            marginRight="12"
            minWidth="20rem"
            fillWidth
          >
            <Row padding="32" fillWidth>
              <Text wrap="balance" variant="heading-default-xs">
                {testimonial.content}
              </Text>
            </Row>
            <Row borderTop fillWidth paddingY="24" paddingX="32" style={{ filter: "grayscale(1)" }}>
              {(testimonial.role || testimonial.company) && (
                <User
                  avatarProps={{ src: testimonial.avatar }}
                  name={testimonial.name}
                  subline={
                    <>
                      {testimonial.role}{" "}
                      {testimonial.link && testimonial.company && (
                        <SmartLink unstyled href={testimonial.link}>
                          {testimonial.company}
                        </SmartLink>
                      )}
                    </>
                  }
                />
              )}
            </Row>
          </Column>
        ))}
      </AutoScroll>
      <AutoScroll fillWidth reverse speed="slow">
        {testimonials.slice(Math.ceil(testimonials.length / 2)).map((testimonial, index) => (
          <Column
            key={index}
            background="surface"
            radius="l"
            border
            vertical="between"
            marginRight="12"
            minWidth="20rem"
            fillWidth
          >
            <Row padding="32" fillWidth>
              <Text wrap="balance" variant="heading-default-xs">
                {testimonial.content}
              </Text>
            </Row>
            <Row borderTop fillWidth paddingY="24" paddingX="32" style={{ filter: "grayscale(1)" }}>
              {(testimonial.role || testimonial.company) && (
                <User
                  avatarProps={{ src: testimonial.avatar }}
                  name={testimonial.name}
                  subline={
                    <>
                      {testimonial.role}{" "}
                      {testimonial.link && testimonial.company && (
                        <SmartLink unstyled href={testimonial.link}>
                          {testimonial.company}
                        </SmartLink>
                      )}
                    </>
                  }
                />
              )}
            </Row>
          </Column>
        ))}
      </AutoScroll>
      <Fade
        pointerEvents="none"
        fillHeight
        width="24rem"
        s={{ hide: true }}
        top="0"
        to="right"
        position="absolute"
        left="0"
        leftRadius="xl"
      />
      <Fade
        pointerEvents="none"
        fillHeight
        width="24rem"
        s={{ hide: true }}
        top="0"
        to="left"
        position="absolute"
        right="0"
        rightRadius="xl"
      />
    </Column>
  </Column>
);
