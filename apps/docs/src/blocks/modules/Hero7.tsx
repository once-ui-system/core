import {
  AvatarGroup,
  Background,
  Column,
  Heading,
  IconButton,
  Input,
  RevealFx,
  Row,
  Scroller,
  Text,
} from "@once-ui-system/core";
import { Book } from "./Book";

export const Hero7: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Column fillWidth {...flex}>
      <Column paddingX="l" fillWidth horizontal="center" gap="m">
        <Column maxWidth="s" horizontal="center" align="center">
          <RevealFx paddingTop="24" translateY="4" fillWidth horizontal="center" paddingBottom="16">
            <Heading wrap="balance" variant="display-strong-l">
              Design an independent future
            </Heading>
          </RevealFx>
          <RevealFx translateY="8" delay={200} fillWidth horizontal="center" paddingBottom="40">
            <Text wrap="balance" onBackground="neutral-weak" variant="heading-default-xl">
              Build your solo business and live on your own terms
            </Text>
          </RevealFx>
          <RevealFx direction="column" gap="16" translateY="12" delay={400} horizontal="center">
            <Text wrap="balance" onBackground="neutral-weak" variant="label-default-s">
              By the creator of Once UI
            </Text>
            <Column
              fillWidth
              radius="l"
              horizontal="center"
              align="center"
              maxWidth={20}
              data-border="rounded"
            >
              <Input
                placeholder="Email"
                id="newsletter-email"
                type="email"
                size="s"
                required
                suffix={
                  <IconButton
                    icon="send"
                    style={{
                      marginRight: "-0.25rem",
                    }}
                  />
                }
              />
            </Column>
          </RevealFx>
          <RevealFx translateY="16" delay={600} horizontal="center">
            <Row vertical="center" gap="16" paddingTop="24">
              <AvatarGroup
                reverse
                size="m"
                avatars={[
                  { src: "/images/creators/light.jpg" },
                  { src: "/images/creators/osmy.jpg" },
                  { src: "/images/creators/justin.jpg" },
                  { src: "/images/creators/div.jpg" },
                ]}
              />
              <Text variant="code-default-s">Join 3.5k+ readers</Text>
            </Row>
          </RevealFx>
        </Column>
      </Column>
      <Row fillWidth horizontal="center">
        <Background
          position="absolute"
          left="0"
          top="0"
          fill
          gradient={{
            display: true,
            colorStart: "brand-solid-strong",
            y: 100,
            width: 100,
            height: 90,
          }}
          pointerEvents="none"
        />
        <RevealFx fitWidth translateY="24" delay={800}>
          <Scroller fitWidth>
            <Row paddingX="56" gap="40" paddingY="48">
              <Book
                href="#"
                minWidth={14}
                maxWidth={16}
                aspectRatio="3/4"
                src="/images/customize/philosophy/01.jpg"
              />
              <Book
                href="#"
                minWidth={14}
                maxWidth={16}
                aspectRatio="3/4"
                src="/images/customize/philosophy/02.jpg"
              />
              <Book
                href="#"
                minWidth={14}
                maxWidth={16}
                aspectRatio="3/4"
                src="/images/customize/philosophy/03.jpg"
              />
            </Row>
          </Scroller>
        </RevealFx>
      </Row>
    </Column>
  );
};
