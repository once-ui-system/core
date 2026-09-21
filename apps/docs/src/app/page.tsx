import React from "react";
import { 
  Column, 
  Row, 
  Heading, 
  Text, 
  Button, 
  Grid, 
  Media, 
  StatusIndicator,
  Badge,
  Meta,
  Schema,
  MatrixFx,
  Background,
  Pulse,
  Card,
  BlobFx
} from "@once-ui-system/core";
import corePackage from "@once-ui-system/core/package.json";
import { PromptLibrary } from "@/product/PromptLibrary";
import { baseURL, meta, schema, layout } from "@/resources";
import { PromoCard } from "@/components/PromoCard";

export async function generateMetadata() {
  return Meta.generate({
    title: meta.home.title,
    description: meta.home.description,
    baseURL: baseURL,
    path: meta.home.path,
    image: meta.home.image
  });
}


export default function Home() {
  return (
    <Row fillWidth horizontal="center">
      <Row fillWidth horizontal="center" padding="l">
      <BlobFx maxWidth="l" data-solid="color" height={32} fillWidth position="absolute" translateY="-60%" />
        <Column fillWidth gap="xl" horizontal="center">
          <Schema
            as="webPage"
            title={meta.home.title}
            description={meta.home.description}
            baseURL={baseURL}
            path={meta.home.path}
            author={{
              name: schema.name
            }}
          />
          
          {/* Hero Section */}
          <Column maxWidth={96} minHeight="s" gap="12" center overflow="hidden">
            <Column maxWidth="m" horizontal="center" align="center" gap="16" padding="48">
              <Badge
                background="overlay"
                style={{backdropFilter: "blur(0.25rem)"}}
                paddingLeft="8"
                paddingRight="16"
                border="brand-alpha-weak"
                arrow={false}
                paddingY="8"
                href="https://github.com/once-ui-system/core/releases"
              >
                <Row vertical="center">
                  <Pulse size="s"/>
                  <Row
                    marginLeft="12"
                    textVariant="label-default-s"
                    onBackground="brand-medium"
                    gap="12"
                    vertical="center"
                  >
                    <Text onBackground="brand-strong">{`v${corePackage.version}`}</Text> Measured, not assumed
                  </Row>
                </Row>
              </Badge>
              <Heading variant="display-strong-m" marginTop="12" marginBottom="24">
                Open-source frontend infrastructure for the AI-native web
              </Heading>
              <Button data-border="rounded" size="l" href="/quick-start" id="quick-start">Install Once UI</Button>
            </Column>
          </Column>

          {/* Two ways in: an agent writes the code, or you do */}
          <Grid maxWidth={56} columns="2" s={{columns: 1}} gap="8">
            <Card fillWidth radius="l" border="neutral-alpha-weak" padding="24" background="overlay" href="/ai-coding">
              <Column fillWidth gap="12">
                <Text variant="heading-strong-xs">Build with an agent</Text>
                <Text onBackground="neutral-weak" variant="body-default-s">
                  A harness built for codegen: compact rules, a component catalog and task
                  bundles, all under ~10KB per task. Point your agent at it once and it writes
                  Once UI properly.
                </Text>
              </Column>
            </Card>
            <Card fillWidth radius="l" border="neutral-alpha-weak" padding="24" background="overlay" href="/quick-start">
              <Column fillWidth gap="12">
                <Text variant="heading-strong-xs">Build by hand</Text>
                <Text onBackground="neutral-weak" variant="body-default-s">
                  Install, learn the token props, and reach for the reference when you need a
                  prop name. Start with structure, spacing and typography — the rest composes
                  from those.
                </Text>
              </Column>
            </Card>
          </Grid>

          <PromptLibrary />

          {/* The dozen components most builds actually use */}
          <Column maxWidth={56} gap="16" fillWidth>
            <Column gap="4">
              <Heading as="h2" variant="display-default-xs">Start here</Heading>
              <Text onBackground="neutral-weak" variant="body-default-s">
                There are 80-odd components. These twelve carry most of a build — everything
                else composes from them.
              </Text>
            </Column>
            <Grid fillWidth columns="3" m={{columns: 2}} s={{columns: 1}} gap="8">
            <Card fillWidth radius="l" border="neutral-alpha-weak" padding="16" background="overlay" href="/components/flex">
              <Column fillWidth gap="4">
                <Text variant="label-strong-s">Column</Text>
                <Text onBackground="neutral-weak" variant="body-default-xs">Stack things vertically</Text>
              </Column>
            </Card>
            <Card fillWidth radius="l" border="neutral-alpha-weak" padding="16" background="overlay" href="/components/flex">
              <Column fillWidth gap="4">
                <Text variant="label-strong-s">Row</Text>
                <Text onBackground="neutral-weak" variant="body-default-xs">Stack things horizontally</Text>
              </Column>
            </Card>
            <Card fillWidth radius="l" border="neutral-alpha-weak" padding="16" background="overlay" href="/components/grid">
              <Column fillWidth gap="4">
                <Text variant="label-strong-s">Grid</Text>
                <Text onBackground="neutral-weak" variant="body-default-xs">Responsive columns</Text>
              </Column>
            </Card>
            <Card fillWidth radius="l" border="neutral-alpha-weak" padding="16" background="overlay" href="/components/text">
              <Column fillWidth gap="4">
                <Text variant="label-strong-s">Text</Text>
                <Text onBackground="neutral-weak" variant="body-default-xs">Body copy and labels</Text>
              </Column>
            </Card>
            <Card fillWidth radius="l" border="neutral-alpha-weak" padding="16" background="overlay" href="/components/heading">
              <Column fillWidth gap="4">
                <Text variant="label-strong-s">Heading</Text>
                <Text onBackground="neutral-weak" variant="body-default-xs">Page and section titles</Text>
              </Column>
            </Card>
            <Card fillWidth radius="l" border="neutral-alpha-weak" padding="16" background="overlay" href="/components/button">
              <Column fillWidth gap="4">
                <Text variant="label-strong-s">Button</Text>
                <Text onBackground="neutral-weak" variant="body-default-xs">Primary actions</Text>
              </Column>
            </Card>
            <Card fillWidth radius="l" border="neutral-alpha-weak" padding="16" background="overlay" href="/form-controls/input">
              <Column fillWidth gap="4">
                <Text variant="label-strong-s">Input</Text>
                <Text onBackground="neutral-weak" variant="body-default-xs">Text entry and forms</Text>
              </Column>
            </Card>
            <Card fillWidth radius="l" border="neutral-alpha-weak" padding="16" background="overlay" href="/components/card">
              <Column fillWidth gap="4">
                <Text variant="label-strong-s">Card</Text>
                <Text onBackground="neutral-weak" variant="body-default-xs">Grouped, clickable blocks</Text>
              </Column>
            </Card>
            <Card fillWidth radius="l" border="neutral-alpha-weak" padding="16" background="overlay" href="/components/media">
              <Column fillWidth gap="4">
                <Text variant="label-strong-s">Media</Text>
                <Text onBackground="neutral-weak" variant="body-default-xs">Images and video</Text>
              </Column>
            </Card>
            <Card fillWidth radius="l" border="neutral-alpha-weak" padding="16" background="overlay" href="/components/icon">
              <Column fillWidth gap="4">
                <Text variant="label-strong-s">Icon</Text>
                <Text onBackground="neutral-weak" variant="body-default-xs">The built-in icon set</Text>
              </Column>
            </Card>
            <Card fillWidth radius="l" border="neutral-alpha-weak" padding="16" background="overlay" href="/components/dialog">
              <Column fillWidth gap="4">
                <Text variant="label-strong-s">Dialog</Text>
                <Text onBackground="neutral-weak" variant="body-default-xs">Modals and sheets</Text>
              </Column>
            </Card>
            <Card fillWidth radius="l" border="neutral-alpha-weak" padding="16" background="overlay" href="/components/table">
              <Column fillWidth gap="4">
                <Text variant="label-strong-s">Table</Text>
                <Text onBackground="neutral-weak" variant="body-default-xs">Tabular data</Text>
              </Column>
            </Card>
          </Grid>
            <Row fillWidth horizontal="center" paddingTop="8">
              <Button data-border="rounded" weight="default" variant="secondary" size="s" href="/basics/components" suffixIcon="chevronRight">
                Browse all components
              </Button>
            </Row>
          </Column>

          {/* Templates and products */}
          <Grid maxWidth={56} columns="3" s={{columns: 1}} gap="8">
            <Card fillWidth radius="l" border="neutral-alpha-weak" padding="24" background="overlay" href="/about">
              <Column fillWidth gap="16">
                <Text variant="heading-strong-xs">About Once UI</Text>
                <Text onBackground="neutral-weak" variant="body-default-s">Comprehensive design system and component library for your next project</Text>
              </Column>
            </Card>
            <Card fillWidth radius="l" border="neutral-alpha-weak" padding="24" background="overlay" href="https://once-ui.com/products/magic-portfolio">
              <Column fillWidth gap="16">
                <Text variant="heading-strong-xs">Magic Portfolio</Text>
                <Text onBackground="neutral-weak" variant="body-default-s">Free portfolio template that feels genuinely unique and professional</Text>
              </Column>
            </Card>
            <Card fillWidth radius="l" border="neutral-alpha-weak" padding="24" background="overlay" href="https://once-ui.com/products">
              <Column fillWidth gap="16">
                <Text variant="heading-strong-xs">Premium app templates</Text>
                <Text onBackground="neutral-weak" variant="body-default-s">Ready-to-deploy templates: store, landing page, founder site, and more</Text>
              </Column>
            </Card>
          </Grid>
        </Column>
      </Row>
      <Row
        width={layout.sidebar.width} 
        minWidth={layout.sidebar.width}
        m={{hide: true}}
        fillHeight>
          <Column
            fill
            padding="8"
            position="sticky"
            style={{maxHeight: "calc(100vh - 3.5rem)", top: "3.5rem"}}
            gap="8">
            <Column fill />
            <Card radius="l" href="https://once-ui.com/pricing?ref=docs" fillWidth background="transparent" overflow="hidden">
              <Column fillWidth padding="20" gap="16">
                <Text variant="heading-strong-xs">Support the project and get access to exclusive features!</Text>
                <Button rounded size="s" id="get-pro-banner" prefixIcon="bolt">Get Pro</Button>
              </Column>
            </Card>
            <PromoCard
              href="https://designengineers.club"
              image="/images/docs/swag-promo-01.png"
              buttonText="Join the Club"
            />
          </Column>
      </Row>
    </Row>
  );
}
