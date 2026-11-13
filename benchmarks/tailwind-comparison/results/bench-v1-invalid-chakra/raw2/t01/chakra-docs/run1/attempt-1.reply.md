The simplest typed fix is to render a plain `<time>` element inside a `Span`. `Span` styles the wrapper, and the native `<time>` carries `dateTime`.

The `emotion-registry` import in `app/layout.tsx` resolves to `components/ui/emotion-registry.tsx`, which exists and which I haven't modified. I've left that file alone, and I'm re-emitting all my files with the `time` fix.

```ts lib/data.ts
export type ProjectStatus = "Active" | "Paused" | "Archived";

export interface Project {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
}

export interface User {
  name: string;
  email: string;
  role: string;
}

export const product = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
};

export const user: User = {
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

export const statusColor: Record<ProjectStatus, string> = {
  Active: "green",
  Paused: "orange",
  Archived: "gray",
};

export type NavIconName = "overview" | "reports" | "projects" | "settings";

export interface NavItem {
  label: string;
  /** Items without an href are not available yet. */
  href?: string;
  icon: NavIconName;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { label: "Overview", href: "/", icon: "overview" },
      { label: "Reports", icon: "reports" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Projects", href: "/projects", icon: "projects" },
      { label: "Settings", href: "/settings", icon: "settings" },
    ],
  },
];

export interface Crumb {
  label: string;
  href?: string;
}

export const breadcrumbs: Record<string, Crumb[]> = {
  "/": [{ label: "Analytics" }, { label: "Overview" }],
  "/projects": [{ label: "Workspace" }, { label: "Projects" }],
  "/settings": [{ label: "Workspace" }, { label: "Settings" }],
};

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
```

