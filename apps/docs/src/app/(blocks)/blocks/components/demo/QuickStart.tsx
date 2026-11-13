"use client";

import {
  Scroller,
  Button,
  Column,
  Dialog,
  Grid,
  Heading,
  Icon,
  IconButton,
  Media,
  Row,
  SegmentedControl,
  Tag,
  Text,
  useToast,
} from "@once-ui-system/core";
import { ShineFx } from "@once-ui-system/fx";
import type React from "react";
import { useEffect, useState } from "react";
import { blocks } from "@/resources";
import type { BlockItem, BlockSection } from "@/types";
import { BlockCategoryGrid } from "../BlockCategories";
import { itemsOf } from "../blockMeta";
import DocsLayout from "../layout";
import { NewBlocks } from "../NewBlocks";
import styles from "./QuickStart.module.scss";

interface SectionSummary {
  key: string;
  title: string;
  items: BlockItem[];
  blockCount: number;
}

/** Every catalogue section with its categories and how many blocks they hold. */
const sections: SectionSummary[] = (Object.entries(blocks) as Array<[string, BlockSection]>)
  .filter(([key]) => key !== "blocks")
  .map(([key, section]) => {
    const items = itemsOf(section);
    return {
      key,
      title: section.title,
      items,
      blockCount: items.reduce((sum, item) => sum + (item.examples?.length ?? 0), 0),
    };
  });

const totalBlocks = sections.reduce((sum, section) => sum + section.blockCount, 0);
const totalCategories = sections.reduce((sum, section) => sum + section.items.length, 0);

/**
 * Category previews for the hero's background mosaic, one per category across
 * every section, dealt into rows that drift in alternating directions.
 */
const MOSAIC_ROWS = 3;
const mosaicItems = sections.flatMap((section) => section.items).filter((item) => item.image);
const mosaicRows: BlockItem[][] = Array.from({ length: MOSAIC_ROWS }, (_, row) =>
  mosaicItems.filter((_, index) => index % MOSAIC_ROWS === row),
);

const steps: Array<{ title: string; body: string; code?: string }> = [
  {
    title: "Pick a block",
    body: `${totalBlocks} blocks across ${totalCategories} categories, each with a live preview you can open full screen.`,
  },
  {
    title: "Copy the code, or the prompt",
    body: "Take the source as is, or hand the block to your coding agent with Copy prompt.",
  },
  {
    title: "Install and make it yours",
    body: "Brand, accent and theme live in a single config file.",
    code: "npm i @once-ui-system/core",
  },
];

