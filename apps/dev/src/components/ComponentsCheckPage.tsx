"use client";

import React, { useState } from "react";
import {
    Heading,
    Text,
    Button,
    Column,
    Badge,
    Logo,
    Line,
    LetterFx,
    StylePanel,
    Carousel,
    Media,
    EmojiPicker,
    EmojiPickerDropdown,
    OgCard,
    Icon,
    Textarea,
    Row,
    IconButton,
    Select,
    Option,
    DropdownWrapper,
    AutoScroll,
    User,
    Table,
    ContextMenu,
    BlockQuote,
    RevealFx,
    DatePicker,
    DateInput,
    DateRangeInput,
    Grid,
    AccordionGroup,
    Accordion,
    Kbar,
    Spinner,
    BarChart,
    ListItem,
    List,
    ProgressBar,
    LineChart,
    CountFx,
    Feedback,
    MasonryGrid,
    TagInput,
    Avatar,
    Background,
    Flex,
    Chip,
    Fade,
    Hover,
    Pulse,
    Tooltip,
    Checkbox,
    Switch,
    RadioButton,
    Skeleton,
    HoverCard,
    LogoCloud,
    SmartLink,
    Swiper,
    Scroller,
    Particle,
    Arrow,
    Mask,
    Tag,
    Kbd,
    InlineCode,
    StatusIndicator,
    SegmentedControl,
    ToggleButton,
    ScrollToTop,
    CompareImage,
    InteractiveDetails,
    InfiniteScroll,
    PasswordInput,
    NumberInput,
    ColorInput,
    OTPInput,
    AvatarGroup,
    UserMenu,
    ThemeSwitcher,
    Timeline,
    NavIcon,
    CursorCard,
    FlipFx,
    GlitchFx,
    HoloFx,
    MatrixFx,
    ShineFx,
    TiltFx,
    TypeFx,
    WeatherFx,
    CountdownFx,
    Input,
    Dialog,
    FadingLettersFx,
    useToast,
} from "@once-ui-system/core";

interface ComponentDemo {
    name: string;
    element: React.ReactNode;
}

interface Category {
    id: string;
    name: string;
    description: string;
    components: ComponentDemo[];
}

function DemoCard({ name, children }: { name: string; children: React.ReactNode }) {
    return (
        <Flex padding="m" radius="l" fillWidth border="neutral-alpha-medium" background="surface">
            <Column gap="s" fillWidth>
                <Text variant="label-default-s" onBackground="neutral-weak">{name}</Text>
                <Flex center minHeight="8" fillWidth>
                    {children}
                </Flex>
            </Column>
        </Flex>
    );
}

