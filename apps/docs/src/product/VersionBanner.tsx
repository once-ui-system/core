import { Row, SmartLink, Tag, Text } from "@once-ui-system/core";

/**
 * Which version of Once UI this site documents, said out loud.
 *
 * The docs build against the workspace package, so this site documents whatever
 * core is checked out — currently 2.0, which publishes to the `alpha` dist-tag
 * and not to `latest`. That gap is the problem this solves: `npm install
 * @once-ui-system/core` still resolves 1.8.4, so without a notice a visitor
 * installs the stable release and then reads prop names that do not exist in
 * it. Both directions are covered, because either kind of visitor can arrive
 * here from a search result.
 *
 * It is a tinted strip rather than `Banner`, and that is deliberate rather than
 * a downgrade. `Banner` paints a `solid`, which is the inverse of the page —
 * and nothing inside inherits that inversion. Every component in there still
 * resolves the *page's* colours, so they land on their own opposite: a
 * `SmartLink` came out at 1.26:1 and a secondary `Button` at 1:1, invisible.
 * Only the `onSolid` text utilities know, and core's global `a:not(.button)`
 * rule is (0,1,1) and outspecifies every one of them at (0,1,0), so no prop can
 * fix a link in there. On a normal background all of that simply does not
 * arise, and orientation chrome should be quiet on every page anyway.
 *
 * When 2.0 becomes `latest` this stops being true and should come out — at
 * which point v1.docs is the archive rather than where most people belong.
 */

export const V1_DOCS_URL = "https://v1.docs.once-ui.com";

export function VersionBanner() {
  return (
    <Row
      fillWidth
      /*
       * Opaque, and above the page, because of what sits behind it.
       *
       * The tint below is `neutral-alpha-weak` — 15% — which is right for the
       * banner's weight but lets whatever is underneath through. The docs home
       * page draws a `BlobFx` at `position="absolute"` with `translateY="-60%"`,
       * so it reaches up out of its own container and lands squarely behind
       * this strip. Two separate problems follow, and only doing both fixes it:
       * the colour bled through the tint, and — because the blob is positioned
       * and an in-flow strip is not — it painted *over* the banner as well.
       * `page` gives the tint something opaque to sit on; `relative` + `zIndex`
       * puts the strip back on top.
       *
       * Compositing the tint over `page` is also exactly what the measured
       * contrast assumed, so the AA figures are unchanged by this.
       */
      background="page"
      position="relative"
      zIndex={1}
      borderBottom="neutral-alpha-medium"
    >
      <Row
        fillWidth
        horizontal="center"
        vertical="center"
        gap="12"
        wrap
        paddingX="16"
        paddingY="8"
        background="neutral-alpha-weak"
        s={{ direction: "column" }}
      >
      <Row gap="8" vertical="center" wrap horizontal="center">
        <Tag scheme="brand" size="s">
          2.0 alpha
        </Tag>
        <Text variant="label-default-s" onBackground="neutral-strong">
          These docs describe 2.0. Install it with{" "}
          <Text variant="code-default-s" onBackground="neutral-strong">
            @once-ui-system/core@alpha
          </Text>
          .
        </Text>
      </Row>
      <Text variant="label-default-s" onBackground="neutral-weak">
        On 1.8.x?{" "}
        <SmartLink href={V1_DOCS_URL} suffixIcon="arrowUpRight" iconSize="xs">
          Read the 1.x docs
        </SmartLink>
        </Text>
      </Row>
    </Row>
  );
}
