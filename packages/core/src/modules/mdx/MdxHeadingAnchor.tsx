"use client";

import { HeadingAnchor, type HeadingAnchorProps } from "../navigation/HeadingAnchor.js";

export type MdxHeadingAnchorProps = HeadingAnchorProps;

/**
 * The link next to an MDX heading: a real link to `#id`, so it works
 * without JavaScript, can be opened or copied from the context menu, and is
 * reachable by keyboard. Activating it also copies the section's URL and
 * confirms with a toast when there is a ToastProvider. The same anchor
 * `HeadingLink` renders.
 */
export function MdxHeadingAnchor(props: MdxHeadingAnchorProps) {
  return <HeadingAnchor {...props} />;
}