export default function ComponentsCheck() {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [switchOn, setSwitchOn] = useState(false);
    const [segmentValue, setSegmentValue] = useState("one");
    const [dialogOpen, setDialogOpen] = useState(false);
    const { addToast } = useToast();

    const handleAddToast = (variant: "success" | "danger" | "warning" | "info") => {
        addToast({ variant, message: `This is a ${variant} toast!` });
    };

    const categories: Category[] = [
        {
            id: "layout",
            name: "Layout",
            description: "Core layout primitives for structuring content",
            components: [
                { name: "Column", element: <Column padding="m" background="neutral-medium" radius="l"><Text>Column Layout</Text></Column> },
                { name: "Row", element: <Row padding="m" background="neutral-medium" radius="l"><Text>Row Layout</Text></Row> },
                { name: "Flex", element: <Flex padding="m" background="neutral-medium" radius="l"><Text>Flex Layout</Text></Flex> },
                { name: "Flex maxWidth", element: <Flex maxWidth="xl" padding="m" background="brand-medium" radius="l"><Text onBackground="brand-strong">maxWidth="xl"</Text></Flex> },
                { name: "Grid", element: <Grid columns="2" gap="m" fillWidth><Column padding="m" background="neutral-medium" radius="l"><Text>Grid 1</Text></Column><Column padding="m" background="neutral-medium" radius="l"><Text>Grid 2</Text></Column></Grid> },
            ],
        },
        {
            id: "typography",
            name: "Typography",
            description: "Text rendering and formatting",
            components: [
                {
                    name: "Heading",
                    element: (
                        <Column gap="s" fillWidth>
                            <Heading variant="display-default-l">Display</Heading>
                            <Heading variant="heading-strong-l">Heading</Heading>
                            <Heading variant="heading-strong-m">Subheading</Heading>
                        </Column>
                    ),
                },
                {
                    name: "Text",
                    element: (
                        <Column gap="s" fillWidth>
                            <Text variant="body-default-l">Body large</Text>
                            <Text variant="body-default-m">Body medium</Text>
                            <Text variant="body-default-s" onBackground="neutral-weak">Body small muted</Text>
                        </Column>
                    ),
                },
                { name: "InlineCode", element: <Text>Run <InlineCode>pnpm install</InlineCode> to get started</Text> },
                {
                    name: "BlockQuote",
                    element: (
                        <BlockQuote>
                            <Text>Good design is as little design as possible.</Text>
                        </BlockQuote>
                    ),
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
                    element: (
                        <Row gap="s" wrap>
                            <Button variant="primary">Primary</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="tertiary">Tertiary</Button>
                            <Button variant="quaternary">Quaternary</Button>
                            <Button variant="success">Success</Button>
                            <Button variant="warning">Warning</Button>
                            <Button variant="danger">Danger</Button>
                        </Row>
                    ),
                },
                {
                    name: "IconButton",
                    element: (
                        <Row gap="s">
                            <IconButton icon="sparkle" variant="primary" />
                            <IconButton icon="refresh" variant="secondary" />
                            <IconButton icon="plus" variant="tertiary" />
                            <IconButton icon="check" variant="quaternary" />
                            <IconButton icon="checkCircle" variant="success" />
                            <IconButton icon="warning" variant="warning" />
                            <IconButton icon="close" variant="danger" />
                        </Row>
                    ),
                },
                {
                    name: "Input",
                    element: (
                        <Column gap="s" fillWidth>
                            <Input id="demo-input-1" label="Name" placeholder="Enter your name" />
                            <Input id="demo-input-2" label="Email" placeholder="you@example.com" />
                        </Column>
                    ),
                },
                { name: "Textarea", element: <Textarea id="demo-textarea" label="Message" placeholder="Write something..." lines={3} /> },
                { name: "PasswordInput", element: <PasswordInput id="demo-password" label="Password" placeholder="Enter password" /> },
                { name: "NumberInput", element: <NumberInput id="demo-number" label="Quantity" placeholder="0" /> },
                { name: "ColorInput", element: <ColorInput id="demo-color" value="#3b82f6" onChange={() => {}} /> },
                { name: "OTPInput", element: <OTPInput length={4} /> },
                { name: "Checkbox", element: <Checkbox label="Accept terms and conditions" /> },
                {
                    name: "Switch",
                    element: <Switch isChecked={switchOn} onToggle={() => setSwitchOn(!switchOn)} label="Dark mode" />,
                },
                { name: "RadioButton", element: <RadioButton label="Option A" /> },
                {
                    name: "Select",
                    element: (
                        <Select id="demo-select" label="Framework" options={[
                            { label: "Next.js", value: "next" },
                            { label: "Remix", value: "remix" },
                            { label: "Astro", value: "astro" },
                        ]} />
                    ),
                },
                {
                    name: "TagInput",
                    element: <TagInput id="demo-tags" value={["react", "typescript"]} onChange={() => {}} />,
                },
                {
                    name: "SegmentedControl",
                    element: (
                        <SegmentedControl
                            selected={segmentValue}
                            onToggle={setSegmentValue}
                            buttons={[
                                { value: "one", label: "One" },
                                { value: "two", label: "Two" },
                                { value: "three", label: "Three" },
                            ]}
                        />
                    ),
                },
                { name: "ToggleButton", element: <ToggleButton label="Toggle me" /> },
            ],
        },
        {
            id: "data-display",
            name: "Data Display",
            description: "Components for presenting structured data",
            components: [
                {
                    name: "Table",
                    element: (
                        <Table
                            data={{
                                headers: [
                                    { content: "Name", key: "name" },
                                    { content: "Role", key: "role" },
                                    { content: "Status", key: "status" },
                                ],
                                rows: [
                                    ["Alice", "Engineer", "Active"],
                                    ["Bob", "Designer", "Away"],
                                    ["Carol", "Manager", "Active"],
                                ],
                            }}
                        />
                    ),
                },
                {
                    name: "List",
                    element: (
                        <List>
                            <ListItem>Set up the project</ListItem>
                            <ListItem>Install dependencies</ListItem>
                            <ListItem>Start building</ListItem>
                        </List>
                    ),
                },
                {
                    name: "Timeline",
                    element: (
                        <Timeline
                            items={[
                                { label: "Project kickoff", description: "Initial planning" },
                                { label: "Development", description: "Build core features" },
                                { label: "Launch", description: "Ship to production" },
                            ]}
                        />
                    ),
                },
                {
                    name: "Badge / Tag / Chip",
                    element: (
                        <Row gap="s" wrap vertical="center">
                            <Badge>Badge</Badge>
                            <Tag label="Tag">Tag</Tag>
                            <Chip label="Chip">Chip</Chip>
                        </Row>
                    ),
                },
            ],
        },
        {
            id: "media",
            name: "Media",
            description: "Image, video, and media display components",
            components: [
                {
                    name: "Media (image)",
                    element: <Media src="/images/cover-01.jpg" aspectRatio="16/9" radius="l" enlarge />,
                },
                {
                    name: "Media (YouTube)",
                    element: <Media src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" aspectRatio="16/9" radius="l" controls sound={false} autoplay={true}/>,
                },
                {
                    name: "Avatar",
                    element: (
                        <Row gap="s" vertical="center">
                            <Avatar size="s" />
                            <Avatar size="m" />
                            <Avatar size="l" />
                        </Row>
                    ),
                },
                {
                    name: "AvatarGroup",
                    element: <AvatarGroup avatars={[{}, {}, {}, {}]} />,
                },
                {
                    name: "Carousel",
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
                    name: "CompareImage",
                    element: (
                        <CompareImage
                            leftContent={{ src: "/images/cover-01.jpg" }}
                            rightContent={{ src: "/images/cover-02.jpg" }}
                        />
                    ),
                },
                {
                    name: "Logo",
                    element: (
                        <Row gap="m" vertical="center">
                            <Logo icon="/trademarks/icon-dark.svg" size="xs" />
                            <Logo icon="/trademarks/icon-dark.svg" wordmark="/trademarks/type-dark.svg" size="xs" />
                        </Row>
                    ),
                },
                {
                    name: "LogoCloud",
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
        {
            id: "feedback",
            name: "Feedback & Status",
            description: "Loading states, indicators, and user feedback",
            components: [
                {
                    name: "Spinner",
                    element: (
                        <Row gap="m" vertical="center">
                            <Spinner size="s" />
                            <Spinner size="m" />
                            <Spinner size="l" />
                        </Row>
                    ),
                },
                {
                    name: "ProgressBar",
                    element: (
                        <Column gap="s" fillWidth>
                            <ProgressBar value={25} />
                            <ProgressBar value={65} />
                            <ProgressBar value={100} />
                        </Column>
                    ),
                },
                {
                    name: "Skeleton",
                    element: (
                        <Column gap="s" fillWidth>
                            <Skeleton shape="line" width="xl" />
                            <Skeleton shape="line" width="l" />
                            <Skeleton shape="line" width="m" />
                        </Column>
                    ),
                },
                {
                    name: "StatusIndicator",
                    element: (
                        <Row gap="m" vertical="center">
                            <Row gap="xs" vertical="center"><StatusIndicator color="green" /><Text variant="label-default-s">Online</Text></Row>
                            <Row gap="xs" vertical="center"><StatusIndicator color="yellow" /><Text variant="label-default-s">Away</Text></Row>
                            <Row gap="xs" vertical="center"><StatusIndicator color="red" /><Text variant="label-default-s">Offline</Text></Row>
                        </Row>
                    ),
                },
                {
                    name: "Feedback",
                    element: <Feedback icon title="Changes saved" description="Your settings have been updated successfully." />,
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
                    element: (
                        <>
                            <Button onClick={() => setDialogOpen(true)}>Open Dialog</Button>
                            <Dialog
                                isOpen={dialogOpen}
                                onClose={() => setDialogOpen(false)}
                                title="Confirm action"
                                description="Are you sure you want to continue?"
                                footer={
                                    <Row gap="s" horizontal="end" fillWidth>
                                        <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
                                        <Button onClick={() => setDialogOpen(false)}>Confirm</Button>
                                    </Row>
                                }
                            />
                        </>
                    ),
                },
                {
                    name: "Tooltip",
                    element: (
                        <Tooltip label="This is a tooltip">
                            <Button variant="secondary">Hover me</Button>
                        </Tooltip>
                    ),
                },
                {
                    name: "HoverCard",
                    element: (
                        <HoverCard trigger={<Button variant="secondary">Hover for card</Button>}>
                            <Column padding="m"><Text>Hover card content with extra detail</Text></Column>
                        </HoverCard>
                    ),
                },
                {
                    name: "DropdownWrapper",
                    element: (
                        <DropdownWrapper
                            trigger={<Button variant="secondary" suffixIcon="chevronDown">Options</Button>}
                            dropdown={
                                <Column padding="xs">
                                    <Option value="edit">Edit</Option>
                                    <Option value="duplicate">Duplicate</Option>
                                    <Option value="delete">Delete</Option>
                                </Column>
                            }
                        />
                    ),
                },
                {
                    name: "Toaster",
                    element: (
                        <Row gap="8" wrap>
                            <Button onClick={() => handleAddToast("success")}>Success</Button>
                            <Button onClick={() => handleAddToast("danger")}>Danger</Button>
                            <Button onClick={() => handleAddToast("warning")}>Warning</Button>
                            <Button onClick={() => handleAddToast("info")}>Info</Button>
                        </Row>
                    )
                }
            ],
        },
        {
            id: "navigation",
            name: "Navigation",
            description: "Navigation and menu components",
            components: [
                { name: "NavIcon", element: <NavIcon /> },
                {
                    name: "ContextMenu",
                    element: (
                        <ContextMenu
                            dropdown={
                                <Column padding="xs">
                                    <Option value="copy">Copy</Option>
                                    <Option value="paste">Paste</Option>
                                </Column>
                            }
                        >
                            <Button variant="secondary">Right-click me</Button>
                        </ContextMenu>
                    ),
                },
                { name: "UserMenu", element: <UserMenu /> },
                { name: "SmartLink", element: <SmartLink href="/">Smart Link to home</SmartLink> },
                { name: "ScrollToTop", element: <ScrollToTop /> },
            ],
        },
        {
            id: "accordions",
            name: "Accordions",
            description: "Expandable and collapsible content sections",
            components: [
                {
                    name: "Accordion",
                    element: (
                        <Accordion title="What is Once UI?">
                            <Text>A design system and component library for Next.js applications.</Text>
                        </Accordion>
                    ),
                },
                {
                    name: "AccordionGroup",
                    element: (
                        <AccordionGroup
                            items={[
                                { title: "Installation", content: <Text>Run pnpm install to get started.</Text> },
                                { title: "Configuration", content: <Text>Edit once-ui.config.js to customize the theme.</Text> },
                                { title: "Components", content: <Text>Import components from @once-ui-system/core.</Text> },
                            ]}
                        />
                    ),
                },
                {
                    name: "InteractiveDetails",
                    element: <InteractiveDetails onClick={() => {}} />,
                },
            ],
        },
        {
            id: "effects",
            name: "Effects & Animations",
            description: "Visual effects and animation wrappers",
            components: [
                { name: "RevealFx", element: <RevealFx><Text>Reveal Effect</Text></RevealFx> },
                { name: "LetterFx", element: <LetterFx>Letter Effect</LetterFx> },
                { name: "TypeFx", element: <TypeFx words="Type Effect">Type Effect</TypeFx> },
                { name: "CountFx", element: <CountFx value={100} /> },
                { name: "CountdownFx", element: <CountdownFx targetDate={new Date(Date.now() + 3600000)} /> },
                { name: "Fade", element: <Fade><Text>Fade Effect</Text></Fade> },
                { name: "Pulse", element: <Pulse><Text>Pulse Effect</Text></Pulse> },
                { name: "Hover", element: <Hover trigger={<Text>Test</Text>} overlay={<Column background="overlay"></Column>} onClick={(e) => console.log(e)}><Text>Hover Effect</Text></Hover> },
                { name: "FlipFx", element: <FlipFx back={<Text>Back</Text>} front={<Text>Front</Text>} onClick={(e) => console.log(e)}><Text>Flip Effect</Text></FlipFx> },
                { name: "GlitchFx", element: <GlitchFx><Text>Glitch Effect</Text></GlitchFx> },
                { name: "HoloFx", element: <HoloFx><Text>Holo Effect</Text></HoloFx> },
                { name: "MatrixFx", element: <MatrixFx><Text>Matrix Effect</Text></MatrixFx> },
                { name: "ShineFx", element: <ShineFx><Text>Shine Effect</Text></ShineFx> },
                { name: "TiltFx", element: <TiltFx><Text>Tilt Effect</Text></TiltFx> },
                { name: "WeatherFx", element: <WeatherFx><Text>Weather Effect</Text></WeatherFx> },
                { name: "FadingLettersFx", element: <FadingLettersFx text="Fading Letters Effect" animationState="entering" variant="heading-strong-m" /> },
            ],
        },
        {
            id: "date-time",
            name: "Date & Time",
            description: "Date pickers and calendar inputs",
            components: [
                { name: "DatePicker", element: <DatePicker /> },
                { name: "DateInput", element: <DateInput id="demo-date" label="Date" placeholder="Select a date" /> },
                { name: "DateRangeInput", element: <DateRangeInput id="demo-date-range" startLabel="Start" endLabel="End" placeholder="Select range" /> },
            ],
        },
        {
            id: "specialized",
            name: "Specialized",
            description: "Utility and specialized components",
            components: [
                {
                    name: "Icon",
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
                { name: "Line", element: <Line /> },
                { name: "Arrow", element: <Arrow trigger="hover here" /> },
                { name: "Kbd", element: <Row gap="xs" vertical="center"><Kbd>Ctrl</Kbd><Text variant="label-default-s">+</Text><Kbd>K</Kbd></Row> },
                { name: "Mask", element: <Mask><Text>Masked content</Text></Mask> },
                { name: "Particle", element: <Particle /> },
                {
                    name: "User",
                    element: (
                        <Column gap="s">
                            <User name="Alice Johnson" subline="Engineer" />
                            <User name="Bob Smith" subline="Designer" />
                        </Column>
                    ),
                },
                {
                    name: "CursorCard",
                    element: (
                        <CursorCard>
                            <Flex padding="l" radius="l" background="neutral-medium" center fillWidth>
                                <Text>Move cursor over me</Text>
                            </Flex>
                        </CursorCard>
                    ),
                },
                {
                    name: "OgCard",
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
                { name: "Flex", element: <Flex padding="l" radius="l" fillWidth><Text>A simple card component</Text></Flex> },
                { name: "Background", element: <Background style={{ height: "8rem", position: "relative" }}><Text>Background</Text></Background> },
                { name: "StylePanel", element: <StylePanel /> },
                { name: "ThemeSwitcher", element: <ThemeSwitcher /> },
                { name: "EmojiPicker", element: <EmojiPicker onSelect={() => {}} /> },
                {
                    name: "EmojiPickerDropdown",
                    element: <EmojiPickerDropdown trigger={<Button variant="secondary">Pick Emoji</Button>} onSelect={() => {}} />,
                },
                {
                    name: "Kbar",
                    element: (
                        <Kbar items={[
                            { id: "home", name: "Home", section: "Navigation", shortcut: ["H"], keywords: "home" },
                            { id: "search", name: "Search", section: "Navigation", shortcut: ["S"], keywords: "search" },
                        ]}>
                            <Button variant="secondary" prefixIcon="search">Search</Button>
                        </Kbar>
                    ),
                },
                {
                    name: "Scroller",
                    element: (
                        <Scroller>
                            <Row gap="s">
                                {[1, 2, 3, 4, 5, 6].map((n) => (
                                    <Flex key={n} padding="m" paddingX="l" background="neutral-medium" radius="m">
                                        <Text variant="label-default-s">Item {n}</Text>
                                    </Flex>
                                ))}
                            </Row>
                        </Scroller>
                    ),
                },
                {
                    name: "AutoScroll",
                    element: (
                        <AutoScroll>
                            <Row gap="s">
                                {["Once", "UI", "Design", "System", "Components"].map((word) => (
                                    <Flex key={word} padding="s" paddingX="m" background="brand-medium" radius="full">
                                        <Text variant="label-default-s" onBackground="brand-strong">{word}</Text>
                                    </Flex>
                                ))}
                            </Row>
                        </AutoScroll>
                    ),
                },
                {
                    name: "Swiper",
                    element: (
                        <Swiper
                            aspectRatio="16/9"
                            items={[
                                { slide: <Media src="/images/cover-03.jpg" aspectRatio="16/9" /> },
                                { slide: <Media src="/images/cover-04.jpg" aspectRatio="16/9" /> },
                                { slide: <Media src="/images/cover-05.jpg" aspectRatio="16/9" /> },
                            ]}
                        />
                    ),
                },
                {
                    name: "MasonryGrid",
                    element: (
                        <MasonryGrid columns={3}>
                            {[4, 8, 6, 5, 7, 4].map((h, i) => (
                                <Flex key={i} background="neutral-medium" radius="m" padding="m" style={{ height: `${h}rem` }} center>
                                    <Text variant="label-default-s">{i + 1}</Text>
                                </Flex>
                            ))}
                        </MasonryGrid>
                    ),
                },
                {
                    name: "InfiniteScroll",
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
            id: "charts",
            name: "Charts",
            description: "Data visualization components",
            components: [
                {
                    name: "BarChart",
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
                    name: "LineChart",
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
                style={{ position: "sticky", top: "2rem", alignSelf: "flex-start", minWidth: "12rem" }}
            >
                <Text variant="label-default-s" onBackground="neutral-weak" marginBottom="s">Components</Text>
                <Flex
                    padding="s"
                    paddingX="m"
                    radius="m"
                    cursor="pointer"
                    background={activeCategory === null ? "neutral-medium" : undefined}
                    onClick={() => setActiveCategory(null)}
                >
                    <Text variant="label-default-s" onBackground={activeCategory === null ? "neutral-strong" : "neutral-weak"}>All</Text>
                </Flex>
                {categories.map((cat) => (
                    <Flex
                        key={cat.id}
                        padding="s"
                        paddingX="m"
                        radius="m"
                        cursor="pointer"
                        background={activeCategory === cat.id ? "neutral-medium" : undefined}
                        onClick={() => {
                            setActiveCategory(cat.id);
                            scrollToSection(cat.id);
                        }}
                    >
                        <Text variant="label-default-s" onBackground={activeCategory === cat.id ? "neutral-strong" : "neutral-weak"}>
                            {cat.name}
                        </Text>
                    </Flex>
                ))}
            </Column>

            <Column gap="xl" flex={1} style={{ minWidth: 0 }}>
                {filteredCategories.map((category) => (
                    <Column key={category.id} id={category.id} gap="m" fillWidth>
                        <Column gap="xs">
                            <Heading variant="heading-strong-l">{category.name}</Heading>
                            <Text variant="body-default-s" onBackground="neutral-weak">{category.description}</Text>
                        </Column>
                        <Line />
                        <Grid columns="2" gap="m" fillWidth>
                            {category.components.map((comp) => (
                                <DemoCard key={comp.name} name={comp.name}>
                                    {comp.element}
                                </DemoCard>
                            ))}
                        </Grid>
                    </Column>
                ))}
            </Column>
        </Row>
    );
}
