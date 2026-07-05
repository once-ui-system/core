export const task = {
  planned: { label: "Planned", color: "neutral" },
  progress: { label: "In progress", color: "brand" },
  done: { label: "Done", color: "success" },
  blocked: { label: "Blocked", color: "danger" },
} as const;

export const roadmap = [
  {
    product: "Once UI Core",
    brand: "brand",
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
