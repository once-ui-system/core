"use client";

import {
  Button,
  Column,
  Dropdown,
  IconButton,
  type IconName,
  Option,
  Row,
  SegmentedControl,
  Spinner,
  type StyleScopeConfig,
  Text,
} from "@once-ui-system/core";
import {
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { SiteAdapter } from "./adapter.js";
import { type SaveState, useAutosave } from "./autosave.js";
import { applyCommand, type PageCommand } from "./commands.js";
import { DesignPanel } from "./components/DesignPanel.js";
import { EditorRail } from "./components/EditorRail.js";
import { PagesPanel } from "./components/PagesPanel.js";
import { DEVICES, type Device, PreviewFrame } from "./components/PreviewFrame.js";
import { SectionList } from "./components/SectionList.js";
import { SectionPanel } from "./components/SectionPanel.js";
import { ShortcutSheet } from "./components/ShortcutSheet.js";
import {
  EditorContextProvider,
  type EditorContextValue,
  type FieldRenderer,
  useEditorContext,
} from "./context.js";
import { useHistory } from "./history.js";
import { DEFAULT_EDITOR_LABELS, type EditorLabels } from "./labels.js";
import {
  type ChromeDefinition,
  createSection,
  type EditorField,
  FOOTER_ID,
  HEADER_ID,
  isChrome,
  type Page,
  type PageEntry,
  type SectionDefinition,
  type SiteStyle,
} from "./model.js";
import { useEditorShortcuts } from "./shortcuts.js";

const DEVICE_ICON: Record<Device, IconName> = {
  desktop: "computer",
  tablet: "screen",
  mobile: "phone",
};

// On the token scale: n/16 rem, so 352 is 22rem.
const PANEL_WIDTH = { min: 288, default: 352, max: 512 };
const PANEL_WIDTH_KEY = "once-ui.site-editor.panel-width";

interface Doc {
  page: Page;
  style: SiteStyle;
}

/** A panel a product adds to the rail, after the kit's own. */
export interface EditorPanel {
  id: string;
  icon: IconName;
  label: string;
  render: () => ReactNode;
}

/** What an assistant, an MCP bridge or a test drives the editor through. */
export interface SiteEditorApi {
  /** Run a page command; it undoes, saves and previews like a change made by hand. */
  dispatch: (command: PageCommand) => void;
  /** Change the site's style. */
  setStyle: (patch: Partial<SiteStyle>) => void;
  select: (id: string | null) => void;
  openPage: (id: string) => Promise<void>;
  /** The page and style as they stand, unsaved changes included. */
  read: () => { pageId: string; page: Page; style: SiteStyle };
  /** Save now instead of after the pause. */
  flush: () => Promise<void>;
}

export interface SiteEditorProps {
  adapter: SiteAdapter;
  /** The section types offered: blocks' `sectionSchemas` and the product's own. */
  sections: readonly SectionDefinition[];
  /** The header's and footer's fields; a part left out has no tile. */
  chrome?: { header?: ChromeDefinition; footer?: ChromeDefinition };
  /** Words, for a translated editor. A key left out keeps the English. */
  labels?: Partial<EditorLabels>;
  /** A field's label, for translating the schemas' English ones. */
  fieldLabel?: (type: string, field: EditorField) => string;
  /** Extra field kinds by `kind` (a menu picker, an image upload). */
  fieldKinds?: Record<string, FieldRenderer>;
  /** Extra section drawings by `type` or `type.layout`. */
  glyphs?: Record<string, ReactNode>;
  /** The product's own panels, after Sections, Pages and Design. */
  panels?: EditorPanel[];
  /** The site's languages, own first; the switch shows with more than one. */
  languages?: { value: string; label: string }[];
  /** Where Leave the editor goes. */
  exitHref?: string;
  /** The page opened first; the home page when unset. */
  initialPage?: string;
  readOnly?: boolean;
  /** Called when a save fails, with the error, for the product's own report. */
  onError?: (error: unknown) => void;
  apiRef?: Ref<SiteEditorApi>;
}

function SaveStatus({ state, onRetry }: { state: SaveState; onRetry: () => void }) {
  const { labels } = useEditorContext();
  if (state === "error") {
    return (
      <Row gap="8" vertical="center">
        <Text variant="label-default-xs" onBackground="danger-medium">
          {labels.saveFailed}
        </Text>
        <Button size="s" variant="tertiary" onClick={onRetry}>
          {labels.retry}
        </Button>
      </Row>
    );
  }
  const text = { saved: labels.saved, saving: labels.saving, unsaved: labels.unsaved }[state];
  return (
    <Text variant="label-default-xs" onBackground="neutral-weak" aria-live="polite">
      {text}
    </Text>
  );
}

const worst = (a: SaveState, b: SaveState): SaveState => {
  const order: SaveState[] = ["saved", "unsaved", "saving", "error"];
  return order.indexOf(a) > order.indexOf(b) ? a : b;
};

/**
 * The editor: rail, panel, toolbar and live preview, wired to an adapter.
 * See the README for the interaction spec it keeps.
 */
export function SiteEditor({
  adapter,
  sections: sectionTypes,
  chrome,
  labels: labelOverrides,
  fieldLabel,
  fieldKinds = {},
  glyphs = {},
  panels = [],
  languages = [],
  exitHref,
  initialPage,
  readOnly = false,
  onError,
  apiRef,
}: SiteEditorProps) {
  const labels = useMemo(() => ({ ...DEFAULT_EDITOR_LABELS, ...labelOverrides }), [labelOverrides]);
  const definitions = useMemo(
    () => Object.fromEntries(sectionTypes.map((definition) => [definition.type, definition])),
    [sectionTypes],
  );
  const context: EditorContextValue = useMemo(
    () => ({
      labels,
      definitions,
      glyphs,
      fieldKinds,
      fieldLabel: fieldLabel ?? ((_type, field) => field.label),
    }),
    [labels, definitions, glyphs, fieldKinds, fieldLabel],
  );

  const [pages, setPages] = useState<PageEntry[]>([]);
  const [pageId, setPageId] = useState<string>(initialPage ?? "");
  const [loaded, setLoaded] = useState(0);
  const [loading, setLoading] = useState(true);
  const history = useHistory<Doc>({ page: { sections: [] }, style: { config: {} } });
  const doc = history.value;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tab, setTab] = useState("sections");
  const [device, setDevice] = useState<Device>("desktop");
  const [lang, setLang] = useState(languages[0]?.value);
  const [revision, setRevision] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const [unpublished, setUnpublished] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [panelWidth, setPanelWidth] = useState(PANEL_WIDTH.default);

  const report = useCallback(
    async (write: () => Promise<void>) => {
      try {
        await write();
      } catch (error) {
        onError?.(error);
        throw error;
      }
    },
    [onError],
  );

  const pageSave = useAutosave(doc.page, (page) => report(() => adapter.savePage(pageId, page)), {
    resetKey: `${pageId}:${loaded}`,
  });
  const styleSave = useAutosave(doc.style, (style) => report(() => adapter.saveStyle(style)), {
    resetKey: loaded === 0 ? "style:loading" : "style",
  });
  const saveState = worst(pageSave.state, styleSave.state);
  const flush = useCallback(async () => {
    await Promise.all([pageSave.flush(), styleSave.flush()]);
  }, [pageSave, styleSave]);

  // First load: the index, the style, and the first page.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs once per adapter
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [index, style] = await Promise.all([adapter.listPages(), adapter.loadStyle()]);
      const first =
        index.find((p) => p.id === initialPage) ?? index.find((p) => p.home) ?? index[0];
      const page = first ? await adapter.loadPage(first.id) : { sections: [] };
      if (cancelled) return;
      setPages(index);
      setPageId(first?.id ?? "");
      history.reset({ page, style });
      setLoaded((n) => n + 1);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [adapter]);

  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem(PANEL_WIDTH_KEY));
      if (saved >= PANEL_WIDTH.min && saved <= PANEL_WIDTH.max) setPanelWidth(saved);
    } catch {
      // No storage: the default width.
    }
  }, []);

  // After a save lands, whether there is anything to publish.
  useEffect(() => {
    if (saveState !== "saved" || !adapter.hasUnpublished) return;
    let cancelled = false;
    adapter.hasUnpublished().then((value) => {
      if (!cancelled) setUnpublished(value);
    });
    return () => {
      cancelled = true;
    };
  }, [saveState, adapter]);

  const openPage = useCallback(
    async (id: string) => {
      if (id === pageId) return;
      await flush();
      setLoading(true);
      const page = await adapter.loadPage(id);
      setPageId(id);
      history.reset({ page, style: history.value.style });
      setLoaded((n) => n + 1);
      // The header and footer are on every page, so they stay open.
      setSelectedId((current) => (isChrome(current) ? current : null));
      setLoading(false);
    },
    [adapter, flush, history, pageId],
  );

  const dispatch = useCallback(
    (command: PageCommand) => {
      if (readOnly) return;
      const key = command.type === "setProp" ? `${command.id}.${command.key}` : undefined;
      history.set((current) => ({ ...current, page: applyCommand(current.page, command) }), key);
    },
    [history, readOnly],
  );

  const setStyle = useCallback(
    (patch: Partial<SiteStyle>, key?: string) => {
      if (readOnly) return;
      history.set((current) => ({ ...current, style: { ...current.style, ...patch } }), key);
    },
    [history, readOnly],
  );

  const setConfig = useCallback(
    (patch: Partial<StyleScopeConfig>, key: string) =>
      setStyle({ config: { ...history.value.style.config, ...patch } }, `style.${key}`),
    [setStyle, history.value.style.config],
  );

  const sections = doc.page.sections;
  const selectedIndex = sections.findIndex((section) => section.id === selectedId);
  const selected = selectedIndex >= 0 ? sections[selectedIndex] : undefined;

  const addable = useMemo(
    () =>
      sectionTypes.filter(
        (definition) =>
          definition.maxPerPage === undefined ||
          sections.filter((section) => section.type === definition.type).length <
            definition.maxPerPage,
      ),
    [sectionTypes, sections],
  );

  const add = (type: string, index: number) => {
    const definition = definitions[type];
    if (!definition) return;
    const section = createSection(definition);
    dispatch({ type: "add", section, index });
    setSelectedId(section.id);
  };

  const remove = (id: string) => {
    const index = sections.findIndex((section) => section.id === id);
    dispatch({ type: "remove", id });
    // Selection moves to the neighbour, so a run of removes stays in place.
    const neighbour = sections[index + 1] ?? sections[index - 1];
    setSelectedId(neighbour && neighbour.id !== id ? neighbour.id : null);
  };

  const move = (id: string, by: number) => {
    const index = sections.findIndex((section) => section.id === id);
    if (index < 0) return;
    dispatch({ type: "move", id, to: index + by });
  };

  const duplicate = (id: string) => {
    const newId = `${id}-copy-${Date.now().toString(36)}`;
    dispatch({ type: "duplicate", id, newId });
    setSelectedId(newId);
  };

  useEditorShortcuts(
    {
      undo: history.undo,
      redo: history.redo,
      duplicate: selected ? () => duplicate(selected.id) : undefined,
      moveUp: selected && selectedIndex > 0 ? () => move(selected.id, -1) : undefined,
      moveDown:
        selected && selectedIndex < sections.length - 1 ? () => move(selected.id, 1) : undefined,
      remove: selected ? () => remove(selected.id) : undefined,
      back: selectedId ? () => setSelectedId(null) : undefined,
      help: () => setHelpOpen(true),
    },
    !readOnly && !loading,
  );

  const docRef = useRef({ pageId, doc });
  docRef.current = { pageId, doc };
  useImperativeHandle(
    apiRef,
    () => ({
      dispatch,
      setStyle,
      select: setSelectedId,
      openPage,
      read: () => ({
        pageId: docRef.current.pageId,
        page: docRef.current.doc.page,
        style: docRef.current.doc.style,
      }),
      flush,
    }),
    [dispatch, setStyle, openPage, flush],
  );

  const onSelect = useCallback((id: string) => {
    setTab("sections");
    setSelectedId((current) => (current === id ? null : id));
  }, []);
  const onPreviewSelect = useCallback((id: string) => {
    setTab("sections");
    setSelectedId(id);
  }, []);
  const onNavigate = useCallback(
    (path: string) => {
      const slug = path.split(/[?#]/)[0]?.replace(/^\/+|\/+$/g, "") ?? "";
      const target = pages.find((page) => page.slug === slug);
      if (target) void openPage(target.id);
    },
    [pages, openPage],
  );

  const publish = async () => {
    if (!adapter.publish) return;
    setPublishing(true);
    try {
      await flush();
      await adapter.publish();
      setUnpublished(false);
    } catch (error) {
      onError?.(error);
    } finally {
      setPublishing(false);
    }
  };

  const startResize = (event: React.PointerEvent<HTMLElement>) => {
    const startX = event.clientX;
    const startWidth = panelWidth;
    // Token units per pixel: 16 per rem of the root font size.
    const unit =
      16 / (Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16);
    let width = startWidth;
    const onMove = (move: PointerEvent) => {
      width = Math.min(
        PANEL_WIDTH.max,
        Math.max(PANEL_WIDTH.min, startWidth + (move.clientX - startX) * unit),
      );
      setPanelWidth(width);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      try {
        window.localStorage.setItem(PANEL_WIDTH_KEY, String(Math.round(width)));
      } catch {
        // Not remembered, which is fine.
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const currentPage = pages.find((page) => page.id === pageId);
  const pageName = (page?: PageEntry) =>
    page ? page.title || (page.home ? labels.homePage : `/${page.slug}`) : "";

  const tabs = [
    { id: "sections", icon: "grid" as IconName, label: labels.sections },
    { id: "pages", icon: "document" as IconName, label: labels.pages },
    { id: "design", icon: "adjustments" as IconName, label: labels.design },
    ...panels.map(({ id, icon, label }) => ({ id, icon, label })),
  ];

  const chromePanel = (id: typeof HEADER_ID | typeof FOOTER_ID) => {
    const part = id === HEADER_ID ? "header" : "footer";
    const definition = chrome?.[part];
    if (!definition) return null;
    const values = doc.style[part] ?? {};
    return (
      <SectionPanel
        id={part}
        type={part}
        title={definition.label}
        description={labels.pinnedHint}
        fields={definition.fields}
        values={values}
        onChange={(key, value) =>
          setStyle({ [part]: { ...values, [key]: value } }, `${part}.${key}`)
        }
        onBack={() => setSelectedId(null)}
      />
    );
  };

  const panel = (() => {
    if (tab === "pages") {
      return (
        <PagesPanel
          pages={pages}
          current={pageId}
          onOpen={(id) => {
            void openPage(id);
            setTab("sections");
          }}
          onCreate={
            adapter.createPage && !readOnly
              ? async (input) => {
                  const entry = await adapter.createPage?.(input);
                  setPages(await adapter.listPages());
                  if (entry) await openPage(entry.id);
                  setTab("sections");
                }
              : undefined
          }
          onRename={
            adapter.updatePage && !readOnly
              ? async (id, input) => {
                  await adapter.updatePage?.(id, input);
                  setPages(await adapter.listPages());
                }
              : undefined
          }
          onRemove={
            adapter.removePage && !readOnly
              ? async (id) => {
                  await adapter.removePage?.(id);
                  const next = await adapter.listPages();
                  setPages(next);
                  if (id === pageId) {
                    const home = next.find((page) => page.home) ?? next[0];
                    if (home) {
                      // The page is gone: nothing of it to save.
                      setLoading(true);
                      const page = await adapter.loadPage(home.id);
                      setPageId(home.id);
                      history.reset({ page, style: history.value.style });
                      setLoaded((n) => n + 1);
                      setLoading(false);
                    }
                  }
                }
              : undefined
          }
        />
      );
    }
    if (tab === "design") return <DesignPanel style={doc.style} onChange={setConfig} />;
    const custom = panels.find((p) => p.id === tab);
    if (custom) return custom.render();

    if (selectedId === HEADER_ID || selectedId === FOOTER_ID) {
      const open = chromePanel(selectedId);
      if (open) return open;
    }
    if (selected) {
      const definition = definitions[selected.type];
      return (
        <SectionPanel
          key={selected.id}
          id={selected.id}
          type={selected.type}
          title={definition?.label ?? selected.type}
          description={definition?.description}
          fields={definition?.fields ?? []}
          values={selected.props}
          onChange={(key, value) => dispatch({ type: "setProp", id: selected.id, key, value })}
          onBack={() => setSelectedId(null)}
          actions={
            readOnly
              ? undefined
              : {
                  duplicate: () => duplicate(selected.id),
                  moveUp: selectedIndex > 0 ? () => move(selected.id, -1) : undefined,
                  moveDown:
                    selectedIndex < sections.length - 1 ? () => move(selected.id, 1) : undefined,
                  remove: () => remove(selected.id),
                }
          }
        />
      );
    }
    return (
      <Column fillWidth paddingY="16">
        <SectionList
          sections={sections}
          selectedId={selectedId}
          addable={addable}
          chrome={{ header: !!chrome?.header, footer: !!chrome?.footer }}
          readOnly={readOnly}
          onSelect={onSelect}
          onHover={setHoveredId}
          onMove={(id, to) => dispatch({ type: "move", id, to })}
          onAdd={add}
        />
      </Column>
    );
  })();

  const primary = adapter.publish ? (
    <Button
      size="s"
      variant="primary"
      loading={publishing}
      disabled={readOnly || publishing || (!unpublished && saveState === "saved")}
      onClick={publish}
    >
      {publishing ? labels.publishing : unpublished ? labels.publish : labels.published}
    </Button>
  ) : adapter.siteUrl ? (
    <Button size="s" variant="primary" href={adapter.siteUrl} suffixIcon="arrowUpRight">
      {labels.openSite}
    </Button>
  ) : null;

  return (
    <EditorContextProvider value={context}>
      <Row fill overflow="hidden" background="page" m={{ direction: "column", overflowY: "auto" }}>
        <Row fillHeight fitWidth m={{ hide: true }}>
          <EditorRail
            tabs={tabs}
            value={tab}
            onValueChange={(id) => {
              setTab(id);
              if (id !== "sections") setHoveredId(null);
            }}
            exitHref={exitHref}
            exitLabel={labels.exit}
          />
        </Row>

        <Row
          fillHeight
          position="relative"
          width={panelWidth}
          minWidth={PANEL_WIDTH.min}
          m={{ width: undefined, fillWidth: true, fillHeight: false }}
        >
          <Column fill overflowY="auto" paddingX="16" paddingBottom="16">
            <Row hide m={{ hide: false }} paddingTop="12">
              <SegmentedControl
                fillWidth
                value={tab}
                onValueChange={setTab}
                buttons={tabs.map((t) => ({ value: t.id, label: t.label }))}
              />
            </Row>
            {loading && pages.length === 0 ? (
              <Row fillWidth paddingY="24" horizontal="center">
                <Spinner aria-label={labels.loading} />
              </Row>
            ) : (
              panel
            )}
          </Column>
          <Row
            position="absolute"
            top="0"
            right="0"
            fillHeight
            width="4"
            cursor="col-resize"
            role="separator"
            aria-orientation="vertical"
            aria-valuenow={panelWidth}
            aria-valuemin={PANEL_WIDTH.min}
            aria-valuemax={PANEL_WIDTH.max}
            m={{ hide: true }}
            onPointerDown={startResize}
          />
        </Row>

        <Column fill gap="8" padding="8" overflow="hidden" m={{ height: 40 }}>
          <Row fillWidth vertical="center" gap="12" paddingX="8">
            <Row flex={1} minWidth={0} vertical="center" gap="8">
              <Dropdown
                placement="bottom-start"
                trigger={
                  <Button size="s" variant="secondary" suffixIcon="chevronDown">
                    {pageName(currentPage)}
                  </Button>
                }
              >
                <Column padding="4" gap="2" minWidth={192}>
                  {pages.map((page) => (
                    <Option
                      key={page.id}
                      value={page.id}
                      selected={page.id === pageId}
                      label={pageName(page)}
                      description={`/${page.slug}`}
                      onClick={() => void openPage(page.id)}
                    />
                  ))}
                </Column>
              </Dropdown>
              <SaveStatus
                state={saveState}
                onRetry={() => {
                  void flush();
                }}
              />
            </Row>

            <Row m={{ hide: true }}>
              <SegmentedControl
                value={device}
                onValueChange={(value) => setDevice(value as Device)}
                buttons={DEVICES.map((value) => ({
                  value,
                  prefixIcon: DEVICE_ICON[value],
                  "aria-label": labels[value],
                  tooltip: labels[value],
                }))}
              />
            </Row>

            <Row flex={1} minWidth={0} vertical="center" horizontal="end" gap="4">
              {languages.length > 1 && (
                <Dropdown
                  placement="bottom-end"
                  trigger={
                    <Button size="s" variant="tertiary" prefixIcon="world" suffixIcon="chevronDown">
                      {languages.find((l) => l.value === lang)?.label ?? lang}
                    </Button>
                  }
                >
                  <Column padding="4" gap="2" minWidth={160}>
                    {languages.map((language) => (
                      <Option
                        key={language.value}
                        value={language.value}
                        selected={language.value === lang}
                        label={language.label}
                        onClick={() => setLang(language.value)}
                      />
                    ))}
                  </Column>
                </Dropdown>
              )}
              <IconButton
                icon="return"
                size="s"
                variant="tertiary"
                tooltip={`${labels.undo} (⌘Z)`}
                tooltipPosition="bottom"
                disabled={!history.canUndo || readOnly}
                onClick={history.undo}
              />
              <IconButton
                icon="forward"
                size="s"
                variant="tertiary"
                tooltip={`${labels.redo} (⌘⇧Z)`}
                tooltipPosition="bottom"
                disabled={!history.canRedo || readOnly}
                onClick={history.redo}
              />
              <IconButton
                icon="help"
                size="s"
                variant="tertiary"
                tooltip={labels.shortcuts}
                tooltipPosition="bottom"
                onClick={() => setHelpOpen(true)}
              />
              {primary}
            </Row>
          </Row>

          {pageId && (
            <PreviewFrame
              src={adapter.previewUrl(pageId, lang)}
              pageId={pageId}
              page={loading ? null : doc.page}
              style={loading ? null : doc.style}
              selectedId={selectedId}
              hoveredId={hoveredId}
              device={device}
              revision={revision}
              onSelect={onPreviewSelect}
              onNavigate={onNavigate}
            />
          )}
        </Column>
      </Row>
      <ShortcutSheet open={helpOpen} onClose={() => setHelpOpen(false)} />
      {/* `setRevision` is for adapters whose preview renders on the server. */}
      <RevisionBump state={saveState} bump={() => setRevision((r) => r + 1)} />
    </EditorContextProvider>
  );
}

/** After each completed save, tell a server-rendered preview to render again. */
function RevisionBump({ state, bump }: { state: SaveState; bump: () => void }) {
  const last = useRef(state);
  useEffect(() => {
    if (last.current === "saving" && state === "saved") bump();
    last.current = state;
  }, [state, bump]);
  return null;
}
