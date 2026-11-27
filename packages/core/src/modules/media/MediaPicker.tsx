"use client";

import { useEffect, useState } from "react";
import { Button } from "../../components/Button.js";
import { Column } from "../../components/Column.js";
import { Dialog } from "../../components/Dialog.js";
import { Row } from "../../components/Row.js";
import { Text } from "../../components/Text.js";
import type { CSSUnit } from "../../types.js";
import { MediaLibrary, type MediaLibraryLabels } from "./MediaLibrary.js";
import type { MediaAsset, MediaKind, MediaLibraryAdapter } from "./mediaAdapter.js";

export interface MediaPickerLabels {
  title: string;
  cancel: string;
  choose: string;
  chooseCount: (count: number) => string;
  hint: string;
}

const DEFAULT_LABELS: MediaPickerLabels = {
  title: "Choose media",
  cancel: "Cancel",
  choose: "Choose",
  chooseCount: (count) => `Choose ${count}`,
  hint: "Double-click a file to choose it at once.",
};

export interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  /** Called with the chosen assets; the dialog then closes. */
  onPick: (assets: MediaAsset[]) => void;
  adapter: MediaLibraryAdapter;
  /** Choose several at once. Defaults to one. */
  multiple?: boolean;
  /** Kinds that can be chosen, e.g. `["image"]` for a logo. Defaults to every kind. */
  accept?: MediaKind[];
  /** Folder to open first; `null` (the default) is All media. */
  defaultFolderId?: string | null;
  /** Hide rename, move and delete inside the picker. Defaults to `false`. */
  readOnly?: boolean;
  columns?: 2 | 3 | 4 | 5 | 6;
  /** Library height inside the dialog. Defaults to `"32rem"`. */
  height?: number | CSSUnit;
  labels?: Partial<MediaPickerLabels>;
  libraryLabels?: Partial<MediaLibraryLabels>;
  /** Stack over another open Dialog. */
  stack?: boolean;
}

/** "Choose an image": MediaLibrary in a Dialog that hands back what was picked. */
const MediaPicker = ({
  open,
  onClose,
  onPick,
  adapter,
  multiple = false,
  accept,
  defaultFolderId = null,
  readOnly = false,
  columns = 4,
  height = "32rem",
  labels: labelOverrides,
  libraryLabels,
  stack,
}: MediaPickerProps) => {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const [picked, setPicked] = useState<MediaAsset[]>([]);

  // Every opening starts from nothing chosen.
  useEffect(() => {
    if (open) setPicked([]);
  }, [open]);

  const accepts = (asset: MediaAsset) =>
    !accept || accept.length === 0 || accept.includes(asset.kind);

  const choose = (assets: MediaAsset[]) => {
    const chosen = assets.filter(accepts);
    if (chosen.length === 0) return;
    onPick(chosen);
    onClose();
  };

  const chooseLabel =
    multiple && picked.length > 1 ? labels.chooseCount(picked.length) : labels.choose;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={labels.title}
      stack={stack}
      maxWidth="64rem"
      footer={
        <Row fillWidth vertical="center" horizontal="between" gap="8">
          <Column s={{ hide: true }}>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {labels.hint}
            </Text>
          </Column>
          <Row gap="8">
            <Button variant="secondary" label={labels.cancel} onClick={onClose} />
            <Button
              label={chooseLabel}
              disabled={picked.length === 0}
              onClick={() => choose(picked)}
            />
          </Row>
        </Row>
      }
    >
      <Row fillWidth height={height}>
        {open && (
          <MediaLibrary
            adapter={adapter}
            accept={accept}
            selectionMode={multiple ? "multiple" : "single"}
            onSelectionChange={(_, assets) => setPicked(assets)}
            onOpen={(asset) => choose([asset])}
            defaultFolderId={defaultFolderId}
            readOnly={readOnly}
            columns={columns}
            labels={libraryLabels}
          />
        )}
      </Row>
    </Dialog>
  );
};

MediaPicker.displayName = "MediaPicker";

export { MediaPicker };
