"use client";

import { Column, Row } from "@once-ui-system/core";
import { CodeBlock } from "@once-ui-system/core/code";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { blocks } from "@/resources";
import type { BlockItem } from "@/types";
import { dev } from "@/utils/dev-logger";
import { BlockTitle } from "./BlockTitle";
import DocsLayout from "./layout";

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

type BlockItemMeta = BlockItem;

export function findCategoryMeta(category: string): BlockItemMeta | undefined {
  const href = `/blocks/${category}`;
  for (const section of Object.values(blocks)) {
    const items = Array.isArray(section.items) ? section.items : Object.values(section.items);
    const match = items.find((item) => item.href === href);
    if (match) return match;
  }
  return undefined;
}

// Returns the top-level group key (landingPage, application, sections, ...) the category belongs to.
function findCategoryGroup(category: string): string | undefined {
  const href = `/blocks/${category}`;
  for (const [groupKey, section] of Object.entries(blocks)) {
    const items = Array.isArray(section.items) ? section.items : Object.values(section.items);
    if (items.some((item) => item.href === href)) return groupKey;
  }
  return undefined;
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
    promise = fetch(`/blocks/${file}`)
      .then((response) => (response.ok ? response.text() : ""))
      .catch(() => "");
    fileCache.set(file, promise);
  }
  return promise;
}

function BlockExample({
  example,
  meta,
  reloadButton,
  previewHeight,
  framed,
}: {
  example: BlockExampleDef;
  meta: ExampleMeta | undefined;
  reloadButton?: boolean;
  previewHeight: PreviewHeight;
  framed: boolean;
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

  const isFixed = (example.previewHeight ?? previewHeight) === "fixed";

  // Sections/Misc previews are bare components — frame them with default padding,
  // a min-height so narrow components don't collapse, and centering.
  const renderPreview = () => {
    const rendered = example.render();
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
  };

  const preview =
    selectedTab !== 0 ? undefined : inView ? (
      renderPreview()
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
          title={meta?.title ?? example.id}
          description={meta?.description ?? ""}
          created={meta?.created}
          updated={meta?.updated}
        />
      </Row>
      <CodeBlock
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

  return (
    <DocsLayout title={meta?.label ?? category} description={meta?.description}>
      {ordered.map((example) => (
        <BlockExample
          key={example.id}
          example={example}
          meta={metaByTitle.get(example.id) ?? example.meta}
          reloadButton={reloadButton}
          previewHeight={previewHeight}
          framed={framed}
        />
      ))}
    </DocsLayout>
  );
}
