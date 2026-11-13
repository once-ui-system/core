"use client";

import { Button, Column, Row, SegmentedControl, Tag, Text, useToast } from "@once-ui-system/core";
import { CodeBlock } from "@once-ui-system/core/code";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { harness } from "@/resources/prompts";
import { basePath } from "@/resources/versions";
import { dev } from "@/utils/dev-logger";
import { useBlockDocsLinks } from "./BlockDocsLinks";
import { BlockErrorBoundary } from "./BlockErrorBoundary";
import { BlockFilmstrip } from "./BlockFilmstrip";
import styles from "./BlockPage.module.scss";
import { BlockTitle } from "./BlockTitle";
import { findCategoryGroup, findCategoryGroupTitle, findCategoryMeta } from "./blockMeta";
import { onceUIComponentsIn } from "./blockSource";
import DocsLayout from "./layout";

export { findCategoryMeta };

type PreviewHeight = "auto" | "fixed";

export type BlockFileDef =
  | string
  | { file: string; label?: string; language?: string }
  | { code: string; label: string; language?: string };

export interface BlockExampleDef {
  /** Must match an `examples[].title` entry for this category in resources/blocks.js */
  id: string;
  /**
   * Code tabs: filenames served from /blocks (tab label defaults to the
   * filename stem without trailing digits), or inline { code, label } snippets.
   */
  files: BlockFileDef[];
  /** Preview content, including its wrapper (background, padding, alignment) */
  render: () => ReactNode;
  /** Override the page's preview sizing: "auto" hugs content (capped at 80vh), "fixed" is always 80vh */
  previewHeight?: PreviewHeight;
  /** Title/description fallback for examples that have no entry in resources/blocks.js */
  meta?: ExampleMeta;
}

interface BlockPageProps {
  /** URL segment under /blocks, e.g. "hero" — resolved against item hrefs in resources/blocks.js */
  category: string;
  examples: BlockExampleDef[];
  reloadButton?: boolean;
  /** Default preview sizing for all examples on the page; "fixed" for previews that fill their frame (dashboards, sidebars) */
  previewHeight?: PreviewHeight;
}

export interface ExampleMeta {
  title: string;
  description: string;
  updated?: string;
  created?: string;
}

// Sections/Misc previews are bare components; the page frames them with default
// padding/min-height. Other groups (landing, application, layout) frame themselves.
const FRAMED_GROUPS = new Set(["sections", "misc"]);

const isInline = (file: BlockFileDef): file is { code: string; label: string; language?: string } =>
  typeof file !== "string" && "code" in file;

const derivedLabel = (name: string) => name.replace(/\.\w+$/, "").replace(/\d+$/, "");

const fileLabel = (file: BlockFileDef) => {
  if (typeof file === "string") return derivedLabel(file);
  return file.label ?? derivedLabel((file as { file: string }).file);
};

const fileLanguage = (file: BlockFileDef) =>
  (typeof file === "string" ? undefined : file.language) ?? "tsx";

const fileCache = new Map<string, Promise<string>>();

function fetchFileContent(file: string): Promise<string> {
  let promise = fileCache.get(file);
  if (!promise) {
    promise = fetch(`${basePath}/blocks/${file}`)
      .then((response) => (response.ok ? response.text() : ""))
      .catch(() => "");
    fileCache.set(file, promise);
  }
  return promise;
}

/** A prompt that hands one block to a coding agent: the harness, the intent, then the source. */
function buildBlockPrompt(
  title: string,
  description: string,
  files: { label: string; code: string; language: string }[],
) {
  const sources = files
    .filter((file) => file.code)
    .map((file) => `${file.label}:\n\`\`\`${file.language}\n${file.code.trimEnd()}\n\`\`\``)
    .join("\n\n");
  return `${harness}

Add the Once UI block "${title}" to my app${description ? ` (${description})` : ""}. Keep its layout and components; replace the copy, links and images with my product's.

${sources}`;
}

/**
 * A block's preview as the page shows it. Sections/Misc previews are bare
 * components, so they get default padding, a min-height so narrow components
 * don't collapse, and centering; other groups frame themselves.
 */
function renderBlock(example: BlockExampleDef, framed: boolean, isFixed: boolean) {
  const rendered = <BlockErrorBoundary key={example.id}>{example.render()}</BlockErrorBoundary>;
  if (!framed) return rendered;
  return (
    <Row
      fillWidth
      fillHeight={isFixed}
      fitHeight={!isFixed}
      horizontal="center"
      vertical="start"
      center={false}
      minHeight={24}
      padding="l"
    >
      {rendered}
    </Row>
  );
}