```tsx components/app-shell.tsx
"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Badge,
  Box,
  Flex,
  HStack,
  IconButton,
  Link,
  Span,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  LuChartBar,
  LuChevronsLeft,
  LuChevronsRight,
  LuFileText,
  LuFolderKanban,
  LuMenu,
  LuSettings,
  LuSparkles,
} from "react-icons/lu";
import type { IconType } from "react-icons";
import { Avatar } from "@/components/ui/avatar";
import {
  BreadcrumbCurrentLink,
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
import {
  breadcrumbs,
  navGroups,
  product,
  user,
  type NavIconName,
} from "@/lib/data";

const icons: Record<NavIconName, IconType> = {
  overview: LuChartBar,
  reports: LuFileText,
  projects: LuFolderKanban,
  settings: LuSettings,
};

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <HStack gap="2" px="2" h="14" flexShrink={0}>
      <Flex
        boxSize="8"
        rounded="md"
        bg="blue.solid"
        color="blue.contrast"
        align="center"
        justify="center"
        flexShrink={0}
        aria-hidden
      >
        <LuSparkles />
      </Flex>
      {!collapsed && (
        <Text fontWeight="semibold" fontSize="lg">
          {product.name}
        </Text>
      )}
    </HStack>
  );
}

function NavList({
  collapsed,
  idPrefix,
  onNavigate,
}: {
  collapsed: boolean;
  idPrefix: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <Stack as="nav" aria-label={`Main ${idPrefix}`} gap="5" flex="1" overflowY="auto">
      {navGroups.map((group) => {
        const headingId = `${idPrefix}-nav-group-${group.label.toLowerCase()}`;
        return (
          <Box key={group.label} role="group" aria-labelledby={headingId}>
            {collapsed ? (
              <Span id={headingId} srOnly>
                {group.label}
              </Span>
            ) : (
              <Text
                id={headingId}
                px="3"
                mb="1"
                fontSize="xs"
                fontWeight="semibold"
                textTransform="uppercase"
                letterSpacing="wider"
                color="fg.muted"
              >
                {group.label}
              </Text>
            )}
            <Stack as="ul" listStyleType="none" gap="1" m="0" p="0">
              {group.items.map((item) => {
                const Icon = icons[item.icon];
                const active = item.href === pathname;

                const content = (
                  <>
                    <Icon aria-hidden size={18} style={{ flexShrink: 0 }} />
                    {collapsed ? (
                      <Span srOnly>{item.label}</Span>
                    ) : (
                      <Span flex="1">{item.label}</Span>
                    )}
                    {!item.href && !collapsed && (
                      <Badge size="xs" variant="subtle">
                        Soon
                      </Badge>
                    )}
                  </>
                );

                const element = item.href ? (
                  <Link
                    asChild
                    display="flex"
                    alignItems="center"
                    gap="3"
                    px="3"
                    py="2"
                    rounded="md"
                    fontSize="sm"
                    fontWeight="medium"
                    justifyContent={collapsed ? "center" : "flex-start"}
                    textDecoration="none"
                    bg={active ? "bg.emphasized" : undefined}
                    color={active ? "fg" : "fg.muted"}
                    _hover={{ bg: "bg.muted", color: "fg" }}
                  >
                    <NextLink
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                    >
                      {content}
                    </NextLink>
                  </Link>
                ) : (
                  <Flex
                    as="span"
                    aria-disabled="true"
                    alignItems="center"
                    gap="3"
                    px="3"
                    py="2"
                    rounded="md"
                    fontSize="sm"
                    fontWeight="medium"
                    justifyContent={collapsed ? "center" : "flex-start"}
                    color="fg.subtle"
                    cursor="not-allowed"
                  >
                    {content}
                  </Flex>
                );

                return (
                  <li key={item.label}>
                    <Tooltip
                      content={item.label}
                      positioning={{ placement: "right" }}
                      disabled={!collapsed}
                    >
                      {element}
                    </Tooltip>
                  </li>
                );
              })}
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}

function UserCard({ collapsed }: { collapsed: boolean }) {
  return (
    <HStack
      gap="3"
      px="2"
      py="3"
      borderTopWidth="1px"
      justify={collapsed ? "center" : "flex-start"}
    >
      <Avatar name={user.name} size="sm" />
      {!collapsed && (
        <Box minW="0">
          <Text fontSize="sm" fontWeight="medium" truncate>
            {user.name}
          </Text>
          <Text fontSize="xs" color="fg.muted" truncate>
            {user.role}
          </Text>
        </Box>
      )}
    </HStack>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const crumbs = breadcrumbs[pathname] ?? [{ label: "Lumen" }];

  return (
    <Flex minH="100dvh" bg="bg">
      <Link
        href="#main"
        position="absolute"
        left="2"
        top="2"
        zIndex="popover"
        px="3"
        py="2"
        rounded="md"
        bg="bg"
        borderWidth="1px"
        transform="translateY(-200%)"
        _focus={{ transform: "none" }}
      >
        Skip to content
      </Link>

      {/* Desktop sidebar */}
      <Flex
        as="aside"
        aria-label="Sidebar"
        display={{ base: "none", md: "flex" }}
        direction="column"
        position="sticky"
        top="0"
        h="100dvh"
        flexShrink={0}
        w={collapsed ? "16" : "64"}
        px="2"
        borderEndWidth="1px"
        bg="bg.subtle"
        transition="width 0.2s ease"
      >
        <Brand collapsed={collapsed} />
        <NavList collapsed={collapsed} idPrefix="desktop" />
        <Box pb="2">
          <Tooltip
            content="Expand sidebar"
            positioning={{ placement: "right" }}
            disabled={!collapsed}
          >
            <IconButton
              variant="ghost"
              size="sm"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed((c) => !c)}
              w={collapsed ? "full" : "auto"}
            >
              {collapsed ? <LuChevronsRight /> : <LuChevronsLeft />}
            </IconButton>
          </Tooltip>
        </Box>
        <UserCard collapsed={collapsed} />
      </Flex>

      {/* Mobile drawer */}
      <DrawerRoot
        placement="start"
        size="xs"
        open={drawerOpen}
        onOpenChange={(e) => setDrawerOpen(e.open)}
      >
        <DrawerContent>
          <DrawerCloseTrigger />
          <DrawerHeader>
            <DrawerTitle>
              <Span srOnly>{product.name} navigation</Span>
              <Brand collapsed={false} />
            </DrawerTitle>
          </DrawerHeader>
          <DrawerBody display="flex" flexDirection="column" px="3">
            <NavList
              collapsed={false}
              idPrefix="mobile"
              onNavigate={() => setDrawerOpen(false)}
            />
            <UserCard collapsed={false} />
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>

      <Flex direction="column" flex="1" minW="0">
        <Flex
          as="header"
          h="14"
          px={{ base: "3", md: "6" }}
          align="center"
          gap="3"
          borderBottomWidth="1px"
          position="sticky"
          top="0"
          bg="bg"
          zIndex="sticky"
        >
          <IconButton
            display={{ base: "inline-flex", md: "none" }}
            variant="ghost"
            size="sm"
            aria-label="Open navigation menu"
            onClick={() => setDrawerOpen(true)}
          >
            <LuMenu />
          </IconButton>

          <Box flex="1" minW="0">
            <BreadcrumbRoot size="sm">
              {crumbs.map((c, i) =>
                i === crumbs.length - 1 ? (
                  <BreadcrumbCurrentLink key={c.label}>
                    {c.label}
                  </BreadcrumbCurrentLink>
                ) : (
                  <Span key={c.label} color="fg.muted">
                    {c.label}
                  </Span>
                ),
              )}
            </BreadcrumbRoot>
          </Box>

          <ColorModeButton />
        </Flex>

        <Box
          as="main"
          id="main"
          tabIndex={-1}
          flex="1"
          px={{ base: "4", md: "8" }}
          py={{ base: "5", md: "8" }}
          maxW="6xl"
          w="full"
          mx="auto"
          outline="none"
        >
          {children}
        </Box>
      </Flex>
    </Flex>
  );
}
```

