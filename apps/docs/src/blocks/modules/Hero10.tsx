import {
  Arrow,
  Avatar,
  AvatarGroup,
  Background,
  Badge,
  Button,
  Card,
  Column,
  CompareImage,
  Heading,
  Icon,
  Mask,
  MatrixFx,
  Media,
  Pulse,
  Row,
  Text,
} from "@once-ui-system/core";

export const Hero10: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Column fillWidth fitHeight horizontal="center" {...flex}>
      <Column fillWidth fitHeight overflow="hidden" horizontal="center">
        <Background
          position="absolute"
          top="0"
          left="0"
          gradient={{
            display: true,
            x: 50,
            y: 80,
            width: 75,
            height: 70,
            colorStart: "brand-background-strong",
          }}
        />
        <Mask fill position="absolute" top="0" left="0" x={50} y={70} radius={100}>
          <MatrixFx
            fill
            data-solid="inverse"
            opacity={60}
            colors={["brand-solid-medium", "static-transparent"]}
            fps={24}
            size={1.5}
            spacing={6}
            bulge={{
              duration: 3,
              intensity: 20,
              repeat: false,
            }}
          />
        </Mask>
        <Background
          position="absolute"
          bottom="0"
          left="0"
          gradient={{
            display: true,
            x: 50,
            y: 110,
            height: 65,
            colorStart: "brand-solid-strong",
          }}
        />
        <Background
          hide
          s={{ hide: false }}
          position="absolute"
          data-solid="inverse"
          top="0"
          left="0"
          gradient={{
            display: true,
            x: 50,
            y: 100,
            height: 50,
            colorStart: "brand-solid-strong",
          }}
        />
        <Row
          maxWidth="xl"
          paddingX="l"
          gap="32"
          vertical="end"
          m={{ direction: "column", horizontal: "start" }}
        >
          <Column zIndex={1} maxWidth={40} gap="24" paddingY="xl" fillHeight vertical="between">
            <Card
              fillWidth
              direction="column"
              radius="l"
              href="https://blog.once-ui.com/builder-stories/iqon"
            >
              <Row
                fillWidth
                id="case-study-arrow-trigger"
                xs={{ direction: "column" }}
                fit
                radius="l"
                background="brand-alpha-weak"
                padding="4"
                gap="40"
                vertical="center"
              >
                <Media
                  xs={{ hide: true }}
                  minWidth={12}
                  maxWidth={12}
                  sizes="400px"
                  priority
                  src="/images/blog/iqon-app-02.jpg"
                  radius="m"
                  border
                  aspectRatio="1120/960"
                />
                <Column fillWidth gap="16" xs={{ style: { padding: "1rem" } }}>
                  <Row gap="8" vertical="center" onBackground="brand-weak" marginBottom="4">
                    <Icon name="starFill" size="xs" />
                    <Icon name="starFill" size="xs" />
                    <Icon name="starFill" size="xs" />
                    <Icon name="starFill" size="xs" />
                    <Icon name="starFill" size="xs" />
                  </Row>
                  <Text variant="heading-default-s" wrap="balance">
                    $10k frontend system delivered in 2 months with Once UI Pro
                  </Text>
                  <Row gap="12" vertical="center" textVariant="label-default-s">
                    <Avatar src="/images/creators/lorant.jpg" size="s" />
                    Lorant One · Founder @Once UI
                  </Row>
                </Column>
                <Arrow
                  position="absolute"
                  top="40"
                  right="40"
                  trigger="#case-study-arrow-trigger"
                  scale={1}
                />
              </Row>
            </Card>
            <Column fillWidth gap="24">
              <Badge
                background="overlay"
                paddingLeft="8"
                paddingRight="20"
                border="brand-alpha-medium"
                paddingY="8"
                href="#"
              >
                <Row vertical="center">
                  <Pulse size="s" />
                  <Row
                    marginLeft="12"
                    textVariant="code-default-s"
                    onBackground="brand-medium"
                    gap="8"
                    vertical="center"
                  >
                    Sell high-value frontend systems
                  </Row>
                </Row>
              </Badge>
              <Heading variant="display-default-l">Deployment-ready Next.js app templates</Heading>
              <Text wrap="balance" variant="heading-default-xl" onBackground="neutral-medium">
                Build and deliver complete frontend systems without starting from scratch
              </Text>
              <Row vertical="center" fillWidth gap="20">
                <AvatarGroup
                  reverse
                  size="s"
                  avatars={[
                    { src: "/images/creators/lorant.jpg" },
                    { src: "/images/creators/justin.jpg" },
                    { src: "/images/creators/light.jpg" },
                    { src: "/images/creators/div.jpg" },
                    { src: "/images/creators/osmy.jpg" },
                  ]}
                />
                <Text variant="label-default-s" onBackground="brand-medium">
                  Loved by hundreds of builders
                </Text>
              </Row>
              <Row padding="4" radius="l" fitWidth border="neutral-alpha-strong">
                <Button href="#">Get Pro</Button>
              </Row>
            </Column>
          </Column>
          <Row fill vertical="center">
            <Row
              maxWidth="m"
              minWidth="150%"
              background="overlay"
              aspectRatio="16 / 9"
              radius="l"
              overflow="hidden"
              border
              style={{
                backdropFilter: "blur(0.25rem)",
                transform:
                  "translateY(-10%) translateX(3rem) scaleY(1) scaleX(1.2) rotateX(30deg) rotateY(20deg) rotate(335deg)",
                transformOrigin: "center",
                transformStyle: "preserve-3d",
                maskImage:
                  "linear-gradient(to right, black 80%, transparent 100%), linear-gradient(to bottom, black 60%, transparent 100%)",
                maskComposite: "intersect",
              }}
            >
              <CompareImage
                leftContent={{
                  src: "/images/products/convert-hero.jpg",
                  alt: "Magic Convert dark mode product mockup from Once UI Pro",
                }}
                rightContent={{
                  src: "/images/products/convert-hero-light.jpg",
                  alt: "Magic Convert light mode product mockup from Once UI Pro",
                }}
              />
            </Row>
          </Row>
        </Row>
      </Column>
      <Row fillWidth horizontal="center" borderY="neutral-medium">
        <Row maxWidth="xl" paddingX="l" gap="-1" align="center" s={{ direction: "column" }}>
          <Row flex="4">
            <Column fillWidth borderX="neutral-medium" horizontal="center" padding="l" gap="8">
              <Text variant="display-strong-l">100+</Text>
              <Text onBackground="neutral-weak">Copy-paste blocks</Text>
            </Column>
          </Row>
          <Row flex="5">
            <Column fillWidth borderX="neutral-medium" horizontal="center" padding="l" gap="8">
              <Text variant="display-strong-l">100+</Text>
              <Text onBackground="neutral-weak">Open-source components</Text>
            </Column>
          </Row>
          <Row flex="4">
            <Column fillWidth borderX="neutral-medium" horizontal="center" padding="l" gap="8">
              <Text variant="display-strong-l">10+</Text>
              <Text onBackground="neutral-weak">Deployment-ready apps</Text>
            </Column>
          </Row>
        </Row>
      </Row>
    </Column>
  );
};
