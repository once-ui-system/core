import {
  Avatar,
  Background,
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  Line,
  Mask,
  Media,
  Particle,
  Row,
  Text,
} from "@once-ui-system/core";

export const About3 = () => {
  const team = [
    {
      name: "Alice Johnson",
      avatar: "/images/avatars/03.png",
      role: "Founder & CEO",
      link: "/ alice",
    },
    { name: "David Kim", avatar: "/images/avatars/01.png", role: "CTO", link: "/ david" },
    {
      name: "Sophia Lee",
      avatar: "/images/avatars/02.png",
      role: "Lead Designer",
      link: "/ sophia",
    },
    {
      name: "Ethan Brown",
      avatar: "/images/avatars/04.png",
      role: "Head of Engineering",
      link: "/ ethan",
    },
    {
      name: "Olivia Martinez",
      avatar: "/images/avatars/06.png",
      role: "Product Strategist",
      link: "/ olivia",
    },
    {
      name: "Liam Wilson",
      avatar: "/images/avatars/05.png",
      role: "Marketing Lead",
      link: "/ liam",
    },
  ];

  const features = [
    {
      icon: "lightbulb" as const,
      title: "Innovative.",
      description: "Empowering creators with cutting-edge solutions.",
    },
    {
      icon: "globe" as const,
      title: "Global.",
      description: "Connecting visionaries across the world.",
    },
    {
      icon: "security" as const,
      title: "Reliable.",
      description: "Built with trust and scalability in mind.",
    },
  ];

  return (
    <Column fillWidth horizontal="center">
      <Column maxWidth="m" horizontal="center" gap="24">
        <Column maxWidth="xs" horizontal="center" gap="20">
          <Text variant="body-default-s" align="center" onBackground="brand-weak">
            Our Story
          </Text>
          <Heading variant="display-strong-m" align="center">
            Redefining Creativity for the Future
          </Heading>
        </Column>
        <Row fillWidth overflow="hidden" radius="xl-8" padding="16" marginTop="56">
          <Particle
            opacity={70}
            position="absolute"
            top="0"
            left="0"
            fill
            interactive
            speed={4}
            size="2"
            density={100}
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
              y: 125,
              colorStart: "accent-solid-strong",
              colorEnd: "static-transparent",
            }}
          />
          <Background
            position="absolute"
            top="0"
            left="0"
            gradient={{
              display: true,
              x: 125,
              y: 100,
              width: 150,
              height: 150,
              colorStart: "brand-background-strong",
              colorEnd: "static-transparent",
            }}
          />
          <Row fillWidth s={{ direction: "column" }} gap="16" vertical="center">
            <Mask x={60} y={60} radius={40} style={{ mixBlendMode: "luminosity" }}>
              <Media
                priority
                sizes="(max-width: 768px) 100vw, 560px"
                src="/images/blocks/about.jpg"
                alt="About us"
                aspectRatio="3 / 4"
                radius="l"
              />
            </Mask>
            <Column fillWidth textVariant="body-default-m">
              <Column fillWidth padding="48" gap="32">
                <Text variant="body-default-xl" wrap="balance">
                  We are dedicated to providing world-class tools that help creators bring their
                  boldest ideas to life.
                </Text>
                <Text variant="body-default-xl" wrap="balance">
                  Our tools are designed to help you create anything you can imagine: from simple
                  prototypes to complex applications.
                </Text>
                <Text variant="body-default-xl" wrap="balance">
                  Join our community and be part of the next generation of creators.
                </Text>
              </Column>
            </Column>
          </Row>
        </Row>
        <Grid fillWidth columns="3" s={{ columns: 1 }} paddingX="16" gap="8">
          {features.map((feature, index) => (
            <Column
              key={index}
              fillWidth
              padding="32"
              gap="20"
              radius="xl"
              background="overlay"
              border="neutral-alpha-medium"
            >
              <Icon name={feature.icon} onBackground="brand-weak" size="s" />
              <Text variant="body-default-m" wrap="balance">
                {feature.title} <Text onBackground="neutral-weak">{feature.description}</Text>
              </Text>
            </Column>
          ))}
        </Grid>
        <Line width="24" background="neutral-alpha-strong" marginTop="64" marginBottom="24" />
        <Heading variant="display-strong-xs" align="center" marginBottom="24">
          Meet the Team
        </Heading>
        <Grid fillWidth columns="3" m={{ columns: 2 }} s={{ columns: 1 }} gap="8">
          {team.map((profile, index) => (
            <Column
              key={index}
              fillWidth
              paddingX="32"
              paddingTop="40"
              paddingBottom="32"
              horizontal="center"
              gap="4"
              radius="xl"
              background="overlay"
              border="neutral-alpha-medium"
            >
              <Avatar size="l" src={profile.avatar} />
              <Text variant="label-default-m" align="center" marginTop="16">
                {profile.name}
              </Text>
              <Text
                variant="label-default-s"
                align="center"
                marginBottom="16"
                onBackground="neutral-weak"
              >
                {profile.role}
              </Text>
              <Button
                data-border="rounded"
                size="s"
                weight="default"
                variant="tertiary"
                prefixIcon="threads"
              >
                <Text onBackground="neutral-weak">{profile.link}</Text>
              </Button>
            </Column>
          ))}
        </Grid>
        <Row
          s={{ direction: "column" }}
          fillWidth
          padding="56"
          vertical="center"
          horizontal="between"
          gap="24"
          radius="xl"
          background="overlay"
          border="neutral-alpha-medium"
        >
          <Row maxWidth={40}>
            <Text variant="display-default-xs" wrap="balance">
              Join the next generation of creators
            </Text>
          </Row>
          <Button prefixIcon="discord" id="join-3" arrowIcon size="l" href="#">
            Join us
          </Button>
        </Row>
      </Column>
    </Column>
  );
};
