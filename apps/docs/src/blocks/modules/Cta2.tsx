"use client";

import {
  Background,
  Button,
  Column,
  Heading,
  IconButton,
  Media,
  Row,
  Text,
  useToast,
} from "@once-ui-system/core";

const cta = {
  title: "From empty folder to live product in one command",
  description:
    "Scaffold an app with auth, a dashboard and a landing page, already themed and ready to deploy.",
  command: "npx once-ui create my-app",
  primary: { label: "Read the docs", href: "#" },
  image: "/images/blocks/dashboard-desktop.jpg",
};

/**
 * A call to action for developer products: a raised panel with the install
 * command to copy, one button, and the product peeking in from the right.
 */
export const Cta2: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  const { addToast } = useToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cta.command);
      addToast({ tone: "success", message: "Command copied" });
    } catch {
      addToast({ tone: "danger", message: "Couldn't copy the command" });
    }
  };

  return (
    <Column fillWidth horizontal="center" paddingX="l" paddingY="80" {...flex}>
      <Row
        maxWidth="l"
        background="surface"
        border
        radius="xl"
        overflow="hidden"
        m={{ direction: "column" }}
      >
        <Background
          position="absolute"
          top="0"
          left="0"
          fill
          pointerEvents="none"
          gradient={{
            display: true,
            x: "0%",
            y: "0%",
            width: 200,
            height: 160,
            opacity: 50,
            colorStart: "brand-alpha-medium",
            colorEnd: "static-transparent",
          }}
        />
        <Column flex={5} gap="24" padding="48" vertical="center" zIndex={1} s={{ padding: "24" }}>
          <Heading as="h2" textVariant="display-strong-s" wrap="balance">
            {cta.title}
          </Heading>
          <Text textVariant="body-default-l" onBackground="neutral-weak" wrap="balance">
            {cta.description}
          </Text>
          <Row gap="12" wrap vertical="center" marginTop="8">
            <Row
              background="page"
              border
              radius="l"
              paddingLeft="16"
              paddingRight="4"
              paddingY="4"
              gap="16"
              vertical="center"
              textVariant="code-default-s"
              onBackground="neutral-strong"
            >
              <Text onBackground="brand-medium" aria-hidden="true">
                $
              </Text>
              {cta.command}
              <IconButton
                icon="copy"
                variant="ghost"
                size="m"
                tooltip="Copy"
                aria-label="Copy the install command"
                onClick={copy}
              />
            </Row>
            <Button href={cta.primary.href} variant="secondary" arrowIcon>
              {cta.primary.label}
            </Button>
          </Row>
        </Column>
        <Row
          flex={4}
          minHeight="20rem"
          paddingTop="48"
          paddingLeft="24"
          zIndex={1}
          m={{ paddingLeft: "48" }}
        >
          <Media
            src={cta.image}
            alt="The dashboard a new app starts with"
            sizes="(max-width: 1024px) 100vw, 560px"
            topLeftRadius="l"
            borderTop
            borderLeft
            aspectRatio="4 / 3"
          />
        </Row>
      </Row>
    </Column>
  );
};
