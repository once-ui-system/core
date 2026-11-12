```ts lib/data.ts
export type ProjectStatus = "Active" | "Paused" | "Archived";

export interface Project {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
}

export const product =
  "Lumen, a product-analytics and issue-tracking app for small software teams";

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export const projects: Project[] = [
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
];

export const statusPalette: Record<ProjectStatus, string> = {
  Active: "green",
  Paused: "yellow",
  Archived: "gray",
};

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export const totalIssues = projects.reduce((sum, p) => sum + p.issues, 0);
export const maxIssues = Math.max(...projects.map((p) => p.issues));
export const activeCount = projects.filter((p) => p.status === "Active").length;
export const busiestProject = projects.reduce((a, b) => (b.issues > a.issues ? b : a));
export const recentProjects = [...projects].sort((a, b) => b.updated.localeCompare(a.updated));

export function issuesByStatus(status: ProjectStatus): number {
  return projects.filter((p) => p.status === status).reduce((s, p) => s + p.issues, 0);
}
```

```ts lib/nav.ts
import type { IconType } from "react-icons";
import {
  LuFileText,
  LuFolderKanban,
  LuLayoutDashboard,
  LuSettings,
} from "react-icons/lu";

export interface NavItem {
  label: string;
  href: string;
  icon: IconType;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    id: "analytics",
    label: "Analytics",
    items: [
      { label: "Overview", href: "/", icon: LuLayoutDashboard },
      { label: "Reports", href: "/reports", icon: LuFileText },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { label: "Projects", href: "/projects", icon: LuFolderKanban },
      { label: "Settings", href: "/settings", icon: LuSettings },
    ],
  },
];

export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function crumbsFor(pathname: string): { group: string; label: string } | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(pathname, item.href)) return { group: group.label, label: item.label };
    }
  }
  return null;
}
```

```ts lib/theme.ts
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const MONO = 'ui-monospace, "SFMono-Regular", Menlo, monospace';
const SANS = "ui-sans-serif, system-ui, sans-serif";

const config = defineConfig({
  globalCss: {
    body: {
      bg: "bg",
      color: "fg",
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: MONO },
        body: { value: SANS },
        mono: { value: MONO },
      },
      colors: {
        // Lumen orange, built around #E8590C (500)
        brand: {
          "50": { value: "#fff4ec" },
          "100": { value: "#ffe6d3" },
          "200": { value: "#ffcca6" },
          "300": { value: "#ffa970" },
          "400": { value: "#f47a33" },
          "500": { value: "#e8590c" },
          "600": { value: "#c74a08" },
          "700": { value: "#a43b07" },
          "800": { value: "#7f2e09" },
          "900": { value: "#5c2308" },
          "950": { value: "#3a1505" },
        },
        // warm stone neutrals replace the default grey scale
        gray: {
          "50": { value: "#fafaf9" },
          "100": { value: "#f5f5f4" },
          "200": { value: "#e7e5e4" },
          "300": { value: "#d6d3d1" },
          "400": { value: "#a8a29e" },
          "500": { value: "#78716c" },
          "600": { value: "#57534e" },
          "700": { value: "#44403c" },
          "800": { value: "#292524" },
          "900": { value: "#1c1917" },
          "950": { value: "#0c0a09" },
        },
      },
    },
    semanticTokens: {
      radii: {
        l1: { value: "4px" },
        l2: { value: "4px" },
        l3: { value: "4px" },
      },
      colors: {
        bg: {
          DEFAULT: { value: { base: "{colors.white}", _dark: "{colors.gray.950}" } },
          subtle: { value: { base: "{colors.gray.50}", _dark: "{colors.gray.900}" } },
          muted: { value: { base: "{colors.gray.100}", _dark: "{colors.gray.800}" } },
          panel: { value: { base: "{colors.white}", _dark: "{colors.gray.900}" } },
        },
        brand: {
          contrast: { value: "{colors.gray.950}" },
          fg: { value: { base: "{colors.brand.700}", _dark: "{colors.brand.300}" } },
          muted: { value: { base: "{colors.brand.100}", _dark: "{colors.brand.950}" } },
          subtle: { value: { base: "{colors.brand.200}", _dark: "{colors.brand.900}" } },
          emphasized: { value: { base: "{colors.brand.300}", _dark: "{colors.brand.800}" } },
          solid: { value: "{colors.brand.500}" },
          focusRing: { value: "{colors.brand.500}" },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
```

