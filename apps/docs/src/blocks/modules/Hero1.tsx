import { Button, Column, Heading, Mask, Media, Row, Tag, Text } from "@once-ui-system/core";
import { Background6 } from ".";

export const Hero1: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  return (
    <Column fillWidth style={{ minHeight: "100%" }} horizontal="center" {...flex}>
      <Background6 top="0" left="0" />
      <Row maxWidth="m" gap="32" m={{ direction: "column-reverse" }} fitHeight>
        <Mask fillWidth radius="150vh" x="25%" y="20%" aspectRatio="3 / 4">
          <Media
            src="/images/blocks/dashboard-mobile.jpg"
            border
            stretch
            priority
            radius="xl"
            sizes="(max-width: 1024px) 100vw, 640px"
          />
        </Mask>
        <Column maxWidth="30rem" vertical="center" gap="24" paddingLeft="32" paddingY="32">
          <Tag variant="announce"
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
              <Text textVariant="body-strong-xs">NEW</Text>
            </Tag>
            Instant presence with Once UI
          </Tag>
          <Heading textVariant="display-strong-l" marginTop="12">
            The flexible SaaS template that speaks your brand language
          </Heading>
          <Heading onBackground="neutral-medium" textVariant="body-default-l" marginBottom="16">
            A clean foundation to tell your story, convert users, and scale without limits. Launch a
            fully functional business with Once UI — not just a shiny site
          </Heading>
          <Button data-border="rounded" id="hero-cta-1" href="#" arrowIcon>
            Ship your stack
          </Button>
        </Column>
      </Row>
    </Column>
  );
};
