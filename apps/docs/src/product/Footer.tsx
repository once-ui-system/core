import { layout, social } from "@/resources";
import { Background, Column, IconButton, Logo, Row, SmartLink, Tag, Text } from "@once-ui-system/core";
import { Cta } from "./Cta";

const navigation = [
  {
    title: "Products",
    free: [
      { label: "All Products", href: "https://once-ui.com/products" },
      { label: "Once UI Core", href: "https://once-ui.com/products/once-ui-core" },
      { label: "Magic Portfolio", href: "https://once-ui.com/products/magic-portfolio" },
      { label: "Magic Docs", href: "https://once-ui.com/products/magic-docs" },
      { label: "Magic Bio", href: "https://once-ui.com/products/magic-bio" },
      { label: "Once UI Figma", href: "https://once-ui.com/figma" },
    ],
    pro: [
      { label: "Magic Spotlight", href: "https://once-ui.com/products/magic-spotlight", tag: "New" },
      { label: "Supabase Starter", href: "https://once-ui.com/products/supabase-starter", tag: "New" },
      { label: "Magic Agent", href: "https://once-ui.com/products/magic-agent" },
      { label: "Magic Convert", href: "https://once-ui.com/products/magic-convert" },
      { label: "Magic Store", href: "https://once-ui.com/products/magic-store" },
      { label: "Once UI Blocks", href: "https://once-ui.com/blocks/quickStart" },
    ]
  },
  {
    title: "Learn",
    free: [
      { label: "Customize", href: "https://once-ui.com/customize" },
      { label: "Once UI Core docs", href: "/once-ui/quick-start" },
      { label: "Magic Portfolio docs", href: "/magic-portfolio/quick-start" },
      { label: "Magic Docs docs", href: "/magic-docs/quick-start" },
      { label: "Magic Bio docs", href: "/magic-bio/quick-start" },
      { label: "Roadmap", href: "/roadmap" },
      { label: "Changelog", href: "/changelog" },
    ],
    pro: [
      { label: "Supabase Starter docs", href: "/supabase-starter/quick-start" },
      { label: "Magic Agent docs", href: "/magic-agent/quick-start" },
      { label: "Magic Convert docs", href: "/magic-convert/quick-start" },
      { label: "Magic Store docs", href: "/magic-store/quick-start" },
    ]
  },
  {
    title: "Resources",
    resources: [
      { label: "Pricing", href: "https://once-ui.com/pricing" },
      { label: "Blog", href: "https://once-ui.com/blog" },
      { label: "About us", href: "https://once-ui.com/about" },
      { label: "Merch store", href: "https://store.dopler.app" },
      { label: "Brand assets", href: "https://once-ui.com/brand" },
    ],
    legal: [
      { label: "Terms of Use", href: "https://dopler.app/terms" },
      { label: "Privacy Policy", href: "https://dopler.app/privacy" },
      { label: "License Agreement", href: "https://dopler.app/license" },
    ]
  },
  {
    title: "Hub",
    items: [
      { label: "Explore", href: "https://once-ui.com/hub" },
      { label: "Create profile", href: "https://once-ui.com/hub/profile" },
    ],
  },
];

const Footer = () => {
  return (
    <Column fillWidth horizontal="center">

      <Row fillWidth borderY="neutral-alpha-medium">
        <Background
          lines={{
            display: true,
            color: "neutral-alpha-weak",
            angle: -45,
            size: "4"
          }}
          borderRight="neutral-alpha-medium"
          width={layout.sidebar.width} 
          minWidth={layout.sidebar.width}
          m={{hide: true}}/>
        <Cta/>
        <Background
          lines={{
            display: true,
            color: "neutral-alpha-weak",
            angle: -45,
            size: "4"
          }}
          borderLeft="neutral-alpha-medium"
          width={layout.sidebar.width} 
          minWidth={layout.sidebar.width}
          m={{hide: true}}/>
      </Row>

      <Row fillWidth horizontal="center">
        <Row flex={1}>
          <Background
            fill
            border="neutral-alpha-medium"
            bottomRightRadius="full"
            topLeftRadius="full"
            width={layout.sidebar.width} 
            minWidth={layout.sidebar.width}
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
            <Logo href="/" dark icon="/trademark/icon-dark.svg" size="m"/>
            <Logo href="/" light icon="/trademark/icon-light.svg" size="m"/>
            <Row gap="8">
              {social.map((item, index) => (
                <IconButton
                  data-border="rounded"
                  icon={item.icon}
                  variant="secondary"
                  size="l"
                  key={index}
                  href={item.link}
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
            width={layout.sidebar.width} 
            minWidth={layout.sidebar.width}
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
            width={layout.sidebar.width} 
            minWidth={layout.sidebar.width}
            m={{hide: true}}/>
          <Row fillWidth overflow="hidden" minWidth={4} l={{hide: true}}/>
        </Row>
        <Row gap="8" paddingY="24" center maxWidth="xl" textVariant="label-default-s" onBackground="neutral-medium" borderX="neutral-alpha-medium">
          Once UI is an open-source project by{" "}
          <SmartLink href="https://dopler.app" unstyled>
            <Logo dark icon="/trademark/dopler-icon-dark.svg" size="xs" />
            <Logo light icon="/trademark/dopler-icon-light.svg" size="xs" />
            Dopler
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
            width={layout.sidebar.width} 
            minWidth={layout.sidebar.width}
            m={{hide: true}}/>
        </Row>
      </Row>
    </Column>
  );
};

export { Footer };
