const roadmap = [
  {
    product: "Once UI Core",
    brand: "blue",
    columns: [
      {
        title: "Planned",
        tasks: [
          {
            title: "StylePanel refactoring",
            description: "Make stylepanel composable and add additional edit options like custom colors.",
            type: "feature"
          },
          {
            title: "Chart states",
            description: "Add state examples to chart docs. (Related: Chart error state)",
            type: "documentation"
          },
          {
            title: "Hooks & utils",
            description: "Add hooks and utils to docs.",
            type: "documentation"
          },
        ]
      },
      {
        title: "In Progress",
        tasks: [
        ]
      },
      {
        title: "Done",
        tasks: [
          {
            title: "Once UI 1.5",
            description: "New Once UI 1.5 components and documentation.",
            type: "feature"
          },
        ]
      }
    ]
  },
  {
    product: "Once UI Pro",
    brand: "indigo",
    columns: [
      {
        title: "Planned",
        tasks: [
          {
            title: "Once UI 1.5 blocks",
            description: "New Once UI 1.5 blocks.",
            type: "feature"
          },
          {
            title: "Magic Agent",
            description: "Upgrade to latest AI SDK.",
            type: "improvement"
          },
        ]
      },
      {
        title: "In Progress",
        tasks: [
          {
            title: "Supa Hub",
            description: "Monorepo with multiple social media frontends and a single backend.",
            type: "feature"
          },
        ]
      },
      {
        title: "Done",
        tasks: [
        ]
      },
    ]
  },
  {
    product: "Magic Docs",
    brand: "magenta",
    columns: [
      {
        title: "Planned",
        tasks: [
          {
            title: "Hot reload",
            description: "Automatically re-render documentation when changes are detected in MDX files.",
            type: "feature"
          },
          {
            title: "Versioning",
            description: "Add versioning to documentation.",
            type: "feature"
          },
        ]
      },
      {
        title: "In Progress",
        tasks: [
        ]
      },
      {
        title: "Done",
        tasks: [
        ]
      }
    ]
  },
  {
    product: "Magic Portfolio",
    brand: "orange",
    columns: [
      {
        title: "Planned",
        tasks: [
        ]
      },
      {
        title: "In Progress",
        tasks: [
          {
            title: "Fix OG error",
            description: "Fix Open Graph resolution error.",
            type: "bug"
          },
        ]
      },
      {
        title: "Done",
        tasks: [
        ]
      }
    ]
  },
];

const task = {
  bug: { label: "Bug", color: "red" },
  feature: { label: "Feature", color: "green" },
  improvement: { label: "Improvement", color: "blue" },
  documentation: { label: "Docs", color: "magenta" },
  performance: { label: "Performance", color: "orange" },
  security: { label: "Security", color: "indigo" }
};

export { roadmap, task };