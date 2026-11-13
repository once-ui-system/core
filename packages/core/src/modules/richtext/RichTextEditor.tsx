"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Column } from "../../components/Column.js";
import { MissingDependency } from "../../utils/MissingDependency.js";
import styles from "./RichTextEditor.module.scss";
import type { RichTextEditorProps } from "./types.js";

const RichTextEditorImpl = React.lazy<React.ComponentType<RichTextEditorProps>>(() =>
  import("./RichTextEditor.impl.js").catch(() => {
    console.warn(
      "[@once-ui-system/core] <RichTextEditor /> requires TipTap. Install it with: npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extensions",
    );
    return {
      default: () => <MissingDependency component="RichTextEditor" packageName="@tiptap/react" />,
    };
  }),
);

/** The empty frame, on the server and until TipTap loads, so nothing shifts. */
const EditorFrame = ({ minHeight = "8rem", tools }: RichTextEditorProps) => (
  <Column
    fillWidth
    aria-busy
    className={styles.frame}
    style={{ minHeight: `calc(${minHeight} + ${tools === false ? "0px" : "2.75rem"})` }}
  />
);

/**
 * A rich-text field: bold, italic, headings, lists and links, written with a
 * toolbar, the usual shortcuts (Mod-B, Mod-I) or Markdown as you type (`## `,
 * `- `, `1. `, `> `). The value is HTML. Built on TipTap, an optional peer
 * that loads when an editor renders; the field mounts on the client only.
 *
 * Inside a `Field` the Field's label names it and its hint and error describe
 * it; on its own, give it `label` or `aria-label`. Render the saved HTML
 * through your sanitizer before you show it anywhere else.
 */
const RichTextEditor = (props: RichTextEditorProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <EditorFrame {...props} />;
  return (
    <Suspense fallback={<EditorFrame {...props} />}>
      <RichTextEditorImpl {...props} />
    </Suspense>
  );
};

RichTextEditor.displayName = "RichTextEditor";

export type { RichTextEditorLabels, RichTextEditorProps, RichTextTool } from "./types.js";
export { RichTextEditor };
