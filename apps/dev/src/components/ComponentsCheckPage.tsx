"use client";

import React, { useState, useMemo } from "react";
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
    Sidebar,
    SidebarProvider,
} from "@once-ui-system/core";

interface ComponentItem {
    name: string;
    element: React.ReactNode[] | React.ReactNode;
    status?: "stable" | "beta" | "new" | "deprecated";
    tags?: string[];
}

interface ComponentCategory {
    name: string;
    description: string;
    icon: string;
    components: ComponentItem[];
}

export default function ComponentsCheck() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set());

    const categories: ComponentCategory[] = [
        {
            name: "Layout",
            description: "Core layout components for structuring content",
            icon: "layout",
            components: [
                { name: "Column", element: <Column padding="m" background="neutral-medium" radius="l"><Text>Column Layout</Text></Column>, status: "stable", tags: ["layout", "container"] },
                { name: "Row", element: <Row padding="m" background="neutral-medium" radius="l"><Text>Row Layout</Text></Row>, status: "stable", tags: ["layout", "container"] },
                { name: "Flex", element: <Flex padding="m" background="neutral-medium" radius="l"><Text>Flex Layout</Text></Flex>, status: "stable", tags: ["layout", "container"] },
                { name: "Grid", element: <Grid columns="2" gap="m" fillWidth><Column padding="m" background="neutral-medium" radius="l"><Text>Grid 1</Text></Column><Column padding="m" background="neutral-medium" radius="l"><Text>Grid 2</Text></Column></Grid>, status: "stable", tags: ["layout", "grid"] },
            ],
        },
        {
            name: "Typography",
            description: "Text and heading components",
            icon: "text",
            components: [
                { name: "Heading", element: <Heading variant="heading-strong-l">Heading Component</Heading>, status: "stable", tags: ["text", "typography"] },
                { name: "Text", element: <Text>This is a text component</Text>, status: "stable", tags: ["text", "typography"] },
                { name: "InlineCode", element: <InlineCode>const x = 5;</InlineCode>, status: "stable", tags: ["code", "typography"] },
                { name: "BlockQuote", element: <BlockQuote><Text>This is a blockquote</Text></BlockQuote>, status: "stable", tags: ["text", "quote"] },
            ],
        },
        {
            name: "Buttons & Inputs",
            description: "Interactive form and button components",
            icon: "cursor",
            components: [
                { name: "Button", element: <Button>Click me</Button>, status: "stable", tags: ["button", "interactive"] },
                { name: "IconButton", element: <IconButton icon="heart" />, status: "stable", tags: ["button", "icon"] },
                { name: "Input", element: [
                        <Input key={"input-1"} id="input-test" placeholder="label"/>,
                        <Input key={"input-2"} id="input-test-2" placeholder="label" label="label test"/>,
                        <Input key={"input-3"} id="input-test-3" label="label test"/>
                    ], status: "stable", tags: ["input", "form"] },
                { name: "Textarea", element: <Textarea id="textarea-test" placeholder="Enter text..." lines={3} />, status: "stable", tags: ["input", "form"] },
                { name: "Checkbox", element: <Checkbox label="Checkbox" />, status: "stable", tags: ["input", "form"] },
                { name: "Switch", element: <Switch isChecked={false} onToggle={() => console.log()} label="Toggle" />, status: "stable", tags: ["input", "toggle"] },
                { name: "RadioButton", element: <RadioButton label="Radio" />, status: "stable", tags: ["input", "form"] },
                { name: "Select", element: <Select id="select" options={[{ label: "Option 1", value: "1" }]} />, status: "stable", tags: ["input", "dropdown"] },
                { name: "PasswordInput", element: <PasswordInput id="password-test" placeholder="Password" />, status: "stable", tags: ["input", "form", "security"] },
                { name: "NumberInput", element: <NumberInput id="number-test" placeholder="Number" />, status: "stable", tags: ["input", "form"] },
                { name: "ColorInput", element: <ColorInput onChange={(e) => console.log(e)} value="#ffffff" id="color-test" />, status: "stable", tags: ["input", "color"] },
                { name: "OTPInput", element: <OTPInput length={4} />, status: "stable", tags: ["input", "security"] },
                {
                    name: "Sidebar",
                    element: (
                      <Column fillWidth gap="m">
                        <Text variant="body-default-s" onBackground="neutral-weak">
                          Interactive sidebar with expand/collapse. Click the chevron to toggle.
                        </Text>
                        <Row fillWidth gap="m" style={{ minHeight: "500px" }}>
                          {/* Expanded Sidebar Demo */}
                          <Column fillWidth style={{ position: "relative", minHeight: "500px" }}>
                            <Text variant="label-strong-s" marginBottom="s">Expanded State</Text>
                            <Column 
                              fillWidth 
                              style={{ 
                                position: "relative", 
                                height: "480px",
                                border: "1px solid var(--neutral-alpha-medium)",
                                borderRadius: "var(--radius-l)",
                                overflow: "hidden"
                              }}
                            >
                              <SidebarProvider
                                user={{
                                    id: "u1",
                                    name: "Jane Doe",
                                    role: "Product Manager",
                                    initials: "JD",
                                    email: "jane@example.com",
                                }}
                                navItems={[
                                    {
                                        id: "overview",
                                        label: "Overview",
                                        href: "/dashboard",
                                        icon: "home",
                                    },
                                    {
                                        id: "analytics",
                                        label: "Analytics",
                                        href: "/dashboard/analytics",
                                        icon: "analytics",
                                        badge: 12,
                                        badgeVariant: "info",
                                    },
                                    {
                                        id: "projects",
                                        label: "Projects",
                                        href: "/dashboard/projects",
                                        icon: "folder",
                                        isNew: true,
                                    },
                                    {
                                        id: "team",
                                        label: "Team",
                                        href: "/dashboard/team",
                                        icon: "users",
                                        badge: "4",
                                    },
                                    {
                                        id: "calendar",
                                        label: "Calendar",
                                        href: "/dashboard/calendar",
                                        icon: "calendar",
                                    },
                                    {
                                        id: "messages",
                                        label: "Messages",
                                        href: "/dashboard/messages",
                                        icon: "mail",
                                        badge: 3,
                                        badgeVariant: "warning",
                                    },
                                    {
                                        id: "settings",
                                        label: "Settings",
                                        href: "/dashboard/settings",
                                        icon: "settings",
                                    },
                                ]}
                                config={{
                                    width: { expanded: 280, collapsed: 72 },
                                    persistState: false,
                                    defaultCollapsed: false,
                                }}
                              >
                                  <Sidebar
                                    logoText="Acme Inc"
                                    homeRoute="/dashboard"
                                    showUserProfile
                                    showThemeSwitcher
                                    navigationSections={[
                                        {
                                            id: "main",
                                            titleKey: "Main Navigation",
                                            items: [
                                                {
                                                    id: "overview",
                                                    label: "Overview",
                                                    href: "/dashboard",
                                                    icon: "home",
                                                },
                                                {
                                                    id: "analytics",
                                                    label: "Analytics",
                                                    href: "/dashboard/analytics",
                                                    icon: "analytics",
                                                    badge: 12,
                                                    badgeVariant: "info",
                                                },
                                                {
                                                    id: "projects",
                                                    label: "Projects",
                                                    href: "/dashboard/projects",
                                                    icon: "folder",
                                                    isNew: true,
                                                },
                                            ]
                                        },
                                        {
                                            id: "collaboration",
                                            titleKey: "Collaboration",
                                            items: [
                                                {
                                                    id: "team",
                                                    label: "Team",
                                                    href: "/dashboard/team",
                                                    icon: "users",
                                                    badge: "4",
                                                },
                                                {
                                                    id: "calendar",
                                                    label: "Calendar",
                                                    href: "/dashboard/calendar",
                                                    icon: "calendar",
                                                },
                                                {
                                                    id: "messages",
                                                    label: "Messages",
                                                    href: "/dashboard/messages",
                                                    icon: "mail",
                                                    badge: 3,
                                                    badgeVariant: "warning",
                                                },
                                            ]
                                        },
                                        {
                                            id: "system",
                                            titleKey: "System",
                                            items: [
                                                {
                                                    id: "settings",
                                                    label: "Settings",
                                                    href: "/dashboard/settings",
                                                    icon: "settings",
                                                },
                                            ]
                                        }
                                    ]}
                                    onNavigate={(item) => console.log("Navigate ->", item.label)}
                                  />
                              </SidebarProvider>
                            </Column>
                          </Column>

                          {/* Collapsed Sidebar Demo */}
                          <Column fillWidth style={{ position: "relative", minHeight: "500px" }}>
                            <Text variant="label-strong-s" marginBottom="s">Collapsed State (Icons Only)</Text>
                            <Column 
                              fillWidth 
                              style={{ 
                                position: "relative", 
                                height: "480px",
                                border: "1px solid var(--neutral-alpha-medium)",
                                borderRadius: "var(--radius-l)",
                                overflow: "hidden"
                              }}
                            >
                              <SidebarProvider
                                user={{
                                    id: "u2",
                                    name: "John Smith",
                                    role: "Developer",
                                    initials: "JS",
                                    email: "john@example.com",
                                }}
                                navItems={[
                                    {
                                        id: "overview",
                                        label: "Overview",
                                        href: "/dashboard",
                                        icon: "home",
                                    },
                                    {
                                        id: "analytics",
                                        label: "Analytics",
                                        href: "/dashboard/analytics",
                                        icon: "analytics",
                                        badge: 12,
                                        badgeVariant: "info",
                                    },
                                    {
                                        id: "projects",
                                        label: "Projects",
                                        href: "/dashboard/projects",
                                        icon: "folder",
                                        isNew: true,
                                    },
                                    {
                                        id: "team",
                                        label: "Team",
                                        href: "/dashboard/team",
                                        icon: "users",
                                        badge: "4",
                                    },
                                    {
                                        id: "calendar",
                                        label: "Calendar",
                                        href: "/dashboard/calendar",
                                        icon: "calendar",
                                    },
                                    {
                                        id: "messages",
                                        label: "Messages",
                                        href: "/dashboard/messages",
                                        icon: "mail",
                                        badge: 3,
                                        badgeVariant: "warning",
                                    },
                                    {
                                        id: "settings",
                                        label: "Settings",
                                        href: "/dashboard/settings",
                                        icon: "settings",
                                    },
                                ]}
                                config={{
                                    width: { expanded: 280, collapsed: 72 },
                                    persistState: false,
                                    defaultCollapsed: true,
                                }}
                              >
                                  <Sidebar
                                    logoText="Acme Inc"
                                    homeRoute="/dashboard"
                                    showUserProfile
                                    showThemeSwitcher={false}
                                    navigationSections={[
                                        {
                                            id: "main",
                                            titleKey: "Main Navigation",
                                            items: [
                                                {
                                                    id: "overview",
                                                    label: "Overview",
                                                    href: "/dashboard",
                                                    icon: "home",
                                                },
                                                {
                                                    id: "analytics",
                                                    label: "Analytics",
                                                    href: "/dashboard/analytics",
                                                    icon: "analytics",
                                                    badge: 12,
                                                    badgeVariant: "info",
                                                },
                                                {
                                                    id: "projects",
                                                    label: "Projects",
                                                    href: "/dashboard/projects",
                                                    icon: "folder",
                                                    isNew: true,
                                                },
                                            ]
                                        },
                                        {
                                            id: "collaboration",
                                            titleKey: "Collaboration",
                                            items: [
                                                {
                                                    id: "team",
                                                    label: "Team",
                                                    href: "/dashboard/team",
                                                    icon: "users",
                                                    badge: "4",
                                                },
                                                {
                                                    id: "calendar",
                                                    label: "Calendar",
                                                    href: "/dashboard/calendar",
                                                    icon: "calendar",
                                                },
                                                {
                                                    id: "messages",
                                                    label: "Messages",
                                                    href: "/dashboard/messages",
                                                    icon: "mail",
                                                    badge: 3,
                                                    badgeVariant: "warning",
                                                },
                                            ]
                                        },
                                        {
                                            id: "system",
                                            titleKey: "System",
                                            items: [
                                                {
                                                    id: "settings",
                                                    label: "Settings",
                                                    href: "/dashboard/settings",
                                                    icon: "settings",
                                                },
                                            ]
                                        }
                                    ]}
                                    onNavigate={(item) => console.log("Navigate ->", item.label)}
                                  />
                              </SidebarProvider>
                            </Column>
                          </Column>
                        </Row>
                      </Column>
                    ),
                    status: "new",
                    tags: ["navigation", "layout", "sidebar"]
                }
            ],
        },
        {
            name: "Data Display",
            description: "Components for displaying data",
            icon: "table",
            components: [
                { 
                    name: "Table", 
                    element: (
                        <Column fillWidth gap="xl">
                            <Column gap="s">
                                <Text variant="label-strong-m">Basic Sortable Table</Text>
                                <Text variant="body-default-s" onBackground="neutral-weak">
                                    Click column headers to sort data
                                </Text>
                                <Table 
                                    data={{ 
                                        headers: [
                                            { content: "Name", key: "name", sortable: true },
                                            { content: "Role", key: "role", sortable: true },
                                            { content: "Status", key: "status", sortable: true }
                                        ], 
                                        rows: [
                                            ["John Doe", "Developer", <Tag key="1">Active</Tag>],
                                            ["Jane Smith", "Designer", <Tag key="2">Active</Tag>],
                                            ["Bob Johnson", "Manager", <Tag key="3">Away</Tag>],
                                            ["Alice Williams", "Developer", <Tag key="4">Active</Tag>],
                                            ["Charlie Brown", "QA Engineer", <Tag key="5">Active</Tag>]
                                        ] 
                                    }} 
                                    onRowClick={(i: number) => console.log("Row clicked:", i)}
                                />
                            </Column>

                            <Column gap="s">
                                <Text variant="label-strong-m">Searchable Table</Text>
                                <Text variant="body-default-s" onBackground="neutral-weak">
                                    Real-time search across all columns
                                </Text>
                                <Table 
                                    searchable
                                    searchPlaceholder="Search products..."
                                    data={{ 
                                        headers: [
                                            { content: "Product", key: "product", sortable: true },
                                            { content: "Price", key: "price", sortable: true },
                                            { content: "Stock", key: "stock", sortable: true },
                                            { content: "Category", key: "category", sortable: true }
                                        ], 
                                        rows: [
                                            ["Laptop Pro 15\"", "$1,299", "12 units", "Electronics"],
                                            ["Wireless Mouse", "$29", "45 units", "Accessories"],
                                            ["Mechanical Keyboard", "$79", "23 units", "Accessories"],
                                            ["4K Monitor 27\"", "$399", "8 units", "Electronics"],
                                            ["USB-C Hub", "$49", "67 units", "Accessories"],
                                            ["Noise-Canceling Headphones", "$249", "31 units", "Audio"],
                                            ["Webcam HD", "$89", "19 units", "Electronics"],
                                            ["Desk Lamp LED", "$39", "54 units", "Office"]
                                        ] 
                                    }} 
                                />
                            </Column>

                            <Column gap="s">
                                <Text variant="label-strong-m">Striped with Actions</Text>
                                <Text variant="body-default-s" onBackground="neutral-weak">
                                    Alternating row colors with action buttons
                                </Text>
                                <Table 
                                    striped
                                    hoverable
                                    data={{ 
                                        headers: [
                                            { content: "User", key: "user", sortable: true },
                                            { content: "Email", key: "email", sortable: true },
                                            { content: "Last Login", key: "login", sortable: true }
                                        ], 
                                        rows: [
                                            ["Alice Cooper", "alice@example.com", "2 hours ago"],
                                            ["Bob Dylan", "bob@example.com", "1 day ago"],
                                            ["Charlie Parker", "charlie@example.com", "3 days ago"],
                                            ["Diana Ross", "diana@example.com", "1 week ago"],
                                            ["Elvis Presley", "elvis@example.com", "2 weeks ago"]
                                        ] 
                                    }}
                                    actions={[
                                        {
                                            icon: "edit",
                                            tooltip: "Edit user",
                                            onClick: (i: number) => console.log("Edit user", i)
                                        },
                                        {
                                            icon: "mail",
                                            tooltip: "Send email",
                                            variant: "secondary",
                                            onClick: (i: number) => console.log("Email user", i)
                                        },
                                        {
                                            icon: "trash",
                                            tooltip: "Delete user",
                                            variant: "danger",
                                            onClick: (i: number) => console.log("Delete user", i)
                                        }
                                    ]}
                                />
                            </Column>

                            <Column gap="s">
                                <Text variant="label-strong-m">Compact with Search & Actions</Text>
                                <Text variant="body-default-s" onBackground="neutral-weak">
                                    Dense layout combining search and actions
                                </Text>
                                <Table 
                                    compact
                                    searchable
                                    searchPlaceholder="Search orders..."
                                    data={{ 
                                        headers: [
                                            { content: "Order #", key: "order", sortable: true },
                                            { content: "Customer", key: "customer", sortable: true },
                                            { content: "Amount", key: "amount", sortable: true },
                                            { content: "Status", key: "status", sortable: true }
                                        ], 
                                        rows: [
                                            ["#1001", "John Smith", "$299.00", <Tag key="1">Shipped</Tag>],
                                            ["#1002", "Sarah Johnson", "$149.50", <Tag key="2">Processing</Tag>],
                                            ["#1003", "Mike Wilson", "$599.99", <Tag key="3">Delivered</Tag>],
                                            ["#1004", "Emma Davis", "$89.00", <Tag key="4">Pending</Tag>],
                                            ["#1005", "Chris Brown", "$1,299.00", <Tag key="5">Shipped</Tag>],
                                            ["#1006", "Lisa Anderson", "$45.50", <Tag key="6">Delivered</Tag>]
                                        ] 
                                    }}
                                    actions={[
                                        {
                                            icon: "eye",
                                            tooltip: "View details",
                                            onClick: (i: number) => console.log("View order", i)
                                        },
                                        {
                                            icon: "download",
                                            tooltip: "Download invoice",
                                            variant: "secondary",
                                            onClick: (i: number) => console.log("Download invoice", i)
                                        }
                                    ]}
                                />
                            </Column>

                            <Column gap="s">
                                <Text variant="label-strong-m">Sticky Header with Scroll</Text>
                                <Text variant="body-default-s" onBackground="neutral-weak">
                                    Header stays visible while scrolling through data
                                </Text>
                                <Table 
                                    stickyHeader
                                    maxHeight="300px"
                                    striped
                                    data={{ 
                                        headers: [
                                            { content: "#", key: "id", sortable: true },
                                            { content: "Task", key: "task", sortable: true },
                                            { content: "Assignee", key: "assignee", sortable: true },
                                            { content: "Priority", key: "priority", sortable: true }
                                        ], 
                                        rows: Array.from({ length: 20 }, (_, i) => [
                                            `${i + 1}`,
                                            `Task ${i + 1}: Complete project milestone`,
                                            ["Alice", "Bob", "Charlie", "Diana"][i % 4],
                                            i % 3 === 0 ? <Tag key={i}>High</Tag> : i % 3 === 1 ? <Tag key={i}>Medium</Tag> : <Tag key={i}>Low</Tag>
                                        ])
                                    }} 
                                />
                            </Column>

                            <Column gap="s">
                                <Text variant="label-strong-m">Searchable with Conditional Actions</Text>
                                <Text variant="body-default-s" onBackground="neutral-weak">
                                    Search functionality with conditionally disabled actions
                                </Text>
                                <Table 
                                    searchable
                                    hoverable
                                    searchPlaceholder="Search team members..."
                                    data={{ 
                                        headers: [
                                            { content: "Name", key: "name", sortable: true },
                                            { content: "Department", key: "dept", sortable: true },
                                            { content: "Role", key: "role", sortable: true }
                                        ], 
                                        rows: [
                                            ["Admin User", "IT", "Administrator"],
                                            ["John Developer", "Engineering", "Senior Dev"],
                                            ["Jane Designer", "Design", "Lead Designer"],
                                            ["Bob Manager", "Operations", "Manager"],
                                            ["Alice Analyst", "Data", "Data Analyst"]
                                        ] 
                                    }}
                                    actions={[
                                        {
                                            icon: "edit",
                                            tooltip: "Edit member",
                                            onClick: (i: number) => console.log("Edit", i),
                                            disabled: (i: number) => i === 0 // Disable for admin
                                        },
                                        {
                                            icon: "trash",
                                            tooltip: "Remove member",
                                            variant: "danger",
                                            onClick: (i: number) => console.log("Remove", i),
                                            disabled: (i: number) => i === 0 // Disable for admin
                                        }
                                    ]}
                                />
                            </Column>

                            <Column gap="s">
                                <Text variant="label-strong-m">Loading State</Text>
                                <Text variant="body-default-s" onBackground="neutral-weak">
                                    Shows spinner while data is being fetched
                                </Text>
                                <Table 
                                    loading
                                    data={{ 
                                        headers: [
                                            { content: "Name", key: "name" },
                                            { content: "Value", key: "value" }
                                        ], 
                                        rows: [] 
                                    }} 
                                />
                            </Column>

                            <Column gap="s">
                                <Text variant="label-strong-m">Custom Empty State</Text>
                                <Text variant="body-default-s" onBackground="neutral-weak">
                                    Custom message when no data is available
                                </Text>
                                <Table 
                                    searchable
                                    data={{ 
                                        headers: [
                                            { content: "Order", key: "order" },
                                            { content: "Customer", key: "customer" }
                                        ], 
                                        rows: [] 
                                    }}
                                    emptyState={
                                        <Column center padding="xl" gap="m">
                                            <Icon name="shoppingBag" size="xl" onBackground="neutral-weak" />
                                            <Column center gap="4">
                                                <Text variant="heading-strong-m">No orders yet</Text>
                                                <Text variant="body-default-s" onBackground="neutral-weak">
                                                    Orders will appear here once customers make purchases
                                                </Text>
                                            </Column>
                                            <Button size="s" variant="primary">Create Order</Button>
                                        </Column>
                                    }
                                />
                            </Column>

                            <Column gap="s">
                                <Text variant="label-strong-m">Full Featured Table</Text>
                                <Text variant="body-default-s" onBackground="neutral-weak">
                                    Combining search, sorting, striped rows, and actions
                                </Text>
                                <Table 
                                    searchable
                                    striped
                                    hoverable
                                    searchPlaceholder="Search invoices..."
                                    data={{ 
                                        headers: [
                                            { content: "Invoice", key: "invoice", sortable: true },
                                            { content: "Client", key: "client", sortable: true },
                                            { content: "Date", key: "date", sortable: true },
                                            { content: "Amount", key: "amount", sortable: true },
                                            { content: "Status", key: "status", sortable: true }
                                        ], 
                                        rows: [
                                            ["INV-2024-001", "Acme Corp", "2024-01-15", "$2,500.00", <Tag key="1">Paid</Tag>],
                                            ["INV-2024-002", "TechStart Inc", "2024-01-18", "$1,750.00", <Tag key="2">Pending</Tag>],
                                            ["INV-2024-003", "Global Solutions", "2024-01-20", "$3,200.00", <Tag key="3">Paid</Tag>],
                                            ["INV-2024-004", "Digital Agency", "2024-01-22", "$890.00", <Tag key="4">Overdue</Tag>],
                                            ["INV-2024-005", "Creative Studio", "2024-01-25", "$4,100.00", <Tag key="5">Paid</Tag>],
                                            ["INV-2024-006", "Marketing Pro", "2024-01-28", "$1,450.00", <Tag key="6">Pending</Tag>]
                                        ] 
                                    }}
                                    actions={[
                                        {
                                            icon: "eye",
                                            tooltip: "View invoice",
                                            onClick: (i: number) => console.log("View", i)
                                        },
                                        {
                                            icon: "download",
                                            tooltip: "Download PDF",
                                            variant: "secondary",
                                            onClick: (i: number) => console.log("Download", i)
                                        },
                                        {
                                            icon: "mail",
                                            tooltip: "Send reminder",
                                            variant: "secondary",
                                            onClick: (i: number) => console.log("Send", i)
                                        }
                                    ]}
                                />
                            </Column>

                            <Column gap="s">
                                <Text variant="label-strong-m">Paginated Table</Text>
                                <Text variant="body-default-s" onBackground="neutral-weak">
                                    Large dataset with pagination controls
                                </Text>
                                <Table 
                                    paginated
                                    defaultPageSize={10}
                                    pageSizeOptions={[5, 10, 20, 50]}
                                    striped
                                    data={{ 
                                        headers: [
                                            { content: "#", key: "id", sortable: true },
                                            { content: "Customer", key: "customer", sortable: true },
                                            { content: "Email", key: "email", sortable: true },
                                            { content: "Plan", key: "plan", sortable: true },
                                            { content: "Status", key: "status", sortable: true }
                                        ], 
                                        rows: Array.from({ length: 50 }, (_, i) => [
                                            `${i + 1}`,
                                            `Customer ${i + 1}`,
                                            `customer${i + 1}@example.com`,
                                            ["Free", "Pro", "Enterprise"][i % 3],
                                            i % 2 === 0 ? <Tag key={i}>Active</Tag> : <Tag key={i}>Trial</Tag>
                                        ])
                                    }} 
                                    actions={[
                                        {
                                            icon: "edit",
                                            tooltip: "Edit customer",
                                            onClick: (i: number) => console.log("Edit", i)
                                        },
                                        {
                                            icon: "trash",
                                            tooltip: "Delete customer",
                                            variant: "danger",
                                            onClick: (i: number) => console.log("Delete", i)
                                        }
                                    ]}
                                />
                            </Column>
                        </Column>
                    ), 
                    status: "stable", 
                    tags: ["data", "table", "sortable", "searchable", "actions", "pagination"] 
                },
                { name: "List", element: <List><ListItem>Item 1</ListItem><ListItem>Item 2</ListItem></List>, status: "stable", tags: ["data", "list"] },
                { name: "Timeline", element: <Timeline items={[{ label: "Event 1" }, { label: "Event 2" }]} />, status: "stable", tags: ["data", "timeline"] },
                { name: "Badge", element: <Badge>Badge</Badge>, status: "stable", tags: ["indicator", "label"] },
                { name: "Tag", element: <Tag label="tag label">Tag</Tag>, status: "stable", tags: ["indicator", "label"] },
                { name: "Chip", element: <Chip label="chip label">Chip</Chip>, status: "stable", tags: ["indicator", "label"] },
            ],
        },
        {
            name: "Media",
            description: "Image and media components",
            icon: "image",
            components: [
                { name: "Avatar", element: <Avatar size="m" />, status: "stable", tags: ["media", "user"] },
                { name: "AvatarGroup", element: <AvatarGroup avatars={[{}, {}, {}]} />, status: "stable", tags: ["media", "user"] },
                { name: "Media", element: <Media src="/images/cover-01.jpg" aspectRatio="16/9" radius="l" />, status: "stable", tags: ["media", "image"] },
                { name: "Carousel", element: <Row height={32} fillWidth><Carousel items={[{ slide: "/images/demo.jpg" }]} /></Row>, status: "stable", tags: ["media", "slider"] },
                { name: "Logo", element: <Logo icon="/trademarks/icon-dark.svg" size="xs" />, status: "stable", tags: ["media", "brand"] },
                { name: "LogoCloud", element: <LogoCloud logos={[{ icon: "/trademarks/icon-dark.svg" }]} />, status: "stable", tags: ["media", "brand"] },
            ],
        },
        {
            name: "Feedback & Status",
            description: "Components for user feedback and status indication",
            icon: "info",
            components: [
                { name: "Spinner", element: <Spinner />, status: "stable", tags: ["loading", "feedback"] },
                { name: "ProgressBar", element: <ProgressBar value={65} />, status: "stable", tags: ["progress", "feedback"] },
                { name: "Skeleton", element: <Skeleton shape="block" width="m"/>, status: "stable", tags: ["loading", "placeholder"] },
                { name: "StatusIndicator", element: <StatusIndicator color="indigo" />, status: "stable", tags: ["status", "indicator"] },
                { name: "Feedback", element: <Feedback icon title="Success" description="Operation completed" />, status: "stable", tags: ["feedback", "message"] },
            ],
        },
        {
            name: "Overlays & Modals",
            description: "Components for overlays and modal dialogs",
            icon: "layers",
            components: [
                { name: "Dialog", element: <Button onClick={() => {}}>Open Dialog</Button>, status: "stable", tags: ["overlay", "modal"] },
                { name: "Tooltip", element: <Tooltip label="Tooltip text"><Button>Hover me</Button></Tooltip>, status: "stable", tags: ["overlay", "tooltip"] },
                { name: "HoverCard", element: <HoverCard><Button>Hover Card</Button></HoverCard>, status: "stable", tags: ["overlay", "card"] },
                { name: "DropdownWrapper", element: <DropdownWrapper trigger={<Button>Dropdown</Button>} dropdown={<Column><Option value="1">Option 1</Option></Column>} />, status: "stable", tags: ["overlay", "dropdown"] },
            ],
        },
        {
            name: "Navigation",
            description: "Navigation and menu components",
            icon: "compass",
            components: [
                { name: "NavIcon", element: <NavIcon />, status: "stable", tags: ["navigation", "icon"] },
                { name: "ContextMenu", element: <ContextMenu dropdown={<Option value="1">Option 1</Option>}><Button>Right-click</Button></ContextMenu>, status: "stable", tags: ["navigation", "menu"] },
                { name: "UserMenu", element: <UserMenu />, status: "stable", tags: ["navigation", "user"] },
                { name: "SmartLink", element: <SmartLink href="/">Smart Link</SmartLink>, status: "stable", tags: ["navigation", "link"] },
            ],
        },
        {
            name: "Accordions & Collapsibles",
            description: "Expandable content components",
            icon: "chevronDown",
            components: [
                { name: "Accordion", element: <Accordion title="Accordion"><Text>Content</Text></Accordion>, status: "stable", tags: ["collapsible", "accordion"] },
                { name: "AccordionGroup", element: <AccordionGroup items={[{ title: "Item 1", content: <Text>Content 1</Text> }]} />, status: "stable", tags: ["collapsible", "accordion"] },
                { name: "InteractiveDetails", element: <InteractiveDetails onClick={() => console.log()}></InteractiveDetails>, status: "stable", tags: ["collapsible", "interactive"] },
            ],
        },
        {
            name: "Effects & Animations",
            description: "Visual effects and animation components",
            icon: "sparkles",
            components: [
                { name: "RevealFx", element: <RevealFx><Text>Reveal Effect</Text></RevealFx>, status: "stable", tags: ["effect", "animation"] },
                { name: "LetterFx", element: <LetterFx>Letter Effect</LetterFx>, status: "stable", tags: ["effect", "text"] },
                { name: "TypeFx", element: <TypeFx words="Type Effect">Type Effect</TypeFx>, status: "stable", tags: ["effect", "text"] },
                { name: "CountFx", element: <CountFx value={100} />, status: "stable", tags: ["effect", "number"] },
                { name: "CountdownFx", element: <CountdownFx targetDate={new Date(Date.now() + 3600000)} />, status: "stable", tags: ["effect", "time"] },
                { name: "Fade", element: <Fade><Text>Fade Effect</Text></Fade>, status: "stable", tags: ["effect", "animation"] },
                { name: "Pulse", element: <Pulse><Text>Pulse Effect</Text></Pulse>, status: "stable", tags: ["effect", "animation"] },
                { name: "Hover", element: <Hover trigger={<Text>Test</Text>} overlay={<Column background="overlay"></Column>} onClick={(e) => console.log(e)}><Text>Hover Effect</Text></Hover>, status: "stable", tags: ["effect", "interactive"] },
                { name: "FlipFx", element: <FlipFx back={<Text>Back</Text>} front={<Text>Front</Text>} onClick={(e) => console.log(e)}><Text>Flip Effect</Text></FlipFx>, status: "stable", tags: ["effect", "3d"] },
                { name: "GlitchFx", element: <GlitchFx><Text>Glitch Effect</Text></GlitchFx>, status: "beta", tags: ["effect", "glitch"] },
                { name: "HoloFx", element: <HoloFx><Text>Holo Effect</Text></HoloFx>, status: "beta", tags: ["effect", "3d"] },
                { name: "MatrixFx", element: <MatrixFx><Text>Matrix Effect</Text></MatrixFx>, status: "beta", tags: ["effect", "animation"] },
                { name: "ShineFx", element: <ShineFx><Text>Shine Effect</Text></ShineFx>, status: "stable", tags: ["effect", "shine"] },
                { name: "TiltFx", element: <TiltFx><Text>Tilt Effect</Text></TiltFx>, status: "stable", tags: ["effect", "3d"] },
                { name: "WeatherFx", element: <WeatherFx><Text>Weather Effect</Text></WeatherFx>, status: "beta", tags: ["effect", "weather"] },
            ],
        },
        {
            name: "Date & Time",
            description: "Date and time picker components",
            icon: "calendar",
            components: [
                { name: "DatePicker", element: <DatePicker />, status: "stable", tags: ["date", "picker"] },
                { name: "DateInput", element: <DateInput id="date-test" placeholder="Select date" />, status: "stable", tags: ["date", "input"] },
                { name: "DateRangeInput", element: <DateRangeInput startLabel="2000" endLabel="2030" id="date-range-test" placeholder="Select range" />, status: "stable", tags: ["date", "range"] },
            ],
        },
        {
            name: "Specialized",
            description: "Specialized and utility components",
            icon: "settings",
            components: [
                { name: "Icon", element: <Icon name="heart" />, status: "stable", tags: ["icon", "utility"] },
                { name: "Line", element: <Line />, status: "stable", tags: ["divider", "utility"] },
                { name: "Arrow", element: <Arrow trigger="wow" />, status: "stable", tags: ["arrow", "utility"] },
                { name: "Mask", element: <Mask><Text>Masked</Text></Mask>, status: "stable", tags: ["mask", "utility"] },
                { name: "Particle", element: <Particle />, status: "beta", tags: ["particle", "effect"] },
                { name: "Scroller", element: <Scroller><Text>Scrolling content</Text></Scroller>, status: "stable", tags: ["scroll", "utility"] },
                { name: "AutoScroll", element: <AutoScroll><Text>Auto scroll</Text></AutoScroll>, status: "stable", tags: ["scroll", "auto"] },
                { name: "ScrollToTop", element: <ScrollToTop />, status: "stable", tags: ["scroll", "navigation"] },
                { name: "Swiper", element: <Swiper items={[{ slide: <Text>Slide 1</Text> }]} />, status: "stable", tags: ["swiper", "slider"] },
                { name: "MasonryGrid", element: <MasonryGrid columns={3}><Column background="neutral-medium" radius="l" padding="m"><Text>Item</Text></Column></MasonryGrid>, status: "stable", tags: ["grid", "masonry"] },
                { name: "InfiniteScroll", element: <InfiniteScroll items={[]} loadMore={async () => false} renderItem={(item, index) => <Text>Test</Text>}/>, status: "stable", tags: ["scroll", "infinite"] },
                { name: "CompareImage", element: <CompareImage leftContent={{ src: "/images/cover-01.jpg"}} rightContent={{ src: "/images/cover-02.jpg"}} />, status: "stable", tags: ["image", "compare"] },
                { name: "CursorCard", element: <CursorCard><Text>Cursor Card</Text></CursorCard>, status: "beta", tags: ["card", "cursor"] },
                { name: "OgCard", element: <OgCard url="https://once-ui.com" />, status: "stable", tags: ["card", "og"] },
                { name: "StylePanel", element: <StylePanel />, status: "stable", tags: ["style", "utility"] },
                { name: "ThemeSwitcher", element: <ThemeSwitcher />, status: "stable", tags: ["theme", "utility"] },
                { name: "SegmentedControl", element: <SegmentedControl onToggle={(str) => console.log(str)} buttons={[{ value: "1" }]} />, status: "stable", tags: ["control", "toggle"] },
                { name: "ToggleButton", element: <ToggleButton label="Toggle" />, status: "stable", tags: ["button", "toggle"] },
                { name: "TagInput", element: <TagInput value={["str1", "str2"]} onChange={() => console.log} id="tags" />, status: "stable", tags: ["input", "tags"] },
                { name: "EmojiPicker", element: <EmojiPicker onSelect={() => {}} />, status: "stable", tags: ["emoji", "picker"] },
                { name: "EmojiPickerDropdown", element: <EmojiPickerDropdown trigger={<Button>Emoji</Button>} onSelect={() => {}} />, status: "stable", tags: ["emoji", "dropdown"] },
                { name: "Kbar", element: <Kbar items={[{ id: "1", name: "Search", section: "Navigation", shortcut: ["desc"], keywords: "test"}]}><Button>Search</Button></Kbar>, status: "stable", tags: ["search", "command"] },
                { name: "User", element: <User name="John Doe" />, status: "stable", tags: ["user", "profile"] },
                { name: "Background", element: <Background><Text>Background</Text></Background>, status: "stable", tags: ["background", "utility"] },
                { name: "Card", element: <Card><Text>Card</Text></Card>, status: "stable", tags: ["card", "container"] },
                { name: "Kbd", element: <Kbd>Ctrl</Kbd>, status: "stable", tags: ["keyboard", "utility"] },
            ],
        },
        {
            name: "Charts",
            description: "Data visualization components",
            icon: "analytics",
            components: [
                { name: "BarChart", element: <BarChart title="Sample" series={[{ key: "Data", color: "blue" }]} data={[{ label: "Item", Data: 10 }]} />, status: "stable", tags: ["chart", "bar"] },
                { name: "LineChart", element: <LineChart title="Sample" series={[{ key: "Data", color: "blue" }]} data={[{ date: new Date(), Data: 10 }]} />, status: "stable", tags: ["chart", "line"] },
            ],
        },
    ];

    // Filter logic
    const filteredCategories = useMemo(() => {
        let filtered = categories;

        // Filter by selected category
        if (selectedCategory) {
            filtered = filtered.filter(cat => cat.name === selectedCategory);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.map(category => ({
                ...category,
                components: category.components.filter(comp =>
                    comp.name.toLowerCase().includes(query) ||
                    comp.tags?.some(tag => tag.toLowerCase().includes(query))
                )
            })).filter(cat => cat.components.length > 0);
        }

        return filtered;
    }, [categories, selectedCategory, searchQuery]);

    const totalComponents = categories.reduce((sum, cat) => sum + cat.components.length, 0);
    const filteredCount = filteredCategories.reduce((sum, cat) => sum + cat.components.length, 0);

    const toggleComponent = (id: string) => {
        setExpandedComponents(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case "new":
                return <Badge>New</Badge>;
            case "beta":
                return <Badge>Beta</Badge>;
            case "deprecated":
                return <Badge>Deprecated</Badge>;
            default:
                return null;
        }
    };

    return (
        <Column fill padding="l" gap="xl" background="page">
            {/* Header */}
            <Column gap="m" maxWidth="xl">
                <Row vertical="center" horizontal="between" fillWidth wrap>
                    <Column gap="4">
                        <Row gap="s" vertical="center">
                            <Heading variant="heading-strong-xl">Component Library</Heading>
                            <Badge>{totalComponents}</Badge>
                        </Row>
                        <Text variant="body-default-m" onBackground="neutral-weak">
                            Explore and test all available UI components
                        </Text>
                    </Column>
                    <Row gap="s">
                        <Button
                            variant="tertiary"
                            size="s"
                            prefixIcon="refresh"
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedCategory(null);
                                setExpandedComponents(new Set());
                            }}
                        >
                            Reset
                        </Button>
                        <Button
                            variant="secondary"
                            size="s"
                            prefixIcon={expandedComponents.size > 0 ? "chevronUp" : "chevronDown"}
                            onClick={() => {
                                if (expandedComponents.size > 0) {
                                    setExpandedComponents(new Set());
                                } else {
                                    const allIds = filteredCategories.flatMap(cat =>
                                        cat.components.map((comp, idx) => `${cat.name}::${comp.name}::${idx}`)
                                    );
                                    setExpandedComponents(new Set(allIds));
                                }
                            }}
                        >
                            {expandedComponents.size > 0 ? "Collapse All" : "Expand All"}
                        </Button>
                    </Row>
                </Row>

                {/* Search and Filters */}
                <Column gap="s" fillWidth>
                    <Input
                        id="search"
                        placeholder="Search components or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <Text variant="body-default-s" onBackground="neutral-weak">
                            Found {filteredCount} component{filteredCount !== 1 ? 's' : ''} matching "{searchQuery}"
                        </Text>
                    )}
                </Column>

                {/* Category Pills */}
                <Column gap="s" fillWidth>
                    <Text variant="label-default-s" onBackground="neutral-weak">Filter by category</Text>
                    <Row gap="s" wrap fillWidth>
                        <Chip
                            label="All"
                            selected={selectedCategory === null}
                            onClick={() => setSelectedCategory(null)}
                        />
                        {categories.map((category) => (
                            <Chip
                                key={category.name}
                                label={category.name}
                                prefixIcon={category.icon as any}
                                selected={selectedCategory === category.name}
                                onClick={() => setSelectedCategory(category.name)}
                            />
                        ))}
                    </Row>
                </Column>
            </Column>

            <Line />

            {/* Components Grid */}
            <Column gap="xl" fillWidth>
                {filteredCategories.map((category) => (
                    <Column key={category.name} gap="m" fillWidth>
                        <Row gap="s" vertical="center">
                            <Icon name={category.icon as any} size="m" />
                            <Heading variant="heading-strong-l">{category.name}</Heading>
                            <Badge>{category.components.length}</Badge>
                        </Row>
                        <Text variant="body-default-m" onBackground="neutral-weak">
                            {category.description}
                        </Text>

                        <Grid columns="3" gap="m" fillWidth>
                            {category.components.map((component, idx) => {
                                const id = `${category.name}::${component.name}::${idx}`;
                                const isExpanded = expandedComponents.has(id);

                                return (
                                    <Card
                                        key={id}
                                        padding="0"
                                        radius="l"
                                        fillWidth
                                        border="neutral-alpha-medium"
                                        background="surface"
                                        style={{
                                            transition: "all 0.2s ease",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <Column gap="0" fillWidth>
                                            {/* Component Header */}
                                            <Row
                                                padding="m"
                                                horizontal="between"
                                                vertical="center"
                                                fillWidth
                                                onClick={() => toggleComponent(id)}
                                                style={{ 
                                                    cursor: "pointer",
                                                    transition: "background 0.2s ease"
                                                }}
                                            >
                                                <Row gap="s" vertical="center">
                                                    <Text variant="heading-strong-m">{component.name}</Text>
                                                    {getStatusBadge(component.status)}
                                                </Row>
                                                <Icon
                                                    name={isExpanded ? "chevronUp" : "chevronDown"}
                                                    size="s"
                                                    onBackground="neutral-weak"
                                                />
                                            </Row>

                                            {/* Tags */}
                                            {component.tags && component.tags.length > 0 && (
                                                <Row gap="4" wrap paddingX="m" paddingBottom="m">
                                                    {component.tags.map(tag => (
                                                        <Tag key={tag} size="s">
                                                            {tag}
                                                        </Tag>
                                                    ))}
                                                </Row>
                                            )}

                                            {/* Component Preview */}
                                            {isExpanded && (
                                                <Column gap="0" fillWidth>
                                                    <Line />
                                                    <Column
                                                        padding="l"
                                                        gap="m"
                                                        fillWidth
                                                        background="page"
                                                        style={{ 
                                                            minHeight: component.name === "Sidebar" ? "auto" : "120px",
                                                            display: "flex",
                                                            alignItems: component.name === "Sidebar" ? "stretch" : "center",
                                                            justifyContent: component.name === "Sidebar" ? "flex-start" : "center"
                                                        }}
                                                    >
                                                        {component.element}
                                                    </Column>
                                                    <Line />
                                                    <Row gap="s" padding="m" fillWidth>
                                                        <Button
                                                            size="s"
                                                            variant="secondary"
                                                            fillWidth
                                                            prefixIcon="copy"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(`<${component.name} />`);
                                                            }}
                                                        >
                                                            Copy JSX
                                                        </Button>
                                                        <IconButton
                                                            icon="externalLink"
                                                            size="s"
                                                            variant="secondary"
                                                            tooltip="View docs"
                                                            onClick={() => {
                                                                console.log("View docs for", component.name);
                                                            }}
                                                        />
                                                    </Row>
                                                </Column>
                                            )}
                                        </Column>
                                    </Card>
                                );
                            })}
                        </Grid>
                    </Column>
                ))}

                {filteredCategories.length === 0 && (
                    <Column center padding="xl" gap="m">
                        <Icon name="search" size="xl" onBackground="neutral-weak" />
                        <Heading variant="heading-strong-l">No components found</Heading>
                        <Text variant="body-default-m" onBackground="neutral-weak">
                            Try adjusting your search or filters
                        </Text>
                    </Column>
                )}
            </Column>
        </Column>
    );
}
