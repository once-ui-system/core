import { createOgImageRoute } from "@once-ui-system/core/next";
import { ogSkin } from "@/resources/og";

export const { GET } = createOgImageRoute({ skin: ogSkin, fallbackTitle: "Documentation" });
