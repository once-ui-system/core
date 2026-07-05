import { Avatar, Background, Button, Column, IconButton, Logo, Mask, Particle, Row, SmartLink, Tag, Text, TypeFx } from "@once-ui-system/core";

const social = [
  {
    icon: "discord",
    label: "Discord",
    href: "https://discord.com/invite/5EyAQ4eNdS" },
  {
    icon: "github",
    label: "GitHub",
    href: "https://github.com/once-ui-system",
  },
  {
    icon: "email",
    label: "Email",
    href: "mailto:demo@email.com",
  },
];

const navigation = [
  {
    title: "Free",
    items: [
      { label: "All Products", href: "#" },
      { label: "Once UI Core", href: "#" },
      { label: "Magic Portfolio", href: "#" },
      { label: "Magic Docs", href: "#" },
      { label: "Magic Bio", href: "#" },
      { label: "Once UI Figma", href: "#" },
    ],
  },
  {
    title: "Pro",
    items: [
      { label: "Supa Social", href: "#", tag: "New" },
      { label: "Magic Studio", href: "#", tag: "New" },
      { label: "Supabase Starter", href: "#" },
      { label: "Magic Convert", href: "#" },
      { label: "Magic Spotlight", href: "#" },
      { label: "Magic Journal", href: "#", tag: "New" },
      { label: "Magic Store", href: "#" },
      { label: "Magic Agent", href: "#" },
      { label: "Once UI Blocks", href: "#" },
    ]
  },
  {
    title: "Learn",
    items: [
      { label: "Pricing", href: "#" },
      { label: "Services", href: "#", tag: "New" },
      { label: "Canvas", href: "#", tag: "New" },
      { label: "Documentation", href: "#" },
      { label: "Roadmap", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Handbook", href: "#", tag: "New" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Blog", href: "#" },
      { label: "About us", href: "#" },
      { label: "Contact us", href: "#" },
      { label: "Sponsor us", href: "#" },
      { label: "Merch store", href: "#" },
      { label: "Brand assets", href: "#" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Terms of Use", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "License Agreement", href: "#" },
    ]
  },
];

export const Footer4 = (flex: React.ComponentProps<typeof Column>) => {
  return (
    <Column fillWidth horizontal="center" {...flex}>

      <Row fillWidth borderY="neutral-alpha-medium">
        <Background
          lines={{
            display: true,
            color: "neutral-alpha-weak",
            angle: -45,
            size: "4"
          }}
          borderRight="neutral-alpha-medium"
          width={12}
          minWidth={12}
          m={{hide: true}}/>
        <Row fillWidth horizontal="center">
          <Row flex={1} border="neutral-alpha-medium" radius="full" minWidth={4} l={{hide: true}}/>
          <Column maxWidth="xl" height="m" center paddingX="l" gap="24" s={{direction: "column"}} borderLeft="neutral-alpha-medium" borderRight="neutral-alpha-medium" overflow="hidden">
            <Background
              position="absolute"
              fill
              lines={{
                display: true,
                color: "neutral-alpha-weak",
                angle: -45,
                size: "4"
              }}/>
            <Row overflow="hidden" position="absolute" minWidth={80} minHeight={28} radius="full" border="neutral-alpha-medium">
              <Background
                fill
                position="absolute"
                bottom="0"
                left="0"
                data-solid="color"
                gradient={{
                  display: true,
                  x: 50,
                  y: 100,
                  width: 100,
                  height: 50,
                  colorStart: "brand-solid-strong",
                  colorEnd: "page-background",
                }}
              />
              <Background
                fill
                position="absolute"
                bottom="0"
                left="0"
                style={{filter: "blur(1rem)", transform: "scale(1.1)"}}
                gradient={{
                  display: true,
                  x: 50,
                  y: 100,
                  width: 100,
                  height: 30,
                  colorStart: "brand-on-background-strong",
                }}
              />
              </Row>
              <Row overflow="hidden" position="absolute" minWidth={58} minHeight={28} radius="full" border="neutral-alpha-medium"/>
              <Row overflow="hidden" position="absolute" minWidth={42} minHeight={28} radius="full" border="neutral-alpha-medium"/>
              <Row overflow="hidden" position="absolute" minWidth={28} minHeight={28} radius="full" border="neutral-alpha-medium">
              <Mask fill
                position="absolute"
                x={50}
                y={50}
                radius={25}
                >
                <Particle style={{transform: "scale(1.1)"}} opacity={70} position="absolute" top="0" left="0" fill interactive speed={1.5} density={100} size="2" intensity={20} mode="attract"/>
              </Mask>
            </Row>
            <Column horizontal="center" gap="20">
              <TypeFx
                variant="display-strong-m"
                words={["Ship your product.", "Build a presence.", "Launch seamlessly."]}
                speed={80}
                hold={2000}
                trigger="instant"
              />
              <Button data-border="rounded" id="hero-cta-button" href="#" arrowIcon>
                Start now
              </Button>
            </Column>
          </Column>
          <Row flex={1} border="neutral-alpha-medium" radius="full" minWidth={4} l={{hide: true}}/>
        </Row>
        <Background
          lines={{
            display: true,
            color: "neutral-alpha-weak",
            angle: -45,
            size: "4"
          }}
          borderLeft="neutral-alpha-medium"
          width={12} 
          minWidth={12}
          m={{hide: true}}/>
      </Row>

      <Row fillWidth horizontal="center">
        <Row flex={1}>
          <Background
            fill
            border="neutral-alpha-medium"
            bottomRightRadius="full"
            topLeftRadius="full"
            width={12} 
            minWidth={12}
            m={{hide: true}}/>
          <Column flex={1}
            bottomLeftRadius="full"
            topRightRadius="full"
            overflow="hidden"
            border="neutral-alpha-medium"
            l={{hide: true}}>
            <Row
              flex={1}
              minWidth={4}
              overflow="hidden">
              <Background
                fill
                position="absolute"
                bottom="0"
                left="0"
                data-solid="color"
                gradient={{
                  display: true,
                  x: 50,
                  y: 100,
                  width: 100,
                  height: 50,
                  colorStart: "brand-solid-strong",
                  colorEnd: "page-background",
                }}
              />
              <Background
                fill
                position="absolute"
                bottom="0"
                left="0"
                style={{filter: "blur(1rem)", transform: "scale(1.1)"}}
                gradient={{
                  display: true,
                  x: 50,
                  y: 100,
                  width: 100,
                  height: 30,
                  colorStart: "brand-on-background-strong",
                }}
              />
            </Row>
            <Background
              lines={{
                display: true,
                color: "neutral-alpha-weak",
                angle: -45,
                size: "4"
              }}
              flex={1}
              minWidth={4}/>
          </Column>
        </Row>
        <Column 
          maxWidth="xl"
          borderX="neutral-alpha-medium">
          <Row paddingX="xl" paddingTop="xl" paddingBottom="40" fillWidth horizontal="between" vertical="center">
            <Logo href="/" dark icon="/trademarks/icon-dark.svg" size="m"/>
            <Logo href="/" light icon="/trademarks/icon-light.svg" size="m"/>
            <Row gap="8">
              {social.map((item, index) => (
                <IconButton
                  data-border="rounded"
                  icon={item.icon}
                  variant="secondary"
                  size="l"
                  key={index}
                  href={item.href}
                />
              ))}
            </Row>
          </Row>
          <Row
            paddingX="xl" 
            paddingBottom="xl" 
            fillWidth 
            wrap 
            gap="32" 
            horizontal="between">
            {navigation.map((section) => (
              <Column key={section.title} maxWidth={12} gap="32" paddingY="8">
                <Text wrap="balance" variant="heading-strong-s">
                  {section.title}
                </Text>
                {[
                  { key: "free", label: "Free" },
                  { key: "pro", label: "Pro" },
                  { key: "resources", label: "Resources" },
                  { key: "legal", label: "Legal" },
                  { key: "items", label: undefined },
                ].map(({ key, label }) => {
                  const arr = (section as any)[key] as Array<any> | undefined;
                  if (!arr || arr.length === 0) return null;
                  return (
                    <Column key={`${section.title}-${key}`} gap="8">
                      {label && (
                        <Text variant="label-default-s" onBackground="neutral-weak" marginBottom="8">
                          {label}
                        </Text>
                      )}
                      {arr.map((item: any) => (
                        <SmartLink key={`${item.label}-${item.href}`} href={item.href} unstyled>
                          <Text wrap="balance" variant="body-default-s" onBackground="neutral-strong">
                            {item.label}
                          </Text>
                          {item.tag && (
                            <Tag style={{ transform: "scale(0.9)" }} variant="brand" size="s">
                              {item.tag}
                            </Tag>
                          )}
                        </SmartLink>
                      ))}
                    </Column>
                  );
                })}
              </Column>
            ))}
          </Row>
        </Column>
        <Row flex={1}>
          <Background
            lines={{
              display: true,
              color: "neutral-alpha-weak",
              angle: -45,
              size: "4"
            }}
            flex={1}
            border="neutral-alpha-medium"
            bottomRadius="full"
            topLeftRadius="full"
            minWidth={4}
            l={{hide: true}}/>
          <Background
            fillWidth
            border="neutral-alpha-medium"
            leftRadius="full"
            width={12} 
            minWidth={12}
            m={{hide: true}}/>
        </Row>
      </Row>
      
      <Row fillWidth borderTop="neutral-alpha-medium" horizontal="center">
        <Row flex={1}>
          <Background
            lines={{
              display: true,
              color: "neutral-alpha-weak",
              angle: -45,
              size: "4"
            }}
            borderRight="neutral-alpha-medium"
            width={12} 
            minWidth={12}
            m={{hide: true}}/>
          <Row fillWidth overflow="hidden" minWidth={4} l={{hide: true}}/>
        </Row>
        <Row gap="8" paddingY="24" center maxWidth="xl" textVariant="label-default-s" onBackground="neutral-medium" borderX="neutral-alpha-medium">
          Built with curiosity by{" "}
          <SmartLink href="#" unstyled>
            <Avatar size="xs" src="/images/creators/lorant.jpg"/>
            Lorant One
          </SmartLink>
        </Row>
        <Row flex={1}>
          <Row fillWidth overflow="hidden" minWidth={4} l={{hide: true}}>
            <Background
              fill
              position="absolute"
              bottom="0"
              left="0"
              data-solid="color"
              gradient={{
                display: true,
                x: 0,
                y: 50,
                width: 100,
                height: 200,
                colorStart: "brand-solid-strong",
                colorEnd: "page-background",
              }}
            />
            <Background
              fill
              position="absolute"
              bottom="0"
              left="0"
              style={{filter: "blur(1rem)", transform: "scale(1.1)"}}
              gradient={{
                display: true,
                x: 0,
                y: 50,
                width: 50,
                height: 200,
                colorStart: "brand-on-background-strong",
              }}
            />
          </Row>
          <Background
            lines={{
              display: true,
              color: "neutral-alpha-weak",
              angle: -45,
              size: "4"
            }}
            bottomLeftRadius="full"
            borderLeft="neutral-alpha-medium"
            borderBottom="neutral-alpha-medium"
            width={12} 
            minWidth={12}
            m={{hide: true}}/>
        </Row>
      </Row>
    </Column>
  );
};