import { Background, Badge, Button, Column, Heading, Media, Row, Tag } from "@once-ui-system/core";

export const Hero8: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Column
      fillWidth
      horizontal="center"
      gap="64"
      paddingTop="l"
      paddingX="l"
      borderBottom
      overflow="hidden"
      {...flex}
    >
      <Background
        data-solid="inverse"
        position="absolute"
        top="0"
        left="0"
        gradient={{ display: true, colorStart: "brand-solid-medium", y: 80, width: 40, height: 64 }}
      />
      <Column maxWidth="xl" horizontal="center">
        <Column maxWidth="l" gap="24" paddingX="s" paddingBottom="l" paddingTop="m">
          <Badge
            background="overlay"
            paddingLeft="8"
            paddingRight="16"
            border="brand-alpha-medium"
            paddingY="8"
            href="#"
          >
            <Row vertical="center" gap="8">
              <Tag data-border="rounded" size="s" scheme="brand">
                Blog
              </Tag>
              <Row textVariant="code-default-s" gap="8" vertical="center">
                The new service model
              </Row>
            </Row>
          </Badge>
          <Heading variant="display-default-l" marginTop="8">
            Sell $5k–$20k frontend systems. Without starting from scratch.
          </Heading>
          <Row gap="16" vertical="center" paddingTop="16" paddingLeft="8">
            <Button rounded href="#">
              Launch your service
            </Button>
            <Button rounded variant="secondary" href="#">
              View demo
            </Button>
          </Row>
        </Column>
        <Row hide s={{ hide: false }} height={4} />
      </Column>

      <Column fillWidth horizontal="center">
        <Row
          maxWidth="xl"
          position="absolute"
          top={-6}
          horizontal="end"
          paddingRight="48"
          gap="24"
          zIndex={1}
          data-solid="inverse"
          pointerEvents="none"
        >
          <Row
            width={3}
            height={12}
            borderLeft="brand-strong"
            borderTop="brand-strong"
            style={{ borderColor: "var(--brand-solid-strong)" }}
          >
            <Row
              position="absolute"
              solid="brand-strong"
              width="8"
              height="8"
              bottom="0"
              left="0"
              style={{ transform: "translateX(-50%) rotate(45deg)" }}
            ></Row>
          </Row>
          <Row fit onBackground="brand-medium" textVariant="code-default-l" translateY="-50%">
            Your website
          </Row>
        </Row>
        <Row
          maxWidth="xl"
          topRadius="l"
          borderTop
          borderX
          className="glow"
          data-solid="inverse"
          fillWidth
          overflow="hidden"
          background="page"
        >
          <Media
            src="/images/og/home.jpg"
            sizes="(max-width: 1024px) 100vw, 1024px"
            alt="Hero"
            fillWidth
            aspectRatio="16/9"
          />
        </Row>
      </Column>
    </Column>
  );
};
