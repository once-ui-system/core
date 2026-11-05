"use client";

import { createContext, type ReactNode, useContext } from "react";
import { DEFAULT_EDITOR_LABELS, type EditorLabels } from "./labels.js";
import type { EditorField, SectionDefinition } from "./model.js";

/** Draws a field kind the kit does not have. */
export type FieldRenderer = (props: {
  field: EditorField;
  id: string;
  value: unknown;
  onChange: (value: unknown) => void;
}) => ReactNode;

export interface EditorContextValue {
  labels: EditorLabels;
  /** Section types by `type`. */
  definitions: Record<string, SectionDefinition>;
  /** Extra drawings by `type` or `type.layout`; see SectionGlyph. */
  glyphs: Record<string, ReactNode>;
  /** Extra field kinds by `kind`. */
  fieldKinds: Record<string, FieldRenderer>;
  /** Field labels a product translates, by `type.key` (or `key` for every type). */
  fieldLabel: (type: string, field: EditorField) => string;
}

const EditorContext = createContext<EditorContextValue>({
  labels: DEFAULT_EDITOR_LABELS,
  definitions: {},
  glyphs: {},
  fieldKinds: {},
  fieldLabel: (_type, field) => field.label,
});

export const EditorContextProvider = EditorContext.Provider;

export const useEditorContext = () => useContext(EditorContext);