const Docs: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(sections[0]?.key ?? "");
  const current = sections.find((section) => section.key === activeSection) ?? sections[0];

  const scrollToBlocks = () => {
    document.getElementById("blocks")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Cleanup: ensure dialog is closed when component unmounts
  useEffect(() => {
    return () => {
      setIsDialogOpen(false);
    };
  }, []);

  return (
    <DocsLayout maxWidth="xl">
      <Column fillWidth gap="104">
        <Column
          as="section"
          fillWidth
          minHeight="36rem"
          center
          radius="xl"
          border
          background="surface"
          overflow="hidden"
          paddingX="24"
          paddingY="80"
        >
          <Column position="absolute" top="0" left="0" fill pointerEvents="none" aria-hidden="true">
            <HeroMosaic />
          </Column>
          <Column horizontal="center" gap="24" zIndex={1} maxWidth="44rem">
            <Tag
              variant="announce"
              effect={false}
              tabIndex={0}
              paddingY="8"
              paddingLeft="8"
              paddingRight="20"
              onBackground="brand-weak"
              textVariant="code-default-s"
              background="surface"
              vertical="center"
              gap="12"
              cursor="interactive"
              onClick={(e) => {
                e.preventDefault();
                setIsDialogOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsDialogOpen(true);
                }
              }}
            >
              <Row fit padding="4" border="brand-alpha-medium" background="brand-alpha-weak" radius="full">
                <Icon name="sparkle" size="xs" />
              </Row>
              <ShineFx duration={3000} inverse baseOpacity={0.6}>
                What's new?
              </ShineFx>
            </Tag>
            <Heading
              as="h1"
              align="center"
              textVariant="display-default-l"
              style={{ lineHeight: "1.05" }}
            >
              Let Once UI fight
              <br /> your <Text onBackground="brand-medium">CSS battles</Text>
            </Heading>
            <Column maxWidth="32rem">
              <Text
                align="center"
                textVariant="body-default-l"
                onBackground="neutral-medium"
                wrap="balance"
              >
                Copy-paste high quality, responsive building blocks — modular, beautiful, ready to
                ship.
              </Text>
            </Column>
            <Row gap="12" wrap horizontal="center">
              <Button arrowIcon onClick={scrollToBlocks}>
                Browse blocks
              </Button>
              <Button variant="secondary" href="https://once-ui.com/pricing">
                View Pro
              </Button>
            </Row>
          </Column>
        </Column>

        <Column as="section" fillWidth gap="24" aria-labelledby="how-it-works">
          <Heading id="how-it-works" as="h2" textVariant="display-strong-xs">
            How it works
          </Heading>
          <Grid
            fillWidth
            columns="3"
            m={{ columns: 1 }}
            gap="1"
            radius="l"
            border
            overflow="hidden"
            background="neutral-alpha-medium"
          >
            {steps.map((step, index) => (
              <Column key={step.title} background="surface" padding="24" gap="12">
                <Text textVariant="code-default-s" onBackground="brand-medium">
                  {String(index + 1).padStart(2, "0")}
                </Text>
                <Text textVariant="heading-strong-m">{step.title}</Text>
                <Text textVariant="body-default-s" onBackground="neutral-weak">
                  {step.body}
                </Text>
                {step.code && <CommandLine command={step.code} />}
              </Column>
            ))}
          </Grid>
        </Column>

        <Column
          as="section"
          id="blocks"
          fillWidth
          gap="24"
          aria-labelledby="explore-sections"
          style={{ scrollMarginTop: "80px" }}
        >
          <Row fillWidth wrap gap="16" vertical="center">
            <Row gap="12" vertical="center">
              <Heading id="explore-sections" as="h2" textVariant="display-strong-xs">
                Explore by section
              </Heading>
              <Tag size="m" tone="brand">
                Pro
              </Tag>
            </Row>
            <Row flex={1} />
            <SegmentedControl
              fillWidth={false}
              value={activeSection}
              onValueChange={setActiveSection}
              buttons={sections.map((section) => ({ value: section.key, label: section.title }))}
            />
          </Row>
          {current && (
            <Column fillWidth gap="16">
              <Text textVariant="label-default-s" onBackground="neutral-weak">
                {current.items.length} {current.items.length === 1 ? "category" : "categories"} ·{" "}
                {current.blockCount} blocks
              </Text>
              <BlockCategoryGrid items={current.items} />
            </Column>
          )}
        </Column>
      </Column>
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="What's new?"
        description="Recently added blocks and components"
      >
        <NewBlocks onNavigate={() => setIsDialogOpen(false)} />
      </Dialog>
    </DocsLayout>
  );
};

/**
 * The hero's backdrop: a tilted wall of category previews, each row drifting
 * the other way, that fades toward the centre so the headline sits on a calm
 * surface with the catalogue moving around it. AutoScroll holds still under
 * reduced motion.
 */
function HeroMosaic() {
  return (
    <>
      <Column className={styles.mosaic} gap="16" vertical="center" opacity={50}>
        {mosaicRows.map((row, index) => (
          <Scroller auto={{ speed: "slow", hover: "none", reverse: index % 2 === 1, gap: "16" }}
            key={row[0]?.href ?? index}
          >
            {row.map((item) => (
              <Column key={item.href} width="20rem" radius="m" border overflow="hidden">
                <Media
                  sizes="320px"
                  showIn="dark"
                  src={item.image?.dark || ""}
                  alt=""
                  aspectRatio="960/880"
                />
                <Media
                  sizes="320px"
                  showIn="light"
                  src={item.image?.light || ""}
                  alt=""
                  aspectRatio="960/880"
                />
              </Column>
            ))}
          </Scroller>
        ))}
      </Column>
      <Column className={styles.fade} position="absolute" top="0" left="0" fill />
    </>
  );
}

/** A one-line shell command with a copy button, sized to fit a narrow card. */
function CommandLine({ command }: { command: string }) {
  const { addToast } = useToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      addToast({ tone: "success", message: "Command copied" });
    } catch {
      addToast({ tone: "danger", message: "Couldn't copy to the clipboard" });
    }
  };

  return (
    <Row
      fillWidth
      vertical="center"
      gap="8"
      paddingLeft="12"
      paddingRight="4"
      paddingY="4"
      radius="m"
      border
      background="overlay"
    >
      <Text as="code" textVariant="code-default-xs" onBackground="neutral-strong" truncate>
        {command}
      </Text>
      <Row flex={1} />
      <IconButton
        icon="copy"
        size="s"
        variant="tertiary"
        tooltip="Copy"
        aria-label={`Copy ${command}`}
        onClick={copy}
      />
    </Row>
  );
}

export default Docs;
