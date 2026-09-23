import {
  Background,
  Badge,
  Button,
  Column,
  Heading,
  Media,
  type Row,
  Tag,
  Text,
} from "@once-ui-system/core";

export const Hero2: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Column fillWidth fitHeight horizontal="center" align="center">
      <Background
        data-solid="color"
        position="absolute"
        gradient={{
          display: true,
          x: 50,
          y: 50,
          width: 50,
          height: 50,
          colorStart: "brand-solid-strong",
          colorEnd: "static-transparent",
        }}
        top="0"
        left="0"
        style={{ height: "100vh" }}
      />
      <Column maxWidth="l" gap="32" fitHeight horizontal="center" {...flex}>
        <Column maxWidth="m" horizontal="center" gap="16" marginBottom="32">
          <Badge
            paddingY="4"
            paddingLeft="4"
            paddingRight="16"
            gap="12"
            href="#"
            textVariant="label-default-s"
            background="overlay"
            border
            arrow={false}
          >
            <Tag>
              <Text variant="body-strong-xs">NEW</Text>
            </Tag>
            Instant presence with Once UI
          </Badge>
          <Heading variant="display-strong-l" marginTop="12">
            Let us fight your CSS battles
          </Heading>
          <Heading
            wrap="balance"
            onBackground="neutral-medium"
            variant="body-default-xl"
            marginBottom="16"
          >
            Once UI provides out-of-the-box solutions for advanced UI challenges
          </Heading>
          <Button id="hero-cta-2" href="#" arrowIcon>
            Ship your app
          </Button>
        </Column>
        <Media
          src="/images/blocks/dashboard-desktop.jpg"
          border
          aspectRatio="16 / 9"
          fillWidth
          priority
          radius="xl"
          sizes="(max-width: 1024px) 100vw, 1024px"
        />
      </Column>
    </Column>
  );
};
