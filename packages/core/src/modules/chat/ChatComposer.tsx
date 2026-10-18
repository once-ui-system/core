"use client";

import classNames from "clsx";
import type React from "react";
import { type ReactNode, useId, useRef, useState } from "react";
import { Column } from "../../components/Column.js";
import { Icon } from "../../components/Icon.js";
import { IconButton } from "../../components/IconButton.js";
import { Row } from "../../components/Row.js";
import { Text } from "../../components/Text.js";
import { Textarea } from "../../components/Textarea.js";
import styles from "./Chat.module.scss";

export interface ChatComposerMessage {
  text: string;
  files: File[];
}

export interface ChatComposerProps
  extends Omit<
    React.ComponentProps<typeof Column>,
    "onChange" | "onSubmit" | "prefix" | "ref" | "aria-label"
  > {
  /** Called with the trimmed text and the attached files. Return a promise to
   *  show the send button loading; the field clears when it resolves and keeps
   *  the draft when it rejects. */
  onSend: (message: ChatComposerMessage) => void | Promise<void>;
  /** The draft, when the parent owns it. */
  value?: string;
  /** The first draft, when the composer owns it. */
  defaultValue?: string;
  /** Called on every edit of the draft. */
  onValueChange?: (value: string) => void;
  placeholder?: string;
  /** Show the attach button. Pass an object to limit the file types or to allow only one. */
  attach?: boolean | { accept?: string; multiple?: boolean };
  /** Enter sends and Shift+Enter starts a new line. Off, Enter always starts a new line. */
  sendOnEnter?: boolean;
  /** Shows the send button loading and stops another send, without disabling the field. */
  loading?: boolean;
  disabled?: boolean;
  /** The field's accessible name. Defaults to "Message". */
  "aria-label"?: string;
  sendLabel?: string;
  attachLabel?: string;
  /** The label of each attachment's remove button; it gets the file name. */
  removeLabel?: (fileName: string) => string;
  /** Content before the field, such as an `EmojiPickerDropdown`. */
  prefix?: ReactNode;
  /** More controls before the send button. */
  actions?: ReactNode;
  maxLength?: number;
  id?: string;
  /** The textarea. */
  ref?: React.Ref<HTMLTextAreaElement>;
}

/**
 * The input bar under a conversation: a field that grows with the draft, an
 * optional attach button with the picked files as removable chips, and send.
 */
const ChatComposer = ({
  ref,
  onSend,
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  placeholder = "Write a message",
  attach = false,
  sendOnEnter = true,
  loading = false,
  disabled = false,
  "aria-label": ariaLabel = "Message",
  sendLabel = "Send",
  attachLabel = "Attach files",
  removeLabel = (fileName) => `Remove ${fileName}`,
  prefix,
  actions,
  maxLength,
  id,
  className,
  ...flex
}: ChatComposerProps) => {
  const generatedId = useId();
  const fieldId = id ?? `chat-composer-${generatedId}`;
  const [ownValue, setOwnValue] = useState(defaultValue);
  const value = controlledValue ?? ownValue;
  // Each file gets an id for its key: two picks of the same file are two attachments.
  const [files, setFiles] = useState<{ id: number; file: File }[]>([]);
  const nextId = useRef(0);
  const [sending, setSending] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const attachOptions = typeof attach === "object" ? attach : {};
  const multiple = attachOptions.multiple ?? true;

  const setValue = (next: string) => {
    if (controlledValue === undefined) setOwnValue(next);
    onValueChange?.(next);
  };

  const busy = loading || sending;
  const canSend = !disabled && !busy && (value.trim() !== "" || files.length > 0);

  const send = async () => {
    if (!canSend) return;
    const message = { text: value.trim(), files: files.map((entry) => entry.file) };
    setSending(true);
    try {
      await onSend(message);
      setValue("");
      setFiles([]);
    } catch {
      // The draft stays, so the user can send it again. Showing the error
      // is the caller's: it knows what went wrong.
    } finally {
      setSending(false);
    }
  };

  const addFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const picked = Array.from(list, (file) => ({ id: nextId.current++, file }));
    setFiles((current) => (multiple ? [...current, ...picked] : picked.slice(0, 1)));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // `isComposing`: Enter also confirms an IME composition (Japanese,
    // Chinese, Korean input), and that Enter must not send half a word.
    if (sendOnEnter && event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!attach || event.clipboardData.files.length === 0) return;
    event.preventDefault();
    addFiles(event.clipboardData.files);
  };

  return (
    <Column fillWidth gap="8" className={classNames(styles.composer, className)} {...flex}>
      <Textarea
        ref={ref}
        id={fieldId}
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        disabled={disabled}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        style={{ maxHeight: "12rem", overflowY: "auto" }}
        prefix={
          (attach || prefix) && (
            <Row gap="4" vertical="center" className={styles.composerEdge}>
              {attach && (
                <>
                  <IconButton
                    icon="plus"
                    variant="tertiary"
                    aria-label={attachLabel}
                    tooltip={attachLabel}
                    disabled={disabled}
                    onClick={() => fileInput.current?.click()}
                  />
                  <input
                    ref={fileInput}
                    type="file"
                    hidden
                    tabIndex={-1}
                    accept={attachOptions.accept}
                    multiple={multiple}
                    onChange={(event) => {
                      addFiles(event.target.files);
                      // Picking the same file again after removing it must fire a change.
                      event.target.value = "";
                    }}
                  />
                </>
              )}
              {prefix}
            </Row>
          )
        }
        suffix={
          <Row gap="4" vertical="center" className={styles.composerEdge}>
            {actions}
            <IconButton
              icon="send"
              aria-label={sendLabel}
              tooltip={sendLabel}
              loading={busy}
              disabled={!canSend}
              onClick={send}
            />
          </Row>
        }
      >
        {files.length > 0 && (
          <Row gap="4" wrap paddingX="8" paddingBottom="8">
            {files.map(({ id: fileId, file }) => (
              <Row
                key={fileId}
                gap="4"
                vertical="center"
                paddingLeft="8"
                paddingY="2"
                paddingRight="2"
                radius="full"
                background="neutral-alpha-weak"
                border="neutral-alpha-medium"
                className={styles.attachment}
              >
                <Icon name={file.type.startsWith("image/") ? "image" : "document"} size="xs" />
                <Text textVariant="label-default-s" truncate>
                  {file.name}
                </Text>
                <IconButton
                  icon="close"
                  size="s"
                  variant="ghost"
                  aria-label={removeLabel(file.name)}
                  onClick={() =>
                    setFiles((current) => current.filter((entry) => entry.id !== fileId))
                  }
                />
              </Row>
            ))}
          </Row>
        )}
      </Textarea>
    </Column>
  );
};

ChatComposer.displayName = "ChatComposer";

export { ChatComposer };
