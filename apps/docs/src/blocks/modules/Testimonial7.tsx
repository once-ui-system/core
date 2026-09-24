"use client";

import {
  Background,
  BlockQuote,
  Column,
  Heading,
  Icon,
  Logo,
  Mask,
  MatrixFx,
  Media,
  Row,
  Text,
} from "@once-ui-system/core";

export interface TestimonialProps {
  logo: {
    icon: string;
    wordmark: string;
  };
  quote: {
    text: string;
    author: {
      name: string;
      avatar: string;
    };
    link: {
      href: string;
      label: string;
    };
  };
  heading: string;
}

const testimonial: TestimonialProps = {
  logo: {
    icon: "/trademarks/icon-dark.svg",
    wordmark: "/trademarks/icon-dark.svg",
  },
  quote: {
    text: "Lorant delivered a rock-solid frontend for our landing page and desktop app and helped us launch 6 months in advance.",
    author: {
      name: "Lorant One",
      avatar: "/images/creators/lorant.jpg",
    },
    link: {
      href: "#",
      label: "Once UI",
    },
  },
  heading: "A $10k frontend project delivered for Once UI faster than they expected. Read how.",
};

export const Testimonial7 = (flex: React.ComponentProps<typeof Column>) => {
  return (
    <Row fillWidth gap="8" s={{ direction: "column" }} {...flex}>
      <Row flex={1} border="brand-medium" radius="l" overflow="hidden" center aspectRatio="3/4">
        <MatrixFx
          data-solid="color"
          position="absolute"
          fill
          colors={["brand-solid-strong"]}
          spacing={3}
          size={2}
          flicker
          bulge={{
            type: "ripple",
            duration: 4,
            intensity: 15,
            repeat: true,
          }}
        />
        <Mask fill center x={70} y={20} radius={50} padding="24">
          <Media fillWidth aspectRatio="1" src={testimonial.logo.icon} />
        </Mask>
        <Row position="absolute" left="24" bottom="24">
          <Logo wordmark={testimonial.logo.wordmark} />
        </Row>
      </Row>
      <Column
        flex={2}
        border
        radius="xl"
        overflow="hidden"
        cursor={
          <Icon
            solid="brand-strong"
            onSolid="brand-strong"
            name="arrowUpRight"
            padding="12"
            radius="full"
          />
        }
      >
        <Background
          data-solid="color"
          position="absolute"
          fill
          gradient={{
            display: true,
            width: 75,
            height: 50,
            y: 100,
            colorStart: "brand-solid-medium",
          }}
        />
        <Column fill vertical="center" paddingX="xl" paddingY="80">
          <Heading variant="display-default-xs">{testimonial.heading}</Heading>
          <BlockQuote
            align="left"
            separator="none"
            marginBottom="0"
            author={testimonial.quote.author}
            link={testimonial.quote.link}
          >
            <Text variant="heading-default-l" onBackground="neutral-weak">
              {testimonial.quote.text}
            </Text>
          </BlockQuote>
        </Column>
      </Column>
    </Row>
  );
};
