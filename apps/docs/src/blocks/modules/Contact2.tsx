"use client";

import {
  AvatarGroup,
  Background,
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  Input,
  Row,
  Text,
  Textarea,
} from "@once-ui-system/core";

const contacts = [
  {
    title: "Chat on Discord",
    description: "Join our community and chat with others.",
    icon: "discord" as const,
    link: {
      label: "Join Discord",
      href: "",
    },
  },
  {
    title: "Send an email",
    description: "Get in touch with us for help or feedback.",
    icon: "email" as const,
    link: {
      label: "Send email",
      href: "mailto:",
    },
  },
];

export const Contact2 = () => {
  return (
    <Row fillWidth fitHeight horizontal="center">
      <Column fillWidth horizontal="center" maxWidth="m">
        <Row
          fillWidth
          horizontal="center"
          borderTop="neutral-medium"
          borderX="neutral-medium"
          paddingX="l"
          paddingY="24"
          textVariant="body-default-s"
          onBackground="brand-weak"
        >
          Contact
        </Row>
        <Row fillWidth horizontal="center" borderTop="neutral-medium" borderX="neutral-medium">
          <Column maxWidth="xs" gap="16" paddingY="48" paddingX="24">
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
        </Row>
        <Grid
          fillWidth
          borderTop="neutral-medium"
          borderLeft="neutral-medium"
          columns="2"
          s={{ columns: 1 }}
        >
          {contacts.map((contact, index) => (
            <Column
              padding="24"
              borderRight="neutral-medium"
              borderBottom="neutral-medium"
              key={index}
              fillWidth
              gap="8"
            >
              <Background
                position="absolute"
                left="0"
                top="0"
                mask={{ x: 75, y: -50, radius: 20 }}
                grid={{
                  display: true,
                  width: "8px",
                  height: "8px",
                  color: "neutral-border-medium",
                }}
              />
              <Icon
                name={contact.icon}
                size="s"
                padding="12"
                radius="full"
                background="brand-alpha-weak"
                onBackground="brand-weak"
              />
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
        <Row fillWidth height="16" borderLeft="neutral-medium" borderRight="neutral-medium" />
        <Row border="neutral-medium" m={{ direction: "column" }}>
          <Column fillWidth>
            <Column gap="16" fillWidth paddingX="l" paddingY="xl">
              <AvatarGroup
                reverse
                avatars={[
                  {
                    src: "/images/avatars/01.png",
                  },
                  {
                    src: "/images/avatars/02.png",
                  },
                  {
                    src: "/images/avatars/03.png",
                  },
                ]}
              />
              <Column gap="s" fillWidth marginBottom="32" marginTop="8">
                <Heading variant="display-strong-s">Send us a message</Heading>
                <Text variant="body-default-xl" onBackground="neutral-medium" wrap="balance">
                  We'd love to hear from you. Send us a message and we'll respond as soon as
                  possible.
                </Text>
              </Column>

              <Column gap="-1">
                <Input corners="top" id="name" label="Name" type="text" />
                <Input corners="none" id="email" label="Email" type="email" />
                <Textarea
                  style={{ minHeight: "6rem" }}
                  corners="bottom"
                  id="message"
                  label="Message"
                />
              </Column>
              <Button id="send-2" arrowIcon>
                Send message
              </Button>
            </Column>
          </Column>

          <Column fillWidth minHeight={32}>
            <iframe
              title="Map showing Once UI location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2689.2891732781513!2d-122.35198712346974!3d47.62050127118443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5490151f4ed5b7f9%3A0xdb2ba8689ed0920d!2sSpace%20Needle!5e0!3m2!1sen!2sus!4v1708762160575!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0, display: "block" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Column>
        </Row>
      </Column>
    </Row>
  );
};
