"use client";

import {
  AutoScroll,
  Avatar,
  Background,
  Column,
  Fade,
  Heading,
  Icon,
  MatrixFx,
  Row,
  Text,
} from "@once-ui-system/core";

interface Testimonial6 {
  content: string;
  name: string;
  avatar?: string;
  role?: string;
  company?: string;
}

interface TestimonialsSectionProps extends React.ComponentProps<typeof Row> {
  rating: number;
  reviewCount: number;
  testimonials: Testimonial6[];
  scheme?: string;
}

export const Testimonial6: React.FC<TestimonialsSectionProps> = ({
  rating,
  reviewCount,
  testimonials,
  ...flex
}) => {
  return (
    <Row
      fillWidth
      gap="20"
      vertical="center"
      xs={{ direction: "column", horizontal: "start" }}
      {...flex}
    >
      <Column
        minWidth={14}
        minHeight={14}
        fillHeight
        center
        radius="xl"
        border="brand-alpha-weak"
        overflow="hidden"
        padding="l"
      >
        <MatrixFx
          data-solid="color"
          position="absolute"
          left="0"
          top="0"
          flicker
          fps={40}
          revealFrom="top"
          size={2}
          spacing={2}
          colors={["brand-solid-strong", "static-transparent"]}
        />
        <Background
          fill
          data-solid="color"
          position="absolute"
          left="0"
          top="0"
          opacity={70}
          gradient={{
            display: true,
            colorStart: "neutral-background-weak",
          }}
        />
        <Column horizontal="center" align="center" gap="8">
          <Heading variant="heading-strong-s">Excellent</Heading>
          <Text variant="display-strong-s" wrap="balance">
            {rating.toFixed(2)}
          </Text>
          <Text onBackground="brand-weak" variant="label-default-s" wrap="balance">
            {reviewCount} Reviews
          </Text>
        </Column>
      </Column>
      <Column fillWidth paddingY="20">
        <Row fillWidth zIndex={1} paddingLeft="12" paddingBottom="20">
          <Heading as="h2" variant="heading-strong-l">
            Loved by many
          </Heading>
        </Row>
        <AutoScroll fillWidth speed="slow">
          {testimonials.map((testimonial, index) => (
            <Column
              key={index}
              background="page"
              radius="l"
              border
              vertical="between"
              marginRight="8"
              padding="24"
              gap="16"
              minWidth={16}
              maxWidth={16}
            >
              <Row gap="4">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Icon key={starIndex} name="star" size="xs" />
                ))}
              </Row>
              <Row fillWidth textVariant="body-default-s" marginTop="12">
                <Text wrap="balance">{testimonial.content}</Text>
              </Row>
              <Row fillWidth gap="12" vertical="center">
                {(testimonial.role || testimonial.company) && (
                  <Avatar src={testimonial.avatar} size="xs" />
                )}
                <Text variant="label-default-s" onBackground="neutral-weak">
                  {testimonial.name}
                </Text>
              </Row>
            </Column>
          ))}
        </AutoScroll>
        <Fade
          pointerEvents="none"
          fillHeight
          width={4}
          s={{ hide: true }}
          top="0"
          to="right"
          position="absolute"
          left="0"
        />
        <Fade
          pointerEvents="none"
          fillHeight
          width={4}
          s={{ hide: true }}
          top="0"
          to="left"
          position="absolute"
          right="0"
        />
      </Column>
    </Row>
  );
};
