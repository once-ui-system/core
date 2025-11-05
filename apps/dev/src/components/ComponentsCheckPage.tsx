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
    Flex,
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
    Card,
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
} from "@once-ui-system/core";

interface ComponentCategory {
    name: string;
    description: string;
    components: {
        name: string;
        element: React.ReactNode[] | React.ReactNode;
    }[];
}

export default function ComponentsCheck() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const categories: ComponentCategory[] = [
        {
            name: "Layout",
            description: "Core layout components for structuring content",
            components: [
                { name: "Column", element: <Column padding="m" background="neutral-medium" radius="l"><Text>Column Layout</Text></Column> },
                { name: "Row", element: <Row padding="m" background="neutral-medium" radius="l"><Text>Row Layout</Text></Row> },
                { name: "Flex", element: <Flex padding="m" background="neutral-medium" radius="l"><Text>Flex Layout</Text></Flex> },
                { name: "Grid", element: <Grid columns="2" gap="m" fillWidth><Column padding="m" background="neutral-medium" radius="l"><Text>Grid 1</Text></Column><Column padding="m" background="neutral-medium" radius="l"><Text>Grid 2</Text></Column></Grid> },
            ],
        },
        {
            name: "Typography",
            description: "Text and heading components",
            components: [
                { name: "Heading", element: <Heading variant="heading-strong-l">Heading Component</Heading> },
                { name: "Text", element: <Text>This is a text component</Text> },
                { name: "InlineCode", element: <InlineCode>const x = 5;</InlineCode> },
                { name: "BlockQuote", element: <BlockQuote><Text>This is a blockquote</Text></BlockQuote> },
            ],
        },
        {
            name: "Buttons & Inputs",
            description: "Interactive form and button components",
            components: [
                { name: "Button", element: <Button>Click me</Button> },
                { name: "IconButton", element: <IconButton icon="heart" /> },
                { name: "Input", element: [
                    <Input key={"input-1"} id="input-test" placeholder="label"/>,
                    <Input key={"input-2"} id="input-test-2" placeholder="label" label="label test"/>,
                    <Input key={"input-3"} id="input-test-3" label="label test"/>
                ]},
                { name: "Textarea", element: <Textarea id="textarea-test" placeholder="Enter text..." lines={3} /> },
                { name: "Checkbox", element: <Checkbox label="Checkbox" /> },
                { name: "Switch", element: <Switch isChecked={false} onToggle={() => console.log()} label="Toggle" /> },
                { name: "RadioButton", element: <RadioButton label="Radio" /> },
                { name: "Select", element: <Select id="select" options={[{ label: "Option 1", value: "1" }]} /> },
                { name: "PasswordInput", element: <PasswordInput id="password-test" placeholder="Password" /> },
                { name: "NumberInput", element: <NumberInput id="number-test" placeholder="Number" /> },
                { name: "ColorInput", element: <ColorInput onChange={(e) => console.log(e)} value="#ffffff" id="color-test" /> },
                { name: "OTPInput", element: <OTPInput length={4} /> },
            ],
        },
        {
            name: "Data Display",
            description: "Components for displaying data",
            components: [
                { name: "Table", element: <Table data={{ headers: [{ content: "Name", key: "name" }], rows: [["John"]] }} /> },
                { name: "List", element: <List><ListItem>Item 1</ListItem><ListItem>Item 2</ListItem></List> },
                { name: "Timeline", element: <Timeline items={[{ label: "Event 1" }, { label: "Event 2" }]} /> },
                { name: "Badge", element: <Badge>Badge</Badge> },
                { name: "Tag", element: <Tag label="tag label">Tag</Tag> },
                { name: "Chip", element: <Chip label="chip label">Chip</Chip> },
            ],
        },
        {
            name: "Media",
            description: "Image and media components",
            components: [
                { name: "Avatar", element: <Avatar size="m" /> },
                { name: "AvatarGroup", element: <AvatarGroup avatars={[{}, {}, {}]} /> },
                { name: "Media", element: <Media src="/images/cover-01.jpg" aspectRatio="16/9" radius="l" /> },
                { name: "Carousel", element: <Row height={32} fillWidth><Carousel items={[{ slide: "/images/demo.jpg" }]} /></Row> },
                { name: "Logo", element: <Logo icon="/trademarks/icon-dark.svg" size="xs" /> },
                { name: "LogoCloud", element: <LogoCloud logos={[{ icon: "/trademarks/icon-dark.svg" }]} /> },
            ],
        },
        {
            name: "Feedback & Status",
            description: "Components for user feedback and status indication",
            components: [
                { name: "Spinner", element: <Spinner /> },
                { name: "ProgressBar", element: <ProgressBar value={65} /> },
                { name: "Skeleton", element: <Skeleton shape="block" width="m"/> },
                { name: "StatusIndicator", element: <StatusIndicator color="indigo" /> },
                { name: "Feedback", element: <Feedback icon title="Success" description="Operation completed" /> },
            ],
        },
        {
            name: "Overlays & Modals",
            description: "Components for overlays and modal dialogs",
            components: [
                { name: "Dialog", element: <Button onClick={() => {}}>Open Dialog</Button> },
                { name: "Tooltip", element: <Tooltip label="Tooltip text"><Button>Hover me</Button></Tooltip> },
                { name: "HoverCard", element: <HoverCard><Button>Hover Card</Button></HoverCard> },
                { name: "DropdownWrapper", element: <DropdownWrapper trigger={<Button>Dropdown</Button>} dropdown={<Column><Option value="1">Option 1</Option></Column>} /> },
            ],
        },
        {
            name: "Navigation",
            description: "Navigation and menu components",
            components: [
                { name: "NavIcon", element: <NavIcon /> },
                { name: "ContextMenu", element: <ContextMenu dropdown={<Option value="1">Option 1</Option>}><Button>Right-click</Button></ContextMenu> },
                { name: "UserMenu", element: <UserMenu /> },
                { name: "SmartLink", element: <SmartLink href="/">Smart Link</SmartLink> },
            ],
        },
        {
            name: "Accordions & Collapsibles",
            description: "Expandable content components",
            components: [
                { name: "Accordion", element: <Accordion title="Accordion"><Text>Content</Text></Accordion> },
                { name: "AccordionGroup", element: <AccordionGroup items={[{ title: "Item 1", content: <Text>Content 1</Text> }]} /> },
                { name: "InteractiveDetails", element: <InteractiveDetails onClick={() => console.log()}></InteractiveDetails> },
            ],
        },
        {
            name: "Effects & Animations",
            description: "Visual effects and animation components",
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
            ],
        },
        {
            name: "Date & Time",
            description: "Date and time picker components",
            components: [
                { name: "DatePicker", element: <DatePicker /> },
                { name: "DateInput", element: <DateInput id="date-test" placeholder="Select date" /> },
                { name: "DateRangeInput", element: <DateRangeInput startLabel="2000" endLabel="2030" id="date-range-test" placeholder="Select range" /> },
            ],
        },
        {
            name: "Specialized",
            description: "Specialized and utility components",
            components: [
                { name: "Icon", element: <Icon name="heart" /> },
                { name: "Line", element: <Line /> },
                { name: "Arrow", element: <Arrow trigger="wow" /> },
                { name: "Mask", element: <Mask><Text>Masked</Text></Mask> },
                { name: "Particle", element: <Particle /> },
                { name: "Scroller", element: <Scroller><Text>Scrolling content</Text></Scroller> },
                { name: "AutoScroll", element: <AutoScroll><Text>Auto scroll</Text></AutoScroll> },
                { name: "ScrollToTop", element: <ScrollToTop /> },
                { name: "Swiper", element: <Swiper items={[{ slide: <Text>Slide 1</Text> }]} /> },
                { name: "MasonryGrid", element: <MasonryGrid columns={3}><Column background="neutral-medium" radius="l" padding="m"><Text>Item</Text></Column></MasonryGrid> },
                { name: "InfiniteScroll", element: <InfiniteScroll items={[]} loadMore={async () => false} renderItem={(item, index) => <Text>Test</Text>}/> },
                { name: "CompareImage", element: <CompareImage leftContent={{ src: "/images/cover-01.jpg"}} rightContent={{ src: "/images/cover-02.jpg"}} /> },
                { name: "CursorCard", element: <CursorCard><Text>Cursor Card</Text></CursorCard> },
                { name: "OgCard", element: <OgCard url="https://once-ui.com" /> },
                { name: "StylePanel", element: <StylePanel /> },
                { name: "ThemeSwitcher", element: <ThemeSwitcher /> },
                { name: "SegmentedControl", element: <SegmentedControl onToggle={(str) => console.log(str)} buttons={[{ value: "1" }]} /> },
                { name: "ToggleButton", element: <ToggleButton label="Toggle" /> },
                { name: "TagInput", element: <TagInput value={["str1", "str2"]} onChange={() => console.log} id="tags" /> },
                { name: "EmojiPicker", element: <EmojiPicker onSelect={() => {}} /> },
                { name: "EmojiPickerDropdown", element: <EmojiPickerDropdown trigger={<Button>Emoji</Button>} onSelect={() => {}} /> },
                { name: "Kbar", element: <Kbar items={[{ id: "1", name: "Search", section: "Navigation", shortcut: ["desc"], keywords: "test"}]}><Button>Search</Button></Kbar> },
                { name: "User", element: <User name="John Doe" /> },
                { name: "Background", element: <Background><Text>Background</Text></Background> },
                { name: "Card", element: <Card><Text>Card</Text></Card> },
                { name: "Kbd", element: <Kbd>Ctrl</Kbd> },
            ],
        },
        {
            name: "Charts",
            description: "Data visualization components",
            components: [
                { name: "BarChart", element: <BarChart title="Sample" series={[{ key: "Data", color: "blue" }]} data={[{ label: "Item", Data: 10 }]} /> },
                { name: "LineChart", element: <LineChart title="Sample" series={[{ key: "Data", color: "blue" }]} data={[{ date: new Date(), Data: 10 }]} /> },
            ],
        },
    ];

    return (
        <Column fill padding="l" gap="xl">
            <Column gap="m" maxWidth="xl">
                <Grid columns={3} gap="s">
                    <Button
                        variant={selectedCategory === null ? "primary" : "secondary"}
                        onClick={() => setSelectedCategory(null)}
                    >
                        All
                    </Button>
                    {categories.map((category) => (
                        <Button
                            key={category.name}
                            variant={selectedCategory === category.name ? "primary" : "secondary"}
                            onClick={() => setSelectedCategory(category.name)}
                        >
                            {category.name}
                        </Button>
                    ))}
                </Grid>
            </Column>

            <Grid columns={2} gap="l" fillWidth>
                {categories
                    .filter((cat) => selectedCategory === null || selectedCategory === cat.name)
                    .map((category) => (
                        <Column key={category.name} gap="m" fillWidth>
                            <Row gap="s" fillWidth vertical="center">
                                <Heading variant="heading-strong-l">{category.name}</Heading>
                                <Text variant="body-default-s" onBackground="neutral-weak">
                                    {category.description}
                                </Text>
                            </Row>

                            <Grid columns={3} gap="m" fillWidth>
                                {category.components.map((component, idx) => {
                                    const id = `${category.name}::${component.name}::${idx}`;

                                    return (
                                        <DropdownWrapper
                                            key={id}
                                            fillWidth
                                            trigger={
                                                <Card
                                                    padding="m"
                                                    radius="l"
                                                    fillWidth
                                                    border="neutral-alpha-medium"
                                                    background="surface"
                                                    cursor="pointer"
                                                    center
                                                >
                                                    <Row horizontal="between" vertical="center" fillWidth>
                                                        <Text variant="heading-strong-m">{component.name}</Text>
                                                        <Icon name="chevronDown" size="m" />
                                                    </Row>
                                                </Card>
                                            }
                                            dropdown={
                                                <Column
                                                    radius="l"
                                                    border="neutral-alpha-medium"
                                                    fillWidth
                                                    background="surface"
                                                    padding="m"
                                                    cursor="pointer"
                                                    center
                                                    gap="m"
                                                >
                                                    {component.element}
                                                </Column>
                                            }
                                        />
                                    );
                                })}
                            </Grid>
                        </Column>
                    ))}
            </Grid>
        </Column>
    );
}
