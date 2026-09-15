/**
 * The three shells from `ai/layouts.md`, as code that compiles.
 *
 * A recipe nobody ever ran is a suggestion. These live here so `pnpm typecheck`
 * covers them: if a prop is renamed or a component changes shape, the recipe
 * fails with everything else rather than going quietly stale in a markdown file.
 *
 * Read `ai/layouts.md` for what each decision is for — the scrolling pane, the
 * sticky offset, why nav selection needs the longest match rather than an
 * equality check.
 */
import {
  Column, Row, SplitView, Scrubber, NavGroup, NavItem, selectNavHref,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";

const Header = () => <Row height="56" fillWidth />;
const Sidebar = (p: React.ComponentProps<typeof Column>) => <Column {...p} />;

export const Shell = ({ children }: { children: React.ReactNode }) => (
  <Column fill horizontal="center" flex={1}>
    <Header />
    <Row fill paddingX="8">
      <Sidebar s={{ hide: true }} maxWidth={18} fitHeight position="sticky" top="56" />
      <Row fill horizontal="center" topRadius="l" overflow="hidden">
        <Row
          height="calc(100dvh - var(--static-space-56))"
          overflowY="auto"
          topRadius="l"
          horizontal="center"
          fillWidth
          background="surface">
          <Column maxWidth="xl" gap="m" paddingY="32" fitHeight>
            {children}
          </Column>
        </Row>
      </Row>
    </Row>
  </Column>
);

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
            defaultOpen={item.items.some((s) => s.href === current)}>
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
  duration, time, setTime, tracks, pause,
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
