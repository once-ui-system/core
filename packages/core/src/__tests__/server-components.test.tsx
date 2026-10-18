// @vitest-environment node
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Avatar } from "../components/Avatar";
import { Banner } from "../components/Banner";
import { InlineCode } from "../components/InlineCode";
import { Line } from "../components/Line";
import { List } from "../components/List";
import { ListItem } from "../components/ListItem";
import { ProgressBar } from "../components/ProgressBar";
import { Skeleton } from "../components/Skeleton";
import { Tag } from "../components/Tag";
import { Timeline } from "../components/Timeline";
import { User } from "../components/User";
import { LayoutProvider } from "../contexts/LayoutProvider";

/**
 * These components had `"use client"` with nothing that needs the client:
 * no hooks, no handlers of their own, no context, no browser APIs. The
 * directive made each one a client boundary, so a page that rendered a
 * `Tag` or a `Skeleton` shipped it as client JavaScript. Without it they
 * render as server components, and the client parts they use (`Icon`,
 * `Media`, `SmartLink`, `CountFx`) stay client components of their own.
 *
 * Two checks. The source check walks each component's local imports up to
 * the next `"use client"` boundary and fails on anything a server component
 * may not import — the React APIs Next.js rejects in the server graph, plus
 * `useContext`. The render check runs here, in Node with no DOM, under the
 * `LayoutProvider` an app puts at its root: a `style` object sends `Flex`
 * down its client path, which reads the layout context.
 */
const SERVER_COMPONENTS = [
  "Avatar",
  "Banner",
  "InlineCode",
  "Line",
  "List",
  "ListItem",
  "ProgressBar",
  "Skeleton",
  "Tag",
  "Timeline",
  "User",
];

const COMPONENTS = join(__dirname, "..", "components");
const SRC = join(__dirname, "..");

const CLIENT_DIRECTIVE = /^\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*["']use client["']/;

/** React and react-dom APIs that only exist on the client. */
const CLIENT_ONLY_API =
  /\b(?:useState|useEffect|useLayoutEffect|useInsertionEffect|useReducer|useRef|useContext|useImperativeHandle|useSyncExternalStore|useTransition|useDeferredValue|useOptimistic|useActionState|useFormStatus|createContext|createPortal|flushSync|findDOMNode|PureComponent)\b/;

const resolveLocal = (from: string, specifier: string): string | undefined => {
  const base = resolve(dirname(from), specifier);
  return [`${base}.tsx`, `${base}.ts`, join(base, "index.tsx"), join(base, "index.ts")].find(
    existsSync,
  );
};

const localImports = (file: string, source: string): string[] =>
  [...source.matchAll(/^(?:import|export)\s+(?!type\b)[^;]*?from\s+["'](\.[^"']+)["']/gm)]
    .map((match) => match[1])
    .filter((specifier) => !/\.(s?css|json)$/.test(specifier))
    .map((specifier) => resolveLocal(file, specifier))
    .filter((path): path is string => Boolean(path));

/** Every module a server render of `entry` evaluates, with what it may not use. */
const serverGraphOffenders = (entry: string): string[] => {
  const offenders: string[] = [];
  const seen = new Set<string>();
  const visit = (file: string, isEntry: boolean) => {
    if (seen.has(file)) return;
    seen.add(file);
    const source = readFileSync(file, "utf8");
    const name = relative(SRC, file);
    if (CLIENT_DIRECTIVE.test(source)) {
      // A client boundary is fine to render; what is behind it is not ours
      // to check. The entry itself must not be one.
      if (isEntry) offenders.push(`${name}: "use client"`);
      return;
    }
    const api = source.match(CLIENT_ONLY_API);
    if (api) offenders.push(`${name}: ${api[0]}`);
    for (const dep of localImports(file, source)) visit(dep, false);
  };
  visit(entry, true);
  return offenders;
};

describe("components with nothing client-side render as server components", () => {
  it.each(SERVER_COMPONENTS)(
    "%s has no client directive and no client-only API behind it",
    (name) => {
      expect(serverGraphOffenders(join(COMPONENTS, `${name}.tsx`))).toEqual([]);
    },
  );

  it.each(SERVER_COMPONENTS)("%s defines no event handler of its own", (name) => {
    const source = readFileSync(join(COMPONENTS, `${name}.tsx`), "utf8");
    // `onBackground` and `onSolid` are colour props, not handlers.
    expect(source).not.toMatch(/\son(?!Background\b|Solid\b)[A-Z][A-Za-z]*=\{/);
    expect(source).not.toMatch(/\b(?:window|document|navigator|localStorage)\./);
  });

  it("renders each one in Node", () => {
    const html = renderToString(
      <LayoutProvider>
        <Line />
        <Banner>Banner</Banner>
        <List>
          <ListItem>Item</ListItem>
        </List>
        <InlineCode>code</InlineCode>
        <Skeleton shape="line" />
        <ProgressBar value={40} />
        <Timeline items={[{ label: "Step one", tone: "success" }, { label: "Step two" }]} />
        <Tag variant="announce" label="New" href="/changelog" />
        <Tag label="Live" prefixIcon="check" />
        <Avatar value="AB" statusIndicator={{ scheme: "green" }} />
        <Avatar loading />
        <User
          name="Ada"
          subline="Engineer"
          tagProps={{ label: "Admin" }}
          avatarProps={{ value: "A" }}
        />
      </LayoutProvider>,
    );

    for (const text of [
      "Banner",
      "Item",
      "code",
      "Step one",
      "New",
      "Live",
      "AB",
      "Ada",
      "Admin",
    ]) {
      expect(html).toContain(text);
    }
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('href="/changelog"');
  });
});
