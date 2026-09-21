import { Row, Tag, Text } from "@once-ui-system/core";
import { AVAILABILITY, type Availability } from "./availability";

/**
 * Says, on the page itself, whether the reader can install what they are
 * reading about.
 *
 * `VersionBanner` already says the site documents 2.0, but it says one thing
 * to every page, and it cannot tell "shipped in the alpha" from "not published
 * anywhere yet" — it tells both to install `@alpha`, which is wrong for the
 * second. It also sits above the sidebar, far from the prose someone arriving
 * from a search result starts reading.
 *
 * So this is per page, under the title, in the column the content is in.
 * Tinted rather than `solid` for the reason `VersionBanner` documents at
 * length: a solid inverts the surface but nothing inside inherits the
 * inversion, so links and buttons land on their own opposite.
 */
export function AvailabilityNotice({ status }: { status: Availability }) {
  const copy = AVAILABILITY[status];

  return (
    <Row
      fillWidth
      gap="12"
      vertical="center"
      wrap
      paddingX="16"
      paddingY="12"
      radius="l"
      border={`${copy.scheme}-alpha-weak`}
      background={`${copy.scheme}-alpha-weak`}
    >
      <Tag scheme={copy.scheme} size="s">
        {copy.tag}
      </Tag>
      {/* One `Text`, not a `Row` of two: a Row is a flex container, so the
          headline and the detail would each become a flex item and sit in
          their own column rather than reading as one sentence. Nesting keeps
          them in a single inline flow, with the headline coloured. */}
      <Text
        variant="label-default-s"
        onBackground="neutral-strong"
        style={{ flex: 1, minWidth: "12rem" }}
      >
        <Text onBackground={`${copy.scheme}-strong`}>{copy.headline}</Text> {copy.detail}
      </Text>
    </Row>
  );
}