/** The Once UI components a block is built from, each linked to its docs page when it has one. */
function BuiltWith({ sources }: { sources: string[] }) {
  const links = useBlockDocsLinks();
  const components = onceUIComponentsIn(sources);
  if (!components.length) return null;
  return (
    <Row flex={1} minWidth={0} wrap gap="8" vertical="center">
      <Text variant="label-default-s" onBackground="neutral-weak" marginRight="4">
        Built with
      </Text>
      {components.map((name) => {
        const href = links[name.toLowerCase()];
        return href ? (
          <Button key={name} href={href} size="s" variant="secondary" weight="default">
            {name}
          </Button>
        ) : (
          <Tag key={name} size="m">
            {name}
          </Tag>
        );
      })}
    </Row>
  );
}

function BlockExample({
  example,
  meta,
  reloadButton,
  previewHeight,
  framed,
  footerEnd,
}: {
  example: BlockExampleDef;
  meta: ExampleMeta | undefined;
  reloadButton?: boolean;
  previewHeight: PreviewHeight;
  framed: boolean;
  /** Shown at the end of the "Built with" row, e.g. previous/next block buttons. */
  footerEnd?: ReactNode;
}) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [contents, setContents] = useState<string[]>(() => example.files.map(() => ""));
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mount the live preview only when the example is near the viewport, so
  // offscreen animations and videos don't run all at once.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const MARGIN = 800;
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight + MARGIN && rect.bottom > -MARGIN) {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: `${MARGIN}px 0px` },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      example.files.map((file) =>
        isInline(file)
          ? Promise.resolve(file.code)
          : fetchFileContent(typeof file === "string" ? file : file.file),
      ),
    ).then((results) => {
      if (!cancelled) setContents(results);
    });
    return () => {
      cancelled = true;
    };
  }, [example.files]);

  const codes = [
    { code: "", language: "jsx", label: "Preview" },
    ...example.files.map((file, index) => ({
      code: contents[index],
      language: fileLanguage(file),
      label: fileLabel(file),
    })),
  ];

  const { addToast } = useToast();
  const title = meta?.title ?? example.id;
  const description = meta?.description ?? "";
  const sourcesLoaded = contents.some(Boolean);

  const copyPrompt = async () => {
    const prompt = buildBlockPrompt(title, description, codes.slice(1));
    try {
      await navigator.clipboard.writeText(prompt);
      addToast({ variant: "success", message: `Prompt for ${title} copied` });
    } catch {
      addToast({ variant: "danger", message: "Couldn't copy to the clipboard" });
    }
  };

  const isFixed = (example.previewHeight ?? previewHeight) === "fixed";

  const preview =
    selectedTab !== 0 ? undefined : inView ? (
      renderBlock(example, framed, isFixed)
    ) : (
      <Row fillWidth minHeight={24} />
    );

  // Content-sized on the preview tab (capped at 80vh); the code view and
  // "fixed" previews (frame-filling modules) keep the full-height frame.
  const autoHeight = !isFixed && selectedTab === 0;

  return (
    <Column ref={containerRef} fillWidth gap="12">
      <Row fillWidth horizontal="between" vertical="center" wrap gap="12" paddingX="16">
        <BlockTitle
          id={example.id}
          title={title}
          description={description}
          created={meta?.created}
          updated={meta?.updated}
        />
        <Button
          size="s"
          variant="secondary"
          prefixIcon="sparkle"
          disabled={!sourcesLoaded}
          onClick={copyPrompt}
        >
          Copy prompt
        </Button>
      </Row>
      <CodeBlock
        className={styles.frame}
        lineNumbers
        styleButton
        reloadButton={reloadButton}
        fullscreenButton
        copyButton
        previewPadding="0"
        vertical="start"
        style={autoHeight ? { maxHeight: "80vh" } : { height: "80vh" }}
        fillHeight
        preview={preview}
        codes={codes}
        onInstanceChange={setSelectedTab}
      />
      <Row fillWidth wrap gap="12" vertical="center" paddingX="16">
        <BuiltWith sources={contents} />
        {footerEnd}
      </Row>
    </Column>
  );
}