```tsx components/page-heading.tsx
import { Box, Heading, Text } from "@chakra-ui/react";

export function PageHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Box mb="6">
      <Heading as="h1" size={{ base: "xl", md: "2xl" }}>
        {title}
      </Heading>
      {description && (
        <Text color="fg.muted" mt="1">
          {description}
        </Text>
      )}
    </Box>
  );
}
```

```tsx app/page.tsx
import { Badge, Box, Card, HStack, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { formatDate, product, projects, statusColor, user } from "@/lib/data";

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active");
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

  const summary = [
    { label: "Open issues", value: String(openIssues), hint: `Across ${projects.length} projects` },
    { label: "Active projects", value: String(active.length), hint: active.map((p) => p.key).join(", ") },
    { label: "Busiest project", value: busiest.name, hint: `${busiest.issues} open issues` },
    { label: "Last activity", value: formatDate(latest.updated), hint: latest.name },
  ];

  return (
    <AppShell>
      <PageHeading
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description={`${product.tagline}. Here is where your workspace stands today.`}
      />

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="4" mb="8">
        {summary.map((s) => (
          <Card.Root key={s.label} variant="outline">
            <Card.Body gap="1">
              <Text fontSize="sm" color="fg.muted">
                {s.label}
              </Text>
              <Text fontSize="2xl" fontWeight="semibold" lineHeight="short">
                {s.value}
              </Text>
              <Text fontSize="sm" color="fg.muted">
                {s.hint}
              </Text>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>

      <Card.Root variant="outline">
        <Card.Header>
          <Card.Title>Recently updated</Card.Title>
          <Card.Description>The latest movement across your projects.</Card.Description>
        </Card.Header>
        <Card.Body>
          <Stack as="ul" listStyleType="none" m="0" p="0" gap="3">
            {[...projects]
              .sort((a, b) => b.updated.localeCompare(a.updated))
              .slice(0, 3)
              .map((p) => (
                <HStack as="li" key={p.key} justify="space-between" gap="3" wrap="wrap">
                  <Box minW="0">
                    <Text fontWeight="medium">{p.name}</Text>
                    <Text fontSize="sm" color="fg.muted">
                      {p.key} · {p.issues} open issues · Updated {formatDate(p.updated)}
                    </Text>
                  </Box>
                  <Badge colorPalette={statusColor[p.status]}>{p.status}</Badge>
                </HStack>
              ))}
          </Stack>
        </Card.Body>
      </Card.Root>
    </AppShell>
  );
}
```

