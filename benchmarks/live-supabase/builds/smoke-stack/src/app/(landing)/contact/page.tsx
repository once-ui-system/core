import type { IconName } from "@once-ui-system/core";
import { Column, Row, Grid, Heading, Text, Button, Icon, Input, Textarea, AvatarGroup, Background, Mask, MatrixFx, Schema, Meta } from "@once-ui-system/core";
import { baseURL, landing, schema } from "@/resources";

export async function generateMetadata() {
  return Meta.generate({
    baseURL: baseURL,
    title: landing.contact.title,
    description: landing.contact.description,
    image: landing.contact.image,
    path: landing.contact.path,
  });
}

export default function Contact() {
  const contacts: {
    title: string;
    description: string;
    icon: IconName;
    link: { label: string; href: string };
    color: "brand" | "neutral";
  }[] = [
    {
      title: "Chat on Discord",
      description: "Join our community and chat with others.",
      icon: "discord",
      link: {
        label: "Join Discord",
        href: "#",
      },
      color: "brand",
    },
    {
      title: "Send an email",
      description: "Get in touch with us for help or feedback.",
      icon: "email",
      link: {
        label: "Send email",
        href: `mailto:${schema.email}`,
      },
      color: "neutral",
    },
  ];

  return (
    <Row fillWidth horizontal="center">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={landing.contact.title}
        description={landing.contact.description}
        path={landing.contact.path}
      />
      <Column fillWidth horizontal="center" maxWidth="m">
        <Column maxWidth="xs" gap="8" paddingBottom="64" paddingX="24">
          <Heading variant="display-strong-s" align="center">
            Get in touch
          </Heading>
          <Text
            variant="body-default-xl"
            align="center"
            wrap="balance"
            onBackground="neutral-weak"
          >
            We're always here to help
          </Text>
        </Column>
        <Grid
          fillWidth
          columns="2"
          gap="20"
          s={{columns: 1}}
        >
          {contacts.map((contact, index) => (
            <Column
              padding="24"
              border
              background="page"
              radius="xl"
              overflow="hidden"
              key={index}
              fillWidth
              gap="8"
            >
              <Mask position="absolute" left="0" top="0" x={0} y={0} radius={25}>
                <MatrixFx
                  data-solid="inverse"
                  size={1.5}
                  spacing={5}
                  fps={24}
                  colors={[`${contact.color}-solid-medium`]}
                  flicker
                />
              </Mask>
              <Icon name={contact.icon} size="s" padding="12" radius="full" background={`${contact.color}-alpha-weak` as const} onBackground={`${contact.color}-weak` as const} border={`${contact.color}-alpha-weak` as const} />
              <Heading marginTop="16" marginLeft="12" as="h3" variant="heading-strong-l">
                {contact.title}
              </Heading>
              <Text
                marginBottom="16"
                marginLeft="12"
                onBackground="neutral-medium"
                variant="body-default-s"
                wrap="balance"
              >
                {contact.description}
              </Text>
              <Button
                weight="default"
                data-border="rounded"
                size="s"
                href={contact.link.href}
                variant="secondary"
              >
                {contact.link.label}
              </Button>
            </Column>
          ))}
        </Grid>
      </Column>
    </Row>
  )
}