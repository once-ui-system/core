import {
  Avatar,
  BlobFx,
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  Line,
  Row,
  Text,
} from "@once-ui-system/core";

export const About1 = () => {
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
      <Column maxWidth="m" horizontal="center" gap="24">
        <Column maxWidth="xs" horizontal="center" gap="24">
          <Text variant="body-default-s" align="center" onBackground="brand-weak" marginBottom="12">
            Our Story
          </Text>
          <Heading variant="display-strong-m" align="center">
            Redefining Creativity for the Future
          </Heading>
          <Text
            marginBottom="48"
            variant="body-default-xl"
            align="center"
            wrap="balance"
            onBackground="neutral-weak"
          >
            We are dedicated to providing world-class tools that help creators bring their boldest
            ideas to life.
          </Text>
        </Column>
        <Grid fillWidth columns="3" s={{ columns: 1 }} gap="8">
          {features.map((feature, index) => (
            <Column
              key={index}
              fillWidth
              padding="32"
              gap="20"
              radius="l"
              background="overlay"
              border
            >
              <Icon name={feature.icon} onBackground="brand-weak" />
              <Text wrap="balance" variant="body-default-l">
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
              radius="l"
              background="overlay"
              border
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
        <Row
          s={{ direction: "column" }}
          fillWidth
          padding="56"
          vertical="center"
          horizontal="between"
          gap="24"
          radius="l"
          background="overlay"
          border
          overflow="hidden"
        >
          <BlobFx position="absolute" right="0" bottom="0" />
          <Row maxWidth={40}>
            <Text variant="heading-default-xl" wrap="balance">
              Join our community and be part of the next generation of creators.
            </Text>
          </Row>
          <Button id="join-1" arrowIcon size="l" href="#">
            Join us
          </Button>
        </Row>
      </Column>
    </Column>
  );
};
