"use client";

import {
  Button,
  type ChangeDetails,
  Column,
  Feedback,
  Input,
  Row,
  Select,
  Switch,
  Text,
} from "@once-ui-system/core";
import { type AgentActResult, type AgentEntry, createAgent } from "@once-ui-system/core/agent";
import { CodeBlock } from "@once-ui-system/core/code";
import { useMemo, useRef, useState } from "react";

const TIMEZONES = [
  { value: "utc", label: "UTC" },
  { value: "cet", label: "Central European Time" },
  { value: "pst", label: "Pacific Time" },
];

// The steps a model would send for "Call me Ada, use Central European
// Time and stop the weekly digest". Scripted here, so the page needs no key.
const STEPS = [
  { ref: "Display name", action: "setValue", args: ["Ada Lovelace"] },
  { ref: "Timezone", action: "setValue", args: ["cet"] },
  { ref: "Weekly digest", action: "setChecked", args: [false] },
];

type Log = { title: string; body: unknown };

/** A settings card an agent drives through the bridge, with what it reads and gets back. */
export function AgentSettingsExample() {
  const [name, setName] = useState("Grace Hopper");
  const [timezone, setTimezone] = useState("utc");
  const [digest, setDigest] = useState(true);
  const [sources, setSources] = useState<string[]>([]);
  const [log, setLog] = useState<Log>();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string>();
  const deleted = useRef(false);

  const agent = useMemo(
    // The docs page has no way to ask a person, so every confirm step is refused.
    () => createAgent({ allow: (step) => !step.confirm }),
    [],
  );

  const note = (control: string, details?: ChangeDetails) =>
    setSources((list) => [`${control}: ${details?.source ?? "unknown"}`, ...list].slice(0, 4));

  const snapshot = () => {
    const entries: AgentEntry[] = agent.snapshot().filter((entry) => entry.component !== "section");
    setLog({ title: "snapshot()", body: entries });
  };

  const run = async (title: string, steps: typeof STEPS) => {
    setRunning(true);
    setError(undefined);
    try {
      const result: AgentActResult = await agent.act({ steps });
      setLog({ title, body: result });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    setName("Grace Hopper");
    setTimezone("utc");
    setDigest(true);
    setSources([]);
    setLog(undefined);
    setError(undefined);
    deleted.current = false;
  };

  return (
    <Column fillWidth gap="16">
      <Row fillWidth gap="16" s={{ direction: "column" }}>
        <Column flex={1} gap="12" padding="20" radius="l" border>
          <Input
            id="agent-demo-name"
            label="Display name"
            value={name}
            onValueChange={(value, details) => {
              setName(value);
              note("Display name", details);
            }}
          />
          <Select
            id="agent-demo-timezone"
            label="Timezone"
            options={TIMEZONES}
            value={timezone}
            onValueChange={(value, details) => {
              setTimezone(String(value));
              note("Timezone", details);
            }}
          />
          <Switch
            label="Weekly digest"
            checked={digest}
            onCheckedChange={(checked, details) => {
              setDigest(checked);
              note("Weekly digest", details);
            }}
          />
          <Row horizontal="end">
            <Button
              tone="danger"
              size="s"
              data-agent-confirm="Deletes the workspace and all its data"
              onClick={() => {
                deleted.current = true;
              }}
            >
              Delete workspace
            </Button>
          </Row>
        </Column>
        <Column flex={1} gap="8">
          <Text textVariant="label-default-s" onBackground="neutral-weak">
            Who changed what
          </Text>
          {sources.length === 0 ? (
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              Edit a field yourself, then let the agent run: each change reports its source.
            </Text>
          ) : (
            sources.map((line, index) => (
              <Text
                key={`${line}-${index}`}
                textVariant="code-default-s"
                onBackground="neutral-medium"
              >
                {line}
              </Text>
            ))
          )}
        </Column>
      </Row>
      <Row gap="8" wrap>
        <Button size="s" variant="secondary" onClick={snapshot}>
          Snapshot
        </Button>
        <Button size="s" loading={running} onClick={() => run("act(steps)", STEPS)}>
          Run the agent's steps
        </Button>
        <Button
          size="s"
          variant="secondary"
          onClick={() =>
            run("act(delete)", [{ ref: "Delete workspace", action: "press", args: [] }])
          }
        >
          Ask it to delete
        </Button>
        <Button size="s" variant="tertiary" onClick={reset}>
          Reset
        </Button>
      </Row>
      {error && (
        <Feedback tone="danger" title="The bridge stopped" description={error}>
          <Button size="s" variant="secondary" onClick={() => run("act(steps)", STEPS)}>
            Retry
          </Button>
        </Feedback>
      )}
      {log && (
        <CodeBlock
          compact
          codes={[
            {
              code: JSON.stringify(log.body, null, 2),
              language: "json",
              label: log.title,
            },
          ]}
        />
      )}
    </Column>
  );
}
