import type React from "react";
import type { ReactNode } from "react";
import type { Column } from "../../components/Column.js";

/** A toolbar button. */
type RichTextTool =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "code"
  | "heading"
  | "bulletList"
  | "orderedList"
  | "link"
  | "undo"
  | "redo";

/** The names of the toolbar and its buttons, to translate them. */
interface RichTextEditorLabels {
  toolbar: string;
  bold: string;
  italic: string;
  underline: string;
  strike: string;
  code: string;
  heading: string;
  bulletList: string;
  orderedList: string;
  link: string;
  unlink: string;
  undo: string;
  redo: string;
  /** The link address field. */
  linkUrl: string;
  /** The button that sets the link. */
  apply: string;
}

interface RichTextEditorProps
  extends Omit<
    React.ComponentProps<typeof Column>,
    "children" | "onChange" | "defaultValue" | "id" | "aria-label" | "minHeight" | "maxHeight"
  > {
  /**
   * The editable area's id. Inside a `Field` it comes from the Field, and the
   * Field's label names the editor.
   */
  id?: string;
  /** The document as HTML, controlled. An empty document is `""`. */
  value?: string;
  /** The starting document as HTML, uncontrolled. */
  defaultValue?: string;
  /** Called with the document as HTML on every change; `""` once it is empty. */
  onValueChange?: (html: string) => void;
  /** A visible label above the editor. Leave it out inside a `Field`. */
  label?: ReactNode;
  /** Shown while the document is empty. */
  placeholder?: string;
  /**
   * The toolbar's buttons, in order, or `false` for none (the keyboard
   * shortcuts and Markdown shortcuts such as `## ` and `- ` still work).
   * Defaults to bold, italic, heading, the two lists, link, undo and redo.
   */
  tools?: RichTextTool[] | false;
  disabled?: boolean;
  readOnly?: boolean;
  /** The writing area's least height, as a CSS length. Default `"8rem"`. */
  minHeight?: string;
  /** The writing area scrolls past this height, as a CSS length. */
  maxHeight?: string;
  /** Focus the editor when it mounts. */
  autoFocus?: boolean;
  labels?: Partial<RichTextEditorLabels>;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-required"?: boolean | "true" | "false";
}

export type { RichTextEditorLabels, RichTextEditorProps, RichTextTool };
