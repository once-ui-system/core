"use client";

import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import classNames from "clsx";
import { useEffect, useId, useState } from "react";
import { Button } from "../../components/Button.js";
import { Column } from "../../components/Column.js";
import { Input } from "../../components/Input.js";
import { Row } from "../../components/Row.js";
import { Text } from "../../components/Text.js";
import { ToggleButton } from "../../components/ToggleButton.js";
import { createIcon } from "../../icons/renderIcon.js";
import { toolIcons } from "./icons.js";
import styles from "./RichTextEditor.module.scss";
import type { RichTextEditorLabels, RichTextEditorProps, RichTextTool } from "./types.js";

const DEFAULT_TOOLS: RichTextTool[] = [
  "bold",
  "italic",
  "heading",
  "bulletList",
  "orderedList",
  "link",
  "undo",
  "redo",
];

const DEFAULT_LABELS: RichTextEditorLabels = {
  toolbar: "Formatting",
  bold: "Bold",
  italic: "Italic",
  underline: "Underline",
  strike: "Strikethrough",
  code: "Code",
  heading: "Heading",
  bulletList: "Bulleted list",
  orderedList: "Numbered list",
  link: "Link",
  unlink: "Remove link",
  undo: "Undo",
  redo: "Redo",
  linkUrl: "Link address",
  apply: "Apply",
};

const icons = Object.fromEntries(
  Object.entries(toolIcons).map(([name, data]) => [name, createIcon(data)]),
) as Record<keyof typeof toolIcons, ReturnType<typeof createIcon>>;

/** An address as typed, made a link: `example.com` gets `https://`, `mailto:` and paths stay. */
const toHref = (typed: string) => {
  const url = typed.trim();
  if (!url) return "";
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(url)) return url;
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return ""; // any other scheme, javascript: included
  return `https://${url}`;
};

