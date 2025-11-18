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
  Tag,
  Meta,
  Schema,
  MatrixFx,
  Background,
  Pulse,
  ShineFx
} from "@once-ui-system/core";
import { baseURL, meta, schema, changelog, roadmap, layout } from "@/resources";
import { formatDate } from "./utils/formatDate";
import { Products } from "@/product";
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
          <Column maxWidth={62} gap="12" minHeight="m" vertical="center" radius="l" overflow="hidden" border="brand-alpha-weak">
            <MatrixFx
              data-solid="color"
              position="absolute"
              top="0"
              left="0"
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
            <Column fillWidth gap="16" padding="48">
              <Badge
                background="overlay"
                style={{backdropFilter: "blue(0.25rem)"}}
                paddingLeft="8"
                paddingRight="4"
                border="brand-alpha-weak"
                arrow={false}
                paddingY="4"
                href="/changelog"
              >
                <Row vertical="center">
                  <Pulse size="s"/>
                  <Row
                    marginLeft="12"
                    textVariant="label-default-s"
                    onBackground="brand-medium"
                    gap="8"
                    vertical="center"
                  >
                    <Text weight="strong" onBackground="brand-strong">Once UI 1.5</Text> Curiosity in code
                    <Tag variant="brand" data-border="rounded"><ShineFx speed={2} baseOpacity={0.8}>New</ShineFx></Tag>
                  </Row>
                </Row>
              </Badge>
              <Heading variant="display-strong-m" marginTop="12">
                Once UI Docs
              </Heading>
              <Text wrap="balance" onBackground="neutral-weak" variant="body-default-xl" marginBottom="20">
                Open-source design system and<br/> app templates for indie builders
              </Text>
              <Button data-border="rounded" size="s" href="/get-started" variant="secondary" arrowIcon id="get-started">Quick start</Button>
            </Column>
          </Column>

          <Column maxWidth={56}>
            <Column fillWidth gap="4">
              <Text 
                variant="display-default-s" 
                onBackground="neutral-strong"
              >
                Products
              </Text>
              <Text
                onBackground="neutral-weak"
                marginTop="8"
                marginBottom="16"
              >
                Deploy fully functional apps in minutes
              </Text>
            </Column>
            <Products />
          </Column>
          
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
                  Q4 2025 Roadmap
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
            position="sticky"
            style={{maxHeight: "calc(100vh - 3.5rem)", top: "3.5rem"}}
            gap="-1">
            <Column fill borderLeft="neutral-alpha-medium" vertical="end">
              <Background
                fillWidth
                height={2}
                borderTop="neutral-alpha-medium"
                lines={{
                  display: true,
                  color: "neutral-alpha-weak",
                  angle: -45,
                  size: "4"
                }}/>
              <Row fillWidth padding="24" borderTop="neutral-alpha-medium">
                <Heading as="h3" variant="heading-strong-m">Support our recent launch!</Heading>
              </Row>
            </Column>
            {[
              {
                href: "https://store.dopler.app/product/curiosity-in-code-hooded-long-sleeve",
                image: "/images/docs/swag-promo-01.png",
              },
              {
                href: "https://store.dopler.app/product/curiosity-in-code-desk-mat",
                image: "/images/docs/swag-promo-02.png",
              }
            ].map((product, index) => (
              <PromoCard 
                key={index}
                href={product.href}
                image={product.image}
              />
            ))}
          </Column>
      </Row>
    </Row>
  );
}
