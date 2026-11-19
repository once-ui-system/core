// Messages between the editor and the preview iframe. Both sides check the
// `source` tag and the origin, so nothing else on the page can drive either.

import type { Page, SiteStyle } from "./model.js";

export const TO_PREVIEW = "once-ui-site-editor";
export const TO_EDITOR = "once-ui-site-preview";

export type EditorMessage =
  /** The draft page, as it stands: the preview renders it without a round trip. */
  | { kind: "page"; pageId: string; page: Page }
  /** The site's look, applied at once through StyleScope. */
  | { kind: "style"; style: SiteStyle }
  /** Outline this section (null clears it) and scroll it into view. */
  | { kind: "select"; id: string | null }
  /** Outline this section faintly, for a tile under the pointer. */
  | { kind: "hover"; id: string | null }
  /** The store changed under the preview: render again from the server. */
  | { kind: "refresh" };

export type PreviewMessage =
  /** The preview mounted and is listening. */
  | { kind: "ready" }
  /** Someone clicked a section (or the header or footer) in the preview. */
  | { kind: "select"; id: string }
  /** Someone followed a link to another page of the site. */
  | { kind: "navigate"; path: string }
  /** An editor shortcut pressed while the preview had focus, passed up. */
  | {
      kind: "key";
      key: string;
      metaKey: boolean;
      ctrlKey: boolean;
      shiftKey: boolean;
    };

type Tagged<T, S> = T & { source: S };

export const isEditorMessage = (data: unknown): data is Tagged<EditorMessage, typeof TO_PREVIEW> =>
  !!data && typeof data === "object" && (data as { source?: unknown }).source === TO_PREVIEW;

export const isPreviewMessage = (data: unknown): data is Tagged<PreviewMessage, typeof TO_EDITOR> =>
  !!data && typeof data === "object" && (data as { source?: unknown }).source === TO_EDITOR;
