// The contract between MediaLibrary and wherever an app keeps its files.
// MediaLibrary never fetches anything itself: every read and write goes
// through a `MediaLibraryAdapter`, so the same component runs on S3, Bunny,
// Supabase storage, a REST API or the in-memory adapter below.

/** What a file is, as far as the library cares: it picks the tile and the accept filter. */
export type MediaKind = "image" | "video" | "audio" | "file";

export interface MediaAsset {
  /** Stable id from the adapter; selection and every write use it. */
  id: string;
  /** File name shown under the tile and in dialogs. */
  name: string;
  /** What to render right now. A signed or resized URL is fine here. */
  src: string;
  /** What an app stores when this asset is picked. Defaults to `src`. */
  url?: string;
  kind: MediaKind;
  /** Folder it lives in; `null` is the top level. */
  folderId?: string | null;
  /** Still for a video tile. Without one, a video whose `src` ends in a video extension shows its first frame. */
  poster?: string;
  /** Bytes. */
  size?: number;
  width?: number;
  height?: number;
  /** ISO date. */
  createdAt?: string;
}

export interface MediaFolder {
  id: string;
  name: string;
  /** `null` for a top-level folder. */
  parentId: string | null;
}

export interface MediaListQuery {
  /** Folder to list. `null` lists everything, in every folder. */
  folderId: string | null;
  /** What the person typed in the search field, trimmed; absent when empty. */
  search?: string;
  /** Kinds the library can show. An adapter may ignore it: tiles of other kinds are dimmed. */
  kinds?: MediaKind[];
  /** The `nextCursor` of the page before; absent for the first page. */
  cursor?: string;
}

export interface MediaListPage {
  items: MediaAsset[];
  /** Cursor for the next page; absent or `null` when this was the last. */
  nextCursor?: string | null;
}

export interface MediaUploadContext {
  /** Folder open when the file was dropped; `null` is the top level. */
  folderId: string | null;
  /** Report progress from 0 to 1 to fill the upload tile's bar. */
  onProgress: (fraction: number) => void;
  /** Aborted when the library unmounts. */
  signal: AbortSignal;
}

/**
 * Where the files live. Only `list` is required: every other method adds its
 * control (no `upload`, no upload button; no `listFolders`, no folder
 * sidebar), so a read-only library is `{ list }`.
 */
export interface MediaLibraryAdapter {
  list: (query: MediaListQuery) => Promise<MediaListPage>;
  /** Every folder, flat; the library builds the tree from `parentId`. */
  listFolders?: () => Promise<MediaFolder[]>;
  /** Store one file and return it as an asset. */
  upload?: (file: File, context: MediaUploadContext) => Promise<MediaAsset>;
  remove?: (ids: string[]) => Promise<void>;
  /** Move assets into a folder; `null` is the top level. */
  move?: (ids: string[], folderId: string | null) => Promise<void>;
  rename?: (id: string, name: string) => Promise<void>;
  createFolder?: (name: string, parentId: string | null) => Promise<MediaFolder>;
  renameFolder?: (id: string, name: string) => Promise<void>;
  /** Remove a folder. What happens to what was in it is the adapter's call. */
  removeFolder?: (id: string) => Promise<void>;
}

const VIDEO_EXTENSION = /\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i;
const IMAGE_EXTENSION = /\.(png|jpe?g|gif|webp|avif|svg|bmp|ico)(\?.*)?$/i;
const AUDIO_EXTENSION = /\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/i;

/** The kind of a browser `File`, from its MIME type and then its name. */
export function mediaKindOfFile(file: Pick<File, "type" | "name">): MediaKind {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  if (IMAGE_EXTENSION.test(file.name)) return "image";
  if (VIDEO_EXTENSION.test(file.name)) return "video";
  if (AUDIO_EXTENSION.test(file.name)) return "audio";
  return "file";
}

/** True when `src` ends in a video extension, so `Media` can play it. */
export function isPlayableVideoSrc(src: string): boolean {
  return VIDEO_EXTENSION.test(src);
}

