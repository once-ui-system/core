"use client";

/**
 * The three shells from `ai/layouts.md`, as code that compiles.
 *
 * A recipe nobody ever ran is a suggestion. These live here so `pnpm typecheck`
 * covers them: if a prop is renamed or a component changes shape, the recipe
 * fails with everything else rather than going quietly stale in a markdown file.
 *
 * Read `ai/layouts.md` for what each decision is for — the scrolling pane, the
 * sticky offset, the mobile drawer, why nav selection needs the longest match
 * rather than an equality check.
 */
import type { IconName } from "@once-ui-system/core";
import {
  Column,
  Drawer,
  IconButton,
  NavGroup,
  NavItem,
  Row,
  Scrubber,
  SplitView,
  selectNavHref,
} from "@once-ui-system/core";
import { useState } from "react";

export const Shell = ({
  children,
  nav,
  pathname,
}: {
  children: React.ReactNode;
  nav: Item[];
  pathname: string;
}) => {
  // The drawer is open for the path it was opened on, so following one of its
  // links closes it with the navigation — no effect watching the pathname.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  return (
    <Column fill horizontal="center" flex={1}>
      <Row height="56" fillWidth vertical="center" paddingX="16" gap="8">
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="moreHorizontal"
            variant="tertiary"
            tooltip="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
        {/* logo, search, account */}
      </Row>
      <Row fill paddingX="8">
        <Column s={{ hide: true }} maxWidth={18} fitHeight position="sticky" top="56">
          <Nav nav={nav} pathname={pathname} />
        </Column>
        <Row fill horizontal="center" topRadius="l" overflow="hidden">
          <Row
            height="below-header"
            overflowY="auto"
            topRadius="l"
            horizontal="center"
            fillWidth
            background="surface"
          >
            <Column maxWidth="xl" gap="m" paddingY="32" fitHeight>
              {children}
            </Column>
          </Row>
        </Row>
      </Row>
      <Drawer
        open={menuOpen}
        onClose={() => setMenuPath(null)}
        side="left"
        size="s"
        title="Menu"
        flush
      >
        <Column paddingTop="64" paddingBottom="16">
          <Nav nav={nav} pathname={pathname} />
        </Column>
      </Drawer>
    </Column>
  );
};

type Sub = { href: string; label: string; badge?: number };
type Item = { key: string; label: string; icon?: IconName; href?: string; items?: Sub[] };

export const Nav = ({ nav, pathname }: { nav: Item[]; pathname: string }) => {
  const current = selectNavHref(
    pathname,
    nav.flatMap((i) => (i.items ? i.items.map((s) => s.href) : [i.href!])),
  );
  return (
    <Column fill gap="4" paddingX="8">
      {nav.map((item) =>
        item.items ? (
          <NavGroup
            key={item.key}
            label={item.label}
            icon={item.icon}
            defaultOpen={item.items.some((s) => s.href === current)}
          >
            {item.items.map((sub) => (
              <NavItem
                key={sub.href}
                href={sub.href}
                label={sub.label}
                badge={sub.badge}
                selected={sub.href === current}
              />
            ))}
          </NavGroup>
        ) : (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            selected={item.href === current}
          />
        ),
      )}
    </Column>
  );
};

export const Editor = ({
  duration,
  time,
  setTime,
  tracks,
  pause,
}: {
  duration: number;
  time: number;
  setTime: (t: number) => void;
  tracks: React.ComponentProps<typeof Scrubber>["tracks"];
  pause: () => void;
}) => (
  <Column fill>
    <SplitView
      fill
      leftPanel={<Column fill overflowY="auto" />}
      rightPanel={<Column fill overflowY="auto" />}
      defaultSplit={0.28}
      minSplit={0.2}
      maxSplit={0.6}
      collapseBelow="s"
      labels={{ left: "Layers", right: "Canvas" }}
    />
    <Scrubber
      duration={duration}
      value={time}
      onChange={setTime}
      tracks={tracks}
      onGestureStart={pause}
    />
  </Column>
);
