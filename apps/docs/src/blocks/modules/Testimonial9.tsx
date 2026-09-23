"use client";

import {
  Avatar,
  Background,
  Button,
  Column,
  Heading,
  Mask,
  MatrixFx,
  Media,
  Row,
  Tag,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";

interface CaseStudy {
  id: string;
  brand: string;
  title: string;
  summary: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  href: string;
  avatar: string;
  image: string;
  imageAlt: string;
}

const caseStudies: CaseStudy[] = [
  {
    id: "iqon",
    brand: "cyan",
    title: "Scaling with a design system",
    summary:
      "How IQON went from zero to production with a landing page and desktop app in two months.",
    quote:
      "Once UI let us ship a polished frontend without hiring a full design team. We launched months ahead of schedule.",
    name: "Zachary Sura",
    role: "Founder",
    company: "@IQON",
    href: "#",
    avatar: "/images/creators/zach.jpg",
    image: "/images/blog/iqon-app.jpg",
    imageAlt: "IQON desktop app interface",
  },
  {
    id: "osmyreal",
    brand: "red",
    title: "Launching a platform for mobile gamers",
    summary: "How OsmyReal built a 100k+ audience and monetized his platform with Once UI.",
    quote:
      "The component library gave us consistency across marketing and product without slowing down iteration.",
    name: "OsmyReal",
    role: "Founder",
    company: "@OsmyReal",
    href: "#",
    avatar: "/images/creators/osmy.jpg",
    image: "/images/blog/osmyreal-cover.jpg",
    imageAlt: "OsmyReal platform cover",
  },
  {
    id: "jexcellence",
    brand: "emerald",
    title: "From side-projects to enterprise apps",
    summary: "Crafting enterprise-grade applications as a solo agency owner with Once UI.",
    quote:
      "I deliver client work faster because every project starts from the same solid foundation.",
    name: "Justin",
    role: "Founder",
    company: "@JExcellence",
    href: "#",
    avatar: "/images/creators/justin.jpg",
    image: "/images/blog/jexcellence-cover.jpg",
    imageAlt: "JExcellence agency site mockup",
  },
];

export const Testimonial9 = (flex: React.ComponentProps<typeof Column>) => {
  const [activeId, setActiveId] = useState(caseStudies[0].id);
  const active = caseStudies.find((study) => study.id === activeId) ?? caseStudies[0];

  return (
    <Column fillWidth horizontal="center" gap="40" {...flex}>
      <Column fillWidth maxWidth={48} gap="12" paddingX="l">
        <Tag size="s" scheme="brand" data-border="rounded">
          Case studies
        </Tag>
        <Heading as="h2" variant="display-strong-m" wrap="balance">
          Builders shipping faster with a system that scales
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
          Real stories from founders and teams who replaced fragmented UI work with Once UI.
        </Text>
      </Column>

      <Row fillWidth gap="8" paddingX="l" wrap>
        {caseStudies.map((study) => (
          <Tag
            key={study.id}
            size="l"
            data-brand={study.brand}
            data-solid="color"
            scheme={activeId === study.id ? "brand" : "neutral"}
            onClick={() => setActiveId(study.id)}
            style={{ cursor: "pointer" }}
          >
            {study.company.replace("@", "")}
          </Tag>
        ))}
      </Row>

      <Row
        fillWidth
        maxWidth="xl"
        gap="8"
        radius="xl"
        border
        overflow="hidden"
        background="page"
        s={{ direction: "column" }}
      >
        <Column
          data-brand={active.brand}
          data-solid="color"
          flex={1}
          minHeight={24}
          overflow="hidden"
        >
          <Background
            position="absolute"
            top="0"
            left="0"
            gradient={{
              display: true,
              colorStart: "brand-solid-weak",
              x: 0,
              y: 0,
              width: 125,
              height: 125,
            }}
          />
          <Mask
            pointerEvents="none"
            position="absolute"
            fill
            left="0"
            bottom="0"
            x={0}
            y={0}
            radius={50}
          >
            <MatrixFx flicker fps={24} colors={["brand-solid-strong"]} size={1.5} spacing={5} />
          </Mask>
          <Column fill vertical="end" padding="24" gap="8">
            <Text variant="heading-strong-l">{active.company.replace("@", "")}</Text>
            <Text variant="label-default-s" onBackground="neutral-weak" wrap="balance">
              {active.summary}
            </Text>
          </Column>
        </Column>

        <Column flex={2} padding="24" gap="20" vertical="center">
          <Column gap="8">
            <Heading as="h3" variant="display-default-xs" wrap="balance">
              {active.title}
            </Heading>
            <Text variant="heading-default-m" onBackground="neutral-weak" wrap="balance">
              "{active.quote}"
            </Text>
          </Column>
          <Row gap="12" vertical="center">
            <Avatar src={active.avatar} size="s" />
            <Column gap="2">
              <Text variant="label-default-s">{active.name}</Text>
              <Text variant="label-default-s" onBackground="neutral-weak">
                {active.role} · {active.company}
              </Text>
            </Column>
          </Row>
          <Row gap="12" wrap>
            <Button href={active.href} size="s" arrowIcon>
              Read story
            </Button>
            <Button href={active.href} size="s" variant="secondary" prefixIcon="arrowUpRight">
              Visit site
            </Button>
          </Row>
        </Column>

        <Row flex={2} aspectRatio="4/3" overflow="hidden" borderLeft>
          <Media
            stretch
            src={active.image}
            alt={active.imageAlt}
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </Row>
      </Row>
    </Column>
  );
};
