"use client";

import { Button, Column, Dropdown, Option, Row, Tag, Text } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { currentVersion, VERSIONS, versionHref } from "@/resources/versions";

/**
 * Which major version these docs describe. Each version is its own site, so
 * picking one opens the same page on that version's site.
 */
export function VersionPicker() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "/";

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      placement="bottom-start"
      trigger={
        <Button
          size="s"
          variant="tertiary"
          weight="default"
          suffixIcon="chevronDown"
          data-border="rounded"
          aria-label={`Docs version: ${currentVersion.label}`}
          onClick={() => setOpen(!open)}
        >
          {currentVersion.label}
        </Button>
      }
    >
      <Column minWidth="16rem" padding="4" gap="2">
        <Row paddingX="12" paddingTop="8" paddingBottom="4">
          <Text textVariant="label-default-xs" onBackground="neutral-weak">
            Docs version
          </Text>
        </Row>
        {VERSIONS.map((version) => {
          const isCurrent = version.id === currentVersion.id;
          const unavailable = !version.published && !isCurrent;
          return (
            <Option
              key={version.id}
              value={version.id}
              selected={isCurrent}
              disabled={unavailable}
              href={isCurrent || unavailable ? undefined : versionHref(version, pathname)}
              onClick={() => setOpen(false)}
              label={version.label}
              description={
                unavailable
                  ? "Docs site goes live with the beta"
                  : version.npmTag
                    ? `Installs from npm @${version.npmTag}`
                    : "Previous major version"
              }
              suffix={
                version.status === "stable" ? (
                  <Tag size="s" tone="brand">
                    Latest
                  </Tag>
                ) : version.status === "beta" ? (
                  <Tag size="s" tone="warning">
                    Beta
                  </Tag>
                ) : undefined
              }
            />
          );
        })}
      </Column>
    </Dropdown>
  );
}
