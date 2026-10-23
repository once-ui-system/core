import { Button, Column, Heading, Row, Text, Media, Background, Mask, Particle } from "@once-ui-system/core";

const section = {
  title: "Begin at 80% on day one",
  subtitle: "Stop reinventing and start delivering",
  image: "/images/dashboard-desktop.jpg",
  label: "Start for free"
};

const features = [
  {
    title: "Components.",
    description: "Access advanced components through simple APIs",
  },
  {
    title: "1-min styling.",
    description: "Create your brand, no design skills required",
  },
  {
    title: "SEO optimized.",
    description: "Enjoy out of the box meta and schema support",
  },
];

export const Hero: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  return (
    <Column fillWidth horizontal="center" {...flex}>
      <Column zIndex={1} maxWidth="m" horizontal="center" align="center" fillWidth gap="16" paddingBottom="64" paddingX="20">
        <Heading as="h1" variant="display-strong-xl">
          {section.title}
        </Heading>
        <Text wrap="balance" variant="display-default-xs" onBackground="neutral-medium" marginBottom="20">
          {section.subtitle}
        </Text>
        <Button size="l" href="/pricing">{section.label}</Button>
      </Column>
      <Background
        fill
        pointerEvents="none"
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
        pointerEvents="none"
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
      <Mask position="absolute" x={60} y={25} radius={50} fill pointerEvents="none">
        <Particle speed={0.5} size="2" opacity={50} color="brand-on-background-strong" density={200}/>
      </Mask>
      <Column maxWidth="l" paddingTop="l" gap="xl" topRadius="xl" borderTop="neutral-alpha-medium" borderLeft="neutral-alpha-medium" borderRight="neutral-alpha-medium" background="neutral-alpha-weak">
        <Background
          fill
          pointerEvents="none"
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
                src={section.image}
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
      <Row fillWidth borderTop="neutral-alpha-weak" borderBottom="neutral-alpha-weak" horizontal="center" paddingX="l">
        <Row maxWidth="l" gap="-1" s={{direction: "column"}}>
          {features.map((feature, index) => (
            <Column fillWidth gap="12" padding="l" borderLeft="neutral-alpha-weak" borderRight="neutral-alpha-weak" key={index}>
              <Text wrap="balance" variant="heading-default-m" onBackground="neutral-medium">
              {feature.title} <Text onBackground="neutral-weak">{feature.description}</Text>
              </Text>
            </Column>
          ))}
        </Row>
      </Row>
    </Column>
  );
};