import { withErrorContract } from "@/lib/errors";
import { createOgProxyRoute } from "@once-ui-system/core/next";

const og = createOgProxyRoute({ cacheMaxAge: 86400 });

/** Link-preview images for `OgCard`, served from this origin by core's OG route handler. */
export async function GET(request: Request) {
  return withErrorContract(await og.GET(request));
}
