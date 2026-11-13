"use client";

import {
  Button,
  Column,
  Heading,
  Input,
  Row,
  Setting,
  Text,
  type Tone,
  useToast,
} from "@once-ui-system/core";
import type React from "react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { mergeLabels } from "../internal/labels.js";
import { defaultSettingsLabels, type SettingsLabels } from "./labels.js";
import type { Reauth } from "./types.js";

/** A partial `SettingsLabels`: any group or string left out keeps its default. */
export type SettingsLabelsInput = {
  [K in keyof SettingsLabels]?: SettingsLabels[K] extends (...args: never[]) => unknown
    ? SettingsLabels[K]
    : Partial<SettingsLabels[K]>;
};

const LabelsContext = createContext<SettingsLabels>(defaultSettingsLabels);

/** Gives every settings block below it the same labels. `SettingsLayout` uses it. */
export function SettingsLabelsProvider({
  labels,
  children,
}: {
  labels?: SettingsLabelsInput;
  children: ReactNode;
}) {
  const parent = useContext(LabelsContext);
  const merged = useMemo(() => mergeLabels(parent, labels), [parent, labels]);
  return <LabelsContext.Provider value={merged}>{children}</LabelsContext.Provider>;
}

/** The labels in context, with a block's own `labels` prop over them. */
export function useSettingsLabels(labels?: SettingsLabelsInput): SettingsLabels {
  const context = useContext(LabelsContext);
  return useMemo(() => mergeLabels(context, labels), [context, labels]);
}

/**
 * Runs an adapter call with a busy flag, and turns a thrown error into a
 * toast: the message of an `Error` when it has one, the generic label when it
 * does not. Resolves to whether the call succeeded.
 */
export function useAction() {
  const { addToast } = useToast();
  const labels = useSettingsLabels();
  const [busy, setBusy] = useState(false);
  const run = useCallback(
    async (fn: () => Promise<unknown>, success?: ReactNode): Promise<boolean> => {
      setBusy(true);
      try {
        await fn();
        if (success) addToast({ tone: "success", message: success });
        return true;
      } catch (error) {
        addToast({ tone: "danger", message: errorMessage(error, labels.common.failed) });
        return false;
      } finally {
        setBusy(false);
      }
    },
    [addToast, labels.common.failed],
  );
  return { busy, run };
}

export function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}

/** A section's heading and the line under it. */
export function SectionHeader({
  title,
  description,
}: {
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <Column gap="4">
      {/* Kept out of a docs page's "On this page" list, which reads h2 to h6. */}
      <Heading as="h2" textVariant="heading-strong-m" data-exclude-nav>
        {title}
      </Heading>
      {description && (
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          {description}
        </Text>
      )}
    </Column>
  );
}

/** A titled run of rows inside a section ("Connected accounts", "Danger zone"). */
export function SettingsGroup({
  title,
  children,
  tone,
}: {
  title?: ReactNode;
  children: ReactNode;
  tone?: Extract<Tone, "danger">;
}) {
  return (
    <Column as="section" fillWidth gap="8">
      {title && (
        <Row paddingLeft="4">
          <Text
            as="h3"
            data-exclude-nav
            textVariant="label-default-s"
            onBackground={tone === "danger" ? "danger-weak" : "neutral-weak"}
          >
            {title}
          </Text>
        </Row>
      )}
      {children}
    </Column>
  );
}

interface EditableSettingProps {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  value: string | null | undefined;
  /** Saves the new value. Throw to keep the field open and show the error. */
  onSave?: (value: string) => Promise<void>;
  inputProps?: Omit<React.ComponentProps<typeof Input>, "id" | "value" | "onChange" | "size">;
  /** Shown beside the value at rest, such as a "Verified" tag. */
  extra?: ReactNode;
}

/**
 * A setting that reads as its value until Edit is pressed, and only then
 * becomes a field with Save and Cancel. Enter saves and Escape puts it back.
 * Without `onSave` the value is shown read only.
 */
