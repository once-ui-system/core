import React from "react";
import { 
  Column, 
  Row, 
  Heading, 
  Text, 
  Button, 
  Grid, 
  Card, 
  Media, 
  Line, 
  StatusIndicator,
  Avatar,
  Badge,
  Tag,
  Meta,
  Schema
} from "@once-ui-system/core";
import { baseURL, meta, schema, changelog, roadmap } from "@/resources";
import { formatDate } from "./utils/formatDate";

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
    <Column maxWidth={56} gap="xl">
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
      <Column fillWidth gap="l" paddingTop="l">
        <Row fillWidth gap="l">
          <Column maxWidth="xs" gap="12">
          <Badge
              background="overlay"
              paddingLeft="8"
              paddingRight="20"
              paddingY="8"
              effect={false}
              border="neutral-alpha-medium"
              shadow={undefined}
              href="/changelog"
              vertical="center"
              marginBottom="12"
              radius="l"
            >
              <Tag marginRight="12" variant="brand">NEW</Tag>
              <Text
                variant="label-default-s"
              >
                Once UI 1.4 release
              </Text>
            </Badge>
            <Heading variant="display-strong-s">
              Once UI Docs
            </Heading>
            <Text wrap="balance" onBackground="neutral-weak" variant="body-default-xl" marginBottom="20">
              Get started with our premium, plug-and-play solutions built for vibe coding
            </Text>
            <Button data-border="rounded" size="s" href="/get-started" variant="secondary" arrowIcon id="get-started">Quick start</Button>
          </Column>
        </Row>
      </Column>

      <Column fillWidth>
      <Column fillWidth gap="4">
        <Text 
          variant="display-default-s" 
          onBackground="neutral-strong"
        >
          Products
        </Text>
        <Text
          variant="label-default-s" 
          onBackground="neutral-weak"
          marginTop="8"
          marginBottom="16"
        >
          Deploy fully functional apps in minutes
        </Text>
      </Column>
      <Grid fillWidth columns="2" m={{columns: 1}} gap="12" marginTop="16">
          {[
            {
              title: "Once UI Core",
              description: "The design system that powers all our products.",
              image: "/images/docs/once-ui.jpg",
              href: "/once-ui/quick-start"
            },
            {
              title: "Magic Portfolio",
              description: "Showcase your work with our beautiful portfolio template.",
              image: "/images/docs/magic-portfolio.jpg",
              href: "/magic-portfolio/quick-start"
            },
            {
              title: "Magic Convert",
              description: "Create conversion-optimized landing pages and dashboards.",
              image: "/images/docs/magic-convert.jpg",
              href: "/magic-convert/quick-start"
            },
            {
              title: "Magic Docs",
              description: "Create beautiful documentations like this one.",
              image: "/images/docs/magic-docs.jpg",
              href: "/magic-docs/quick-start"
            },
            {
              title: "Magic Store",
              description: "Start selling merch with a ready-made store.",
              image: "/images/docs/magic-store.jpg",
              href: "/magic-store/quick-start"
            },
            {
              title: "Magic Bio",
              description: "A modern link-in-bio solution for creators.",
              image: "/images/docs/magic-bio.jpg",
              href: "/magic-bio/quick-start"
            }
          ].map((template, index) => (
            <Card
              key={index}
              href={template.href}
              fillWidth
              radius="l"
              border="neutral-alpha-medium"
              direction="column"
            >
              <Row paddingX="20" paddingY="12" gap="12" vertical="center">
              <Avatar style={{background: "black"}} src="/trademark/icon-dark.svg" size="s" />
              <Text variant="label-default-s">Once UI</Text>
              </Row>
              <Media
                border="neutral-alpha-medium"
                src={template.image} 
                aspectRatio="16/9" 
                radius="l" 
                sizes="400px" 
              />
              <Column fillWidth padding="20" gap="4" horizontal="start">
                <Text 
                  variant="heading-default-xs" 
                  onBackground="neutral-strong"
                >
                  {template.title}
                </Text>
                <Text 
                  variant="body-default-s" 
                  onBackground="neutral-weak"
                  wrap="balance"
                >
                  {template.description}
                </Text>
              </Column>
            </Card>
          ))}
        </Grid>
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
        
        <Column fillWidth>
          {latestChangelogEntry.image && (
            <Media
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              radius="l"
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
              Q2 2025 Roadmap
            </Heading>
            <Button data-border="rounded" weight="default" variant="secondary" href="/roadmap" size="s" suffixIcon="chevronRight">
            View Roadmap
          </Button>
          </Row>
          <Text variant="label-default-s" onBackground="neutral-weak">
            Progress and task status
          </Text>
        </Column>
        
        <Line background="neutral-alpha-weak" />
        
        <Row fillWidth padding="32" gap="20" position="relative" s={{direction: "column"}}>
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
  );
}
