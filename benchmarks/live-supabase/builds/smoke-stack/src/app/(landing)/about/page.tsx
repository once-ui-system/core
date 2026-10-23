import { about, benefits, intro, team } from "@/content";
import { Meta, Schema, Avatar, Background, Button, Column, Grid, Heading, Icon, Line, Mask, Media, Particle, Row, Text } from "@once-ui-system/core";
import { baseURL, landing } from "@/resources";

export async function generateMetadata() {
  return Meta.generate({
    title: landing.about.title,
    description: landing.about.description,
    baseURL: baseURL,
    path: landing.about.path,
    canonical: landing.about.canonical,
    image: landing.about.image,
    robots: landing.about.robots,
    alternates: landing.about.alternates,
  });
}

export default function About() {
  return (
    <Column fillWidth horizontal="center">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={landing.about.title}
        description={landing.about.description}
        path={landing.about.path}
      />
      <Column maxWidth="m" horizontal="center" gap="24">
        <Column maxWidth="xs" horizontal="center" gap="20">
          <Text variant="body-default-s" align="center" onBackground="brand-weak">
            {about.tag}
          </Text>
          <Heading variant="display-strong-m" align="center">
            {about.title}
          </Heading>
        </Column>
        <Row fillWidth overflow="hidden" radius="xl-8" padding="16" marginTop="56">
          <Particle opacity={70} position="absolute" top="0" left="0" fill interactive speed={4} size="2" density={100} intensity={40} pointerEvents="none"/>
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
          <Row fillWidth s={{direction: "column"}} gap="16" vertical="center">
            <Mask x={60} y={60} radius={40} style={{mixBlendMode: "luminosity"}}>
              <Media
                priority
                sizes="(max-width: 768px) 100vw, 560px"
                src="/images/about.jpg"
                alt="About us"
                aspectRatio="3 / 4"
                radius="l"
              />
            </Mask>
            <Column
              fillWidth
              textVariant="body-default-m">
              <Column fillWidth padding="48" gap="32">
                {intro.map((text, index) => (
                  <Text key={index} wrap="balance">
                    {text}
                  </Text>
                ))}
              </Column>
            </Column>
          </Row>
        </Row>
        <Grid fillWidth columns="3" s={{columns: 1}} paddingX="16" gap="8">
          {benefits.map((benefit, index) => (
            <Column
              key={index}
              fillWidth
              padding="32"
              gap="20"
              radius="xl"
              background="overlay"
              border="neutral-alpha-medium"
            >
              <Icon name={benefit.icon} onBackground="brand-weak" size="s" />
              <Text variant="body-default-xl" wrap="balance">
                {benefit.title} <Text onBackground="neutral-weak">{benefit.description}</Text>
              </Text>
            </Column>
          ))}
        </Grid>
        <Line width="24" background="neutral-alpha-strong" marginTop="64" marginBottom="24" />
        <Heading as="h2" variant="display-strong-xs" align="center" marginBottom="24">
          Meet the Team
        </Heading>
        <Grid fillWidth columns="3" m={{columns: 2}} s={{columns: 1}} gap="8">
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
                href={profile.link}
              >
                <Text onBackground="neutral-weak">
                  {profile.username}
                </Text>
              </Button>
            </Column>
          ))}
        </Grid>
        <Row
          s={{direction: "column"}}
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
          <Button prefixIcon="discord" id="join" arrowIcon size="l" href="https://discord.gg/5EyAQ4eNdS">
            Join us
          </Button>
        </Row>
      </Column>
    </Column>
  );
};