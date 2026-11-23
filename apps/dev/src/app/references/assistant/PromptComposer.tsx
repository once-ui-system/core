"use client";

import type { IconName } from "@once-ui-system/core";
import {
  Button,
  Column,
  Dropdown,
  Icon,
  IconButton,
  Kbd,
  Option,
  Row,
  Tag,
  Text,
  Textarea,
} from "@once-ui-system/core";
import { useState } from "react";

/**
 * Prototype for a 3.1 "prompt" composer: the big box an assistant home opens
 * with, as opposed to ChatComposer's one-line bar under a thread. It brings
 * over what Stack's own chat composer has (attach, model picker, mic, usage,
 * send/stop), adds the context the prompt is about as removable chips, and
 * keeps suggested prompts under it as quiet rows. Core parts only.
 */

const models = [
  { id: "fast", label: "Ember Fast", description: "Quick answers and drafts." },
  { id: "deep", label: "Ember Deep", description: "Plans, analysis and long briefs. Uses 3x." },
];

type Context = { id: string; label: string; icon: IconName };

export function PromptComposer({
  suggestions,
  usage,
}: {
  suggestions: { label: string; icon: IconName }[];
  usage: number;
}) {
  const [draft, setDraft] = useState("");
  const [model, setModel] = useState(models[0]);
  const [context, setContext] = useState<Context[]>([
    { id: "q4", label: "Q4 launch", icon: "folder" },
    { id: "meta", label: "Ads account", icon: "grid" },
  ]);
  const [sending, setSending] = useState(false);
  const canSend = draft.trim() !== "" && !sending;

  const send = () => {
    if (!canSend) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setDraft("");
    }, 1200);
  };

  return (
    <Column fillWidth gap="24">
      <Column fillWidth background="surface" border radius="xl" shadow="l" padding="8" gap="4">
        {context.length > 0 && (
          <Row gap="4" wrap paddingX="8" paddingTop="8">
            {context.map((c) => (
              <Tag
                key={c.id}
                size="s"
                prefixIcon={c.icon}
                label={c.label}
                onRemove={() => setContext((all) => all.filter((x) => x.id !== c.id))}
              />
            ))}
          </Row>
        )}
        <Textarea
          id="prompt"
          variant="ghost"
          lines={3}
          resize="none"
          aria-label="Ask the assistant"
          placeholder="Ask anything, or type @ to add a project, file or app"
          value={draft}
          onValueChange={setDraft}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              send();
            }
          }}
        />
        <Row fillWidth vertical="center" gap="4" paddingX="4" paddingBottom="4">
          <IconButton icon="plus" variant="tertiary" tooltip="Attach files" onClick={() => {}} />
          <IconButton
            icon="symbol"
            variant="tertiary"
            tooltip="Add context (@)"
            onClick={() => {}}
          />
          <Dropdown
            placement="top-start"
            minWidth={18}
            trigger={
              <Button variant="tertiary" size="s" suffixIcon="chevronDown" label={model.label} />
            }
          >
            <Column padding="4" gap="2">
              {models.map((m) => (
                <Option
                  key={m.id}
                  value={m.id}
                  label={m.label}
                  description={m.description}
                  selected={m.id === model.id}
                  onClick={() => setModel(m)}
                />
              ))}
            </Column>
          </Dropdown>
          <Row flex={1} />
          <Text textVariant="label-default-xs" onBackground="neutral-weak">
            {usage}% of today
          </Text>
          <IconButton icon="microphone" variant="tertiary" tooltip="Talk" onClick={() => {}} />
          {sending ? (
            <IconButton
              icon="stop"
              variant="secondary"
              tooltip="Stop"
              onClick={() => setSending(false)}
            />
          ) : (
            <IconButton
              icon="arrowUp"
              variant={canSend ? "primary" : "secondary"}
              tooltip={
                <Row gap="8" vertical="center">
                  Send <Kbd keys="enter" />
                </Row>
              }
              aria-label="Send"
              disabled={!canSend}
              onClick={send}
            />
          )}
        </Row>
      </Column>

      <Column gap="2">
        {suggestions.map((s) => (
          <Option
            key={s.label}
            value={s.label}
            label={s.label}
            prefix={<Icon name={s.icon} size="s" onBackground="neutral-weak" />}
            onClick={() => setDraft(s.label)}
          />
        ))}
      </Column>
    </Column>
  );
}