```tsx components/ui/provider.tsx
"use client"

import { ChakraProvider } from "@chakra-ui/react"
import { system } from "@/lib/theme"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider
        defaultTheme="dark"
        enableSystem={false}
        {...props}
      />
    </ChakraProvider>
  )
}
```

```tsx app/layout.tsx
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { EmotionRegistry } from "@/components/ui/emotion-registry";
import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = { title: "Lumen" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <EmotionRegistry>
          <Provider>
            <AppShell>{children}</AppShell>
            <Toaster />
          </Provider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
```

```tsx components/nav.tsx
"use client";

import { Box, Collapsible, Link, Span, Stack } from "@chakra-ui/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { LuChevronRight } from "react-icons/lu";
import { Tooltip } from "@/components/ui/tooltip";
import { isActive, navGroups, type NavItem } from "@/lib/nav";

interface NavListProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

function NavLinkItem({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Tooltip
      content={item.label}
      positioning={{ placement: "right" }}
      disabled={!collapsed}
    >
      <Link
        asChild
        variant="plain"
        display="flex"
        alignItems="center"
        gap="3"
        px="3"
        py="2"
        minH="9"
        fontSize="sm"
        fontWeight="medium"
        color="fg.muted"
        borderRadius="l2"
        borderStartWidth="2px"
        borderStartColor="transparent"
        justifyContent={collapsed ? "center" : "flex-start"}
        textDecoration="none"
        _hover={{ bg: "bg.muted", color: "fg", textDecoration: "none" }}
        css={{
          "&[aria-current=page]": {
            bg: "colorPalette.muted",
            color: "colorPalette.fg",
            borderStartColor: "colorPalette.solid",
          },
        }}
      >
        <NextLink
          href={item.href}
          aria-current={active ? "page" : undefined}
          aria-label={collapsed ? item.label : undefined}
          onClick={onNavigate}
        >
          <Icon aria-hidden size={18} style={{ flexShrink: 0 }} />
          {!collapsed && <Span>{item.label}</Span>}
        </NextLink>
      </Link>
    </Tooltip>
  );
}

export function NavList({ collapsed = false, onNavigate }: NavListProps) {
  const pathname = usePathname();

  return (
    <Box as="nav" aria-label="Main">
      <Stack gap={collapsed ? "3" : "4"}>
        {navGroups.map((group, index) =>
          collapsed ? (
            <Stack
              key={group.id}
              gap="1"
              role="group"
              aria-label={group.label}
              borderTopWidth={index === 0 ? "0" : "1px"}
              pt={index === 0 ? "0" : "3"}
            >
              {group.items.map((item) => (
                <NavLinkItem
                  key={item.href}
                  item={item}
                  active={isActive(pathname, item.href)}
                  collapsed
                  onNavigate={onNavigate}
                />
              ))}
            </Stack>
          ) : (
            <Collapsible.Root key={group.id} defaultOpen>
              <Collapsible.Trigger
                w="full"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                px="3"
                py="1.5"
                fontFamily="heading"
                fontSize="xs"
                textTransform="uppercase"
                letterSpacing="wider"
                color="fg.muted"
                cursor="pointer"
                borderRadius="l2"
                _hover={{ color: "fg" }}
                css={{
                  "& .chev": { transition: "transform 0.15s ease" },
                  "&[data-state=open] .chev": { transform: "rotate(90deg)" },
                }}
              >
                {group.label}
                <LuChevronRight className="chev" aria-hidden />
              </Collapsible.Trigger>
              <Collapsible.Content>
                <Stack gap="0.5" mt="1">
                  {group.items.map((item) => (
                    <NavLinkItem
                      key={item.href}
                      item={item}
                      active={isActive(pathname, item.href)}
                      collapsed={false}
                      onNavigate={onNavigate}
                    />
                  ))}
                </Stack>
              </Collapsible.Content>
            </Collapsible.Root>
          ),
        )}
      </Stack>
    </Box>
  );
}
```

