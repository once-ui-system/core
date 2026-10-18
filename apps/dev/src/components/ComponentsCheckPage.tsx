"use client";

import React, { useState } from "react";
import { Heading, Text, Button, Column, Logo, Line, Carousel, Media, OgCard, Icon, Textarea, Row, IconButton, Select, Option, Dropdown, User, Table, BlockQuote, DatePicker, DateInput, Grid, AccordionGroup, Accordion, Kbar, Spinner, ListItem, List, ProgressBar, Feedback, TagInput, Avatar, Background, Flex, Fade, Tooltip, Checkbox, Switch, RadioButton, Skeleton, HoverCard, SmartLink, Scroller, Mask, Tag, Kbd, InlineCode, StatusIndicator, SegmentedControl, InfiniteScroll, NumberInput, ColorInput, OTPInput, AvatarGroup, ThemeSwitcher, Timeline, NavIcon, Card, Input, Dialog, useToast } from "@once-ui-system/core";
import { LetterFx, RevealFx, CountFx, ParticleFx, FlipFx, GlitchFx, HoloFx, MatrixFx, ShineFx, TiltFx, TypeFx, WeatherFx, CountdownFx } from "@once-ui-system/fx";
import { StylePanel, StyleOverlay, LogoCloud, ScrollToTop } from "@once-ui-system/blocks";
import { EmojiPicker } from "@once-ui-system/core/emoji";
import { CompareImage } from "@once-ui-system/core/media";
import { BarChart, LineChart } from "@once-ui-system/core/data";
import { CodeBlock } from "@once-ui-system/core/code";

interface ComponentVariation {
  value: string;
  label: string;
  element: React.ReactNode;
}

interface ComponentDemo {
  name: string;
  variations: ComponentVariation[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  components: ComponentDemo[];
}

export default function ComponentsCheck() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [switchOn, setSwitchOn] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const { addToast } = useToast();
  const [selectedVariation, setSelectedVariation] = useState<
    Record<string, string>
  >({});

  const handleAddToast = (
    variant: "success" | "danger" | "warning" | "info",
  ) => {
    addToast({ tone: variant, message: `This is a ${variant} toast!` });
  };

  const selectVar = (compKey: string, value: string) => {
    setSelectedVariation((prev) => ({ ...prev, [compKey]: value }));
  };

  const getVar = (
    compKey: string,
    variations: ComponentVariation[],
  ): string => {
    return selectedVariation[compKey] || variations[0].value;
  };

