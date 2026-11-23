"use client";

import {
  Button,
  Column,
  Combobox,
  type ComboboxOption,
  Field,
  Row,
  Tag,
  Text,
} from "@once-ui-system/core";
import { RichTextEditor } from "@once-ui-system/core/richtext";
import { useEffect, useState } from "react";

// ─── Combobox ───────────────────────────────────────────────────────────────

const teammates: ComboboxOption[] = [
  { value: "mira-kovan", label: "Mira Kovan", description: "Design" },
  { value: "tobin-asher", label: "Tobin Asher", description: "Engineering" },
  { value: "lena-voss", label: "Lena Voss", description: "Finance" },
  { value: "ravi-ostrand", label: "Ravi Ostrand", description: "Engineering" },
  { value: "hana-pell", label: "Hana Pell", description: "Support", disabled: true },
];

/** Controlled text, with the picked option kept apart from free text. */
export function ComboboxControlledExample() {
  const [text, setText] = useState("");
  const [picked, setPicked] = useState<ComboboxOption | null>(null);

  return (
    <Column fillWidth gap="12">
      <Combobox
        id="combobox-controlled"
        label="Assign to"
        options={teammates}
        value={text}
        onValueChange={(next) => {
          setText(next);
          if (picked && next !== picked.label) setPicked(null);
        }}
        onOptionSelect={setPicked}
      />
      <Row gap="8" vertical="center">
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          {picked ? "Picked:" : text ? "Free text:" : "Nothing yet"}
        </Text>
        {picked && <Tag tone="brand">{picked.value}</Tag>}
        {!picked && text && <Tag tone="neutral">{text}</Tag>}
      </Row>
    </Column>
  );
}

/** Starts-with matching instead of the default contains. */
export function ComboboxFilterExample() {
  return (
    <Combobox
      id="combobox-filter"
      label="Country code"
      options={[
        { value: "HU", label: "HU" },
        { value: "AT", label: "AT" },
        { value: "DE", label: "DE" },
        { value: "DK", label: "DK" },
        { value: "UA", label: "UA" },
      ]}
      filter={(option, query) => option.value.toLowerCase().startsWith(query.trim().toLowerCase())}
    />
  );
}

const cities = [
  "Aldermoor",
  "Brightwater",
  "Calderon",
  "Dunmere",
  "Eastvale",
  "Fernholt",
  "Glenrock",
  "Harrowgate",
  "Ivybridge",
  "Larkspur",
  "Marlow Bay",
  "Northwick",
];

/** A stand-in for a server search: results arrive after a short wait. */
function searchCities(query: string): Promise<ComboboxOption[]> {
  const q = query.trim().toLowerCase();
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve(
          cities
            .filter((city) => city.toLowerCase().includes(q))
            .map((city) => ({ value: city, label: city })),
        ),
      600,
    ),
  );
}

/** Server results: `filter={false}`, `loading` and the options for the current text. */
export function ComboboxServerExample() {
  const [text, setText] = useState("");
  const [options, setOptions] = useState<ComboboxOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!text.trim()) {
      setOptions([]);
      setLoading(false);
      return;
    }
    let current = true;
    setLoading(true);
    searchCities(text).then((results) => {
      if (!current) return;
      setOptions(results);
      setLoading(false);
    });
    return () => {
      current = false;
    };
  }, [text]);

  return (
    <Combobox
      id="combobox-server"
      label="Delivery city"
      options={options}
      value={text}
      onValueChange={setText}
      filter={false}
      loading={loading}
      emptyState={
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          No city matches. You can still use what you typed.
        </Text>
      }
    />
  );
}

// ─── RichTextEditor ─────────────────────────────────────────────────────────

/** Controlled: the HTML the editor reports, shown under it. */
export function RichTextEditorControlledExample() {
  const [html, setHtml] = useState(
    "<p>Hi Ada,</p><p>The <strong>first draft</strong> is ready for review.</p>",
  );

  return (
    <Column fillWidth gap="12">
      <RichTextEditor label="Message" value={html} onValueChange={setHtml} maxHeight="16rem" />
      <Column fillWidth gap="4">
        <Text textVariant="label-default-s" onBackground="neutral-weak">
          Value
        </Text>
        <Text
          textVariant="code-default-s"
          onBackground="neutral-medium"
          style={{ wordBreak: "break-all" }}
        >
          {html || '""'}
        </Text>
      </Column>
    </Column>
  );
}

/** Inside a Field, with a hint and an error once it is empty. */
export function RichTextEditorFieldExample() {
  const [html, setHtml] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const error = submitted && !html ? "Write a short summary before you send it." : undefined;

  return (
    <Column fillWidth gap="12">
      <Field
        label="Project summary"
        hint="A few lines the client sees at the top of the project."
        error={error}
        required
      >
        <RichTextEditor
          id="project-summary"
          value={html}
          onValueChange={setHtml}
          placeholder="What is this project about?"
        />
      </Field>
      <Row>
        <Button size="s" label="Send" onClick={() => setSubmitted(true)} />
      </Row>
    </Column>
  );
}