```tsx components/app-shell.tsx
"use client";

import {
  Box,
  Flex,
  HStack,
  IconButton,
  Link,
  Span,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LuMenu,
  LuPanelLeftClose,
  LuPanelLeftOpen,
} from "react-icons/lu";
import { NavList } from "@/components/nav";
import { Avatar } from "@/components/ui/avatar";
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot,
} from "@/components/ui/breadcrumb";
import { ColorModeButton } from "@/components/ui/color-mode";
import {
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Tooltip } from "@/components/ui/tooltip";
import { user } from "@/lib/data";
import { crumbsFor } from "@/lib/nav";

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      asChild
      variant="plain"
      textDecoration="none"
      _hover={{ textDecoration: "none" }}
    >
      <NextLink href="/" aria-label="Lumen home">
        <HStack gap="2">
          <Box boxSize="3" bg="brand.solid" borderRadius="l1" aria-hidden />
          {!compact && (
            <Text
              fontFamily="heading"
              fontWeight="bold"
              fontSize="md"
              letterSpacing="tight"
              color="fg"
            >
              Lumen
            </Text>
          )}
        </HStack>
      </NextLink>
    </Link>
  );
}

function UserChip({ compact = false }: { compact?: boolean }) {
  return (
    <HStack gap="3" minW="0" justifyContent={compact ? "center" : "flex-start"}>
      <Avatar size="sm" name={user.name} />
      {!compact && (
        <Box minW="0">
          <Text fontSize="sm" fontWeight="medium" truncate>
            {user.name}
          </Text>
          <Text fontSize="xs" color="fg.muted" truncate>
            {user.email}
          </Text>
        </Box>
      )}
    </HStack>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const crumb = crumbsFor(pathname);

  return (
    <Flex minH="100dvh" colorPalette="brand" bg="bg" color="fg">
      <Link
        href="#main-content"
        position="absolute"
        left="-9999px"
        top="2"
        px="3"
        py="2"
        bg="bg.panel"
        borderRadius="l2"
        borderWidth="1px"
        zIndex="skipLink"
        _focus={{ left: "2" }}
      >
        Skip to content
      </Link>

      {/* Desktop sidebar */}
      <Box
        as="aside"
        display={{ base: "none", md: "flex" }}
        flexDirection="column"
        position="sticky"
        top="0"
        h="100dvh"
        flexShrink="0"
        w={collapsed ? "16" : "64"}
        transition="width 0.2s ease"
        borderEndWidth="1px"
        bg="bg.subtle"
      >
        <Flex
          h="14"
          align="center"
          px="4"
          justify={collapsed ? "center" : "flex-start"}
          borderBottomWidth="1px"
          flexShrink="0"
        >
          <Logo compact={collapsed} />
        </Flex>
        <Box flex="1" overflowY="auto" p="3">
          <NavList collapsed={collapsed} />
        </Box>
        <Box borderTopWidth="1px" p="3" flexShrink="0">
          <Flex justify={collapsed ? "center" : "flex-end"} mb="3">
            <Tooltip
              content={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              positioning={{ placement: "right" }}
            >
              <IconButton
                variant="ghost"
                size="sm"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!collapsed}
                onClick={() => setCollapsed((c) => !c)}
              >
                {collapsed ? <LuPanelLeftOpen /> : <LuPanelLeftClose />}
              </IconButton>
            </Tooltip>
          </Flex>
          <UserChip compact={collapsed} />
        </Box>
      </Box>

      {/* Mobile drawer */}
      <DrawerRoot
        placement="start"
        size="xs"
        open={mobileOpen}
        onOpenChange={(e) => setMobileOpen(e.open)}
      >
        <DrawerContent colorPalette="brand">
          <DrawerHeader borderBottomWidth="1px">
            <DrawerTitle>
              <Logo />
            </DrawerTitle>
          </DrawerHeader>
          <DrawerBody p="3">
            <NavList onNavigate={() => setMobileOpen(false)} />
          </DrawerBody>
          <DrawerCloseTrigger />
        </DrawerContent>
      </DrawerRoot>

      <Flex direction="column" flex="1" minW="0">
        <Flex
          as="header"
          h="14"
          align="center"
          gap="3"
          px={{ base: "4", md: "6" }}
          borderBottomWidth="1px"
          bg="bg"
          position="sticky"
          top="0"
          zIndex="sticky"
        >
          <IconButton
            display={{ base: "inline-flex", md: "none" }}
            variant="ghost"
            size="sm"
            aria-label="Open navigation menu"
            onClick={() => setMobileOpen(true)}
          >
            <LuMenu />
          </IconButton>

          <BreadcrumbRoot size="sm">
            <BreadcrumbLink asChild>
              <NextLink href="/">Lumen</NextLink>
            </BreadcrumbLink>
            {crumb && <Span color="fg.muted">{crumb.group}</Span>}
            {crumb && <BreadcrumbCurrentLink>{crumb.label}</BreadcrumbCurrentLink>}
          </BreadcrumbRoot>

          <HStack ml="auto" gap="3">
            <ColorModeButton />
            <HStack gap="2" display={{ base: "none", sm: "flex" }}>
              <Avatar size="xs" name={user.name} />
              <Text fontSize="sm">{user.name}</Text>
            </HStack>
          </HStack>
        </Flex>

        <Box
          as="main"
          id="main-content"
          tabIndex={-1}
          flex="1"
          px={{ base: "4", md: "6", lg: "8" }}
          py={{ base: "6", md: "8" }}
          outline="none"
        >
          <Box maxW="6xl" mx="auto" w="full">
            {children}
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}
```