const RichTextEditorImpl = ({
  id: idProp,
  value,
  defaultValue,
  onValueChange,
  label,
  placeholder,
  tools = DEFAULT_TOOLS,
  disabled = false,
  readOnly = false,
  minHeight = "8rem",
  maxHeight,
  autoFocus = false,
  labels,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-required": ariaRequired,
  className,
  ...flex
}: RichTextEditorProps) => {
  const text = { ...DEFAULT_LABELS, ...labels };
  const generatedId = useId();
  const id = idProp ?? `${generatedId}-editor`;
  const labelId = `${id}-label`;
  const invalid = ariaInvalid === true || ariaInvalid === "true";
  const editable = !disabled && !readOnly;

  // A Field's <label htmlFor> cannot name a contenteditable element, so the
  // editor points at it with aria-labelledby instead.
  const [fieldLabelId, setFieldLabelId] = useState<string | undefined>();
  useEffect(() => {
    if (label || ariaLabelledBy || ariaLabel) return;
    const fieldLabel = document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(id)}"]`);
    if (!fieldLabel) return;
    if (!fieldLabel.id) fieldLabel.id = `${id}-field-label`;
    setFieldLabelId(fieldLabel.id);
  }, [id, label, ariaLabel, ariaLabelledBy]);

  const labelledBy = label ? labelId : (ariaLabelledBy ?? fieldLabelId);

  const attributes: Record<string, string> = {
    id,
    role: "textbox",
    "aria-multiline": "true",
    class: styles.content,
  };
  if (labelledBy) attributes["aria-labelledby"] = labelledBy;
  else if (ariaLabel) attributes["aria-label"] = ariaLabel;
  if (ariaDescribedBy) attributes["aria-describedby"] = ariaDescribedBy;
  if (invalid) attributes["aria-invalid"] = "true";
  if (ariaRequired === true || ariaRequired === "true") attributes["aria-required"] = "true";
  if (readOnly) attributes["aria-readonly"] = "true";
  if (disabled) attributes["aria-disabled"] = "true";

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3] },
          link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
        }),
        Placeholder.configure({ placeholder: placeholder ?? "" }),
      ],
      content: value ?? defaultValue ?? "",
      editable,
      autofocus: autoFocus ? "end" : false,
      immediatelyRender: false,
      editorProps: { attributes },
      onUpdate: ({ editor: current }) => onValueChange?.(current.isEmpty ? "" : current.getHTML()),
    },
    [placeholder],
  );

  // Attributes follow the props without rebuilding the editor.
  const attributesKey = JSON.stringify(attributes);
  useEffect(() => {
    editor?.setOptions({ editorProps: { attributes: JSON.parse(attributesKey) } });
  }, [editor, attributesKey]);

  useEffect(() => {
    editor?.setEditable(editable, false);
  }, [editor, editable]);

  // A controlled value that differs from the document replaces it, without
  // reporting the change back.
  useEffect(() => {
    if (!editor || value === undefined) return;
    const current = editor.isEmpty ? "" : editor.getHTML();
    if (value !== current) editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  const active = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      current
        ? {
            bold: current.isActive("bold"),
            italic: current.isActive("italic"),
            underline: current.isActive("underline"),
            strike: current.isActive("strike"),
            code: current.isActive("code"),
            heading: current.isActive("heading"),
            bulletList: current.isActive("bulletList"),
            orderedList: current.isActive("orderedList"),
            link: current.isActive("link"),
            canUndo: current.can().undo(),
            canRedo: current.can().redo(),
          }
        : null,
  });

  const [linkOpen, setLinkOpen] = useState(false);
  const [linkDraft, setLinkDraft] = useState("");

  const run = (tool: RichTextTool) => {
    if (!editor) return;
    const chain = editor.chain().focus();
    switch (tool) {
      case "bold":
        chain.toggleBold().run();
        break;
      case "italic":
        chain.toggleItalic().run();
        break;
      case "underline":
        chain.toggleUnderline().run();
        break;
      case "strike":
        chain.toggleStrike().run();
        break;
      case "code":
        chain.toggleCode().run();
        break;
      case "heading":
        chain.toggleHeading({ level: 2 }).run();
        break;
      case "bulletList":
        chain.toggleBulletList().run();
        break;
      case "orderedList":
        chain.toggleOrderedList().run();
        break;
      case "undo":
        chain.undo().run();
        break;
      case "redo":
        chain.redo().run();
        break;
      case "link":
        if (editor.isActive("link")) {
          chain.extendMarkRange("link").unsetLink().run();
        } else {
          setLinkDraft("");
          setLinkOpen(true);
        }
        break;
    }
  };

  const applyLink = () => {
    const href = toHref(linkDraft);
    setLinkOpen(false);
    if (!editor || !href) return;
    const chain = editor.chain().focus().extendMarkRange("link");
    if (editor.state.selection.empty && !editor.isActive("link")) {
      chain
        .insertContent({
          type: "text",
          text: linkDraft.trim(),
          marks: [{ type: "link", attrs: { href } }],
        })
        .run();
    } else {
      chain.setLink({ href }).run();
    }
  };

  const toolList = tools === false ? [] : tools;

  return (
    <Column fillWidth gap="8" className={className} {...flex}>
      {label && (
        <Text
          id={labelId}
          as="span"
          textVariant="label-default-s"
          onBackground="neutral-medium"
          onClick={() => editor?.commands.focus()}
        >
          {label}
        </Text>
      )}
      <Column
        fillWidth
        className={classNames(styles.frame, {
          [styles.invalid]: invalid,
          [styles.disabled]: disabled,
        })}
      >
        {toolList.length > 0 && editable && (
          <Row
            role="toolbar"
            aria-label={text.toolbar}
            aria-controls={id}
            gap="2"
            padding="4"
            wrap
            vertical="center"
            className={styles.toolbar}
          >
            {toolList.map((tool) => {
              const isLink = tool === "link";
              const pressed =
                tool === "undo" || tool === "redo" ? undefined : Boolean(active?.[tool]);
              const name = isLink && active?.link ? text.unlink : text[tool];
              const IconSvg = icons[isLink && active?.link ? "unlink" : tool];
              const unavailable =
                (tool === "undo" && !active?.canUndo) || (tool === "redo" && !active?.canRedo);
              return (
                <ToggleButton
                  key={tool}
                  size="s"
                  selected={Boolean(pressed) && !isLink}
                  aria-pressed={isLink ? undefined : pressed}
                  aria-expanded={isLink && !active?.link ? linkOpen : undefined}
                  aria-label={name}
                  title={name}
                  disabled={unavailable || !editor}
                  // Keep the selection in the document while the button is pressed.
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => run(tool)}
                >
                  <IconSvg className={styles.icon} aria-hidden="true" />
                </ToggleButton>
              );
            })}
          </Row>
        )}
        {linkOpen && (
          <Row gap="8" padding="8" vertical="center" className={styles.toolbar}>
            <Input
              id={`${id}-link`}
              size="xxs"
              aria-label={text.linkUrl}
              placeholder="https://"
              value={linkDraft}
              // biome-ignore lint/a11y/noAutofocus: the reader opened this field to type in it
              autoFocus
              onChange={(event) => setLinkDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyLink();
                } else if (event.key === "Escape") {
                  event.preventDefault();
                  setLinkOpen(false);
                  editor?.commands.focus();
                }
              }}
            />
            <Button size="s" variant="secondary" onClick={applyLink}>
              {text.apply}
            </Button>
          </Row>
        )}
        <div className={maxHeight ? styles.scroll : undefined} style={{ minHeight, maxHeight }}>
          <EditorContent editor={editor} style={{ minHeight }} />
        </div>
      </Column>
    </Column>
  );
};

export { RichTextEditorImpl as default };
