import {
  Avatar,
  Background,
  Button,
  Card,
  Column,
  Grid,
  Heading,
  Icon,
  Logo,
  Mask,
  MatrixFx,
  Media,
  Row,
  ShineFx,
  Text,
} from "@once-ui-system/core";

export const About4 = () => {
  const benefits = [
    {
      title: "Recognition",
      description: "Get featured as a trusted voice in the community",
      icon: "medal" as const,
    },
    {
      title: "Early access",
      description: "Try out new features before they launch",
      icon: "bolt" as const,
    },
    {
      title: "Swag",
      description: "Exclusive merch to celebrate your work",
      icon: "tshirt" as const,
    },
    {
      title: "Expert support",
      description: "Get direct support on your projects",
      icon: "lifering" as const,
    },
  ];

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

  return (
    <Column fillWidth horizontal="center" borderY>
      <Column fillWidth horizontal="center" paddingX="l" gap="xl">
        <Column maxWidth="m" borderX>
          <Background
            position="absolute"
            fill
            m={{ hide: true }}
            lines={{
              display: true,
              color: "neutral-alpha-weak",
              angle: -45,
              size: "4",
            }}
          />
          <Row fillWidth>
            <Column fillWidth paddingY="48" gap="20" background="page">
              <Heading variant="display-strong-m" paddingX="32">
                A vision to build the impossible.
              </Heading>
            </Column>
            <Row fillWidth borderLeft s={{ hide: true }} />
          </Row>

          <Row fillWidth borderY padding="8">
            <Row
              s={{ direction: "column" }}
              fillWidth
              minHeight="l"
              radius="l-8"
              overflow="hidden"
              border
              background="page"
            >
              <Media
                stretch
                minHeight={20}
                sizes="(max-width: 768px) 100vw, 640px"
                src="/images/creators/lorant.jpg"
              />
              <Mask position="absolute" fill x={50} y={0} radius={50}>
                <MatrixFx
                  flicker
                  fps={24}
                  revealFrom="top"
                  size={2}
                  spacing={2}
                  colors={["brand-solid-strong", "static-transparent", "static-transparent"]}
                />
              </Mask>
              <Row position="absolute" top="24" left="24">
                <Logo icon="/trademarks/icon-dark.svg" size="s" />
              </Row>
              <Column fill padding="8">
                <Column
                  fill
                  background="page"
                  radius="l"
                  paddingY="24"
                  gap="16"
                  vertical="center"
                  border
                >
                  <Column fillWidth paddingX="l" gap="12">
                    <Heading as="h2" variant="heading-strong-l" paddingX="4">
                      Curiosity in code<ShineFx baseOpacity={0.4}>_</ShineFx>
                    </Heading>
                    <Text
                      wrap="balance"
                      variant="body-default-m"
                      onBackground="neutral-weak"
                      marginBottom="16"
                      paddingX="4"
                    >
                      How far can curiosity take design and code when they work as one? Once UI is
                      not a company — it’s a flow of ideas, a way of building a future that feels
                      human.
                    </Text>
                  </Column>
                  <Row fillWidth borderY paddingRight="l">
                    <Background
                      borderLeft
                      fillHeight
                      fitWidth
                      paddingLeft="l"
                      lines={{
                        display: true,
                        color: "neutral-alpha-weak",
                        angle: -45,
                        size: "4",
                      }}
                    />
                    <Row fillWidth borderX gap="4">
                      <Row padding="4" width={18}>
                        <Button fillWidth size="s" rounded arrowIcon href="https://lorant.one">
                          About the creator
                        </Button>
                      </Row>
                      <Background
                        borderLeft
                        fill
                        lines={{
                          display: true,
                          color: "neutral-alpha-weak",
                          angle: -45,
                          size: "4",
                        }}
                      />
                    </Row>
                  </Row>
                </Column>
              </Column>
            </Row>
          </Row>

          <Grid columns={4} s={{ columns: 2 }} fillWidth background="page">
            <Row fill center borderRight borderBottom minHeight={4}>
              <Logo icon="/trademarks/icon-dark.svg" size="m" />
              <Logo light icon="/trademarks/icon-light.svg" size="m" />
            </Row>
            <Row fill center borderRight borderBottom minHeight={4}>
              <Logo wordmark="/trademarks/icon-dark.svg" size="m" />
              <Logo light wordmark="/trademarks/icon-light.svg" size="m" />
            </Row>
            <Row fill center borderRight borderBottom minHeight={4}>
              <Logo wordmark="/trademarks/icon-dark.svg" size="m" />
              <Logo light wordmark="/trademarks/icon-light.svg" size="m" />
            </Row>
            <Row fill borderBottom minHeight={4}>
              <Card href="#" fill center textVariant="label-strong-s" border="transparent">
                Become a sponsor
              </Card>
            </Row>
          </Grid>

          <Row fillWidth horizontal="center" borderBottom>
            <Row flex={1} borderRight m={{ hide: true }} />
            <Column flex={2} background="page">
              <Column fillWidth paddingX="24" paddingY="80">
                <Heading variant="heading-strong-l" marginBottom="32">
                  Rewriting limits.
                </Heading>
                <Text variant="body-default-m" onBackground="neutral-weak" as="span">
                  <Text marginBottom="16" as="p">
                    We believe technology should expand human agency, not replace it. While big tech
                    uses AI to generate endless content and feed the dead internet, we see another
                    path — one where AI becomes a tool for autonomy and creation.
                  </Text>
                  <Text marginBottom="16" as="p">
                    Once UI was created for those who build with intention — for makers who use AI
                    not to replace their work, but to realize what should already exist: the
                    interfaces, systems, and ideas that make creation effortless.
                  </Text>
                  <Text marginBottom="16" as="p">
                    We imagine a future of self-contained, self-hostable infrastructures —
                    micro-communities that think, build, and create independently. Where design and
                    code coexist not as opposites, but as a shared language of creation.
                  </Text>
                  <Text marginBottom="16" as="p">
                    We are not competing with giants.
                    <br />
                    We're reclaiming the tools to build what’s real.
                    <br />A return to craft. A return to curiosity.
                  </Text>
                  <Text as="p">
                    A vision to build the <i>impossible</i>.
                  </Text>
                </Text>
              </Column>
            </Column>
            <Row flex={1} borderLeft m={{ hide: true }} />
          </Row>

          <Column fillWidth>
            <Row fillWidth borderBottom>
              <Column fillWidth background="page">
                <Column fillWidth paddingY="24" paddingX="l">
                  <Heading as="h2" variant="heading-strong-l" marginBottom="4">
                    Frontiers. <Text onBackground="neutral-weak">Pushing Once UI forward.</Text>
                  </Heading>
                  <Text variant="body-default-s" wrap="balance" onBackground="neutral-weak">
                    Passionate builders who help us shape the future of Once UI
                  </Text>
                </Column>
              </Column>
              <Row fillWidth borderLeft m={{ hide: true }} />
            </Row>
          </Column>

          <Row fillWidth borderBottom m={{ direction: "column-reverse" }}>
            <Column fillWidth gap="40" padding="8">
              <Grid columns={2} gap="4">
                {benefits.map((benefit, index) => (
                  <Column
                    key={index}
                    fillWidth
                    border="neutral-alpha-medium"
                    radius="l"
                    gap="8"
                    padding="l"
                    background="page"
                  >
                    <Icon name={benefit.icon} size="s" onBackground="neutral-weak" />
                    <Heading as="h3" marginTop="12" variant="body-default-m">
                      {benefit.title}
                    </Heading>
                    <Text wrap="balance" onBackground="neutral-weak" variant="label-default-s">
                      {benefit.description}
                    </Text>
                  </Column>
                ))}
              </Grid>
            </Column>
            <Column
              fillWidth
              center
              paddingX="8"
              paddingY="24"
              gap="8"
              background="page"
              borderLeft
            >
              <Heading align="center" as="h2" variant="display-strong-xs">
                Frontier benefits
              </Heading>
              <Column onBackground="neutral-weak" horizontal="center" align="center" gap="20">
                Become a Frontier — reach out on Discord
                <Button size="s" rounded variant="secondary" href="#">
                  Join Discord
                </Button>
              </Column>
            </Column>
          </Row>

          <Column fillWidth>
            <Row fillWidth m={{ direction: "column" }}>
              <Column flex={1}>
                <Column
                  fillWidth
                  paddingY="24"
                  paddingX="32"
                  background="page"
                  borderBottom
                  position="sticky"
                  top="56"
                >
                  <Heading as="h2" variant="heading-strong-l" marginBottom="8">
                    Hall of fame
                  </Heading>
                  <Row vertical="center" gap="12" onBackground="neutral-weak">
                    <Row vertical="center" textVariant="label-default-s" gap="4">
                      <Icon name="github" size="xs" /> <Text marginRight="4">GitHub</Text>{" "}
                      contributors
                    </Row>
                  </Row>
                </Column>
              </Column>
            </Row>
          </Column>
          <Grid fillWidth columns="3" m={{ columns: 2 }} s={{ columns: 1 }} gap="8" padding="8">
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
                background="page"
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
        </Column>
      </Column>
    </Column>
  );
};