```tsx components/page-header.tsx
import { Box, Heading, Text } from "@chakra-ui/react";

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Box mb={{ base: "6", md: "8" }}>
      <Heading as="h1" size={{ base: "xl", md: "2xl" }} letterSpacing="tight">
        {title}
      </Heading>
      {description && (
        <Text mt="2" color="fg.muted" maxW="2xl">
          {description}
        </Text>
      )}
    </Box>
  );
}
```

```tsx app/page.tsx
"use client";

import {
  Badge,
  Box,
  Card,
  Flex,
  Heading,
  HStack,
  Link,
  Progress,
  SimpleGrid,
  Stack,
  Stat,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { PageHeader } from "@/components/page-header";
import {
  activeCount,
  busiestProject,
  formatDate,
  maxIssues,
  projects,
  recentProjects,
  statusPalette,
  totalIssues,
  user,
} from "@/lib/data";

function SummaryCard({
  label,
  value,
  help,
}: {
  label: string;
  value: string;
  help: string;
}) {
  return (
    <Card.Root variant="outline" bg="bg.panel">
      <Card.Body>
        <Stat.Root>
          <Stat.Label>{label}</Stat.Label>
          <Stat.ValueText fontFamily="heading">{value}</Stat.ValueText>
          <Stat.HelpText>{help}</Stat.HelpText>
        </Stat.Root>
      </Card.Body>
    </Card.Root>
  );
}

export default function DashboardPage() {
  const firstName = user.name.split(" ")[0];
  const latest = recentProjects[0];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description={`You are signed in as ${user.role.toLowerCase()} of the workspace. Here is where your ${projects.length} projects stand today.`}
      />

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="4" mb={{ base: "6", md: "8" }}>
        <SummaryCard
          label="Open issues"
          value={String(totalIssues)}
          help={`across ${projects.length} projects`}
        />
        <SummaryCard
          label="Active projects"
          value={`${activeCount} of ${projects.length}`}
          help="1 paused, 1 archived"
        />
        <SummaryCard
          label="Busiest project"
          value={busiestProject.key}
          help={`${busiestProject.name}, ${busiestProject.issues} open issues`}
        />
        <SummaryCard
          label="Latest update"
          value={formatDate(latest.updated)}
          help={latest.name}
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="4">
        <Card.Root variant="outline" bg="bg.panel">
          <Card.Header>
            <Heading as="h2" size="md">
              Open issues by project
            </Heading>
          </Card.Header>
          <Card.Body>
            <Stack gap="4" as="ul" listStyleType="none" m="0" p="0">
              {projects.map((p) => (
                <Box as="li" key={p.key}>
                  <Flex justify="space-between" mb="1" fontSize="sm" gap="3">
                    <Text>
                      <Text as="span" fontFamily="mono" color="fg.muted" mr="2">
                        {p.key}
                      </Text>
                      {p.name}
                    </Text>
                    <Text fontFamily="mono">{p.issues}</Text>
                  </Flex>
                  <Progress.Root
                    value={p.issues}
                    max={maxIssues}
                    size="xs"
                    aria-label={`${p.name}: ${p.issues} open issues`}
                  >
                    <Progress.Track>
                      <Progress.Range />
                    </Progress.Track>
                  </Progress.Root>
                </Box>
              ))}
            </Stack>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="outline" bg="bg.panel">
          <Card.Header>
            <Heading as="h2" size="md">
              Recently updated
            </Heading>
          </Card.Header>
          <Card.Body>
            <Stack gap="4" as="ul" listStyleType="none" m="0" p="0">
              {recentProjects.slice(0, 4).map((p) => (
                <Flex as="li" key={p.key} justify="space-between" align="center" gap="3">
                  <Box minW="0">
                    <Text fontSize="sm" fontWeight="medium" truncate>
                      {p.name}
                    </Text>
                    <Text fontSize="xs" color="fg.muted">
                      {formatDate(p.updated)}
                    </Text>
                  </Box>
                  <Badge colorPalette={statusPalette[p.status]} variant="subtle">
                    {p.status}
                  </Badge>
                </Flex>
              ))}
            </Stack>
          </Card.Body>
          <Card.Footer>
            <HStack>
              <Link asChild>
                <NextLink href="/projects">View all projects</NextLink>
              </Link>
            </HStack>
          </Card.Footer>
        </Card.Root>
      </SimpleGrid>
    </>
  );
}
```

