"use client";

import React, { Suspense } from "react";
import { MissingDependency } from "../../utils/MissingDependency.js";
import type { CodeBlockProps } from "./CodeBlock.impl.js";

const CodeBlockImpl = React.lazy<React.ComponentType<CodeBlockProps>>(() =>
  import("./CodeBlock.impl.js").catch(() => {
    console.warn(
      '[@once-ui-system/core] <CodeBlock /> requires the "prismjs" package. Install it with: npm install prismjs',
    );
    return {
      default: () => <MissingDependency component="CodeBlock" packageName="prismjs" />,
    };
  }),
);

const CodeBlock = (props: CodeBlockProps) => (
  <Suspense fallback={null}>
    <CodeBlockImpl {...props} />
  </Suspense>
);

CodeBlock.displayName = "CodeBlock";

export type { CodeBlockProps };
export { CodeBlock };
