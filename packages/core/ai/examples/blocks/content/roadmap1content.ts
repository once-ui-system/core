import type { Schemes } from "@once-ui-system/core";

export const task = {
  planned: { label: "Planned", color: "gray" },
  progress: { label: "In progress", color: "blue" },
  done: { label: "Done", color: "green" },
  blocked: { label: "Blocked", color: "red" },
} as const;

export const roadmap: {
  product: string;
  brand: Schemes;
  columns: {
    title: string;
    tasks: {
      title: string;
      description?: string;
      type: keyof typeof task;
      user?: { name?: string; avatar?: string };
      href?: string;
    }[];
  }[];
}[] = [
  {
    product: "Once UI Core",
    brand: "blue",
    columns: [
      {
        title: "Planned",
        tasks: [
          {
            title: "Agent-first MCP tools",
            description: "resolve, get_component, validate",
            type: "progress",
            user: { name: "Lorant", avatar: "/images/creators/lorant.jpg" },
            href: "#",
          },
          {
            title: "Expanded block references",
            description: "Pro block gold examples in harness",
            type: "planned",
          },
        ],
      },
      {
        title: "In progress",
        tasks: [
          {
            title: "Codegen harness Phase 1",
            type: "progress",
            user: { name: "Lorant" },
          },
        ],
      },
      {
        title: "Done",
        tasks: [
          {
            title: "Component catalog slices",
            type: "done",
          },
        ],
      },
    ],
  },
];