```tsx app/projects/page.tsx
"use client";

import { Badge, Box, Input, Table, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Field } from "@/components/ui/field";
import { formatDate, projects, statusPalette } from "@/lib/data";

export default function ProjectsPage() {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.key.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <>
      <PageHeader
        title="Projects"
        description="Every project in the workspace with its open issues and last update."
      />

      <Field label="Filter projects" maxW={{ base: "full", sm: "sm" }} mb="4">
        <Input
          type="search"
          placeholder="Name, key or status"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Field>

      <Table.ScrollArea borderWidth="1px" borderRadius="l2" bg="bg.panel">
        <Table.Root aria-label="Projects" size="md">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Key</Table.ColumnHeader>
              <Table.ColumnHeader>Name</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Open issues</Table.ColumnHeader>
              <Table.ColumnHeader>Updated</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {visible.map((p) => (
              <Table.Row key={p.key}>
                <Table.Cell fontFamily="mono" fontWeight="medium">
                  {p.key}
                </Table.Cell>
                <Table.Cell>{p.name}</Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={statusPalette[p.status]} variant="subtle">
                    {p.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell textAlign="end" fontFamily="mono">
                  {p.issues}
                </Table.Cell>
                <Table.Cell whiteSpace="nowrap">{formatDate(p.updated)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>

      <Box mt="3" aria-live="polite">
        <Text fontSize="sm" color="fg.muted">
          {visible.length === 0
            ? "No projects match this filter."
            : `Showing ${visible.length} of ${projects.length} projects.`}
        </Text>
      </Box>
    </>
  );
}
```

