import { Avatar, Button, Column, Grid, Heading, Icon, Line, Row, Text } from "@once-ui-system/core";

export const About2 = () => {
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
    <Column fillWidth fitHeight horizontal="center">
      <Column
        maxWidth="m"
        horizontal="center"
        borderLeft="neutral-medium"
        borderRight="neutral-medium"
      >
        <Column fillWidth horizontal="center">
          <Line />
          <Row paddingY="24" textVariant="body-default-s" align="center" onBackground="brand-weak">
            Our Story
          </Row>
          <Line />
          <Column maxWidth="xs" gap="24" paddingY="48" paddingX="24">
            <Heading variant="display-strong-s" align="center">
              Redefining Creativity for the Future
            </Heading>
            <Text
              variant="body-default-xl"
              align="center"
              wrap="balance"
              onBackground="neutral-weak"
            >
              We are dedicated to providing world-class tools that help creators bring their boldest
              ideas to life.
            </Text>
          </Column>
        </Column>
        <Line />
        <Grid fillWidth columns="3" s={{ columns: 1 }}>
          {features.map((feature, index) => (
            <Column
              key={index}
              fillWidth
              padding="32"
              gap="20"
              borderLeft={index === 1 ? "neutral-medium" : undefined}
              borderRight={index === 1 ? "neutral-medium" : undefined}
              borderBottom="neutral-medium"
            >
              <Icon name={feature.icon} onBackground="brand-weak" />
              <Text wrap="balance" variant="body-default-l">
                {feature.title} <Text onBackground="neutral-weak">{feature.description}</Text>
              </Text>
            </Column>
          ))}
        </Grid>
        <Line marginTop="16" />
        <Row fillWidth padding="32" horizontal="center">
          <Heading variant="display-strong-xs" align="center">
            Meet the Team
          </Heading>
        </Row>
        <Line />
        <Grid fillWidth columns="3" s={{ columns: 1 }}>
          {team.map((profile, index) => (
            <Column
              key={index}
              fillWidth
              paddingX="32"
              paddingTop="40"
              paddingBottom="32"
              horizontal="center"
              gap="4"
              borderBottom="neutral-medium"
              borderRight={index === 1 || index === 4 ? "neutral-medium" : undefined}
              borderLeft={index === 1 || index === 4 ? "neutral-medium" : undefined}
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
                href=" "
                prefixIcon="threads"
              >
                <Text onBackground="neutral-weak">{profile.link}</Text>
              </Button>
            </Column>
          ))}
        </Grid>
        <Line marginTop="16" />
        <Row s={{ direction: "column" }} fillWidth vertical="center" horizontal="between">
          <Row flex={2} borderRight="neutral-medium">
            <Row fillWidth paddingX="xl" paddingY="56">
              <Text variant="heading-default-xl" wrap="balance">
                Join our community and be part of the next generation of creators.
              </Text>
            </Row>
          </Row>
          <Row flex={1}>
            <Row fillWidth paddingX="xl" paddingY="56" horizontal="center">
              <Button id="join-2" arrowIcon size="l" href="#">
                Join us
              </Button>
            </Row>
          </Row>
        </Row>
        <Line />
      </Column>
    </Column>
  );
};
