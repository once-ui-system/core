import { withErrorContract } from "@/lib/errors";
import { createOgFetchRoute } from "@once-ui-system/core/next";

const og = createOgFetchRoute({ userAgent: "bot", favicon: false });

/** Open Graph data for `OgCard` and `useOgData`, from core's OG route handler. */
export async function GET(request: Request) {
  return withErrorContract(await og.GET(request));
}
