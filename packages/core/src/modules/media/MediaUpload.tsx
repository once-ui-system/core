"use client";

import React, { Suspense } from "react";
import { MissingDependency } from "../../utils/MissingDependency.js";
import type { MediaUploadProps } from "./MediaUpload.impl.js";

const MediaUploadImpl = React.lazy<React.ComponentType<MediaUploadProps>>(() =>
  import("./MediaUpload.impl.js").catch(() => {
    console.warn(
      '[@once-ui-system/core] <MediaUpload /> requires the "compressorjs" package. Install it with: npm install compressorjs',
    );
    return {
      default: () => <MissingDependency component="MediaUpload" packageName="compressorjs" />,
    };
  }),
);

const MediaUpload = ({ ref, ...props }: MediaUploadProps) => (
  <Suspense fallback={null}>
    <MediaUploadImpl {...props} ref={ref} />
  </Suspense>
);

MediaUpload.displayName = "MediaUpload";

export type { MediaUploadProps };
export { MediaUpload };
