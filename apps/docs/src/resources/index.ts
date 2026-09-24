export {
  style,
  layout,
  baseURL,
  social,
  schema,
  meta,
  dataStyle
} from "@/resources/once-ui.config";

/**
 * The blocks catalogue.
 *
 * `blocks.js` is authored as plain JavaScript, so it arrives untyped. The cast
 * is the one place that is admitted, rather than every reader having to widen
 * it themselves.
 */
import type { Blocks } from "@/types";
import { blocks as blocksData } from "@/resources/blocks";

export const blocks = blocksData as unknown as Blocks;
