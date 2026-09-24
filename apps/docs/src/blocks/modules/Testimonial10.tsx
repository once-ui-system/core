"use client";

import {
  Background,
  Button,
  Card,
  Column,
  type Flex,
  Heading,
  IconButton,
  Mask,
  MatrixFx,
  Row,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";
import { Testimonial2 } from "./Testimonial2";
import styles from "./Testimonial10.module.scss";

interface SlideItem {
  brand: string;
  label: string;
  title: string;
  content: string;
  name: string;
  company: string;
  role: string;
  avatar: string;
  src: string;
  alt: string;
}

const slides: SlideItem[] = [
  {
    brand: "cyan",
    label: "IQON",
    title: "Scaling with a design system",
    content:
      "How IQON went from zero to production with their new landing page and desktop app in just two months.",
    name: "Zach",
    company: "@IQON",
    role: "Founder",
    avatar: "/images/creators/zach.jpg",
    src: "/images/blog/iqon-app.jpg",
    alt: "Product image of the IQON app",
  },
  {
    brand: "red",
    label: "OsmyReal",
    title: "Launching a platform for mobile gamers",
    content: "How OsmyReal built a 100k+ audience and monetized his platform with Once UI.",
    name: "OsmyReal",
    company: "@OsmyReal",
    role: "Founder",
    avatar: "/images/creators/osmy.jpg",
    src: "/images/blog/osmyreal-cover.jpg",
    alt: "Product image of the OsmyReal platform",
  },
  {
    brand: "emerald",
    label: "JExcellence",
    title: "From side-projects to enterprise apps",
    content:
      "Crafting enterprise-grade applications with the power of Once UI as a solo agency owner.",
    name: "Justin",
    company: "@JExcellence",
    role: "Founder",
    avatar: "/images/creators/justin.jpg",
    src: "/images/blog/jexcellence-cover.jpg",
    alt: "Mockup image of the agency site",
  },
];

function CaseStudySlideShow({
  activeIndex: initialIndex = 0,
  ...rest
}: React.ComponentProps<typeof Column> & { activeIndex?: number }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(initialIndex);

  return (
    <Column gap="24" fillWidth horizontal="center" {...rest}>
      <Row fillWidth horizontal="end" gap="8">
        <IconButton
          onClick={() =>
            setActiveIndex(activeIndex === 0 ? slides.length - 1 : (activeIndex ?? 0) - 1)
          }
          icon="chevronLeft"
          size="l"
          variant="secondary"
        />
        <IconButton
          onClick={() =>
            setActiveIndex(activeIndex === slides.length - 1 ? 0 : (activeIndex ?? 0) + 1)
          }
          icon="chevronRight"
          size="l"
          variant="secondary"
        />
      </Row>
      <Row fillWidth gap="8" style={{ maxHeight: "100%" }}>
        {slides.map((slide, index) => {
          const isExpanded = activeIndex === index;

          return (
            <Row
              key={slide.label}
              radius="xl"
              border
              fillHeight
              cursor="interactive"
              className={styles.expandTransition}
              onClick={() => setActiveIndex(index === activeIndex ? activeIndex : index)}
              overflow="hidden"
              style={{
                transitionDelay: isExpanded ? "0ms" : "75ms",
                width: isExpanded ? "100%" : "6rem",
              }}
            >
              <Row fill position="absolute" left="0">
                <Card
                  fill
                  border="transparent"
                  background="transparent"
                  style={{
                    opacity: isExpanded ? 0 : 1,
                    inset: 0,
                    transitionDelay: isExpanded ? "0s" : "0.25s",
                    pointerEvents: isExpanded ? "none" : "auto",
                    cursor: "pointer",
                  }}
                >
                  <Row
                    fill
                    padding="24"
                    horizontal="end"
                    vertical="center"
                    style={{
                      writingMode: "vertical-lr",
                      transform: "rotate(180deg)",
                      textOrientation: "mixed",
                    }}
                  >
                    <Text variant="heading-strong-l">{slide.label}</Text>
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
                      <MatrixFx
                        data-brand={slide.brand}
                        data-solid="color"
                        flicker
                        fps={24}
                        colors={["brand-solid-strong"]}
                        size={1.5}
                        spacing={5}
                      />
                    </Mask>
                  </Row>
                </Card>
              </Row>

              <Row
                flex={1}
                style={{
                  opacity: isExpanded ? 1 : 0,
                  inset: 0,
                  transition: "opacity 0.25s ease-in",
                  transitionDelay: isExpanded ? "0.25s" : "0s",
                  pointerEvents: isExpanded ? "auto" : "none",
                }}
              >
                <Column
                  flex={1}
                  style={{
                    opacity: isExpanded ? 1 : 0,
                    transform: isExpanded ? "translateX(0)" : "translateX(20px)",
                    transition: "opacity 0.3s ease, transform 0.3s ease",
                    transitionDelay: isExpanded ? "0.35s" : "0s",
                  }}
                >
                  <Column
                    data-brand={slide.brand}
                    data-solid="color"
                    background="page"
                    flex={1}
                    padding="8"
                  >
                    <Background
                      position="absolute"
                      left="0"
                      top="0"
                      fill
                      gradient={{
                        display: true,
                        colorStart: "brand-solid-weak",
                        x: 0,
                        y: 0,
                        width: 125,
                        height: 125,
                      }}
                    />
                    <Testimonial2
                      flex={1}
                      background="page"
                      title={slide.title}
                      content={slide.content}
                      name={slide.name}
                      company={slide.company}
                      role={slide.role}
                      avatar={slide.avatar}
                      src={slide.src}
                      alt={slide.alt}
                    >
                      <Mask
                        pointerEvents="none"
                        position="absolute"
                        fill
                        left="0"
                        bottom="0"
                        minHeight={32}
                        x={0}
                        y={100}
                        radius={50}
                      >
                        <MatrixFx
                          flicker
                          fps={24}
                          colors={["brand-solid-strong"]}
                          size={1.5}
                          spacing={5}
                        />
                      </Mask>
                      <Button className="mt-12" size="s" arrowIcon>
                        Read story
                      </Button>
                    </Testimonial2>
                  </Column>
                </Column>
              </Row>
            </Row>
          );
        })}
      </Row>
    </Column>
  );
}

export const Testimonial10 = (flex: React.ComponentProps<typeof Flex>) => {
  return (
    <Column fillWidth horizontal="center" padding="l" {...flex}>
      <Column maxWidth="l" gap="24">
        <Heading paddingLeft="24" as="h2" variant="display-default-s">
          Solo founders and small teams scale faster when their design system does not fight back.
        </Heading>
        <CaseStudySlideShow aspectRatio="8/3" minHeight={36} activeIndex={0} />
      </Column>
    </Column>
  );
};
