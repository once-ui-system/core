"use client";

import type React from "react";
import { useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import { Button } from "../../components/Button.js";
import { Card } from "../../components/Card.js";
import { Checkbox } from "../../components/Checkbox.js";
import { Column } from "../../components/Column.js";
import { Dialog } from "../../components/Dialog.js";
import { Dropdown } from "../../components/Dropdown.js";
import { EmptyState } from "../../components/EmptyState.js";
import { Feedback } from "../../components/Feedback.js";
import { FileTree, type FileTreeItem } from "../../components/FileTree.js";
import { Grid } from "../../components/Grid.js";
import { Icon } from "../../components/Icon.js";
import { IconButton } from "../../components/IconButton.js";
import { InfiniteScroll } from "../../components/InfiniteScroll.js";
import { Input } from "../../components/Input.js";
import { Line } from "../../components/Line.js";
import { Media } from "../../components/Media.js";
import { Option } from "../../components/Option.js";
import { ProgressBar } from "../../components/ProgressBar.js";
import { Row } from "../../components/Row.js";
import { Skeleton } from "../../components/Skeleton.js";
import { Text } from "../../components/Text.js";
import { ToastContext } from "../../contexts/ToastContext.js";
import type { IconName } from "../../icons.js";
import { MediaUpload } from "./MediaUpload.js";
import {
  acceptForKinds,
  folderAndDescendants,
  isPlayableVideoSrc,
  type MediaAsset,
  type MediaFolder,
  type MediaKind,
  type MediaLibraryAdapter,
  mediaKindOfFile,
} from "./mediaAdapter.js";

/** Every word MediaLibrary shows, for translation. Pass only the ones you change. */
export interface MediaLibraryLabels {
  allMedia: string;
  folders: string;
  newFolder: string;
  search: string;
  upload: string;
  dropToUpload: string;
  uploading: string;
  emptyTitle: string;
  emptyDescription: string;
  noResultsTitle: string;
  noResultsDescription: string;
  loadFailed: string;
  retry: string;
  actions: string;
  rename: string;
  moveTo: string;
  topLevel: string;
  delete: string;
  cancel: string;
  save: string;
  create: string;
  name: string;
  folderName: string;
  renameFolder: string;
  deleteFolder: string;
  deleteFolderDescription: (name: string) => string;
  deleteTitle: (count: number) => string;
  deleteDescription: (count: number) => string;
  selected: (count: number) => string;
  clearSelection: string;
  select: (name: string) => string;
  uploadFailed: (name: string) => string;
  notAccepted: (name: string) => string;
  actionFailed: string;
}

const DEFAULT_LABELS: MediaLibraryLabels = {
  allMedia: "All media",
  folders: "Folders",
  newFolder: "New folder",
  search: "Search",
  upload: "Upload",
  dropToUpload: "Drop files to upload",
  uploading: "Uploading",
  emptyTitle: "Nothing here yet",
  emptyDescription: "Upload images and videos, or drop them here.",
  noResultsTitle: "No matches",
  noResultsDescription: "Try another name, or look in another folder.",
  loadFailed: "The library could not be loaded.",
  retry: "Retry",
  actions: "Actions",
  rename: "Rename",
  moveTo: "Move to",
  topLevel: "Top level",
  delete: "Delete",
  cancel: "Cancel",
  save: "Save",
  create: "Create",
  name: "Name",
  folderName: "Folder name",
  renameFolder: "Rename folder",
  deleteFolder: "Delete folder",
  deleteFolderDescription: (name) => `"${name}" and the folders inside it will be deleted.`,
  deleteTitle: (count) => (count === 1 ? "Delete this file?" : `Delete ${count} files?`),
  deleteDescription: (count) =>
    count === 1
      ? "It is removed from the library. Pages that use it may break."
      : "They are removed from the library. Pages that use them may break.",
  selected: (count) => `${count} selected`,
  clearSelection: "Clear selection",
  select: (name) => `Select ${name}`,
  uploadFailed: (name) => `${name} could not be uploaded.`,
  notAccepted: (name) => `${name} is not a file this library takes.`,
  actionFailed: "That did not work. Nothing was changed.",
};

export interface MediaLibraryProps
  extends Omit<React.ComponentProps<typeof Row>, "children" | "onSelect"> {
  /** Where the files live. Every read and write goes through it. */
  adapter: MediaLibraryAdapter;
  /** Kinds that can be uploaded and selected. Others are dimmed. Defaults to every kind. */
  accept?: MediaKind[];
  /** `none` opens a tile on click, `single` and `multiple` select. Defaults to `multiple`. */
  selectionMode?: "none" | "single" | "multiple";
  /** Selected asset ids, controlled. */
  selectedIds?: string[];
  /** Initial selection when `selectedIds` is uncontrolled. */
  defaultSelectedIds?: string[];
  /** Called with the new selection and the assets it names. */
  onSelectionChange?: (ids: string[], assets: MediaAsset[]) => void;
  /** Called on a double click, or a click with `selectionMode="none"`. */
  onOpen?: (asset: MediaAsset) => void;
  /** Folder to open first; `null` (the default) is All media. */
  defaultFolderId?: string | null;
  /** Called when another folder opens. */
  onFolderChange?: (folderId: string | null) => void;
  /** Hide rename, move and delete, keeping upload and folders for browsing. */
  readOnly?: boolean;
  /** Grid columns on wide screens; narrower screens step down to 2. Defaults to 4. */
  columns?: 2 | 3 | 4 | 5 | 6;
  /** Change it to drop what is loaded and list again. */
  refreshKey?: string | number;
  labels?: Partial<MediaLibraryLabels>;
}

interface PendingUpload {
  key: string;
  name: string;
  progress: number;
}

type DialogState =
  | { type: "createFolder"; parentId: string | null }
  | { type: "renameFolder"; folder: MediaFolder }
  | { type: "deleteFolder"; folder: MediaFolder }
  | { type: "rename"; asset: MediaAsset }
  | { type: "delete"; ids: string[] }
  | null;

const ALL_MEDIA = "__once-ui-all-media__";
const DRAG_TYPE = "application/x-once-ui-media";
const KIND_ICON: Record<MediaKind, IconName> = {
  image: "image",
  video: "video",
  audio: "music",
  file: "document",
};

function buildFolderTree(folders: MediaFolder[]): FileTreeItem[] {
  const byParent = new Map<string | null, MediaFolder[]>();
  for (const folder of folders) {
    const list = byParent.get(folder.parentId) ?? [];
    list.push(folder);
    byParent.set(folder.parentId, list);
  }
  const branch = (parentId: string | null, seen: Set<string>): FileTreeItem[] =>
    (byParent.get(parentId) ?? [])
      .filter((folder) => !seen.has(folder.id))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((folder) => ({
        id: folder.id,
        name: folder.name,
        type: "folder" as const,
        children: branch(folder.id, new Set([...seen, folder.id])),
      }));
  return branch(null, new Set());
}

/** Folders in tree order with their depth, for the Move to menu. */
function flattenFolders(folders: MediaFolder[]): { folder: MediaFolder; depth: number }[] {
  const out: { folder: MediaFolder; depth: number }[] = [];
  const byId = new Map(folders.map((folder) => [folder.id, folder]));
  const walk = (items: FileTreeItem[], depth: number) => {
    for (const item of items) {
      const folder = byId.get(item.id);
      if (folder) out.push({ folder, depth });
      if (item.type === "folder") walk(item.children, depth + 1);
    }
  };
  walk(buildFolderTree(folders), 0);
  return out;
}

function MediaTile({
  asset,
  selected,
  disabled,
  checkbox,
  draggable,
  menu,
  selectLabel,
  onClick,
  onDoubleClick,
  onDragStart,
}: {
  asset: MediaAsset;
  selected: boolean;
  disabled: boolean;
  checkbox: boolean;
  draggable: boolean;
  menu: React.ReactNode;
  selectLabel: string;
  onClick: () => void;
  onDoubleClick: () => void;
  onDragStart: (event: React.DragEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const showsImage = asset.kind === "image" || Boolean(asset.poster);
  const showsVideo = asset.kind === "video" && !asset.poster && isPlayableVideoSrc(asset.src);

  return (
    <Column
      fillWidth
      gap="4"
      opacity={disabled ? 50 : 100}
      draggable={draggable}
      onDragStart={onDragStart}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
      onDoubleClick={disabled ? undefined : onDoubleClick}
    >
      <Card
        fillWidth
        padding="4"
        radius="l"
        selected={selected}
        border={selected ? "brand-strong" : undefined}
        aria-label={asset.name}
        onClick={disabled ? undefined : onClick}
      >
        {showsImage || showsVideo ? (
          <Media
            radius="m"
            aspectRatio="1 / 1"
            objectFit="cover"
            sizes="240px"
            src={asset.poster ?? asset.src}
            alt={asset.name}
            autoplay={false}
            loop={false}
            sound={false}
          />
        ) : (
          <Column fillWidth aspectRatio="1 / 1" radius="m" background="neutral-alpha-weak" center>
            <Icon name={KIND_ICON[asset.kind]} size="l" onBackground="neutral-weak" />
          </Column>
        )}
        {asset.kind === "video" && (
          <Row
            position="absolute"
            bottom="12"
            left="12"
            padding="4"
            radius="s"
            background="overlay"
            pointerEvents="none"
          >
            <Icon name="video" size="xs" onBackground="neutral-strong" />
          </Row>
        )}
      </Card>
      <Text textVariant="body-default-s" onBackground="neutral-medium" truncate>
        {asset.name}
      </Text>
      {checkbox && (hovered || selected) && !disabled && (
        <Row position="absolute" top="12" left="12" radius="s" background="overlay">
          <Checkbox checked={selected} onCheckedChange={onClick} aria-label={selectLabel} />
        </Row>
      )}
      {menu && hovered && (
        <Row position="absolute" top="8" right="8" radius="m" background="overlay">
          {menu}
        </Row>
      )}
    </Column>
  );
}

/**
 * A media library on any storage: folder tree, searchable tile grid with
 * paging, drop to upload, select, rename, move and delete. It never fetches
 * anything itself; `adapter` does every read and write, and each control
 * shows only when the adapter has the method behind it.
 */
const MediaLibrary = ({
  adapter,
  accept,
  selectionMode = "multiple",
  selectedIds,
  defaultSelectedIds = [],
  onSelectionChange,
  onOpen,
  defaultFolderId = null,
  onFolderChange,
  readOnly = false,
  columns = 4,
  refreshKey,
  labels: labelOverrides,
  ...rest
}: MediaLibraryProps) => {
  const labels = useMemo(() => ({ ...DEFAULT_LABELS, ...labelOverrides }), [labelOverrides]);
  const toast = useContext(ToastContext);
  const searchId = useId();
  const nameId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(Boolean(adapter.listFolders));
  const [folderId, setFolderId] = useState<string | null>(defaultFolderId);
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [generation, setGeneration] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [uploads, setUploads] = useState<PendingUpload[]>([]);
  const [fileDrag, setFileDrag] = useState(false);
  const [dropFolder, setDropFolder] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [dialogName, setDialogName] = useState("");
  const [dialogBusy, setDialogBusy] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [uncontrolledSelection, setUncontrolledSelection] = useState(defaultSelectedIds);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const cursorRef = useRef<string | null>(null);
  const uploadCount = useRef(0);
  const requestRef = useRef(0);
  const known = useRef(new Map<string, MediaAsset>());
  const abortRef = useRef(new AbortController());
  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    return () => controller.abort();
  }, []);

  const selection = selectedIds ?? uncontrolledSelection;
  const selectionSet = useMemo(() => new Set(selection), [selection]);
  const acceptKey = accept?.join(",") ?? "";
  const canWrite = !readOnly;
  const canUpload = Boolean(adapter.upload);
  const canMove = canWrite && Boolean(adapter.move);
  const canRemove = canWrite && Boolean(adapter.remove);
  const canRename = canWrite && Boolean(adapter.rename);
  const hasFolders = Boolean(adapter.listFolders);

  const isAccepted = useCallback(
    (kind: MediaKind) => !accept || accept.length === 0 || accept.includes(kind),
    [accept],
  );

  const notifyError = useCallback(
    (message: string) => {
      if (toast) toast.addToast({ tone: "danger", message });
      else setInlineError(message);
    },
    [toast],
  );

  const remember = (assets: MediaAsset[]) => {
    for (const asset of assets) known.current.set(asset.id, asset);
  };

  const setSelection = (ids: string[]) => {
    if (selectedIds === undefined) setUncontrolledSelection(ids);
    onSelectionChange?.(
      ids,
      ids.map((id) => known.current.get(id)).filter((asset): asset is MediaAsset => !!asset),
    );
  };

  // Search answers after a short pause, not on every key.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 250);
    return () => clearTimeout(timer);
  }, [search]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey only triggers a new listing
  useEffect(() => {
    if (!adapter.listFolders) return;
    let live = true;
    setFoldersLoading(true);
    adapter
      .listFolders()
      .then((list) => live && setFolders(list))
      .catch(() => live && setFolders([]))
      .finally(() => live && setFoldersLoading(false));
    return () => {
      live = false;
    };
  }, [adapter, refreshKey]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: acceptKey stands for accept, reloadKey and refreshKey only trigger a new listing
  useEffect(() => {
    const request = ++requestRef.current;
    setStatus("loading");
    cursorRef.current = null;
    adapter
      .list({
        folderId,
        search: query || undefined,
        kinds: accept && accept.length > 0 ? accept : undefined,
      })
      .then((page) => {
        if (request !== requestRef.current) return;
        remember(page.items);
        setItems(page.items);
        cursorRef.current = page.nextCursor ?? null;
        setGeneration((value) => value + 1);
        setStatus("ready");
      })
      .catch(() => {
        if (request === requestRef.current) setStatus("error");
      });
  }, [adapter, folderId, query, acceptKey, reloadKey, refreshKey]);

  const loadMore = async () => {
    const cursor = cursorRef.current;
    if (!cursor) return false;
    const request = requestRef.current;
    const page = await adapter.list({
      folderId,
      search: query || undefined,
      kinds: accept && accept.length > 0 ? accept : undefined,
      cursor,
    });
    if (request !== requestRef.current) return false;
    remember(page.items);
    setItems((current) => {
      const ids = new Set(current.map((asset) => asset.id));
      return [...current, ...page.items.filter((asset) => !ids.has(asset.id))];
    });
    cursorRef.current = page.nextCursor ?? null;
    return Boolean(page.nextCursor);
  };

  const openFolder = (id: string | null) => {
    setFolderId(id);
    onFolderChange?.(id);
  };

  /** Apply a change now, run the write, and put things back if it fails. */
  const optimistic = async (apply: () => () => void, write: () => Promise<void>) => {
    const rollback = apply();
    try {
      await write();
    } catch {
      rollback();
      notifyError(labels.actionFailed);
    }
  };

  const uploadFiles = (files: File[]) => {
    if (!adapter.upload) return;
    const upload = adapter.upload;
    const target = folderId;
    for (const file of files) {
      if (!isAccepted(mediaKindOfFile(file))) {
        notifyError(labels.notAccepted(file.name));
        continue;
      }
      const key = `upload-${uploadCount.current++}`;
      setUploads((current) => [...current, { key, name: file.name, progress: 0 }]);
      upload(file, {
        folderId: target,
        signal: abortRef.current.signal,
        onProgress: (fraction) =>
          setUploads((current) =>
            current.map((entry) =>
              entry.key === key
                ? { ...entry, progress: Math.max(0, Math.min(1, fraction)) }
                : entry,
            ),
          ),
      })
        .then((asset) => {
          remember([asset]);
          setItems((current) =>
            target === folderId && !current.some((item) => item.id === asset.id)
              ? [asset, ...current]
              : current,
          );
          setStatus("ready");
        })
        .catch(() => notifyError(labels.uploadFailed(file.name)))
        .finally(() => setUploads((current) => current.filter((entry) => entry.key !== key)));
    }
  };

  const removeAssets = (ids: string[]) => {
    const remove = adapter.remove;
    if (!remove) return;
    const gone = new Set(ids);
    void optimistic(
      () => {
        const before = items;
        const selectedBefore = selection;
        setItems((current) => current.filter((asset) => !gone.has(asset.id)));
        setSelection(selection.filter((id) => !gone.has(id)));
        return () => {
          setItems(before);
          setSelection(selectedBefore);
        };
      },
      () => remove(ids),
    );
  };

  const moveAssets = (ids: string[], target: string | null) => {
    const move = adapter.move;
    if (!move) return;
    const moving = new Set(ids);
    void optimistic(
      () => {
        const before = items;
        setItems((current) =>
          folderId === null
            ? current.map((asset) =>
                moving.has(asset.id) ? { ...asset, folderId: target } : asset,
              )
            : target === folderId
              ? current
              : current.filter((asset) => !moving.has(asset.id)),
        );
        return () => setItems(before);
      },
      () => move(ids, target),
    );
  };

  const renameAsset = (id: string, name: string) => {
    const rename = adapter.rename;
    if (!rename) return;
    void optimistic(
      () => {
        const before = items;
        setItems((current) =>
          current.map((asset) => (asset.id === id ? { ...asset, name } : asset)),
        );
        const known_ = known.current.get(id);
        if (known_) known.current.set(id, { ...known_, name });
        return () => setItems(before);
      },
      () => rename(id, name),
    );
  };

  const handleTileClick = (asset: MediaAsset) => {
    if (selectionMode === "none") {
      onOpen?.(asset);
      return;
    }
    if (selectionMode === "single") {
      setSelection(selectionSet.has(asset.id) ? [] : [asset.id]);
      return;
    }
    setSelection(
      selectionSet.has(asset.id)
        ? selection.filter((id) => id !== asset.id)
        : [...selection, asset.id],
    );
  };

  // Drag a tile (or the whole selection, when the tile is part of it) onto a folder.
  const handleTileDragStart = (asset: MediaAsset, event: React.DragEvent) => {
    const ids = selectionSet.has(asset.id) ? selection : [asset.id];
    event.dataTransfer.setData(DRAG_TYPE, JSON.stringify(ids));
    event.dataTransfer.effectAllowed = "move";
  };

  const folderFromEvent = (event: React.DragEvent): string | undefined => {
    const row = (event.target as Element).closest?.('[role="treeitem"]');
    const id = row?.querySelector("[data-media-folder]")?.getAttribute("data-media-folder");
    return id ?? undefined;
  };

  const sidebarDragProps = canMove
    ? {
        onDragOver: (event: React.DragEvent) => {
          if (!event.dataTransfer.types.includes(DRAG_TYPE)) return;
          const id = folderFromEvent(event);
          if (id === undefined) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
          setDropFolder(id);
        },
        onDragLeave: (event: React.DragEvent) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null))
            setDropFolder(null);
        },
        onDrop: (event: React.DragEvent) => {
          const id = folderFromEvent(event);
          setDropFolder(null);
          const raw = event.dataTransfer.getData(DRAG_TYPE);
          if (!raw || id === undefined) return;
          event.preventDefault();
          try {
            const ids = JSON.parse(raw) as string[];
            moveAssets(ids, id === ALL_MEDIA ? null : id);
          } catch {
            // Not ours.
          }
        },
      }
    : {};

  const gridDropProps = canUpload
    ? {
        onDragOver: (event: React.DragEvent) => {
          if (!event.dataTransfer.types.includes("Files")) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
          setFileDrag(true);
        },
        onDragLeave: (event: React.DragEvent) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFileDrag(false);
        },
        onDrop: (event: React.DragEvent) => {
          if (!event.dataTransfer.types.includes("Files")) return;
          event.preventDefault();
          setFileDrag(false);
          uploadFiles(Array.from(event.dataTransfer.files));
        },
      }
    : {};

  const folderTree = useMemo<FileTreeItem[]>(
    () => [
      { id: ALL_MEDIA, name: labels.allMedia, type: "file", icon: "layers" },
      ...buildFolderTree(folders),
    ],
    [folders, labels.allMedia],
  );
  const flatFolders = useMemo(() => flattenFolders(folders), [folders]);
  const currentFolder = folderId ? folders.find((folder) => folder.id === folderId) : undefined;

  const moveOptions = (ids: string[], close: () => void) => [
    <Option
      key="top"
      value="__top"
      label={labels.topLevel}
      prefix={<Icon name="layers" size="xs" onBackground="neutral-weak" />}
      onClick={() => {
        close();
        moveAssets(ids, null);
      }}
    />,
    ...flatFolders.map(({ folder, depth }) => (
      <Option
        key={folder.id}
        value={folder.id}
        label={folder.name}
        prefix={
          <Row paddingLeft={depth > 0 ? `${depth * 12}px` : undefined}>
            <Icon name="folder" size="xs" onBackground="neutral-weak" />
          </Row>
        }
        onClick={() => {
          close();
          moveAssets(ids, folder.id);
        }}
      />
    )),
  ];

  const tileMenu = (asset: MediaAsset) => {
    if (!canRename && !canMove && !canRemove) return null;
    const close = () => setMenuOpenId(null);
    return (
      <Dropdown
        open={menuOpenId === asset.id}
        onOpenChange={(open) => setMenuOpenId(open ? asset.id : null)}
        placement="bottom-end"
        trigger={
          <IconButton
            icon="moreHorizontal"
            size="s"
            variant="ghost"
            tooltip={labels.actions}
            aria-label={labels.actions}
          />
        }
      >
        <Column padding="4" gap="2" minWidth="12rem">
          {canRename && (
            <Option
              value="rename"
              label={labels.rename}
              prefix={<Icon name="edit" size="xs" />}
              onClick={() => {
                close();
                setDialogName(asset.name);
                setDialog({ type: "rename", asset });
              }}
            />
          )}
          {canMove && hasFolders && (
            <>
              <Text
                textVariant="label-default-xs"
                onBackground="neutral-weak"
                marginX="12"
                marginTop="8"
              >
                {labels.moveTo}
              </Text>
              {moveOptions([asset.id], close)}
            </>
          )}
          {canRemove && (
            <>
              <Line marginY="4" />
              <Option
                value="delete"
                label={labels.delete}
                danger
                prefix={<Icon name="trash" size="xs" />}
                onClick={() => {
                  close();
                  setDialog({ type: "delete", ids: [asset.id] });
                }}
              />
            </>
          )}
        </Column>
      </Dropdown>
    );
  };

  const [selectionMoveOpen, setSelectionMoveOpen] = useState(false);
  const [folderMenuOpen, setFolderMenuOpen] = useState(false);

  const openPicker = () => inputRef.current?.click();
  const imageOnly = accept?.length === 1 && accept[0] === "image";

  const closeDialog = () => {
    if (!dialogBusy) setDialog(null);
  };

  const submitDialog = async () => {
    if (!dialog) return;
    const name = dialogName.trim();
    if ((dialog.type === "createFolder" || dialog.type.startsWith("rename")) && !name) return;
    setDialogBusy(true);
    try {
      if (dialog.type === "createFolder" && adapter.createFolder) {
        const folder = await adapter.createFolder(name, dialog.parentId);
        setFolders((current) => [...current, folder]);
      } else if (dialog.type === "renameFolder" && adapter.renameFolder) {
        await adapter.renameFolder(dialog.folder.id, name);
        setFolders((current) =>
          current.map((folder) => (folder.id === dialog.folder.id ? { ...folder, name } : folder)),
        );
      } else if (dialog.type === "deleteFolder" && adapter.removeFolder) {
        await adapter.removeFolder(dialog.folder.id);
        const gone = folderAndDescendants(folders, dialog.folder.id);
        setFolders((current) => current.filter((folder) => !gone.has(folder.id)));
        if (folderId && gone.has(folderId)) openFolder(null);
        else setReloadKey((value) => value + 1);
      } else if (dialog.type === "rename") {
        renameAsset(dialog.asset.id, name);
      } else if (dialog.type === "delete") {
        removeAssets(dialog.ids);
      }
      setDialog(null);
    } catch {
      notifyError(labels.actionFailed);
    } finally {
      setDialogBusy(false);
    }
  };

  const showSkeleton = status === "loading" && uploads.length === 0;
  const isEmpty = status === "ready" && items.length === 0 && uploads.length === 0;

  const grid = (
    <Grid
      fillWidth
      columns={columns}
      m={{ columns: Math.max(2, columns - 1) as 2 | 3 | 4 | 5 }}
      s={{ columns: 2 }}
      gap="12"
    >
      {uploads.map((upload) => (
        <Column key={upload.key} fillWidth gap="4">
          <Column
            fillWidth
            aspectRatio="1 / 1"
            radius="l"
            border
            background="neutral-alpha-weak"
            center
            gap="12"
            padding="16"
          >
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {labels.uploading}
            </Text>
            <ProgressBar value={Math.round(upload.progress * 100)} showLabel={false} size="s" />
          </Column>
          <Text textVariant="body-default-s" onBackground="neutral-weak" truncate>
            {upload.name}
          </Text>
        </Column>
      ))}
      <InfiniteScroll
        key={generation}
        items={items}
        loadMore={loadMore}
        renderItem={(asset) => (
          <MediaTile
            key={asset.id}
            asset={asset}
            selected={selectionSet.has(asset.id)}
            disabled={!isAccepted(asset.kind)}
            checkbox={selectionMode === "multiple"}
            draggable={canMove && hasFolders}
            menu={tileMenu(asset)}
            selectLabel={labels.select(asset.name)}
            onClick={() => handleTileClick(asset)}
            onDoubleClick={() => onOpen?.(asset)}
            onDragStart={(event) => handleTileDragStart(asset, event)}
          />
        )}
      />
    </Grid>
  );

  const body = showSkeleton ? (
    <Grid
      fillWidth
      columns={columns}
      m={{ columns: Math.max(2, columns - 1) as 2 | 3 | 4 | 5 }}
      s={{ columns: 2 }}
      gap="12"
      aria-busy
    >
      {Array.from({ length: columns * 2 }, (_, index) => `skeleton-${index}`).map((key) => (
        <Column key={key} fillWidth gap="8">
          <Row fillWidth aspectRatio="1 / 1" radius="l" overflow="hidden">
            <Skeleton shape="block" delay={100} />
          </Row>
          <Skeleton shape="line" width="60%" size="s" />
        </Column>
      ))}
    </Grid>
  ) : status === "error" ? (
    <Feedback tone="danger" title={labels.loadFailed}>
      <Row paddingTop="8">
        <Button
          size="s"
          variant="secondary"
          prefixIcon="refresh"
          label={labels.retry}
          onClick={() => setReloadKey((value) => value + 1)}
        />
      </Row>
    </Feedback>
  ) : isEmpty && query ? (
    <EmptyState
      icon="search"
      title={labels.noResultsTitle}
      description={labels.noResultsDescription}
      titleAs="h3"
    />
  ) : isEmpty && canUpload && imageOnly ? (
    <MediaUpload
      aspectRatio="16 / 9"
      compress={false}
      accept="image/*"
      emptyState={labels.emptyDescription}
      onFileUpload={async (file) => uploadFiles([file])}
    />
  ) : isEmpty ? (
    <EmptyState
      icon="image"
      title={labels.emptyTitle}
      description={canUpload ? labels.emptyDescription : undefined}
      titleAs="h3"
      action={
        canUpload ? (
          <Button prefixIcon="upload" label={labels.upload} onClick={openPicker} />
        ) : undefined
      }
    />
  ) : (
    grid
  );

  const selectionToolbar = selection.length > 0 && selectionMode !== "none" && (
    <Row
      fillWidth
      vertical="center"
      gap="8"
      paddingX="12"
      paddingY="8"
      radius="l"
      background="brand-alpha-weak"
      horizontal="between"
      s={{ direction: "column", horizontal: "start" }}
    >
      <Text textVariant="label-default-s" onBackground="brand-strong" wrap="nowrap">
        {labels.selected(selection.length)}
      </Text>
      <Row gap="4" vertical="center">
        {canMove && hasFolders && (
          <Dropdown
            open={selectionMoveOpen}
            onOpenChange={setSelectionMoveOpen}
            placement="bottom-end"
            trigger={
              <Button size="s" variant="tertiary" prefixIcon="folder" label={labels.moveTo} />
            }
          >
            <Column padding="4" gap="2" minWidth="12rem">
              {moveOptions(selection, () => setSelectionMoveOpen(false))}
            </Column>
          </Dropdown>
        )}
        {canRemove && (
          <Button
            size="s"
            variant="tertiary"
            tone="danger"
            prefixIcon="trash"
            label={labels.delete}
            onClick={() => setDialog({ type: "delete", ids: selection })}
          />
        )}
        <IconButton
          icon="close"
          size="s"
          variant="ghost"
          tooltip={labels.clearSelection}
          aria-label={labels.clearSelection}
          onClick={() => setSelection([])}
        />
      </Row>
    </Row>
  );

  const folderMenu =
    currentFolder && canWrite && (adapter.renameFolder || adapter.removeFolder) ? (
      <Dropdown
        open={folderMenuOpen}
        onOpenChange={setFolderMenuOpen}
        placement="bottom-start"
        trigger={
          <IconButton
            icon="moreHorizontal"
            size="s"
            variant="ghost"
            tooltip={labels.actions}
            aria-label={labels.actions}
          />
        }
      >
        <Column padding="4" gap="2" minWidth="12rem">
          {adapter.renameFolder && (
            <Option
              value="rename-folder"
              label={labels.renameFolder}
              prefix={<Icon name="edit" size="xs" />}
              onClick={() => {
                setFolderMenuOpen(false);
                setDialogName(currentFolder.name);
                setDialog({ type: "renameFolder", folder: currentFolder });
              }}
            />
          )}
          {adapter.removeFolder && (
            <Option
              value="delete-folder"
              label={labels.deleteFolder}
              danger
              prefix={<Icon name="trash" size="xs" />}
              onClick={() => {
                setFolderMenuOpen(false);
                setDialog({ type: "deleteFolder", folder: currentFolder });
              }}
            />
          )}
        </Column>
      </Dropdown>
    ) : null;

  const nameDialogOpen =
    dialog?.type === "createFolder" || dialog?.type === "renameFolder" || dialog?.type === "rename";
  const confirmDialogOpen = dialog?.type === "delete" || dialog?.type === "deleteFolder";

  return (
    <Row fill gap="16" s={{ direction: "column" }} {...rest}>
      {hasFolders && (
        <Column
          minWidth="14rem"
          maxWidth="14rem"
          gap="8"
          overflowY="auto"
          s={{ maxWidth: "100%", maxHeight: "11rem" }}
          {...sidebarDragProps}
        >
          <Row vertical="center" horizontal="between" paddingLeft="8">
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {labels.folders}
            </Text>
            {canWrite && adapter.createFolder && (
              <IconButton
                icon="plus"
                size="s"
                variant="ghost"
                tooltip={labels.newFolder}
                aria-label={labels.newFolder}
                onClick={() => {
                  setDialogName("");
                  setDialog({ type: "createFolder", parentId: folderId });
                }}
              />
            )}
          </Row>
          <FileTree
            aria-label={labels.folders}
            items={folderTree}
            loading={foldersLoading}
            selectedId={folderId ?? ALL_MEDIA}
            onSelect={(item) => openFolder(item.id === ALL_MEDIA ? null : item.id)}
            renderItem={(item) => (
              <Text
                data-media-folder={item.id}
                textVariant={dropFolder === item.id ? "label-strong-s" : undefined}
                onBackground={dropFolder === item.id ? "brand-strong" : undefined}
              >
                {item.name}
              </Text>
            )}
          />
        </Column>
      )}
      <Column fill gap="12" minWidth={0} {...gridDropProps}>
        <Row fillWidth vertical="center" gap="8" s={{ direction: "column" }}>
          <Row vertical="center" gap="4" fillWidth>
            <Text textVariant="heading-strong-s" truncate>
              {currentFolder?.name ?? labels.allMedia}
            </Text>
            {folderMenu}
          </Row>
          <Row gap="8" vertical="center" fillWidth horizontal="end">
            <Input
              id={searchId}
              placeholder={labels.search}
              aria-label={labels.search}
              value={search}
              onValueChange={setSearch}
              prefix={<Icon name="search" size="xs" onBackground="neutral-weak" />}
            />
            {canUpload && (
              <Button
                prefixIcon="upload"
                label={labels.upload}
                onClick={openPicker}
                loading={uploads.length > 0}
              />
            )}
          </Row>
        </Row>
        {inlineError && (
          <Feedback
            tone="danger"
            description={inlineError}
            showCloseButton
            onClose={() => setInlineError(null)}
          />
        )}
        {selectionToolbar}
        <Column fill overflowY="auto" paddingBottom="8">
          {body}
        </Column>
        {fileDrag && (
          <Column
            position="absolute"
            top="0"
            left="0"
            fill
            radius="l"
            border="brand-medium"
            background="brand-alpha-weak"
            center
            gap="8"
            pointerEvents="none"
            zIndex={1}
          >
            <Icon name="upload" size="l" onBackground="brand-strong" />
            <Text textVariant="label-default-m" onBackground="brand-strong">
              {labels.dropToUpload}
            </Text>
          </Column>
        )}
        {canUpload && (
          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            accept={acceptForKinds(accept)}
            onChange={(event) => {
              if (event.target.files) uploadFiles(Array.from(event.target.files));
              // Clear it, or choosing the same file again fires nothing.
              event.target.value = "";
            }}
          />
        )}
      </Column>

      <Dialog
        open={nameDialogOpen}
        onClose={closeDialog}
        title={
          dialog?.type === "createFolder"
            ? labels.newFolder
            : dialog?.type === "renameFolder"
              ? labels.renameFolder
              : labels.rename
        }
        footer={
          <Row gap="8" horizontal="end" fillWidth>
            <Button variant="secondary" label={labels.cancel} onClick={closeDialog} />
            <Button
              label={dialog?.type === "createFolder" ? labels.create : labels.save}
              loading={dialogBusy}
              disabled={!dialogName.trim()}
              onClick={() => void submitDialog()}
            />
          </Row>
        }
      >
        <Input
          id={nameId}
          label={dialog?.type === "rename" ? labels.name : labels.folderName}
          value={dialogName}
          autoFocus
          onValueChange={setDialogName}
          onKeyDown={(event: React.KeyboardEvent) => {
            if (event.key === "Enter") void submitDialog();
          }}
        />
      </Dialog>

      <Dialog
        open={confirmDialogOpen}
        onClose={closeDialog}
        title={
          dialog?.type === "deleteFolder"
            ? labels.deleteFolder
            : labels.deleteTitle(dialog?.type === "delete" ? dialog.ids.length : 1)
        }
        description={
          dialog?.type === "deleteFolder"
            ? labels.deleteFolderDescription(dialog.folder.name)
            : labels.deleteDescription(dialog?.type === "delete" ? dialog.ids.length : 1)
        }
        footer={
          <Row gap="8" horizontal="end" fillWidth>
            <Button variant="secondary" label={labels.cancel} onClick={closeDialog} />
            <Button
              tone="danger"
              label={labels.delete}
              loading={dialogBusy}
              onClick={() => void submitDialog()}
            />
          </Row>
        }
      />
    </Row>
  );
};

MediaLibrary.displayName = "MediaLibrary";

export { MediaLibrary };
