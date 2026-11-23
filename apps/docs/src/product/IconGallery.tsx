"use client";

import {
  Column,
  Grid,
  Icon,
  type IconName,
  Input,
  iconLibrary,
  Text,
  ToggleButton,
  useToast,
} from "@once-ui-system/core";
import { useMemo, useState } from "react";

const names = Object.keys(iconLibrary).sort((a, b) => a.localeCompare(b)) as IconName[];

/** Every icon Once UI ships, searchable by name; a click copies its name. */
export function IconGallery() {
  const [query, setQuery] = useState("");
  const { addToast } = useToast();

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? names.filter((name) => name.toLowerCase().includes(q)) : names;
  }, [query]);

  const copy = (name: string) => {
    navigator.clipboard?.writeText(name).then(
      () => addToast({ tone: "success", message: `Copied "${name}"` }),
      () => addToast({ tone: "danger", message: "Couldn't copy to the clipboard" }),
    );
  };

  return (
    <Column fillWidth gap="16" marginTop="16" marginBottom="24">
      <Input
        id="icon-gallery-search"
        label={`Search ${names.length} icons`}
        prefix={<Icon marginLeft="4" onBackground="neutral-weak" name="search" size="xs" />}
        value={query}
        onValueChange={setQuery}
      />
      {shown.length === 0 ? (
        <Text variant="body-default-s" onBackground="neutral-weak">
          No icon matches “{query}”.
        </Text>
      ) : (
        <Grid fillWidth columns="6" m={{ columns: "4" }} s={{ columns: "3" }} gap="4">
          {shown.map((name) => (
            <ToggleButton
              key={name}
              fillWidth
              size="l"
              aria-label={`Copy ${name}`}
              onClick={() => copy(name)}
              style={{ height: "auto" }}
            >
              <Column horizontal="center" gap="8" paddingY="12" fillWidth>
                <Icon name={name} size="m" onBackground="neutral-strong" />
                <Text variant="code-default-xs" onBackground="neutral-weak" wrap="balance">
                  {name}
                </Text>
              </Column>
            </ToggleButton>
          ))}
        </Grid>
      )}
    </Column>
  );
}
