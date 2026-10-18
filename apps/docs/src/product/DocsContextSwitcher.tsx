"use client";

import { Column, DropdownWrapper, Icon, Line, Option, Row, Tag, Text } from "@once-ui-system/core";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { counterpartSlug, PLATFORMS, platformOfPath } from "@/resources/platforms";
import { currentVersion, VERSIONS, versionHref } from "@/resources/versions";

interface SlugTree {
  slug: string;
  children?: SlugTree[];
}

/** Every page slug in a navigation tree. Folders are not pages. */
export function flattenSlugs(items: SlugTree[]): string[] {
  return items.flatMap((item) => (item.children ? flattenSlugs(item.children) : [item.slug]));
}

function VersionTag({ status }: { status: string }) {
  if (status === "stable")
    return (
      <Tag size="s" scheme="brand">
        Latest
      </Tag>
    );
  if (status === "beta")
    return (
      <Tag size="s" scheme="warning">
        Beta
      </Tag>
    );
  return null;
}

/**
 * Which docs the reader is in: the platform and the version, in one control
 * at the top of the sidebar. The trigger names both; the menu lists the
 * platforms, then the versions.
 *
 * Switching platform keeps the reader on the same topic where the other
 * platform has a page for it. Each version is its own site, so picking one
 * opens the same page there. With one platform and one version there is
 * nothing to pick, and the control is not drawn.
 */
export function DocsContextSwitcher({ slugs }: { slugs: string[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const platform = platformOfPath(pathname);

  if (PLATFORMS.length < 2 && VERSIONS.length < 2) return null;

  return (
    <DropdownWrapper
      fillWidth
      open={open}
      onOpenChange={setOpen}
      placement="bottom-start"
      trigger={
        <Row
          as="button"
          fillWidth
          vertical="center"
          gap="12"
          padding="8"
          radius="l"
          border="neutral-alpha-medium"
          background="surface"
          cursor="interactive"
          aria-label={`${platform.label} docs, version ${currentVersion.label}. Change platform or version`}
          onClick={() => setOpen(!open)}
          style={{ textAlign: "left" }}
        >
          <Row
            width="32"
            height="32"
            radius="m"
            center
            background="neutral-alpha-weak"
            border="neutral-alpha-weak"
            flex={0}
          >
            <Icon name={platform.icon} size="s" onBackground="neutral-strong" />
          </Row>
          <Column fillWidth gap="2">
            <Text variant="label-strong-s" onBackground="neutral-strong">
              {platform.label}
            </Text>
            <Text variant="label-default-xs" onBackground="neutral-weak">
              Version {currentVersion.label}
            </Text>
          </Column>
          <Icon name="chevronUpDown" size="xs" onBackground="neutral-weak" />
        </Row>
      }
      dropdown={
        <Column minWidth={16} padding="4" gap="2">
          {PLATFORMS.length > 1 && (
            <>
              <Row paddingX="12" paddingTop="8" paddingBottom="4">
                <Text variant="label-default-xs" onBackground="neutral-weak">
                  Platform
                </Text>
              </Row>
              {PLATFORMS.map((p) => (
                <Option
                  key={p.id}
                  value={`platform-${p.id}`}
                  selected={p.id === platform.id}
                  label={p.label}
                  prefix={<Icon name={p.icon} size="xs" onBackground="neutral-weak" />}
                  onClick={() => {
                    setOpen(false);
                    if (p.id !== platform.id)
                      router.push(`/${counterpartSlug(pathname, p, slugs)}`);
                  }}
                />
              ))}
            </>
          )}
          {PLATFORMS.length > 1 && VERSIONS.length > 1 && <Line marginY="4" />}
          {VERSIONS.length > 1 && (
            <>
              <Row paddingX="12" paddingTop="8" paddingBottom="4">
                <Text variant="label-default-xs" onBackground="neutral-weak">
                  Version
                </Text>
              </Row>
              {VERSIONS.map((version) => {
                const isCurrent = version.id === currentVersion.id;
                const unavailable = !version.published && !isCurrent;
                return (
                  <Option
                    key={version.id}
                    value={`version-${version.id}`}
                    selected={isCurrent}
                    disabled={unavailable}
                    href={isCurrent || unavailable ? undefined : versionHref(version, pathname)}
                    onClick={() => setOpen(false)}
                    label={version.label}
                    description={
                      unavailable
                        ? "Site not live yet"
                        : version.npmTag
                          ? `Installs from npm @${version.npmTag}`
                          : "Previous major version"
                    }
                    suffix={<VersionTag status={version.status} />}
                  />
                );
              })}
            </>
          )}
        </Column>
      }
    />
  );
}
