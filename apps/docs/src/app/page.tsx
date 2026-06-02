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
  Card
} from "@once-ui-system/core";
import { baseURL, meta, schema, changelog, roadmap, layout } from "@/resources";
import { formatDate } from "./utils/formatDate";
import { getQuarterLabel } from "./utils/getQuarter";
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

// Calculate roadmap progress stats
const calculateRoadmapStats = () => {
  let totalTasks = 0;
  let inProgressTasks = 0;
  let completedTasks = 0;
  
  roadmap.forEach(product => {
    product.columns.forEach(column => {
      totalTasks += column.tasks.length;
      
      if (column.title === "In Progress") {
        inProgressTasks += column.tasks.length;
      }
      
      if (column.title === "Done") {
        completedTasks += column.tasks.length;
      }
    });
  });
  
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  return {
    totalTasks,
    inProgressTasks,
    completedTasks,
    progressPercentage
  };
};

const roadmapStats = calculateRoadmapStats();

// Get the latest changelog entry
const latestChangelogEntry = changelog[0];

export default function Home() {
  return (
    <Row fillWidth>
      <Row fillWidth horizontal="center" padding="l">
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
            <MatrixFx
              data-solid="color"
              position="absolute"
              top="0"
              left="0"
              size={1.5}
              spacing={8}
              flicker
              colors={["brand-solid-strong"]}
              bulge={{
                type: "wave",
                duration: 3,
                intensity: 20,
                repeat: true
              }}
            />
            <Background position="absolute" gradient={{display: true, colorStart: "page-background", x: 0, y: 50, height: 300, width: 150}}></Background>
            <Column maxWidth="m" horizontal="center" align="center" gap="16" padding="48">
              <Badge
                background="overlay"
                style={{backdropFilter: "blue(0.25rem)"}}
                paddingLeft="8"
                paddingRight="16"
                border="brand-alpha-weak"
                arrow={false}
                paddingY="8"
                href="/changelog"
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
                    <Text onBackground="brand-strong">v1.7</Text> Form with intent
                  </Row>
                </Row>
              </Badge>
              <Heading variant="display-strong-m" marginTop="12" marginBottom="24">
                Open-source frontend infrastructure for the AI-native web
              </Heading>
              <Button data-border="rounded" size="l" href="/once-ui/quick-start" id="quick-start">Install Once UI</Button>
            </Column>
          </Column>

          <Grid maxWidth={56} columns="3" s={{columns: 1}} gap="8">
            <Card fillWidth radius="l" border="neutral-alpha-weak" padding="24" background="overlay" href="/once-ui/about">
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
                <Text onBackground="neutral-weak" variant="body-default-s">Ready-to-deploy app templates for your next project: store, landing page, founder site, and more</Text>
              </Column>
            </Card>
          </Grid>
          
          {/* Latest Update Section */}
          <Column 
            maxWidth={56}
            background="overlay"
            radius="l"
            border="neutral-alpha-weak"
          >
            <Column paddingX="32" paddingY="24" fillWidth horizontal="between" s={{direction: "column"}} gap="4">
              <Row fillWidth vertical="center" horizontal="between" gap="16" wrap>
                <Heading as="h2" variant="display-default-xs">
                  Latest Update
                </Heading>
                <Button data-border="rounded" weight="default" variant="secondary" href="/changelog" size="s" suffixIcon="chevronRight">
                  All changes
                </Button>
              </Row>
              <Text variant="label-default-s" onBackground="neutral-weak">
                {formatDate(latestChangelogEntry.date)}
              </Text>
            </Column>
            
            <Column fillWidth paddingX="4">
              {latestChangelogEntry.image && (
                <Media
                  priority
                  sizes="(max-width: 768px) 100vw, 768px"
                  radius="m"
                  src={latestChangelogEntry.image} 
                  alt={`Illustration for ${latestChangelogEntry.title}`}
                  border="neutral-alpha-weak"
                  aspectRatio="16 / 9"
                />
              )}
              <Column fillWidth gap="4" paddingX="32" paddingY="24">
                <Heading as="h3">
                  {latestChangelogEntry.title}
                </Heading>

                {latestChangelogEntry.description && (
                  <Text variant="body-default-m" onBackground="neutral-weak">
                    {latestChangelogEntry.description}
                  </Text>
                )}
              </Column>
            </Column>
          </Column>
          
          {/* Roadmap Progress Section */}
          <Column 
            maxWidth={56}
            background="overlay"
            radius="l"
            border="neutral-alpha-weak"
          >
            <Column paddingX="32" paddingY="24" fillWidth horizontal="between" s={{direction: "column"}} gap="4">
              <Row fillWidth vertical="center" horizontal="between" gap="16" wrap>
                <Heading as="h2" variant="display-default-xs">
                  {`Roadmap ${getQuarterLabel()}`}
                </Heading>
                <Button data-border="rounded" weight="default" variant="secondary" href="/roadmap" size="s" suffixIcon="chevronRight">
                View Roadmap
              </Button>
              </Row>
              <Text variant="label-default-s" onBackground="neutral-weak">
                Progress and task status
              </Text>
            </Column>
            
            <Row fillWidth padding="32" gap="20" position="relative" s={{direction: "column"}} border="neutral-alpha-weak" radius="l">
              <Row fillWidth gap="12">
                {/* Overall Progress */}
                <Column fillWidth gap="8" paddingTop="8">
                  <Column fillWidth gap="20">
                    <Column fillWidth horizontal="center" gap="4">
                      <Text 
                        variant="display-strong-l" 
                        onBackground="neutral-strong"
                      >
                        {roadmapStats.progressPercentage}%
                      </Text>
                      <Text 
                        align="center"
                        variant="label-default-s" 
                        onBackground="neutral-weak"
                        marginTop="8"
                      >
                        Overall progress
                      </Text>
                    </Column>
                    
                    <Row
                      height="8"
                      fillWidth
                      overflow="hidden"
                      radius="full"
                      background="neutral-alpha-weak"
                      border="neutral-alpha-weak"
                    >
                      <Row
                        fillHeight
                        radius="full"
                        transition="micro-medium"
                        solid="brand-strong"
                        style={{ 
                        width: `${roadmapStats.progressPercentage}%`,
                      }} />
                    </Row>
                  </Column>
                  
                  {/* Task Status */}
                  <Grid fillWidth columns="3" m={{columns: 1}} gap="8" marginTop="24">
                    {/* Planned Tasks */}
                    <Column 
                      padding="l" 
                      horizontal="center"
                      radius="m" 
                      border="neutral-alpha-weak" 
                      background="overlay"
                      gap="s"
                    >
                      <Text 
                        variant="display-default-m" 
                        onBackground="neutral-strong"
                      >
                        {roadmapStats.totalTasks - roadmapStats.completedTasks - roadmapStats.inProgressTasks}
                      </Text>
                      <Row vertical="center" gap="8">
                        <StatusIndicator color="blue" />
                        <Text 
                          variant="label-default-s" 
                          onBackground="neutral-weak"
                        >
                          Planned
                        </Text>
                      </Row>
                    </Column>
                    
                    {/* In Progress Tasks */}
                    <Column 
                      padding="l" 
                      horizontal="center"
                      radius="m" 
                      border="neutral-alpha-weak" 
                      background="overlay"
                      gap="s"
                    >
                      <Text 
                        variant="display-default-m" 
                        onBackground="neutral-strong"
                      >
                        {roadmapStats.inProgressTasks}
                      </Text>
                      <Row vertical="center" gap="8">
                        <StatusIndicator color="yellow" />
                        <Text 
                          variant="label-default-s" 
                          onBackground="neutral-weak"
                        >
                          In progress
                        </Text>
                      </Row>
                    </Column>

                    {/* Completed Tasks */}
                    <Column 
                      padding="l" 
                      horizontal="center"
                      radius="m" 
                      border="neutral-alpha-weak" 
                      background="overlay"
                      gap="s"
                    >
                      <Text 
                        variant="display-default-m" 
                        onBackground="neutral-strong"
                      >
                        {roadmapStats.completedTasks}
                      </Text>
                      <Row vertical="center" gap="8">
                        <StatusIndicator color="green" />
                        <Text 
                          variant="label-default-s" 
                          onBackground="neutral-weak"
                        >
                          Completed
                        </Text>
                      </Row>
                    </Column>
                  </Grid>
                </Column>
              </Row>
            </Row>
          </Column>
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
              <MatrixFx minWidth={12} minHeight={8} position="absolute" flicker revealFrom="top" size={2} spacing={2} colors={["brand-solid-strong", "static-transparent"]}/>
              <Background position="absolute" fill gradient={{display: true, colorStart: "neutral-background-weak", y: 0, width: 300, height: 300}} pointerEvents="none"/>
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