/** An `<input accept>` string for the given kinds. */
export function acceptForKinds(kinds: MediaKind[] | undefined): string | undefined {
  if (!kinds || kinds.length === 0 || kinds.includes("file")) return undefined;
  return kinds.map((kind) => `${kind}/*`).join(",");
}

/** Bytes as a short size: 820 B, 14 kB, 3.2 MB. */
export function formatMediaSize(bytes: number): string {
  if (bytes < 1000) return `${bytes} B`;
  if (bytes < 1_000_000) return `${Math.round(bytes / 1000)} kB`;
  if (bytes < 1_000_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
}

/** Ids of `folderId` and every folder under it. */
export function folderAndDescendants(folders: MediaFolder[], folderId: string): Set<string> {
  const ids = new Set([folderId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const folder of folders) {
      if (folder.parentId && ids.has(folder.parentId) && !ids.has(folder.id)) {
        ids.add(folder.id);
        grew = true;
      }
    }
  }
  return ids;
}

export interface MemoryMediaAdapterOptions {
  assets?: MediaAsset[];
  folders?: MediaFolder[];
  /** Page size for `list`. Defaults to 24. */
  pageSize?: number;
  /** Delay in milliseconds before each call answers, to see loading states. Defaults to 0. */
  latency?: number;
}

/**
 * An adapter that keeps everything in memory, for prototypes, docs and tests.
 * Uploads become object URLs, so they last until the page reloads.
 */
export function createMemoryMediaAdapter(
  options: MemoryMediaAdapterOptions = {},
): MediaLibraryAdapter {
  let assets = [...(options.assets ?? [])];
  let folders = [...(options.folders ?? [])];
  const pageSize = options.pageSize ?? 24;
  const latency = options.latency ?? 0;
  let counter = 0;
  const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${counter++}`;
  const wait = () =>
    latency > 0 ? new Promise<void>((resolve) => setTimeout(resolve, latency)) : Promise.resolve();

  return {
    async list({ folderId, search, kinds, cursor }) {
      await wait();
      const needle = search?.toLowerCase();
      const matching = assets.filter(
        (asset) =>
          (folderId === null || (asset.folderId ?? null) === folderId) &&
          (!needle || asset.name.toLowerCase().includes(needle)) &&
          (!kinds || kinds.length === 0 || kinds.includes(asset.kind)),
      );
      const start = cursor ? Number(cursor) : 0;
      const end = start + pageSize;
      return {
        items: matching.slice(start, end),
        nextCursor: end < matching.length ? String(end) : null,
      };
    },
    async listFolders() {
      await wait();
      return [...folders];
    },
    async upload(file, { folderId, onProgress }) {
      await wait();
      onProgress(1);
      const asset: MediaAsset = {
        id: nextId("asset"),
        name: file.name,
        src: URL.createObjectURL(file),
        kind: mediaKindOfFile(file),
        folderId,
        size: file.size,
        createdAt: new Date().toISOString(),
      };
      assets = [asset, ...assets];
      return asset;
    },
    async remove(ids) {
      await wait();
      assets = assets.filter((asset) => !ids.includes(asset.id));
    },
    async move(ids, folderId) {
      await wait();
      assets = assets.map((asset) => (ids.includes(asset.id) ? { ...asset, folderId } : asset));
    },
    async rename(id, name) {
      await wait();
      assets = assets.map((asset) => (asset.id === id ? { ...asset, name } : asset));
    },
    async createFolder(name, parentId) {
      await wait();
      const folder = { id: nextId("folder"), name, parentId };
      folders = [...folders, folder];
      return folder;
    },
    async renameFolder(id, name) {
      await wait();
      folders = folders.map((folder) => (folder.id === id ? { ...folder, name } : folder));
    },
    async removeFolder(id) {
      await wait();
      const gone = folderAndDescendants(folders, id);
      folders = folders.filter((folder) => !gone.has(folder.id));
      assets = assets.map((asset) =>
        asset.folderId && gone.has(asset.folderId) ? { ...asset, folderId: null } : asset,
      );
    },
  };
}