  const categories: Category[] = [
    {
      id: "layout",
      name: "Layout",
      description: "Core layout primitives for structuring content",
      components: [
        {
          name: "Column",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <Column padding="m" background="neutral-medium" radius="l">
                  <Text>Column Layout</Text>
                </Column>
              ),
            },
            {
              value: "gap",
              label: "With gap",
              element: (
                <Column
                  gap="m"
                  padding="m"
                  background="neutral-medium"
                  radius="l"
                >
                  <Text>Item 1</Text>
                  <Text>Item 2</Text>
                </Column>
              ),
            },
            {
              value: "horizontal",
              label: "Horizontal",
              element: (
                <Column
                  horizontal="center"
                  padding="m"
                  background="neutral-medium"
                  radius="l"
                >
                  <Text>Centered</Text>
                </Column>
              ),
            },
          ],
        },
        {
          name: "Row",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <Row padding="m" background="neutral-medium" radius="l">
                  <Text>Row Layout</Text>
                </Row>
              ),
            },
            {
              value: "gap",
              label: "With gap",
              element: (
                <Row gap="m" padding="m" background="neutral-medium" radius="l">
                  <Text>A</Text>
                  <Text>B</Text>
                  <Text>C</Text>
                </Row>
              ),
            },
          ],
        },
        {
          name: "Flex",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <Flex padding="m" background="neutral-medium" radius="l">
                  <Text>Flex Layout</Text>
                </Flex>
              ),
            },
            {
              value: "maxWidth",
              label: "maxWidth",
              element: (
                <Flex
                  maxWidth="xl"
                  padding="m"
                  background="brand-medium"
                  radius="l"
                >
                  <Text onBackground="brand-strong">
                    maxWidth=&quot;xl&quot;
                  </Text>
                </Flex>
              ),
            },
            {
              value: "column",
              label: "Column dir",
              element: (
                <Flex
                  direction="column"
                  gap="m"
                  padding="m"
                  background="neutral-medium"
                  radius="l"
                >
                  <Text>Flex 1</Text>
                  <Text>Flex 2</Text>
                </Flex>
              ),
            },
            {
              value: "wrap",
              label: "Wrap",
              element: (
                <Flex
                  wrap
                  gap="s"
                  padding="m"
                  background="neutral-medium"
                  radius="l"
                >
                  {Array.from({ length: 8 }, (_, i) => (
                    <Flex
                      key={i}
                      padding="s"
                      paddingX="m"
                      background="brand-medium"
                      radius="full"
                    >
                      <Text
                        textVariant="label-default-s"
                        onBackground="brand-strong"
                      >
                        Item {i + 1}
                      </Text>
                    </Flex>
                  ))}
                </Flex>
              ),
            },
          ],
        },
        {
          name: "Grid",
          variations: [
            {
              value: "2col",
              label: "2 columns",
              element: (
                <Grid columns="2" gap="m" fillWidth>
                  <Column padding="m" background="neutral-medium" radius="l">
                    <Text>Grid 1</Text>
                  </Column>
                  <Column padding="m" background="neutral-medium" radius="l">
                    <Text>Grid 2</Text>
                  </Column>
                </Grid>
              ),
            },
            {
              value: "3col",
              label: "3 columns",
              element: (
                <Grid columns="3" gap="m" fillWidth>
                  <Column padding="m" background="neutral-medium" radius="l">
                    <Text>A</Text>
                  </Column>
                  <Column padding="m" background="neutral-medium" radius="l">
                    <Text>B</Text>
                  </Column>
                  <Column padding="m" background="neutral-medium" radius="l">
                    <Text>C</Text>
                  </Column>
                </Grid>
              ),
            },
          ],
        },
      ],
    },
    {
      id: "typography",
      name: "Typography",
      description: "Text rendering and formatting",
      components: [
        {
          name: "Heading",
          variations: [
            {
              value: "display",
              label: "Display",
              element: <Heading textVariant="display-default-l">Display</Heading>,
            },
            {
              value: "heading",
              label: "Heading",
              element: (
                <Heading textVariant="heading-strong-l">Heading Strong L</Heading>
              ),
            },
            {
              value: "subheading",
              label: "Subheading",
              element: (
                <Heading textVariant="heading-strong-m">Heading Strong M</Heading>
              ),
            },
            {
              value: "small",
              label: "Small",
              element: (
                <Heading textVariant="heading-strong-s">Heading Strong S</Heading>
              ),
            },
          ],
        },
        {
          name: "Text",
          variations: [
            {
              value: "body-l",
              label: "Body L",
              element: <Text textVariant="body-default-l">Body large text</Text>,
            },
            {
              value: "body-m",
              label: "Body M",
              element: <Text textVariant="body-default-m">Body medium text</Text>,
            },
            {
              value: "body-s",
              label: "Body S",
              element: (
                <Text textVariant="body-default-s" onBackground="neutral-weak">
                  Body small muted
                </Text>
              ),
            },
            {
              value: "label",
              label: "Label",
              element: <Text textVariant="label-default-s">Label text</Text>,
            },
            {
              value: "code",
              label: "Code",
              element: (
                <Text textVariant="code-default-m">console.log("hello")</Text>
              ),
            },
            {
              value: "opacity",
              label: "Opacity",
              element: (
                <Column gap="8">
                  <Text opacity={100}>Opacity 100</Text>
                  <Text opacity={60}>Opacity 60</Text>
                  <Text opacity={30}>Opacity 30</Text>
                  <Text opacity={10}>Opacity 10</Text>
                </Column>
              ),
            },
          ],
        },
        {
          name: "InlineCode",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <Text>
                  Run <InlineCode>pnpm install</InlineCode> to get started
                </Text>
              ),
            },
          ],
        },
        {
          name: "BlockQuote",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <BlockQuote>
                  <Text>Good design is as little design as possible.</Text>
                </BlockQuote>
              ),
            },
          ],
        },
        {
          name: "TextWeight",
          variations: [
            {
              value: "default",
              label: "Default (300)",
              element: (
                <Text textVariant="body-default-l">
                  Light weight text — default
                </Text>
              ),
            },
            {
              value: "bold",
              label: "Bold (400)",
              element: (
                <Text textVariant="body-normal-l">
                  Normal weight text — bold
                </Text>
              ),
            },
            {
              value: "bolder",
              label: "Bolder (500)",
              element: (
                <Text textVariant="body-medium-l">
                  Medium weight text — bolder
                </Text>
              ),
            },
            {
              value: "strong",
              label: "Strong (600)",
              element: (
                <Text textVariant="body-strong-l">
                  Semi-bold weight text — strong
                </Text>
              ),
            },
          ],
        },
      ],
    },
    {
      id: "buttons-inputs",
      name: "Buttons & Inputs",
      description: "Interactive form and action components",
      components: [
        {
          name: "Button",
          variations: [
            {
              value: "variants",
              label: "Variants",
              element: (
                <Row gap="s" wrap>
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="tertiary">Tertiary</Button>
                  <Button variant="subtle">Subtle</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="ghost">Quaternary</Button>
                  <Button variant="link">Link</Button>
                  <Button tone="success">Success</Button>
                  <Button tone="warning">Warning</Button>
                  <Button tone="danger">Danger</Button>
                </Row>
              ),
            },
            {
              value: "sizes",
              label: "Sizes",
              element: (
                <Row gap="s" vertical="center">
                  <Button size="xs">XS</Button>
                  <Button size="s">S</Button>
                  <Button size="m">M</Button>
                  <Button size="l">L</Button>
                  <Button size="xl">XL</Button>
                </Row>
              ),
            },
            {
              value: "icons",
              label: "With icons",
              element: (
                <Row gap="s" wrap>
                  <Button variant="secondary" prefixIcon="sparkle">
                    Settings
                  </Button>
                  <Button variant="secondary" suffixIcon="chevronRight">
                    Next
                  </Button>
                  <Button variant="primary" prefixIcon="arrowUpRight">
                    Download
                  </Button>
                  <Button
                    variant="ghost"
                    prefixIcon="search"
                    suffixIcon="enter"
                  >
                    Search
                  </Button>
                </Row>
              ),
            },
            {
              value: "states",
              label: "States",
              element: (
                <Row gap="s" wrap vertical="center">
                  <Button loading disabled>
                    Loading
                  </Button>
                  <Button disabled>Disabled</Button>
                  <Button arrowIcon id="btn-arrow">
                    Arrow
                  </Button>
                  <Button fillWidth>Fill Width</Button>
                </Row>
              ),
            },
          ],
        },
        {
          name: "IconButton",
          variations: [
            {
              value: "variants",
              label: "Variants",
              element: (
                <Row gap="s">
                  <IconButton icon="sparkle" variant="primary" />
                  <IconButton icon="refresh" variant="secondary" />
                  <IconButton icon="plus" variant="tertiary" />
                  <IconButton icon="check" variant="subtle" />
                  <IconButton icon="check" tone="success" />
                  <IconButton icon="warning" tone="warning" />
                  <IconButton icon="close" tone="danger" />
                </Row>
              ),
            },
            {
              value: "tooltip",
              label: "Tooltip",
              element: (
                <Row gap="s">
                  <IconButton
                    icon="sparkle"
                    variant="secondary"
                    tooltip="Settings"
                    tooltipPosition="top"
                  />
                  <IconButton
                    icon="info"
                    variant="secondary"
                    tooltip="Info"
                    tooltipPosition="right"
                  />
                  <IconButton
                    icon="close"
                    tone="danger"
                    tooltip="Delete"
                    tooltipPosition="bottom"
                  />
                </Row>
              ),
            },
          ],
        },
        {
          name: "Input",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <Column gap="s" fillWidth>
                  <Input
                    id="input-name"
                    label="Name"
                    placeholder="Enter your name"
                  />
                  <Input
                    id="input-email"
                    label="Email"
                    placeholder="you@example.com"
                  />
                </Column>
              ),
            },
            {
              value: "error",
              label: "Error",
              element: (
                <Input
                  id="input-error"
                  label="Email"
                  placeholder="you@example.com"
                  error
                  errorMessage="Please enter a valid email"
                />
              ),
            },
            {
              value: "sizes",
              label: "Heights",
              element: (
                <Column gap="s" fillWidth>
                  <Input id="h-xs" size="xs" label="XS" placeholder="xs" />
                  <Input id="h-s" size="s" label="S" placeholder="s" />
                  <Input id="h-m" size="m" label="M" placeholder="m" />
                  <Input id="h-l" size="l" label="L" placeholder="l" />
                </Column>
              ),
            },
          ],
        },
        {
          name: "Textarea",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <Textarea
                  id="ta-msg"
                  label="Message"
                  placeholder="Type more to expand..."
                />
              ),
            },
            {
              value: "fixed",
              label: "Fixed lines",
              element: (
                <Textarea
                  id="ta-fixed"
                  label="Message"
                  placeholder="Write something..."
                  lines={3}
                />
              ),
            },
          ],
        },
        {
          name: "PasswordInput",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <Input
                  id="pwd"
                  label="Password"
                  placeholder="Enter password" type="password"
                />
              ),
            },
          ],
        },
        {
          name: "NumberInput",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <NumberInput id="num" label="Quantity" placeholder="0" />
              ),
            },
            {
              value: "minmax",
              label: "Min/Max",
              element: (
                <NumberInput id="num-bound" label="Age" min={0} max={150} />
              ),
            },
          ],
        },
        {
          name: "ColorInput",
          variations: [
            {
              value: "large",
              label: "Large (100%)",
              element: (
                <Flex fillWidth>
                  <ColorInput
                    id="color-lg"
                    value="#3b82f6"
                    onValueChange={() => {}}
                  />
                </Flex>
              ),
            },
            {
              value: "medium",
              label: "Medium (50%)",
              element: (
                <Flex style={{ width: "50%" }}>
                  <ColorInput
                    id="color-md"
                    value="#3b82f6"
                    onValueChange={() => {}}
                  />
                </Flex>
              ),
            },
            {
              value: "small",
              label: "Small (25%)",
              element: (
                <Flex style={{ width: "25%" }}>
                  <ColorInput
                    id="color-sm"
                    value="#3b82f6"
                    onValueChange={() => {}}
                  />
                </Flex>
              ),
            },
          ],
        },
        {
          name: "OTPInput",
          variations: [
            { value: "4", label: "4 digits", element: <OTPInput length={4} /> },
            { value: "6", label: "6 digits", element: <OTPInput length={6} /> },
          ],
        },
        {
          name: "Checkbox",
          variations: [
            {
              value: "unchecked",
              label: "Unchecked",
              element: <Checkbox label="Accept terms" />,
            },
            {
              value: "checked",
              label: "Checked",
              element: <Checkbox checked label="Remember me" />,
            },
            {
              value: "indeterminate",
              label: "Indeterminate",
              element: <Checkbox indeterminate label="Select all" />,
            },
            {
              value: "disabled",
              label: "Disabled",
              element: (
                <Column gap="s">
                  <Checkbox disabled label="Disabled off" />
                  <Checkbox disabled checked label="Disabled on" />
                </Column>
              ),
            },
            {
              value: "no-hover",
              label: "No hover",
              element: <Checkbox hoverable={false} label="Hover disabled" />,
            },
          ],
        },
        {
          name: "Switch",
          variations: [
            {
              value: "off",
              label: "Off",
              element: (
                <Switch
                  checked={false}
                  onCheckedChange={() => {}}
                  label="Notifications"
                />
              ),
            },
            {
              value: "on",
              label: "On",
              element: (
                <Switch checked onCheckedChange={() => {}} label="Dark mode" />
              ),
            },
            {
              value: "controlled",
              label: "Controlled",
              element: (
                <Switch
                  checked={switchOn}
                  onCheckedChange={() => setSwitchOn(!switchOn)}
                  label="Toggle me"
                />
              ),
            },
          ],
        },
        {
          name: "RadioButton",
          variations: [
            {
              value: "default",
              label: "Default",
              element: <RadioButton label="Option A" />,
            },
            {
              value: "group",
              label: "Group",
              element: (
                <Column gap="s">
                  <RadioButton label="Option A" />
                  <RadioButton label="Option B" />
                  <RadioButton label="Option C" />
                </Column>
              ),
            },
            {
              value: "no-hover",
              label: "No hover",
              element: <RadioButton hoverable={false} label="Hover disabled" />,
            },
          ],
        },
        {
          name: "Select",
          variations: [
            {
              value: "large",
              label: "Large (100%)",
              element: (
                <Flex fillWidth>
                  <Select
                    id="sel-lg"
                    label="Framework"
                    options={[
                      { label: "Next.js", value: "next" },
                      { label: "Remix", value: "remix" },
                      { label: "Astro", value: "astro" },
                    ]}
                  />
                </Flex>
              ),
            },
            {
              value: "medium",
              label: "Medium (50%)",
              element: (
                <Flex style={{ width: "50%" }}>
                  <Select
                    id="sel-md"
                    label="Framework"
                    options={[
                      { label: "Next.js", value: "next" },
                      { label: "Remix", value: "remix" },
                      { label: "Astro", value: "astro" },
                    ]}
                  />
                </Flex>
              ),
            },
            {
              value: "small",
              label: "Small (25%)",
              element: (
                <Flex style={{ width: "25%" }}>
                  <Select
                    id="sel-sm"
                    label="Framework"
                    options={[
                      { label: "Next.js", value: "next" },
                      { label: "Remix", value: "remix" },
                      { label: "Astro", value: "astro" },
                    ]}
                  />
                </Flex>
              ),
            },
          ],
        },
        {
          name: "TagInput",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <TagInput
                  id="tags"
                  value={["react", "typescript"]}
                  onValueChange={() => {}}
                />
              ),
            },
            {
              value: "disabled",
              label: "Disabled",
              element: (
                <TagInput
                  id="tags-disabled"
                  value={["react"]}
                  disabled
                  onValueChange={() => {}}
                />
              ),
            },
          ],
        },
        {
          name: "SegmentedControl",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <SegmentedControl
                  value="one"
                  onValueChange={() => {}}
                  buttons={[
                    { value: "one", label: "One" },
                    { value: "two", label: "Two" },
                    { value: "three", label: "Three" },
                  ]}
                />
              ),
            },
            {
              value: "compact",
              label: "Compact",
              element: (
                <SegmentedControl
                  compact
                  value="a"
                  onValueChange={() => {}}
                  buttons={[
                    { value: "a", label: "A" },
                    { value: "b", label: "B" },
                    { value: "c", label: "C" },
                    { value: "d", label: "D" },
                  ]}
                />
              ),
            },
          ],
        },
        {
          name: "Button color + icons",
          variations: [
            {
              value: "iconbutton-color",
              label: "IconButton color",
              element: (
                <Row gap="8" wrap vertical="center">
                  <Text textVariant="label-default-s" onBackground="neutral-weak">
                    secondary
                  </Text>
                  <IconButton
                    variant="secondary"
                    tone="brand"
                    icon="sparkle"
                  />
                  <IconButton
                    variant="secondary"
                    tone="danger"
                    icon="close"
                  />
                  <IconButton
                    variant="secondary"
                    tone="warning"
                    icon="warning"
                  />
                  <IconButton
                    variant="secondary"
                    tone="success"
                    icon="check"
                  />
                </Row>
              ),
            },
            {
              value: "ghost-color",
              label: "Ghost color",
              element: (
                <Row gap="8" wrap vertical="center">
                  <Text textVariant="label-default-s" onBackground="neutral-weak">
                    ghost
                  </Text>
                  <IconButton
                    variant="ghost"
                    tone="brand"
                    icon="sparkle"
                  />
                  <IconButton
                    variant="ghost"
                    tone="danger"
                    icon="close"
                  />
                  <IconButton variant="ghost" tone="info" icon="info" />
                  <IconButton
                    variant="ghost"
                    tone="success"
                    icon="check"
                  />
                </Row>
              ),
            },
            {
              value: "button-icons",
              label: "Button prefixIcon/suffixIcon",
              element: (
                <Row gap="8" wrap vertical="center">
                  <Button
                    variant="secondary"
                    prefixIcon="sparkle"
                    tone="brand"
                  >
                    Settings
                  </Button>
                  <Button
                    variant="secondary"
                    suffixIcon="chevronRight"
                    tone="danger"
                  >
                    Delete
                  </Button>
                  <Button variant="ghost" prefixIcon="info" tone="info">
                    Info
                  </Button>
                </Row>
              ),
            },
          ],
        },
      ],
    },
    {
      id: "data-display",
      name: "Data Display",
      description: "Components for presenting structured data",
      components: [
        {
          name: "Table",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <Table columns={[{ header: "Name", key: "name" }, { header: "Role", key: "role" }, { header: "Status", key: "status" }]} rows={[
                      ["Alice", "Engineer", "Active"],
                      ["Bob", "Designer", "Away"],
                      ["Carol", "Manager", "Active"],
                    ]}
                />
              ),
            },
            {
              value: "sortable",
              label: "Sortable",
              element: (
                <Table columns={[{ header: "Name", key: "name", sortable: true }, { header: "Score", key: "score", sortable: true }, { header: "Status", key: "status", sortable: true }]} rows={[
                      ["Alice", "95", "Active"],
                      ["Bob", "82", "Away"],
                      ["Carol", "91", "Active"],
                    ]}
                />
              ),
            },
          ],
        },
        {
          name: "List",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <List>
                  <ListItem>Set up the project</ListItem>
                  <ListItem>Install dependencies</ListItem>
                  <ListItem>Start building</ListItem>
                </List>
              ),
            },
          ],
        },
        {
          name: "Timeline",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <Timeline
                  items={[
                    {
                      label: "Project kickoff",
                      description: "Initial planning",
                    },
                    {
                      label: "Development",
                      description: "Build core features",
                    },
                    { label: "Launch", description: "Ship to production" },
                  ]}
                />
              ),
            },
          ],
        },
        {
          name: "Badge / Tag / Chip",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <Row gap="s" wrap vertical="center">
                  <Tag variant="announce">Badge</Tag>
                  <Tag label="Tag">Tag</Tag>
                  <Tag selected label="Chip">Chip</Tag>
                </Row>
              ),
            },
          ],
        },
      ],
    },
    {
      id: "media",
      name: "Media",
      description: "Image, video, and media display components",
      components: [
        {
          name: "Media",
          variations: [
            {
              value: "image",
              label: "Image",
              element: (
                <Media
                  src="/images/cover-01.jpg"
                  aspectRatio="16/9"
                  radius="l"
                  enlarge
                />
              ),
            },
            {
              value: "youtube",
              label: "YouTube",
              element: (
                <Media
                  src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  aspectRatio="16/9"
                  radius="l"
                  controls
                  sound={false}
                  autoplay
                />
              ),
            },
            {
              value: "video",
              label: "Video",
              element: (
                <Media
                  src="https://www.w3schools.com/html/mov_bbb.mp4"
                  aspectRatio="16/9"
                  radius="l"
                  controls
                  sound
                  autoplay={false}
                  loop={false}
                />
              ),
            },
          ],
        },
        {
          name: "Avatar",
          variations: [
            {
              value: "sizes",
              label: "Sizes",
              element: (
                <Row gap="s" vertical="center">
                  <Avatar size="xs" />
                  <Avatar size="s" />
                  <Avatar size="m" />
                  <Avatar size="l" />
                  <Avatar size="xl" />
                </Row>
              ),
            },
            {
              value: "src",
              label: "With image",
              element: (
                <Row gap="s" vertical="center">
                  {["xs", "s", "m", "l"].map((s) => (
                    <Avatar
                      key={s}
                      size={s as any}
                      src="/images/cover-01.jpg"
                    />
                  ))}
                </Row>
              ),
            },
            {
              value: "value",
              label: "Initials",
              element: (
                <Row gap="s" vertical="center">
                  <Avatar value="AD" />
                  <Avatar value="BS" />
                  <Avatar value="CJ" />
                </Row>
              ),
            },
          ],
        },
        {
          name: "AvatarGroup",
          variations: [
            {
              value: "default",
              label: "Default",
              element: <AvatarGroup avatars={[{}, {}, {}, {}]} />,
            },
            {
              value: "limit",
              label: "With limit",
              element: <AvatarGroup limit={3} avatars={[{}, {}, {}, {}, {}]} />,
            },
          ],
        },
        {
          name: "Carousel",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <Carousel
                  aspectRatio="16/9"
                  items={[
                    { slide: "/images/cover-01.jpg" },
                    { slide: "/images/cover-02.jpg" },
                    { slide: "/images/cover-03.jpg" },
                  ]}
                />
              ),
            },
            {
              value: "autoplay",
              label: "Auto play",
              element: (
                <Carousel
                  aspectRatio="16/9"
                  items={[
                    { slide: "/images/cover-01.jpg" },
                    { slide: "/images/cover-02.jpg" },
                    { slide: "/images/cover-03.jpg" },
                  ]}
                  play={{
                    auto: true,
                    interval: 3000,
                    controls: true,
                    progress: true,
                  }}
                />
              ),
            },
          ],
        },
        {
          name: "CompareImage",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <CompareImage
                  leftContent={{ src: "/images/cover-01.jpg" }}
                  rightContent={{ src: "/images/cover-02.jpg" }}
                />
              ),
            },
          ],
        },
        {
          name: "Logo",
          variations: [
            {
              value: "icon",
              label: "Icon only",
              element: <Logo icon="/trademarks/icon-dark.svg" size="xs" />,
            },
            {
              value: "wordmark",
              label: "With wordmark",
              element: (
                <Logo
                  icon="/trademarks/icon-dark.svg"
                  wordmark="/trademarks/type-dark.svg"
                  size="xs"
                />
              ),
            },
            {
              value: "sizes",
              label: "Sizes",
              element: (
                <Row gap="s" vertical="center">
                  <Logo icon="/trademarks/icon-dark.svg" size="xs" />
                  <Logo icon="/trademarks/icon-dark.svg" size="s" />
                  <Logo icon="/trademarks/icon-dark.svg" size="m" />
                </Row>
              ),
            },
          ],
        },
        {
          name: "LogoCloud",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <LogoCloud
                  logos={[
                    { icon: "/trademarks/icon-dark.svg" },
                    { icon: "/trademarks/icon-dark.svg" },
                    { icon: "/trademarks/icon-dark.svg" },
                  ]}
                />
              ),
            },
          ],
        },
      ],
    },
    {
      id: "feedback",
      name: "Feedback & Status",
      description: "Loading states, indicators, and user feedback",
      components: [
        {
          name: "Spinner",
          variations: [
            {
              value: "sizes",
              label: "Sizes",
              element: (
                <Row gap="m" vertical="center">
                  <Spinner size="s" />
                  <Spinner size="m" />
                  <Spinner size="l" />
                </Row>
              ),
            },
            {
              value: "all",
              label: "All sizes",
              element: (
                <Row gap="m" vertical="center">
                  <Spinner size="xs" />
                  <Spinner size="s" />
                  <Spinner size="m" />
                  <Spinner size="l" />
                  <Spinner size="xl" />
                </Row>
              ),
            },
          ],
        },
        {
          name: "ProgressBar",
          variations: [
            {
              value: "values",
              label: "Values",
              element: (
                <Column gap="s" fillWidth>
                  <ProgressBar value={25} />
                  <ProgressBar value={65} />
                  <ProgressBar value={100} />
                </Column>
              ),
            },
            {
              value: "labels",
              label: "Label positions",
              element: (
                <Column gap="s" fillWidth>
                  <ProgressBar value={25} labelPosition="bottom" />
                  <ProgressBar value={65} labelPosition="top" />
                  <ProgressBar value={75} labelPosition="left" />
                  <ProgressBar value={90} labelPosition="right" />
                </Column>
              ),
            },
          ],
        },
        {
          name: "Skeleton",
          variations: [
            {
              value: "lines",
              label: "Lines",
              element: (
                <Column gap="s" fillWidth>
                  <Skeleton shape="line" width="100%" />
                  <Skeleton shape="line" width="75%" />
                  <Skeleton shape="line" width="50%" />
                </Column>
              ),
            },
            {
              value: "shapes",
              label: "Shapes",
              element: (
                <Row gap="s" vertical="center">
                  <Skeleton shape="circle" />
                  <Skeleton shape="block" size="m" />
                </Row>
              ),
            },
          ],
        },
        {
          name: "StatusIndicator",
          variations: [
            {
              value: "colors",
              label: "Colors",
              element: (
                <Row gap="m" vertical="center">
                  <Row gap="xs" vertical="center">
                    <StatusIndicator scheme="green" />
                    <Text textVariant="label-default-s">Online</Text>
                  </Row>
                  <Row gap="xs" vertical="center">
                    <StatusIndicator scheme="yellow" />
                    <Text textVariant="label-default-s">Away</Text>
                  </Row>
                  <Row gap="xs" vertical="center">
                    <StatusIndicator scheme="red" />
                    <Text textVariant="label-default-s">Offline</Text>
                  </Row>
                </Row>
              ),
            },
            {
              value: "sizes",
              label: "Sizes",
              element: (
                <Row gap="m" vertical="center">
                  <StatusIndicator scheme="green" size="s" />
                  <StatusIndicator scheme="green" size="m" />
                  <StatusIndicator scheme="green" size="l" />
                </Row>
              ),
            },
          ],
        },
        {
          name: "Feedback",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <Feedback
                  showIcon
                  title="Changes saved"
                  description="Your settings have been updated successfully."
                />
              ),
            },
          ],
        },
        {
          name: "Card",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <Card padding="16" radius="m" border="neutral-alpha-medium">
                  <Heading textVariant="heading-strong-s">Card title</Heading>
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    A basic interactive card component.
                  </Text>
                </Card>
              ),
            },
            {
              value: "with-link",
              label: "With href",
              element: (
                <Card
                  href="#"
                  padding="16"
                  radius="m"
                  border="neutral-alpha-medium"
                >
                  <Text textVariant="label-default-s">Linked card</Text>
                </Card>
              ),
            },
          ],
        },
      ],
    },
    {
      id: "overlays",
      name: "Overlays & Modals",
      description: "Popover, tooltip, and dialog components",
      components: [
        {
          name: "Dialog",
          variations: [
            {
              value: "open",
              label: "Open",
              element: (
                <>
                  <Button onClick={() => setDialogOpen(true)}>
                    Open Dialog
                  </Button>
                  <Dialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    title="Confirm action"
                    description="Are you sure you want to continue?"
                    footer={
                      <Row gap="s" horizontal="end" fillWidth>
                        <Button
                          variant="secondary"
                          onClick={() => setDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={() => setDialogOpen(false)}>
                          Confirm
                        </Button>
                      </Row>
                    }
                  />
                </>
              ),
            },
            {
              value: "media",
              label: "Media header",
              element: (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => setMediaDialogOpen(true)}
                  >
                    Dialog with media
                  </Button>
                  <Dialog
                    open={mediaDialogOpen}
                    onClose={() => setMediaDialogOpen(false)}
                    title="Featured article"
                    description="A preview of the latest design thinking."
                    maxWidth="48rem"
                    flush
                    footer={
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => setMediaDialogOpen(false)}
                        >
                          Dismiss
                        </Button>
                        <Button onClick={() => setMediaDialogOpen(false)}>
                          Read more
                        </Button>
                      </>
                    }
                  >
                    <Column fillWidth gap="20">
                      <Media
                        src="/images/cover-01.jpg"
                        alt="Design preview"
                        aspectRatio="16 / 10"
                        radius="m"
                        fillWidth
                      />
                      <Column fillWidth gap="8" paddingX="24">
                        <Text textVariant="heading-strong-s">
                          Building design systems that scale
                        </Text>
                        <Text onBackground="neutral-weak">
                          A deep dive into creating modular, token-driven
                          interfaces that stay consistent across products and
                          teams.
                        </Text>
                      </Column>
                    </Column>
                  </Dialog>
                </>
              ),
            },
          ],
        },
        {
          name: "Tooltip",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <Tooltip label="This is a tooltip">
                  <Button variant="secondary">Hover me</Button>
                </Tooltip>
              ),
            },
            {
              value: "icons",
              label: "With icons",
              element: (
                <Tooltip label="Settings" prefixIcon="sparkle">
                  <Button variant="secondary">With icon</Button>
                </Tooltip>
              ),
            },
          ],
        },
        {
          name: "HoverCard",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <HoverCard
                  trigger={<Button variant="secondary">Hover for card</Button>}
                >
                  <Column padding="m">
                    <Text>Hover card content with extra detail</Text>
                  </Column>
                </HoverCard>
              ),
            },
          ],
        },
        {
          name: "DropdownWrapper",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <Dropdown
                  trigger={
                    <Button variant="secondary" suffixIcon="chevronDown">
                      Options
                    </Button>
                  }><Column padding="xs">
                      <Option value="edit">Edit</Option>
                      <Option value="duplicate">Duplicate</Option>
                      <Option value="delete">Delete</Option>
                    </Column></Dropdown>
              ),
            },
          ],
        },
        {
          name: "Toaster",
          variations: [
            {
              value: "success",
              label: "Success",
              element: (
                <Button onClick={() => handleAddToast("success")}>
                  Success Toast
                </Button>
              ),
            },
            {
              value: "danger",
              label: "Danger",
              element: (
                <Button onClick={() => handleAddToast("danger")}>
                  Danger Toast
                </Button>
              ),
            },
            {
              value: "warning",
              label: "Warning",
              element: (
                <Button onClick={() => handleAddToast("warning")}>
                  Warning Toast
                </Button>
              ),
            },
            {
              value: "info",
              label: "Info",
              element: (
                <Button onClick={() => handleAddToast("info")}>
                  Info Toast
                </Button>
              ),
            },
            {
              value: "all",
              label: "All variants",
              element: (
                <Row gap="8" wrap>
                  <Button onClick={() => handleAddToast("success")}>
                    Success
                  </Button>
                  <Button onClick={() => handleAddToast("danger")}>
                    Danger
                  </Button>
                  <Button onClick={() => handleAddToast("warning")}>
                    Warning
                  </Button>
                  <Button onClick={() => handleAddToast("info")}>Info</Button>
                </Row>
              ),
            },
          ],
        },
      ],
    },
    {
      id: "navigation",
      name: "Navigation",
      description: "Navigation and menu components",
      components: [
        {
          name: "NavIcon",
          variations: [
            { value: "default", label: "Default", element: <NavIcon /> },
          ],
        },
        {
          name: "ContextMenu",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <Dropdown openOn="contextmenu" trigger={<Button variant="secondary">Right-click me</Button>}><Column padding="xs">
                      <Option value="copy">Copy</Option>
                      <Option value="paste">Paste</Option>
                    </Column></Dropdown>
              ),
            },
          ],
        },
        {
          name: "UserMenu",
          variations: [
            { value: "default", label: "Default", element: <User dropdown={null} /> },
          ],
        },
        {
          name: "SmartLink",
          variations: [
            {
              value: "default",
              label: "Default",
              element: <SmartLink href="/">Smart Link to home</SmartLink>,
            },
            {
              value: "icons",
              label: "With icons",
              element: (
                <SmartLink
                  href="/"
                  prefixIcon="chevronLeft"
                  suffixIcon="chevronRight"
                >
                  Back and forth
                </SmartLink>
              ),
            },
          ],
        },
        {
          name: "ScrollToTop",
          variations: [
            { value: "default", label: "Default", element: <ScrollToTop /> },
          ],
        },
      ],
    },
    {
      id: "accordions",
      name: "Accordions",
      description: "Expandable and collapsible content sections",
      components: [
        {
          name: "Accordion",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <Accordion title="What is Once UI?">
                  <Text>
                    A design system and component library for Next.js
                    applications.
                  </Text>
                </Accordion>
              ),
            },
            {
              value: "open",
              label: "Open by default",
              element: (
                <Accordion defaultOpen title="Installation">
                  <Text>
                    Run pnpm install @once-ui-system/core to get started.
                  </Text>
                </Accordion>
              ),
            },
            {
              value: "icon",
              label: "With icon",
              element: (
                <Accordion icon="sparkle" title="Special">
                  <Text>This accordion has a custom icon.</Text>
                </Accordion>
              ),
            },
          ],
        },
        {
          name: "AccordionGroup",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <AccordionGroup
                  items={[
                    {
                      title: "Installation",
                      content: <Text>Run pnpm install to get started.</Text>,
                    },
                    {
                      title: "Configuration",
                      content: (
                        <Text>
                          Edit once-ui.config.js to customize the theme.
                        </Text>
                      ),
                    },
                    {
                      title: "Components",
                      content: (
                        <Text>
                          Import components from @once-ui-system/core.
                        </Text>
                      ),
                    },
                  ]}
                />
              ),
            },
            {
              value: "smart-radius",
              label: "Smart radius",
              element: (
                <AccordionGroup
                  items={[
                    {
                      title: "First item",
                      content: <Text>Top — only top corners rounded</Text>,
                    },
                    {
                      title: "Second item",
                      content: <Text>Middle — no border radius</Text>,
                    },
                    {
                      title: "Third item",
                      content: (
                        <Text>Bottom — only bottom corners rounded</Text>
                      ),
                    },
                  ]}
                />
              ),
            },
            {
              value: "autocollapse",
              label: "Auto collapse",
              element: (
                <AccordionGroup
                  autoCollapse
                  items={[
                    {
                      title: "Step 1",
                      content: <Text>Only one open at a time.</Text>,
                    },
                    {
                      title: "Step 2",
                      content: <Text>Opening this closes Step 1.</Text>,
                    },
                    { title: "Step 3", content: <Text>Final step.</Text> },
                  ]}
                />
              ),
            },
            {
              value: "sizes",
              label: "Sizes",
              element: (
                <Column gap="s">
                  <AccordionGroup
                    size="s"
                    items={[
                      { title: "Small", content: <Text>S size</Text> },
                      { title: "Small 2", content: <Text>S size</Text> },
                    ]}
                  />
                  <AccordionGroup
                    size="l"
                    items={[
                      { title: "Large", content: <Text>L size</Text> },
                      { title: "Large 2", content: <Text>L size</Text> },
                    ]}
                  />
                </Column>
              ),
            },
          ],
        },
      ],
    },
    {
      id: "effects",
      name: "Effects & Animations",
      description: "Visual effects and animation wrappers",
      components: [
        {
          name: "RevealFx",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <RevealFx>
                  <Text>Reveal Effect</Text>
                </RevealFx>
              ),
            },
          ],
        },
        {
          name: "LetterFx",
          variations: [
            {
              value: "default",
              label: "Default",
              element: <LetterFx>Letter Effect</LetterFx>,
            },
          ],
        },
        {
          name: "TypeFx",
          variations: [
            {
              value: "default",
              label: "Default",
              element: <TypeFx words="Type Effect">Type Effect</TypeFx>,
            },
          ],
        },
        {
          name: "CountFx",
          variations: [
            {
              value: "default",
              label: "Default",
              element: <CountFx value={100} />,
            },
            {
              value: "prefix",
              label: "With prefix",
              element: <CountFx value={9999} prefix="$" />,
            },
          ],
        },
        {
          name: "CountdownFx",
          variations: [
            {
              value: "1h",
              label: "1 hour",
              element: (
                <CountdownFx targetDate={new Date(Date.now() + 3600000)} />
              ),
            },
            {
              value: "24h",
              label: "24 hours",
              element: (
                <CountdownFx targetDate={new Date(Date.now() + 86400000)} />
              ),
            },
          ],
        },
        {
          name: "Fade",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <Fade>
                  <Text>Fade Effect</Text>
                </Fade>
              ),
            },
          ],
        },
        {
          name: "Pulse",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <StatusIndicator pulse>
                  <Text>Pulse Effect</Text>
                </StatusIndicator>
              ),
            },
            {
              value: "large",
              label: "Large pulse",
              element: (
                <StatusIndicator pulse pulseSize={80}>
                  <Text>Large pulse</Text>
                </StatusIndicator>
              ),
            },
            {
              value: "small",
              label: "Small pulse",
              element: (
                <StatusIndicator pulse pulseSize={40}>
                  <Text>Small pulse</Text>
                </StatusIndicator>
              ),
            },
          ],
        },
        {
          name: "Hover",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <HoverCard placement="cover"
                  trigger={<Text>Test</Text>}
                  onClick={() => {}}><Column background="overlay" /></HoverCard>
              ),
            },
          ],
        },
        {
          name: "FlipFx",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <FlipFx
                  back={<Text>Back</Text>}
                  front={<Text>Front</Text>}
                  onClick={() => {}}
                >
                  <Text>Flip Effect</Text>
                </FlipFx>
              ),
            },
          ],
        },
        {
          name: "GlitchFx",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <GlitchFx>
                  <Text>Glitch Effect</Text>
                </GlitchFx>
              ),
            },
          ],
        },
        {
          name: "HoloFx",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <HoloFx>
                  <Text>Holo Effect</Text>
                </HoloFx>
              ),
            },
          ],
        },
        {
          name: "MatrixFx",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <MatrixFx>
                  <Text>Matrix Effect</Text>
                </MatrixFx>
              ),
            },
          ],
        },
        {
          name: "ShineFx",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <ShineFx>
                  <Text>Shine Effect</Text>
                </ShineFx>
              ),
            },
          ],
        },
        {
          name: "TiltFx",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <TiltFx>
                  <Text>Tilt Effect</Text>
                </TiltFx>
              ),
            },
          ],
        },
        {
          name: "WeatherFx",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <WeatherFx>
                  <Text>Weather Effect</Text>
                </WeatherFx>
              ),
            },
          ],
        },
        {
          name: "FadingLettersFx",
          variations: [
            {
              value: "entering",
              label: "Entering",
              element: (
                <TypeFx mode="fade"
                  words="Fading Letters"
                  state="entering"
                  textVariant="heading-strong-m"
                />
              ),
            },
            {
              value: "visible",
              label: "Visible",
              element: (
                <TypeFx mode="fade"
                  words="Fading Letters"
                  state="visible"
                  textVariant="heading-strong-m"
                />
              ),
            },
            {
              value: "exiting",
              label: "Exiting",
              element: (
                <TypeFx mode="fade"
                  words="Fading Letters"
                  state="exiting"
                  textVariant="heading-strong-m"
                />
              ),
            },
          ],
        },
      ],
    },
    {
      id: "date-time",
      name: "Date & Time",
      description: "Date pickers and calendar inputs",
      components: [
        {
          name: "DatePicker",
          variations: [
            { value: "default", label: "Default", element: <DatePicker /> },
          ],
        },
        {
          name: "DateInput",
          variations: [
            {
              value: "large",
              label: "Large (100%)",
              element: (
                <Flex fillWidth>
                  <DateInput
                    id="di-lg"
                    label="Date"
                    placeholder="Select a date"
                  />
                </Flex>
              ),
            },
            {
              value: "medium",
              label: "Medium (50%)",
              element: (
                <Flex style={{ width: "50%" }}>
                  <DateInput
                    id="di-md"
                    label="Date"
                    placeholder="Select a date"
                  />
                </Flex>
              ),
            },
            {
              value: "small",
              label: "Small (25%)",
              element: (
                <Flex style={{ width: "25%" }}>
                  <DateInput
                    id="di-sm"
                    label="Date"
                    placeholder="Select a date"
                  />
                </Flex>
              ),
            },
          ],
        },
        {
          name: "DateRangeInput",
          variations: [
            {
              value: "large",
              label: "Large (100%)",
              element: (
                <Flex fillWidth>
                  <DateInput range
                    id="dri-lg"
                    startLabel="Start"
                    endLabel="End"
                    placeholder="Select range"
                  />
                </Flex>
              ),
            },
            {
              value: "medium",
              label: "Medium (50%)",
              element: (
                <Flex style={{ width: "50%" }}>
                  <DateInput range
                    id="dri-md"
                    startLabel="Start"
                    endLabel="End"
                    placeholder="Select range"
                  />
                </Flex>
              ),
            },
            {
              value: "small",
              label: "Small (25%)",
              element: (
                <Flex style={{ width: "25%" }}>
                  <DateInput range
                    id="dri-sm"
                    startLabel="Start"
                    endLabel="End"
                    placeholder="Select range"
                  />
                </Flex>
              ),
            },
          ],
        },
      ],
    },
    {
      id: "specialized",
      name: "Specialized",
      description: "Utility and specialized components",
      components: [
        {
          name: "Icon",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <Row gap="m">
                  <Icon name="sparkle" size="m" />
                  <Icon name="search" size="m" />
                  <Icon name="person" size="m" />
                  <Icon name="check" size="m" />
                  <Icon name="plus" size="m" />
                </Row>
              ),
            },
            {
              value: "sizes",
              label: "Sizes",
              element: (
                <Row gap="s" vertical="center">
                  <Icon name="sparkle" size="xs" />
                  <Icon name="sparkle" size="s" />
                  <Icon name="sparkle" size="m" />
                  <Icon name="sparkle" size="l" />
                  <Icon name="sparkle" size="xl" />
                </Row>
              ),
            },
          ],
        },
        {
          name: "Line",
          variations: [
            { value: "default", label: "Default", element: <Line /> },
          ],
        },
        {
          name: "Kbd",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <Row gap="xs" vertical="center">
                  <Kbd>Ctrl</Kbd>
                  <Text textVariant="label-default-s">+</Text>
                  <Kbd>K</Kbd>
                </Row>
              ),
            },
            {
              value: "label",
              label: "With label",
              element: <Kbd label="⌘K" />,
            },
          ],
        },
        {
          name: "Mask",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <Mask>
                  <Text>Masked content</Text>
                </Mask>
              ),
            },
          ],
        },
        {
          name: "ParticleFx",
          variations: [
            { value: "default", label: "Default", element: <ParticleFx /> },
          ],
        },
        {
          name: "User",
          variations: [
            {
              value: "default",
              label: "Default",
              element: <User name="Alice Johnson" subline="Engineer" />,
            },
            {
              value: "avatar",
              label: "With avatar",
              element: (
                <User
                  name="Bob Smith"
                  subline="Designer"
                  avatarProps={{ src: "/images/cover-01.jpg" }}
                />
              ),
            },
          ],
        },
        {
          name: "CursorCard",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <HoverCard placement="cursor"
                  trigger={
                    <Flex
                      padding="l"
                      radius="l"
                      background="neutral-medium"
                      center
                      fillWidth
                    >
                      <Text>Move cursor over me</Text>
                    </Flex>
                  }><Flex
                      padding="l"
                      radius="l"
                      background="surface"
                      border="neutral-medium"
                    >
                      <Text>I follow your cursor!</Text>
                    </Flex></HoverCard>
              ),
            },
          ],
        },
        {
          name: "OgCard",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <OgCard
                  favicon={false}
                  ogData={{
                    title: "Once UI",
                    description: "A design system for Next.js",
                    image: "/images/cover-01.jpg",
                    url: "https://once-ui.com",
                  }}
                />
              ),
            },
          ],
        },
        {
          name: "Background",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <Background style={{ height: "8rem", position: "relative" }}>
                  <Text>Background</Text>
                </Background>
              ),
            },
          ],
        },
        {
          name: "StylePanel",
          variations: [
            { value: "default", label: "Default", element: <StylePanel /> },
          ],
        },
        {
          name: "ThemeSwitcher",
          variations: [
            { value: "default", label: "Default", element: <ThemeSwitcher /> },
          ],
        },
        {
          name: "EmojiPicker",
          variations: [
            {
              value: "default",
              label: "Default",
              element: <EmojiPicker onSelect={() => {}} />,
            },
          ],
        },
        {
          name: "EmojiPickerDropdown",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <EmojiPicker
                  trigger={<Button variant="secondary">Pick Emoji</Button>}
                  onSelect={() => {}}
                />
              ),
            },
          ],
        },
        {
          name: "Kbar",
          variations: [
            {
              value: "xs",
              label: "XS input",
              element: (
                <Kbar
                  size="xs"
                  items={[
                    {
                      id: "home",
                      name: "Home",
                      section: "Navigation",
                      shortcut: ["H"],
                      keywords: "home",
                    },
                    {
                      id: "search",
                      name: "Search",
                      section: "Navigation",
                      shortcut: ["S"],
                      keywords: "search",
                    },
                  ]}
                >
                  <Button variant="secondary" prefixIcon="search">
                    xs
                  </Button>
                </Kbar>
              ),
            },
            {
              value: "m",
              label: "M input",
              element: (
                <Kbar
                  size="m"
                  items={[
                    {
                      id: "home",
                      name: "Home",
                      section: "Navigation",
                      shortcut: ["H"],
                      keywords: "home",
                    },
                    {
                      id: "search",
                      name: "Search",
                      section: "Navigation",
                      shortcut: ["S"],
                      keywords: "search",
                    },
                  ]}
                >
                  <Button variant="secondary" prefixIcon="search">
                    m
                  </Button>
                </Kbar>
              ),
            },
            {
              value: "l",
              label: "L input",
              element: (
                <Kbar
                  size="l"
                  items={[
                    {
                      id: "home",
                      name: "Home",
                      section: "Navigation",
                      shortcut: ["H"],
                      keywords: "home",
                    },
                    {
                      id: "search",
                      name: "Search",
                      section: "Navigation",
                      shortcut: ["S"],
                      keywords: "search",
                    },
                  ]}
                >
                  <Button variant="secondary" prefixIcon="search">
                    l
                  </Button>
                </Kbar>
              ),
            },
          ],
        },
        {
          name: "Scroller",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <Scroller>
                  <Row gap="s">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <Flex
                        key={n}
                        padding="m"
                        paddingX="l"
                        background="neutral-medium"
                        radius="m"
                      >
                        <Text textVariant="label-default-s">Item {n}</Text>
                      </Flex>
                    ))}
                  </Row>
                </Scroller>
              ),
            },
          ],
        },
        {
          name: "AutoScroll",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <Scroller auto>
                  <Row gap="s">
                    {["Once", "UI", "Design", "System", "Components"].map(
                      (word) => (
                        <Flex
                          key={word}
                          padding="s"
                          paddingX="m"
                          background="brand-medium"
                          radius="full"
                        >
                          <Text
                            textVariant="label-default-s"
                            onBackground="brand-strong"
                          >
                            {word}
                          </Text>
                        </Flex>
                      ),
                    )}
                  </Row>
                </Scroller>
              ),
            },
          ],
        },
        {
          name: "Swiper",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <Carousel mode="snap"
                  aspectRatio="16/9"
                  items={[
                    {
                      slide: (
                        <Media src="/images/cover-03.jpg" aspectRatio="16/9" />
                      ),
                    },
                    {
                      slide: (
                        <Media src="/images/cover-04.jpg" aspectRatio="16/9" />
                      ),
                    },
                    {
                      slide: (
                        <Media src="/images/cover-05.jpg" aspectRatio="16/9" />
                      ),
                    },
                  ]}
                />
              ),
            },
          ],
        },
        {
          name: "MasonryGrid",
          variations: [
            {
              value: "3col",
              label: "3 columns",
              element: (
                <Grid masonry columns={3}>
                  {[4, 8, 6, 5, 7, 4].map((h, i) => (
                    <Flex
                      key={i}
                      background="neutral-medium"
                      radius="m"
                      padding="m"
                      style={{ height: `${h}rem` }}
                      center
                    >
                      <Text textVariant="label-default-s">{i + 1}</Text>
                    </Flex>
                  ))}
                </Grid>
              ),
            },
            {
              value: "2col",
              label: "2 columns",
              element: (
                <Grid masonry columns={2}>
                  {[6, 8, 5, 7].map((h, i) => (
                    <Flex
                      key={i}
                      background="neutral-medium"
                      radius="m"
                      padding="m"
                      style={{ height: `${h}rem` }}
                      center
                    >
                      <Text textVariant="label-default-s">{i + 1}</Text>
                    </Flex>
                  ))}
                </Grid>
              ),
            },
          ],
        },
        {
          name: "InfiniteScroll",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <InfiniteScroll
                  items={["Item 1", "Item 2", "Item 3"]}
                  loadMore={async () => false}
                  renderItem={(item) => <Text>{item as string}</Text>}
                />
              ),
            },
          ],
        },
        {
          name: "CodeBlock",
          variations: [
            {
              value: "custom-bg",
              label: "Custom BG (controls test)",
              element: (
                <CodeBlock
                  style={{ backgroundColor: "pink" }}
                  compact
                  codes={[
                    {
                      code: `const greeting = "Hello World";\nconsole.log(greeting);\n\n// Scroll test: enough lines to overflow\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nfor (let i = 0; i < 20; i++) {\n  console.log(\`fib(\${i}) = \${fibonacci(i)}\`);\n}`,
                      language: "javascript",
                      label: "Inherit Test",
                    },
                  ]}
                />
              ),
            },
            {
              value: "default",
              label: "Default",
              element: (
                <CodeBlock
                  preview={
                    <Flex padding="l" center fillWidth>
                      <Button variant="primary" size="s">
                        Preview button
                      </Button>
                    </Flex>
                  }
                  codes={[
                    {
                      code: `function greet(name) {\n  return \`Hello, \${name}!\`;\n}`,
                      language: "javascript",
                      label: "JavaScript",
                    },
                  ]}
                />
              ),
            },
            {
              value: "collapsed",
              label: "Collapsible",
              element: (
                <CodeBlock
                  isCollapsible
                  maxLines={3}
                  copyButton
                  actions={
                    <StyleOverlay>
                      <IconButton variant="tertiary" icon="sparkle" aria-label="Open the style panel" />
                    </StyleOverlay>
                  }
                  reloadButton
                  fullscreenButton
                  preview={
                    <Column gap="m" fillWidth horizontal="center" padding="l">
                      <Heading textVariant="heading-strong-m">Hello World</Heading>
                      <Text
                        textVariant="body-default-m"
                        onBackground="neutral-medium"
                      >
                        This is a preview of the code below.
                      </Text>
                      <Button variant="primary" size="s">
                        Click me
                      </Button>
                    </Column>
                  }
                  codes={[
                    {
                      code: `function hello() {\n  console.log("Hello World");\n}\n\nfunction goodbye() {\n  console.log("Goodbye");\n}\n\nfunction main() {\n  hello();\n  goodbye();\n}`,
                      language: "javascript",
                      label: "JavaScript",
                    },
                  ]}
                />
              ),
            },
            {
              value: "hide-code",
              label: "Hide Code",
              element: (
                <CodeBlock
                  hideCode
                  preview={
                    <Column gap="m" fillWidth horizontal="center" padding="l">
                      <Heading textVariant="heading-strong-m">Hidden Code</Heading>
                      <Text
                        textVariant="body-default-m"
                        onBackground="neutral-medium"
                      >
                        The code is hidden, only preview is shown.
                      </Text>
                      <Button variant="primary" size="s">
                        Action
                      </Button>
                    </Column>
                  }
                  codes={[
                    {
                      code: `function hidden() {\n  return "This code is hidden";\n}`,
                      language: "javascript",
                      label: "JavaScript",
                    },
                  ]}
                />
              ),
            },
            {
              value: "collapsible-full",
              label: "Collapsible (maxLines=0)",
              element: (
                <CodeBlock
                  isCollapsible
                  maxLines={0}
                  copyButton
                  preview={
                    <Column gap="m" fillWidth horizontal="center" padding="l">
                      <Heading textVariant="heading-strong-m">Full Code</Heading>
                      <Text
                        textVariant="body-default-m"
                        onBackground="neutral-medium"
                      >
                        Code is collapsible but shows all lines when expanded.
                      </Text>
                      <Button variant="primary" size="s">
                        View
                      </Button>
                    </Column>
                  }
                  codes={[
                    {
                      code: `function first() {\n  console.log("Line 1");\n}\n\nfunction second() {\n  console.log("Line 2");\n}\n\nfunction third() {\n  console.log("Line 3");\n}\n\nfunction fourth() {\n  console.log("Line 4");\n}`,
                      language: "javascript",
                      label: "JavaScript",
                    },
                  ]}
                />
              ),
            },
          ],
        },
      ],
    },
    {
      id: "charts",
      name: "Charts",
      description: "Data visualization components",
      components: [
        {
          name: "BarChart",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <BarChart
                  title="Revenue"
                  series={[{ key: "Revenue", color: "brand" }]}
                  data={[
                    { label: "Jan", Revenue: 24 },
                    { label: "Feb", Revenue: 38 },
                    { label: "Mar", Revenue: 31 },
                    { label: "Apr", Revenue: 47 },
                    { label: "May", Revenue: 52 },
                    { label: "Jun", Revenue: 41 },
                  ]}
                />
              ),
            },
            {
              value: "multi",
              label: "Multi-series",
              element: (
                <BarChart
                  title="Sales vs Target"
                  series={[
                    { key: "Sales", color: "brand" },
                    { key: "Target", color: "success" },
                  ]}
                  data={[
                    { label: "Jan", Sales: 24, Target: 20 },
                    { label: "Feb", Sales: 38, Target: 35 },
                    { label: "Mar", Sales: 31, Target: 30 },
                    { label: "Apr", Sales: 47, Target: 45 },
                  ]}
                />
              ),
            },
          ],
        },
        {
          name: "LineChart",
          variations: [
            {
              value: "default",
              label: "Default",
              element: (
                <LineChart
                  title="Users"
                  series={[{ key: "Users", color: "brand" }]}
                  data={[
                    { date: new Date(2025, 0), Users: 120 },
                    { date: new Date(2025, 1), Users: 185 },
                    { date: new Date(2025, 2), Users: 240 },
                    { date: new Date(2025, 3), Users: 310 },
                    { date: new Date(2025, 4), Users: 390 },
                    { date: new Date(2025, 5), Users: 480 },
                  ]}
                />
              ),
            },
            {
              value: "multi",
              label: "Multi-series",
              element: (
                <LineChart
                  title="Traffic"
                  series={[
                    { key: "Visitors", color: "brand" },
                    { key: "Pageviews", color: "violet" },
                  ]}
                  data={[
                    {
                      date: new Date(2025, 0),
                      Visitors: 1200,
                      Pageviews: 3400,
                    },
                    {
                      date: new Date(2025, 1),
                      Visitors: 1850,
                      Pageviews: 4200,
                    },
                    {
                      date: new Date(2025, 2),
                      Visitors: 2400,
                      Pageviews: 5100,
                    },
                    {
                      date: new Date(2025, 3),
                      Visitors: 3100,
                      Pageviews: 6300,
                    },
                  ]}
                />
              ),
            },
          ],
        },
      ],
    },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const filteredCategories = activeCategory
    ? categories.filter((c) => c.id === activeCategory)
    : categories;

  return (
    <Row fill gap="l" paddingY="l" style={{ maxWidth: "90rem" }}>
      <Column
        as="nav"
        gap="xs"
        paddingRight="l"
        style={{
          position: "sticky",
          top: "2rem",
          alignSelf: "flex-start",
          minWidth: "12rem",
        }}
      >
        <Text
          textVariant="label-default-s"
          onBackground="neutral-weak"
          marginBottom="s"
        >
          Components
        </Text>
        <Flex
          padding="s"
          paddingX="m"
          radius="m"
          cursor="pointer"
          background={activeCategory === null ? "neutral-medium" : undefined}
          onClick={() => setActiveCategory(null)}
        >
          <Text
            textVariant="label-default-s"
            onBackground={
              activeCategory === null ? "neutral-strong" : "neutral-weak"
            }
          >
            All
          </Text>
        </Flex>
        {categories.map((cat) => (
          <Flex
            key={cat.id}
            padding="s"
            paddingX="m"
            radius="m"
            cursor="pointer"
            background={
              activeCategory === cat.id ? "neutral-medium" : undefined
            }
            onClick={() => {
              setActiveCategory(cat.id);
              scrollToSection(cat.id);
            }}
          >
            <Text
              textVariant="label-default-s"
              onBackground={
                activeCategory === cat.id ? "neutral-strong" : "neutral-weak"
              }
            >
              {cat.name}
            </Text>
          </Flex>
        ))}
      </Column>

      <Column gap="xl" flex={1} style={{ minWidth: 0 }}>
        {filteredCategories.map((category) => (
          <Column key={category.id} id={category.id} gap="m" fillWidth>
            <Column gap="xs">
              <Heading textVariant="heading-strong-l">{category.name}</Heading>
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                {category.description}
              </Text>
            </Column>
            <Line />
            <Grid columns="2" gap="m" fillWidth>
              {category.components.map((comp) => {
                const currentVar = getVar(comp.name, comp.variations);
                return (
                  <Flex
                    key={comp.name}
                    padding="m"
                    radius="l"
                    fillWidth
                    border="neutral-alpha-medium"
                    background="surface"
                  >
                    <Column gap="s" fillWidth>
                      <Flex gap="s" fillWidth>
                        <SegmentedControl
                          value={currentVar}
                          onValueChange={(value: string) =>
                            selectVar(comp.name, value)
                          }
                          buttons={comp.variations.map((v) => ({
                            value: v.value,
                            label: v.label,
                          }))}
                        />
                      </Flex>
                      <Flex center minHeight="8" fillWidth>
                        {
                          comp.variations.find((v) => v.value === currentVar)
                            ?.element
                        }
                      </Flex>
                    </Column>
                  </Flex>
                );
              })}
            </Grid>
          </Column>
        ))}
      </Column>
    </Row>
  );
}