```tsx app/reports/page.tsx
"use client";

import { Box, Card, Flex, Heading, Progress, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { PageHeader } from "@/components/page-header";
import { issuesByStatus, maxIssues, projects, totalIssues, type ProjectStatus } from "@/lib/data";

const statuses: ProjectStatus[] = ["Active", "Paused", "Archived"];

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Where open issues sit by project status and by project."
      />

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="4">
        <Card.Root variant="outline" bg="bg.panel">
          <Card.Header>
            <Heading as="h2" size="md">
              Open issues by status
            </Heading>
          </Card.Header>
          <Card.Body>
            <Stack gap="4">
              {statuses.map((s) => {
                const count = issuesByStatus(s);
                return (
                  <Box key={s}>
                    <Flex justify="space-between" fontSize="sm" mb="1">
                      <Text>{s}</Text>
                      <Text fontFamily="mono">
                        {count} of {totalIssues}
                      </Text>
                    </Flex>
                    <Progress.Root
                      value={count}
                      max={totalIssues}
                      size="xs"
                      aria-label={`${s} projects: ${count} open issues`}
                    >
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                  </Box>
                );
              })}
            </Stack>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="outline" bg="bg.panel">
          <Card.Header>
            <Heading as="h2" size="md">
              Open issues by project
            </Heading>
          </Card.Header>
          <Card.Body>
            <Stack gap="4">
              {projects.map((p) => (
                <Box key={p.key}>
                  <Flex justify="space-between" fontSize="sm" mb="1">
                    <Text>
                      <Text as="span" fontFamily="mono" color="fg.muted" mr="2">
                        {p.key}
                      </Text>
                      {p.name}
                    </Text>
                    <Text fontFamily="mono">{p.issues}</Text>
                  </Flex>
                  <Progress.Root
                    value={p.issues}
                    max={maxIssues}
                    size="xs"
                    aria-label={`${p.name}: ${p.issues} open issues`}
                  >
                    <Progress.Track>
                      <Progress.Range />
                    </Progress.Track>
                  </Progress.Root>
                </Box>
              ))}
            </Stack>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>
    </>
  );
}
```

```tsx app/settings/page.tsx
"use client";

import { Button, Card, Heading, Input, Stack } from "@chakra-ui/react";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { useColorMode } from "@/components/ui/color-mode";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { toaster } from "@/components/ui/toaster";
import { user } from "@/lib/data";

export default function SettingsPage() {
  const { colorMode, setColorMode } = useColorMode();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [mentions, setMentions] = useState(true);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toaster.create({
      title: "Settings saved",
      description: `Profile for ${name} was updated.`,
      type: "success",
    });
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Your profile, notifications and appearance."
      />

      <Stack gap="4" maxW="3xl">
        <form onSubmit={onSubmit}>
          <Stack gap="4">
            <Card.Root variant="outline" bg="bg.panel">
              <Card.Header>
                <Heading as="h2" size="md">
                  Profile
                </Heading>
              </Card.Header>
              <Card.Body>
                <Stack gap="4">
                  <Field label="Full name">
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </Field>
                  <Field label="Email">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Field>
                  <Field label="Role" helperText="Roles are managed by the workspace owner.">
                    <Input value={user.role} readOnly />
                  </Field>
                </Stack>
              </Card.Body>
            </Card.Root>

            <Card.Root variant="outline" bg="bg.panel">
              <Card.Header>
                <Heading as="h2" size="md">
                  Notifications
                </Heading>
              </Card.Header>
              <Card.Body>
                <Stack gap="4">
                  <Switch checked={digest} onCheckedChange={(e) => setDigest(e.checked)}>
                    Weekly digest of open issues
                  </Switch>
                  <Switch checked={mentions} onCheckedChange={(e) => setMentions(e.checked)}>
                    Email me when I am mentioned
                  </Switch>
                </Stack>
              </Card.Body>
            </Card.Root>

            <Button type="submit" colorPalette="brand" alignSelf="flex-start">
              Save changes
            </Button>
          </Stack>
        </form>

        <Card.Root variant="outline" bg="bg.panel">
          <Card.Header>
            <Heading as="h2" size="md">
              Appearance
            </Heading>
          </Card.Header>
          <Card.Body>
            <Switch
              checked={colorMode === "dark"}
              onCheckedChange={(e) => setColorMode(e.checked ? "dark" : "light")}
            >
              Dark mode
            </Switch>
          </Card.Body>
        </Card.Root>
      </Stack>
    </>
  );
}
```