```tsx app/projects/page.tsx
import { Badge, Span, Table } from "@chakra-ui/react";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { formatDate, projects, statusColor } from "@/lib/data";

export default function ProjectsPage() {
  return (
    <AppShell>
      <PageHeading
        title="Projects"
        description={`${projects.length} projects in the Acme Labs workspace.`}
      />

      <Table.ScrollArea borderWidth="1px" rounded="md">
        <Table.Root size="md" interactive>
          <Table.Caption srOnly>
            Projects with status, open issues and last update
          </Table.Caption>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader scope="col">Key</Table.ColumnHeader>
              <Table.ColumnHeader scope="col">Name</Table.ColumnHeader>
              <Table.ColumnHeader scope="col">Status</Table.ColumnHeader>
              <Table.ColumnHeader scope="col" textAlign="end">
                Open issues
              </Table.ColumnHeader>
              <Table.ColumnHeader scope="col">Updated</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {projects.map((p) => (
              <Table.Row key={p.key}>
                <Table.Cell fontFamily="mono" fontSize="sm">
                  {p.key}
                </Table.Cell>
                <Table.Cell fontWeight="medium">{p.name}</Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={statusColor[p.status]}>{p.status}</Badge>
                </Table.Cell>
                <Table.Cell textAlign="end">{p.issues}</Table.Cell>
                <Table.Cell>
                  <Span whiteSpace="nowrap">
                    <time dateTime={p.updated}>{formatDate(p.updated)}</time>
                  </Span>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </AppShell>
  );
}
```

```tsx components/settings-form.tsx
"use client";

import { useState } from "react";
import { Button, Card, HStack, Input, Stack, Text } from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { toaster } from "@/components/ui/toaster";
import { user } from "@/lib/data";

export function SettingsForm() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [issueAlerts, setIssueAlerts] = useState(true);
  const [productNews, setProductNews] = useState(false);

  const nameInvalid = name.trim().length === 0;
  const emailInvalid = !/^\S+@\S+\.\S+$/.test(email);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (nameInvalid || emailInvalid) return;
    toaster.create({
      title: "Settings saved",
      description: "Your profile and notification preferences are up to date.",
      type: "success",
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <Stack gap="6" maxW="2xl">
        <Card.Root variant="outline">
          <Card.Header>
            <Card.Title>Profile</Card.Title>
            <Card.Description>How you appear to your teammates.</Card.Description>
          </Card.Header>
          <Card.Body>
            <Stack gap="4">
              <Field
                label="Full name"
                required
                invalid={nameInvalid}
                errorText="Name is required."
              >
                <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </Field>
              <Field
                label="Email"
                required
                invalid={emailInvalid}
                errorText="Enter a valid email address."
              >
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </Field>
              <Text fontSize="sm" color="fg.muted">
                Role: {user.role}
              </Text>
            </Stack>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="outline">
          <Card.Header>
            <Card.Title>Notifications</Card.Title>
            <Card.Description>Choose what lands in your inbox.</Card.Description>
          </Card.Header>
          <Card.Body>
            <Stack gap="4">
              <Switch checked={weeklyDigest} onCheckedChange={(e) => setWeeklyDigest(e.checked)}>
                Weekly analytics digest
              </Switch>
              <Switch checked={issueAlerts} onCheckedChange={(e) => setIssueAlerts(e.checked)}>
                Alerts when an issue is assigned to me
              </Switch>
              <Switch checked={productNews} onCheckedChange={(e) => setProductNews(e.checked)}>
                Product news and release notes
              </Switch>
            </Stack>
          </Card.Body>
        </Card.Root>

        <HStack justify="flex-end">
          <Button type="submit">Save changes</Button>
        </HStack>
      </Stack>
    </form>
  );
}
```

```tsx app/settings/page.tsx
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { SettingsForm } from "@/components/settings-form";

export default function SettingsPage() {
  return (
    <AppShell>
      <PageHeading
        title="Settings"
        description="Manage your profile and how Lumen keeps you informed."
      />
      <SettingsForm />
    </AppShell>
  );
}
```