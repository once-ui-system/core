"use client";

import React, { useState, useRef, useEffect } from "react";
import { Column, Media, ProgressBar, Row, Scroller, Heading, Fade, Text, Button, Carousel, IconButton, Flex } from "@once-ui-system/core";
import { Footer2 } from "./Footer2";
import { Header3 } from "./Header3";
import { useFloating, offset, autoUpdate } from "@floating-ui/react-dom";
import { createPortal } from "react-dom";

const MediaList = ({ image, progress, title, description, categories }: { image: string, progress: number, title: string, description: string, categories?: string[] }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasPosition, setHasPosition] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const referenceRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (typeof document !== 'undefined') {
      setPortalContainer(document.body);
    }
  }, []);
  
  const { x, y, strategy, refs, update } = useFloating({
    middleware: [
      offset(({rects}) => {
        return (
          -rects.reference.height / 2 - rects.floating.height / 2
        );
      }),
    ],
    whileElementsMounted: autoUpdate
  });
  
  // Ensure reference is set as soon as the element is available
  useEffect(() => {
    if (referenceRef.current) {
      refs.setReference(referenceRef.current);
    }
  }, [refs]);
  
  useEffect(() => {
    let raf = 0;
    if (isHovered && referenceRef.current) {
      refs.setReference(referenceRef.current);
      update();
      raf = requestAnimationFrame(() => setHasPosition(true));
    } else {
      setHasPosition(false);
    }
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isHovered, refs, update]);

  // Mark visible on the frame AFTER coordinates are ready to ensure transition runs
  useEffect(() => {
    let raf = 0;
    const ready = isHovered && hasPosition && x != null && y != null && !(x === 0 && y === 0);
    if (ready) {
      // First frame: render at correct top/left with opacity 0
      // Next frame: flip to visible so CSS transition can animate opacity/blur/transform
      raf = requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [isHovered, hasPosition, x, y]);

  return (
    <Column
      minWidth={24} 
      gap="24"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={referenceRef}
    >
      <Media aspectRatio="16/9" src={image} alt={title} sizes="400px" radius="l" />
      {progress > 0 && <ProgressBar label={false} value={progress} paddingX="l" />}
      
      {(portalContainer && (isHovered || isVisible)) && (
        createPortal(
          <Column
            maxWidth={28}
            background="surface"
            transition="macro-short"
            gap="24"
            padding="8"
            radius="l-4"
            zIndex={9}
            ref={refs.setFloating}
            style={{
              transform: isVisible ? "scale(1)" : "scale(0.9)",
              transformOrigin: "center",
              position: strategy,
              top: hasPosition && y != null ? y : -99999,
              left: hasPosition && x != null ? x : -99999,
              opacity: isVisible ? 1 : 0,
              filter: isVisible ? "blur(0px)" : "blur(0.25rem)",
              willChange: "transform, top, left, opacity",
              transitionProperty: "opacity, transform, filter",
              // Respect design system timing if provided by transition prop; these are fallbacks
              transitionDuration: "160ms",
              transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
          >
            <Media aspectRatio="16/9" src={image} alt={title} sizes="400px" radius="l" />
            {progress > 0 && <ProgressBar label={false} value={progress} paddingX="l" />}
            <Column fillWidth paddingX="16" paddingBottom="20" paddingTop="8" gap="8">
              <Row fillWidth horizontal="between" paddingBottom="12">
                <Row gap="8" data-border="rounded">
                  <IconButton size="l" icon="play" />
                  <IconButton size="l" icon="plus" variant="secondary" />
                </Row>
                <Row gap="8" data-border="rounded">
                  <IconButton size="l" icon="like" variant="secondary" />
                  <IconButton size="l" icon="dislike" variant="secondary" /> 
                </Row>
              </Row>
              <Heading as="h3" variant="heading-strong-l">{title}</Heading>
              <Text variant="body-default-m" onBackground="neutral-weak">{description}</Text>
              <Row paddingTop="12" gap="16" vertical="center">
                {categories && categories.map((category, index) => (
                  <React.Fragment key={index}>
                    <Text variant="label-default-s" onBackground="neutral-medium">{category}</Text>
                    {index < categories.length - 1 && <Flex height={0.4} width={0.4} radius="full" background="neutral-strong"/>}
                  </React.Fragment>
                ))}
              </Row>
            </Column>
          </Column>,
          portalContainer
        )
      )}
    </Column>
  )
}

const FeedSection = ({ title, items }: { title: string, items: Array<{ image: string, progress: number, title: string, description: string, categories?: string[] }> }) => {
  return (
    <Column fillWidth padding="l">
      <Column fillWidth gap="24">
        <Column fillWidth paddingX="24">
          <Heading as="h2" variant="display-strong-s">
            {title}
          </Heading>
        </Column>
        <Scroller>
          <Row fitWidth gap="24">
            {items.map((item, index) => (
              <MediaList
                key={index} 
                image={item.image} 
                progress={item.progress}
                title={item.title}
                description={item.description}
                categories={item.categories} />
            ))}
          </Row>
        </Scroller>
      </Column>
    </Column>
  );
};

export const Streaming1: React.FC = () => {
  const featured = [
    {
      image: "/images/movies/01.jpg",
      title: "The Incredible Adventures of Selene Yu",
      description: "The incredible adventures of Selene Yu follows the story of a young woman who discovers she has the ability to turn back time",
      categories: ["Sci-Fi", "Adventure", "Drama"]
    },
    {
      image: "/images/movies/02.jpg",
      title: "Awakening",
      description: "Matt finds himself in a disturbing place when he wakes up in this Emmy award winning movie",
      categories: ["Thriller", "Mystery", "Drama"]
    },
    {
      image: "/images/movies/03.jpg",
      title: "Family Reunion",
      description: "An intense thriller that will keep you on the edge of your seat when the holiday for a family reunion turns into a nightmare",
      categories: ["Horror", "Thriller", "Mystery"]
    }
  ];

  const feed = [
    {
      title: "Continue Watching", 
      items: [
        { 
          image: "/images/movies/02.jpg", 
          progress: 45, 
          title: "Design System", 
          description: "A comprehensive UI kit for modern web applications",
          categories: ["Dark", "Mystic", "Space"]
        },
        { 
          image: "/images/movies/03.jpg", 
          progress: 72, 
          title: "Component Library", 
          description: "Reusable components for faster development",
          categories: ["Humor", "Thriller", "Drama"] 
        },
        { 
          image: "/images/movies/04.jpg", 
          progress: 30, 
          title: "Animation Framework", 
          description: "Smooth transitions and interactive elements",
          categories: ["Documentary", "Media", "Real Events"] 
        },
        { 
          image: "/images/movies/01.jpg", 
          progress: 88, 
          title: "Responsive Layouts", 
          description: "Adaptive designs for all screen sizes",
          categories: ["Horror", "Thriller", "Drama"]
        },
        { 
          image: "/images/movies/05.jpg", 
          progress: 15, 
          title: "Accessibility Tools", 
          description: "Creating inclusive user experiences",
          categories: ["Documentary", "Tech", "Real Events"] 
        },
        { 
          image: "/images/movies/06.jpg", 
          progress: 60, 
          title: "Theme Builder", 
          description: "Customize your application's look and feel",
          categories: ["Parody", "Humor", "Gossip"] 
        }
      ]
    },
    {
      title: "Popular", 
      items: [
        { 
          image: "/images/movies/07.jpg", 
          progress: 0, 
          title: "Design System", 
          description: "A comprehensive UI kit for modern web applications",
          categories: ["Dark", "Mystic", "Space"] 
        },
        { 
          image: "/images/movies/03.jpg", 
          progress: 0, 
          title: "Component Library", 
          description: "Reusable components for faster development",
          categories: ["Documentary", "Tech", "Real Events"] 
        },
        { 
          image: "/images/movies/08.jpg", 
          progress: 0, 
          title: "Animation Framework", 
          description: "Smooth transitions and interactive elements",
          categories: ["Horror", "Thriller", "Drama"]
        },
        { 
          image: "/images/movies/02.jpg", 
          progress: 0, 
          title: "Responsive Layouts", 
          description: "Adaptive designs for all screen sizes",
          categories: ["Documentary", "Tech", "Real Events"] 
        },
        { 
          image: "/images/movies/05.jpg", 
          progress: 0, 
          title: "Accessibility Tools", 
          description: "Creating inclusive user experiences",
          categories: ["Thriller", "Drama", "Cyberpunk"] 
        },
        { 
          image: "/images/movies/06.jpg", 
          progress: 0, 
          title: "Theme Builder", 
          description: "Customize your application's look and feel",
          categories: ["Mind-Bending", "Offbeat", "Animation"] 
        }
      ]
    }
  ]

  return (
    <Column fillWidth>
      <Header3 position="sticky" top="0" />
      <Column fillWidth style={{marginTop: "calc(-1 * var(--static-space-64))"}}>
        <Row fillWidth style={{height: "80vh"}} paddingBottom="xl">
          <Carousel
            fill
            border="transparent"
            radius="none"
            position="absolute"
            pointerEvents="none"
            controls={false}
            indicator={false}
            play={{auto: true, interval: 10000, controls: false, progress: false}}
            items={featured.map(item => ({ slide: item.image, alt: item.title }))} />
          <Fade
            fillWidth
            position="absolute"
            pointerEvents="none"
            bottom="0"
            to="top"
            height={32}
            pattern={{ display: true, size: "2" }}
          />
          <Carousel
            fill
            pointerEvents="none"
            border="transparent"
            radius="none"
            position="absolute"
            translateY="48"
            controls={false}
            indicator={false}
            play={{auto: true, interval: 10000, controls: false, progress: false}}
            items={featured.map(item => ({
              slide: (
                <Column fillHeight maxWidth={48} vertical="end" padding="xl" gap="l">
                  <Heading variant="display-strong-m" onSolid="neutral-strong">
                    #1 in Movies Today
                  </Heading>
                  <Text variant="heading-default-xl" onSolid="neutral-weak" wrap="balance">
                    {item.description}
                  </Text>
                  <Row gap="8" pointerEvents="all" s={{direction: "column"}}>
                    <Button size="l" prefixIcon="play">
                      Start watching
                    </Button>
                    <Button size="l" prefixIcon="info" variant="secondary">
                      More info
                    </Button>
                  </Row>
                </Column>
              )
            }))}
          />
        </Row>
        
        {feed.map((section, index) => (
          <FeedSection 
            key={index}
            title={section.title}
            items={section.items}
          />
        ))}

        <Footer2 paddingX="xl"/>
      </Column>
    </Column>
  )
}