export function EditableSetting({
  id,
  label,
  description,
  value,
  onSave,
  inputProps,
  extra,
}: EditableSettingProps) {
  const labels = useSettingsLabels();
  const { addToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editButton = useRef<HTMLButtonElement>(null);

  const open = () => {
    setDraft(value ?? "");
    setError(null);
    setEditing(true);
  };
  const close = () => {
    setEditing(false);
    setError(null);
    // Focus goes back where it came from, not to the top of the page.
    requestAnimationFrame(() => editButton.current?.focus());
  };
  const save = async () => {
    if (!onSave) return;
    const next = draft.trim();
    if (next === (value ?? "")) return close();
    setBusy(true);
    try {
      await onSave(next);
      addToast({ tone: "success", message: labels.common.saved });
      close();
    } catch (e) {
      setError(errorMessage(e, labels.common.failed));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Setting label={label} description={description} controlWidth={editing ? "28rem" : "20rem"}>
      {editing ? (
        <Row
          as="form"
          fillWidth
          gap="8"
          vertical="start"
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            void save();
          }}
        >
          <Input
            id={id}
            size="s"
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                close();
              }
            }}
            error={Boolean(error)}
            errorMessage={error ?? undefined}
            aria-label={typeof label === "string" ? label : undefined}
            {...inputProps}
          />
          <Button
            size="s"
            variant="tertiary"
            weight="default"
            type="button"
            onClick={close}
            disabled={busy}
          >
            {labels.common.cancel}
          </Button>
          <Button size="s" type="submit" loading={busy}>
            {labels.common.save}
          </Button>
        </Row>
      ) : (
        <Row gap="8" vertical="center" horizontal="end" minWidth={0}>
          <Text
            textVariant="label-default-s"
            onBackground={value ? "neutral-medium" : "neutral-weak"}
            truncate
          >
            {value || labels.common.notSet}
          </Text>
          {extra}
          {onSave && (
            <Button ref={editButton} size="s" variant="secondary" onClick={open}>
              {value ? labels.common.edit : labels.common.add}
            </Button>
          )}
        </Row>
      )}
    </Setting>
  );
}

/**
 * The proof a sensitive change asks for: the current password, or for an
 * account with none, a note that a recent sign-in is needed.
 */
export function useReauth(hasPassword: boolean | undefined, id: string) {
  const labels = useSettingsLabels();
  const [password, setPassword] = useState("");
  const needsPassword = hasPassword !== false;
  const proof: Reauth = needsPassword ? { password } : { recentSignIn: true };
  const ready = !needsPassword || password.length > 0;
  const field = needsPassword ? (
    <Input
      id={id}
      type="password"
      label={labels.common.currentPassword}
      autoComplete="current-password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
  ) : (
    <Text textVariant="body-default-s" onBackground="neutral-weak">
      {labels.common.recentSignInNote}
    </Text>
  );
  return { proof, ready, field, reset: () => setPassword("") };
}

/** Crops an image to a centred square no larger than `size`, as JPEG or PNG. */
export async function cropSquare(file: Blob, size = 512): Promise<Blob> {
  if (typeof document === "undefined" || typeof createImageBitmap !== "function") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const side = Math.min(bitmap.width, bitmap.height);
    const out = Math.min(side, size);
    const canvas = document.createElement("canvas");
    canvas.width = out;
    canvas.height = out;
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(
      bitmap,
      (bitmap.width - side) / 2,
      (bitmap.height - side) / 2,
      side,
      side,
      0,
      0,
      out,
      out,
    );
    const type = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.9));
    return blob ?? file;
  } catch {
    return file;
  }
}

/** An Upload button over a hidden file input, for photos and logos. */
export function ImagePickerButton({
  label,
  onPick,
  loading,
  disabled,
}: {
  label: ReactNode;
  onPick: (file: File) => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        hidden
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onPick(file);
        }}
      />
      <Button
        size="s"
        variant="secondary"
        loading={loading}
        disabled={disabled}
        onClick={() => input.current?.click()}
      >
        {label}
      </Button>
    </>
  );
}

/** Initials for an avatar with no photo: "Mira Kovács" is "MK". */
export function initials(name?: string | null, fallback?: string) {
  const source = (name || fallback || "").trim();
  if (!source) return "";
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : source.slice(0, 2);
  return letters.toUpperCase();
}
