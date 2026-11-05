"use client";

import {
  arrayMove,
  Checkbox,
  Column,
  Nav,
  NavGroup,
  NavItem,
  NavSection,
  Row,
  Sortable,
  SortableHandle,
  SortableItem,
  type SortablePosition,
  Tag,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";

export function SortableListExample() {
  const [rows, setRows] = useState(["Inbox", "Drafts", "Sent", "Archive", "Spam"]);
  return (
    <Column maxWidth="20rem" padding="8" radius="l" border="neutral-alpha-medium">
      <Sortable items={rows} onReorder={setRows} gap="4">
        {rows.map((row) => (
          <SortableItem key={row} id={row}>
            <NavItem href={`#${row.toLowerCase()}`} label={row} />
          </SortableItem>
        ))}
      </Sortable>
    </Column>
  );
}

type Chats = Record<"pinned" | "projects" | "archive", string[]>;

const CHAT_ICONS = { pinned: "star", projects: "folder", archive: "document" } as const;

/** Moves an id out of one list and into another at an index. */
function moveBetween<K extends string>(
  lists: Record<K, string[]>,
  id: string,
  to: SortablePosition,
  from: SortablePosition,
) {
  const next = { ...lists };
  next[from.list as K] = next[from.list as K].filter((row) => row !== id);
  const target = next[to.list as K].slice();
  target.splice(to.index, 0, id);
  next[to.list as K] = target;
  return next;
}

export function SortableSidebarExample() {
  const [chats, setChats] = useState<Chats>({
    pinned: ["Launch plan", "Pricing page"],
    projects: ["Onboarding emails", "Q4 roadmap", "Hiring loop"],
    archive: ["Old landing copy"],
  });
  const reorder = (list: keyof Chats) => (items: string[]) =>
    setChats((current) => ({ ...current, [list]: items }));
  const move = (id: string, to: SortablePosition, from: SortablePosition) =>
    setChats((current) => moveBetween(current, id, to, from));

  const list = (name: keyof Chats, label: string) => (
    <Sortable
      group="chats"
      name={name}
      label={label}
      items={chats[name]}
      onReorder={reorder(name)}
      onMove={move}
    >
      {chats[name].map((chat) => (
        <SortableItem key={chat} id={chat}>
          <NavItem
            href={`#${chat}`}
            icon={name === "archive" ? undefined : CHAT_ICONS[name]}
            label={chat}
          />
        </SortableItem>
      ))}
    </Sortable>
  );

  return (
    <Column maxWidth="20rem" padding="8" radius="l" border="neutral-alpha-medium">
      <Nav density="compact" gap="16">
        <NavSection label="Pinned">{list("pinned", "Pinned")}</NavSection>
        <NavSection label="Projects">{list("projects", "Projects")}</NavSection>
        <NavGroup label="Archive" icon="document">
          {list("archive", "Archive")}
        </NavGroup>
      </Nav>
    </Column>
  );
}

export function SortableHandleExample() {
  const [tasks, setTasks] = useState([
    { id: "copy", label: "Write the launch copy", done: true },
    { id: "video", label: "Record the demo video", done: false },
    { id: "pricing", label: "Check the pricing table", done: false },
    { id: "post", label: "Schedule the post", done: false },
  ]);
  return (
    <Column maxWidth="24rem" padding="8" radius="l" border="neutral-alpha-medium">
      <Sortable
        handle
        gap="4"
        items={tasks.map((task) => task.id)}
        onReorder={(_, { from, to }) => setTasks((current) => arrayMove(current, from, to))}
      >
        {tasks.map((task) => (
          <SortableItem key={task.id} id={task.id} label={task.label} vertical="center" gap="8">
            <SortableHandle />
            <Checkbox
              label={task.label}
              checked={task.done}
              onCheckedChange={() =>
                setTasks((current) =>
                  current.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)),
                )
              }
            />
          </SortableItem>
        ))}
      </Sortable>
    </Column>
  );
}

type Board = Record<"todo" | "doing" | "done", string[]>;

const COLUMNS: { name: keyof Board; label: string }[] = [
  { name: "todo", label: "To do" },
  { name: "doing", label: "Doing" },
  { name: "done", label: "Done" },
];

export function SortableBoardExample() {
  const [board, setBoard] = useState<Board>({
    todo: ["Hero copy", "Pricing FAQ"],
    doing: ["Signup flow"],
    done: ["Logo", "Color tokens"],
  });
  return (
    <Row fillWidth gap="12" s={{ direction: "column" }}>
      {COLUMNS.map(({ name, label }) => (
        <Column key={name} flex={1} gap="8" padding="8" radius="l" background="neutral-alpha-weak">
          <Row paddingX="8" paddingTop="4" gap="8" vertical="center">
            <Text textVariant="label-default-s">{label}</Text>
            <Tag size="s">{board[name].length}</Tag>
          </Row>
          <Sortable
            group="board"
            name={name}
            label={label}
            gap="8"
            items={board[name]}
            onReorder={(items) => setBoard((current) => ({ ...current, [name]: items }))}
            onMove={(id, to, from) => setBoard((current) => moveBetween(current, id, to, from))}
          >
            {board[name].map((card) => (
              <SortableItem
                key={card}
                id={card}
                padding="12"
                radius="m"
                background="surface"
                border="neutral-alpha-medium"
              >
                <Text textVariant="body-default-s">{card}</Text>
              </SortableItem>
            ))}
          </Sortable>
        </Column>
      ))}
    </Row>
  );
}