export function BlockPage({
  category,
  examples,
  reloadButton,
  previewHeight = "auto",
}: BlockPageProps) {
  const meta = findCategoryMeta(category);
  const framed = FRAMED_GROUPS.has(findCategoryGroup(category) ?? "");
  const groupTitle = findCategoryGroupTitle(category);

  const exampleById = new Map(examples.map((example) => [example.id, example]));
  const metaByTitle = new Map((meta?.examples ?? []).map((entry) => [entry.title, entry]));

  if (process.env.NODE_ENV !== "production") {
    for (const example of examples) {
      if (!metaByTitle.has(example.id) && !example.meta) {
        dev.error(
          `BlockPage: example "${example.id}" has no matching entry in resources/blocks.js for category "${category}"`,
        );
      }
    }
    for (const entry of meta?.examples ?? []) {
      if (!exampleById.has(entry.title)) {
        dev.error(
          `BlockPage: resources/blocks.js lists "${entry.title}" for category "${category}" but no example was provided`,
        );
      }
    }
  }

  // Order by the blocks.js example list (newest last), shown newest-first;
  // manifest-only examples are appended so a metadata gap can't hide them.
  const ordered = [
    ...(meta?.examples ?? [])
      .map((entry) => exampleById.get(entry.title))
      .filter((example): example is BlockExampleDef => Boolean(example)),
    ...examples.filter((example) => !metaByTitle.has(example.id)),
  ].reverse();

  const ids = ordered.map((example) => example.id);
  const idsKey = ids.join("|");
  const browsable = ordered.length > 1;
  const [mode, setMode] = useState<ViewMode>("focus");
  const [activeId, setActiveId] = useState(ids[0] ?? "");

  // `?view=all` opens on the full list (the visual check uses it to shoot every block).
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("view") === "all") setMode("all");
  }, []);

  // The block in focus follows the URL hash (#About7), so a link to one block
  // opens on that block.
  // biome-ignore lint/correctness/useExhaustiveDependencies: idsKey stands in for ids, which is a new array every render
  useEffect(() => {
    const sync = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (ids.includes(id)) setActiveId(id);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [idsKey]);

  // Picking a block takes the reader to it. In focus mode the block only exists
  // after the re-render, so the scroll waits for the commit below.
  const scrollTarget = useRef<string | null>(null);
  const select = (id: string) => {
    setActiveId(id);
    window.history.replaceState(null, "", `#${encodeURIComponent(id)}`);
    scrollTarget.current = id;
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: runs after each selection commits; activeId is the trigger
  useEffect(() => {
    const id = scrollTarget.current;
    if (!id) return;
    scrollTarget.current = null;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeId]);

  const activeIndex = Math.max(0, ids.indexOf(activeId));
  const active = ordered[activeIndex];
  const previous = ordered[(activeIndex - 1 + ordered.length) % ordered.length];
  const next = ordered[(activeIndex + 1) % ordered.length];
  const titleOf = (example: BlockExampleDef) =>
    (metaByTitle.get(example.id) ?? example.meta)?.title ?? example.id;
  const isFixedFor = (example: BlockExampleDef) =>
    (example.previewHeight ?? previewHeight) === "fixed";

  const renderExample = (example: BlockExampleDef, footerEnd?: ReactNode) => (
    <BlockExample
      key={example.id}
      example={example}
      meta={metaByTitle.get(example.id) ?? example.meta}
      reloadButton={reloadButton}
      previewHeight={previewHeight}
      framed={framed}
      footerEnd={footerEnd}
    />
  );

  return (
    <DocsLayout
      title={meta?.label ?? category}
      description={meta?.description}
      breadcrumbs={[
        { label: "Blocks", href: findCategoryMeta("quickStart")?.href ?? "/blocks/quickStart" },
        ...(groupTitle ? [{ label: groupTitle }] : []),
        { label: meta?.label ?? category },
      ]}
      aside={
        browsable ? (
          <Row gap="16" vertical="center" wrap>
            <Text variant="label-default-s" onBackground="neutral-weak">
              {ordered.length} variants
            </Text>
            <SegmentedControl
              fillWidth={false}
              value={mode}
              onChange={(value) => setMode(value as ViewMode)}
              buttons={[
                { value: "focus", label: "Focus" },
                { value: "all", label: "All blocks" },
              ]}
            />
          </Row>
        ) : undefined
      }
    >
      {browsable && (
        <BlockFilmstrip
          activeId={active?.id ?? ""}
          onSelect={select}
          items={ordered.map((example) => ({
            id: example.id,
            title: titleOf(example),
            render: () => renderBlock(example, framed, isFixedFor(example)),
          }))}
        />
      )}
      {mode === "focus" && active
        ? renderExample(
            active,
            browsable ? (
              <Row gap="8">
                <Button
                  size="s"
                  variant="secondary"
                  prefixIcon="chevronLeft"
                  onClick={() => select(previous.id)}
                  aria-label={`Previous block: ${titleOf(previous)}`}
                >
                  {titleOf(previous)}
                </Button>
                <Button
                  size="s"
                  variant="secondary"
                  suffixIcon="chevronRight"
                  onClick={() => select(next.id)}
                  aria-label={`Next block: ${titleOf(next)}`}
                >
                  {titleOf(next)}
                </Button>
              </Row>
            ) : undefined,
          )
        : ordered.map((example) => renderExample(example))}
    </DocsLayout>
  );
}

type ViewMode = "focus" | "all";
