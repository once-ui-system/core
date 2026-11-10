"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Group,
  Modal,
  SegmentedControl,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { formatDate, projects as seed, statusColor, type Project, type ProjectStatus } from "@/lib/data";
import { PageHeader } from "./PageHeader";

const filters = ["All", "Active", "Paused", "Archived"];

function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant="light" color={statusColor[status]} size="lg">
      {status}
    </Badge>
  );
}

export function ProjectsView() {
  const [items, setItems] = useState<Project[]>(seed);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: { name: "", key: "", status: "Active" as string },
    validate: {
      name: (v) => (v.trim().length < 2 ? "Give the project a name" : null),
      key: (v) =>
        !/^[A-Za-z]{2,5}$/.test(v)
          ? "Use 2 to 5 letters"
          : items.some((p) => p.key === v.toUpperCase())
            ? "That key is taken"
            : null,
    },
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((p) => status === "All" || p.status === status)
      .filter((p) => !q || p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q))
      .sort((a, b) => b.updated.localeCompare(a.updated));
  }, [items, query, status]);

  const addProject = form.onSubmit((values) => {
    const project: Project = {
      key: values.key.toUpperCase(),
      name: values.name.trim(),
      status: values.status as ProjectStatus,
      issues: 0,
      updated: new Date().toISOString().slice(0, 10),
    };
    setItems((prev) => [project, ...prev]);
    notifications.show({ title: "Project created", message: `${project.name} is ready for its first issue.`, color: "teal" });
    form.reset();
    close();
  });

  return (
    <>
      <PageHeader
        title="Projects"
        description="Every project your team tracks in Lumen, newest activity first."
        actions={
          <Button leftSection={<IconPlus size={20} aria-hidden />} onClick={open}>
            New project
          </Button>
        }
      />

      <Stack gap="lg">
        <Group gap="md" align="flex-end">
          <TextInput
            label="Search projects"
            placeholder="Name or key"
            leftSection={<IconSearch size={18} aria-hidden />}
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            style={{ flex: "1 1 260px" }}
          />
          <div style={{ flex: "1 1 320px" }}>
            <Text component="label" size="sm" fw={500} id="status-filter-label" display="block" mb={6}>
              Status
            </Text>
            <SegmentedControl
              fullWidth
              size="md"
              data={filters}
              value={status}
              onChange={setStatus}
              aria-labelledby="status-filter-label"
            />
          </div>
        </Group>

        <Text size="sm" c="dimmed" role="status" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "project" : "projects"} shown
        </Text>

        {filtered.length === 0 ? (
          <Card ta="center" py="xl">
            <Text ff="heading" fw={700} fz="xl">
              Nothing matches yet
            </Text>
            <Text c="dimmed" mt="xs">
              Try a different search or switch the status filter back to All.
            </Text>
          </Card>
        ) : (
          <>
            <Card p={0} visibleFrom="sm" style={{ overflow: "hidden" }}>
              <Table verticalSpacing="md" horizontalSpacing="lg" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th scope="col">Key</Table.Th>
                    <Table.Th scope="col">Project</Table.Th>
                    <Table.Th scope="col">Status</Table.Th>
                    <Table.Th scope="col" ta="right">
                      Open issues
                    </Table.Th>
                    <Table.Th scope="col">Updated</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filtered.map((p) => (
                    <Table.Tr key={p.key}>
                      <Table.Td fw={700}>{p.key}</Table.Td>
                      <Table.Td>{p.name}</Table.Td>
                      <Table.Td>
                        <StatusBadge status={p.status} />
                      </Table.Td>
                      <Table.Td ta="right">{p.issues}</Table.Td>
                      <Table.Td>{formatDate(p.updated)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>

            <Stack gap="md" hiddenFrom="sm" component="ul" p={0} m={0} style={{ listStyle: "none" }}>
              {filtered.map((p) => (
                <li key={p.key}>
                  <Card>
                    <Group justify="space-between" wrap="nowrap" align="flex-start">
                      <div>
                        <Text fw={700} fz="lg">
                          {p.name}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {p.key}
                        </Text>
                      </div>
                      <StatusBadge status={p.status} />
                    </Group>
                    <Group justify="space-between" mt="md">
                      <Text size="sm">{p.issues} open issues</Text>
                      <Text size="sm" c="dimmed">
                        Updated {formatDate(p.updated)}
                      </Text>
                    </Group>
                  </Card>
                </li>
              ))}
            </Stack>
          </>
        )}
      </Stack>

      <Modal opened={opened} onClose={close} title="New project" size="md" centered>
        <form onSubmit={addProject} noValidate>
          <Stack gap="md">
            <TextInput label="Name" placeholder="Billing portal" required {...form.getInputProps("name")} />
            <TextInput label="Key" description="2 to 5 letters, shown on every issue" placeholder="BILL" required {...form.getInputProps("key")} />
            <Select
              label="Status"
              data={["Active", "Paused", "Archived"]}
              allowDeselect={false}
              {...form.getInputProps("status")}
            />
            <Group justify="flex-end" mt="sm">
              <Button variant="default" onClick={close}>
                Cancel
              </Button>
              <Button type="submit">Create project</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
