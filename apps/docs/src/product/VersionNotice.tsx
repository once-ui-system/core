import { Row, SmartLink, Tag, Text } from "@once-ui-system/core";
import { currentVersion, stableVersion, versionHref } from "@/resources/versions";

/**
 * Shown on every page of a version that is not the stable one, so a reader who
 * arrives from a search result knows which release the page describes. Drawn
 * like `AvailabilityNotice`, which sits in the same place.
 */
export function VersionNotice({ path }: { path: string }) {
  if (currentVersion.status === "stable") return null;
  const beta = currentVersion.status === "beta";

  return (
    <Row
      fillWidth
      gap="12"
      vertical="center"
      wrap
      paddingX="16"
      paddingY="12"
      radius="l"
      border="warning-alpha-weak"
      background="warning-alpha-weak"
    >
      <Tag scheme="warning" size="s">
        {currentVersion.label}
      </Tag>
      <Text
        variant="label-default-s"
        onBackground="neutral-strong"
        style={{ flex: 1, minWidth: "12rem" }}
      >
        {beta ? (
          <>
            <Text onBackground="warning-strong">Prerelease docs.</Text> This describes the{" "}
            <code>@{currentVersion.npmTag}</code> release.
          </>
        ) : (
          <>
            <Text onBackground="warning-strong">Previous major version.</Text> These docs describe{" "}
            {currentVersion.label}.
          </>
        )}{" "}
        The current release is documented in{" "}
        <SmartLink href={versionHref(stableVersion, path)}>{stableVersion.label}</SmartLink>.
      </Text>
    </Row>
  );
}
